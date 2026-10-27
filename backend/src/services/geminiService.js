const BloodSugar = require('../models/BloodSugar');

// AI Model and Version Constants
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_VERSION = 'v1beta';

// Access keys dynamically from process.env
const getGeminiKey = () => process.env.GEMINI_API_KEY;
const getGroqKey = () => process.env.GROQ_API_KEY;

// Simple in-memory cache: userId_lang => { text, timestamp }
const recommendationCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// ─── Gemini API Call (Primary) ──────────────────────────────────
const callGeminiAPI = async (prompt, retries = 1) => {
  const apiKey = getGeminiKey();
  if (!apiKey || apiKey.includes('your_')) throw new Error('Gemini API kaliti sozlanmagan');
  
  console.log(`🤖 Gemini so'rovi yuborilmoqda (Model: ${GEMINI_MODEL})...`);
  const url = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 600,
        thinkingConfig: {
          thinkingBudget: 0
        }
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'No error body');
    console.error(`❌ Gemini API error (${response.status}):`, errText);
    if (response.status === 429 && retries > 0) {
      console.log('🔄 Gemini 429 detected, retrying in 3s...');
      await new Promise(r => setTimeout(r, 3000));
      return callGeminiAPI(prompt, retries - 1);
    }
    throw new Error(`Gemini API xatosi ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

// ─── Groq API Call (Fallback) ──────────────────────────────────
const callGroqAPI = async (prompt) => {
  const apiKey = getGroqKey();
  if (!apiKey || apiKey.includes('your_')) throw new Error('Groq API kaliti sozlanmagan');

  console.log(`🤖 Groq so'rovi yuborilmoqda (Model: ${GROQ_MODEL})...`);
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Siz tajribali endokrinologsiz. Bemorlarga faqat ENG ASOSIY, QISQA va TUSHUNARLI maslahat berasiz. Katta matnlar, ilmiy terminlar yozmang, qisqa bullet point qilib bering.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 900,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'No error body');
    console.error(`❌ Groq API error (${response.status}):`, errText);
    throw new Error(`Groq API xatosi ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
};

// ── Nutrition Recommendation ──────────────────────────────────────
const getNutritionRecommendation = async (req, res) => {
  try {
    const groqKey = getGroqKey();
    const geminiKey = getGeminiKey();

    if ((!groqKey || groqKey.includes('your_')) && (!geminiKey || geminiKey.includes('your_'))) {
      return res.status(500).json({
        success: false,
        message: 'AI API kalitlari (Groq yoki Gemini) sozlanmagan. Iltimos, .env faylini tekshiring.'
      });
    }

    const user = req.user;
    const language = req.body.language || 'uz';
    const forceRefresh = req.body.forceRefresh || false;

    // ─── Calculate age ───────────────────────────────────────
    let age = null;
    if (user.dateOfBirth) {
      const diffMs = Date.now() - new Date(user.dateOfBirth).getTime();
      age = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
    }

    const height = user.height;   // sm
    const weight = user.weight;   // kg
    const gender = user.gender;
    const diabetesType = user.diabetesType;

    // ─── BMI & BMR ────────────────────────────────────────────
    let bmi = null;
    let bmiLabel = '';
    if (height && weight) {
      const bmiVal = weight / ((height / 100) ** 2);
      bmi = bmiVal.toFixed(1);
      if (bmiVal < 18.5) bmiLabel = language === 'uz' ? 'kam vazn' : language === 'ru' ? 'недовес' : 'underweight';
      else if (bmiVal < 25) bmiLabel = language === 'uz' ? 'normal' : 'норма';
      else if (bmiVal < 30) bmiLabel = language === 'uz' ? 'ortiqcha vazn' : language === 'ru' ? 'избыточный вес' : 'overweight';
      else bmiLabel = language === 'uz' ? 'semizlik' : language === 'ru' ? 'ожирение' : 'obese';
    }

    let bmr = null;
    if (height && weight && age) {
      if (gender === 'male') bmr = Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
      else if (gender === 'female') bmr = Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
      else bmr = Math.round(((88.362 + 447.593) / 2) + (11.3 * weight) + (3.9 * height) - (5.0 * age));
    }
    const dailyCalories = bmr ? Math.round(bmr * 1.375) : null;

    // ─── Blood sugar records ─────────────────────────────────
    const recentRecords = await BloodSugar.find({ user: user._id }).sort({ createdAt: -1 }).limit(7);

    const avgFasting = recentRecords.length > 0
      ? (recentRecords.reduce((s, r) => s + (r.fastingLevel || 0), 0) / recentRecords.length).toFixed(1)
      : null;

    const postMealRecs = recentRecords.filter(r => r.postMealLevel);
    const avgPostMeal = postMealRecs.length > 0
      ? (postMealRecs.reduce((s, r) => s + r.postMealLevel, 0) / postMealRecs.length).toFixed(1)
      : null;

    // Pick the absolute latest reading (fasting or post-meal from the very last record)
    const lastRec = recentRecords[0];
    let latestSugar = null;
    let measT = '';
    let isPostMeal = false;
    let isFasting = false;

    if (lastRec) {
      if (lastRec.postMealLevel && lastRec.fastingLevel) {
        latestSugar = `${lastRec.postMealLevel}`;
        isPostMeal = true;
        measT = language === 'uz'
          ? `Ovqatdan keyin (to'q qoringa) ${lastRec.postMealLevel} mmol/l [Ertalabki och qoringa: ${lastRec.fastingLevel} mmol/l]`
          : language === 'ru'
          ? `После еды ${lastRec.postMealLevel} ммоль/л [Утром натощак: ${lastRec.fastingLevel} ммоль/л]`
          : `Post-meal ${lastRec.postMealLevel} mmol/l [Morning fasting: ${lastRec.fastingLevel} mmol/l]`;
      } else if (lastRec.postMealLevel) {
        latestSugar = `${lastRec.postMealLevel}`;
        isPostMeal = true;
        measT = language === 'uz'
          ? `Ovqatdan keyin (to'q qoringa) ${lastRec.postMealLevel} mmol/l`
          : language === 'ru'
          ? `После еды ${lastRec.postMealLevel} ммоль/л`
          : `Post-meal ${lastRec.postMealLevel} mmol/l`;
      } else if (lastRec.fastingLevel) {
        latestSugar = `${lastRec.fastingLevel}`;
        isFasting = true;
        measT = language === 'uz'
          ? `Och qoringa (nahorga) ${lastRec.fastingLevel} mmol/l`
          : language === 'ru'
          ? `Натощак ${lastRec.fastingLevel} ммоль/л`
          : `Fasting ${lastRec.fastingLevel} mmol/l`;
      } else {
        measT = language === 'uz' ? `Qand miqdori kiritilmagan` : language === 'ru' ? `Данные не указаны` : `Not specified`;
      }
    } else {
      measT = language === 'uz' ? `Qand miqdori kiritilmagan` : language === 'ru' ? `Данные не указаны` : `Not specified`;
    }

    const sugarStatus = latestSugar
      ? isFasting
        ? (parseFloat(latestSugar) >= 7 ? 'high' : parseFloat(latestSugar) < 3.9 ? 'low' : 'normal')
        : (parseFloat(latestSugar) >= 10 ? 'high' : parseFloat(latestSugar) < 3.9 ? 'low' : 'normal')
      : 'unknown';

    // ─── Localized diabetes labels ──────────────────────────
    const dLabels = {
      type1: { uz: '1-tip diabet', ru: 'Диабет 1 типа', en: 'Type 1' },
      type2: { uz: '2-tip diabet', ru: 'Диабет 2 типа', en: 'Type 2' },
      prediabetes: { uz: 'Prediabet', ru: 'Предиабет', en: 'Prediabetes' },
      gestational: { uz: 'Homiladorlik diabeti', ru: 'Гест. диабет', en: 'Gestational' },
      none: { uz: "Diabet yo'q", ru: 'Без диабета', en: 'No Diabetes' },
    };
    const dLabel = dLabels[diabetesType]?.[language] || diabetesType || "noma'lum";

    // ─── Add urgent alert if sugar is high ────────────────────
    let urgentAlert = "";
    if (latestSugar && parseFloat(latestSugar) > 13) {
      urgentAlert = language === 'uz' ? `\n\n!!! OGOHLANTIRISH: Qand miqdori juda yuqori (${latestSugar} mmol/l). Zudlik bilan shifokor bilan bog'laning !!!`
        : language === 'ru' ? `\n\n!!! ВНИМАНИЕ: Сахар критически высокий (${latestSugar} ммоль/л). Срочно обратитесь к врачу !!!`
          : `\n\n!!! URGENT: Sugar level is critically high (${latestSugar} mmol/l). Contact a doctor !!!`;
    }

    // ─── Build prompt with diversity nonce ───────────────────
    const nonce = Date.now().toString(36);
    let prompt = `[ID: ${nonce}]\n`;

    if (language === 'ru') {
      const mealRuleRu = isPostMeal
        ? `ВНИМАНИЕ: Замер сделан ПОСЛЕ ЕДЫ (${latestSugar} ммоль/л)! Ни в коем случае НЕ называйте это "натощак"! Оценивайте строго по норме после еды (при диабете норма до 8.5-9.0 ммоль/л, если 7.0 ммоль/л — это отличный нормальный показатель!).`
        : isFasting
        ? `ВНИМАНИЕ: Замер сделан НАТОЩАК (${latestSugar} ммоль/л)! Ни в коем случае НЕ называйте "после еды"! Оценивайте строго по норме натощак (при диабете норма 4.0-7.0 ммоль/л).`
        : `Оценивайте показатели точно.`;

      prompt += `Вы опытный врач-эндокринолог. Пациенты не читают длинные простыни текста. БЕЗ приветствий, вступлений и заключений, ПРЯМО и ПРЕДЕЛЬНО КРАТКО ответьте по следующим 3 разделам (не более 4-6 строк суммарно):

ДАННЫЕ ПАЦИЕНТА:
- Возраст: ${age ? `${age} лет` : "не указан"}, Диабет: ${dLabel}
- ПОКАЗАТЕЛЬ САХАРА: ${measT}

ПРАВИЛА:
1. ${mealRuleRu}
2. Текст должен быть предельно кратким (буллеты по 1 строке).

ФОРМАТ ОТВЕТА (ТОЧНО ТАК):
**1. АНАЛИЗ САХАРА**
• [1 краткая фраза о показателе и норме (строго учитывая: натощак или после еды)]

**2. ПИТАНИЕ НА СЕГОДНЯ**
• Можно: [2-3 конкретных полезных продукта]
• Исключить: [2-3 вредных продукта]

**3. ДЕЙСТВИЕ**
• [1 конкретное действие: вода, ходьба или замер]${urgentAlert}`;

    } else if (language === 'en') {
      const mealRuleEn = isPostMeal
        ? `ATTENTION: The reading was taken POST-MEAL (${latestSugar} mmol/l)! Do NOT call it "fasting"! Evaluate against post-meal target (up to 8.5 mmol/l is well-controlled).`
        : isFasting
        ? `ATTENTION: The reading was taken FASTING (${latestSugar} mmol/l)! Do NOT call it "post-meal"! Evaluate against fasting target (4.0-7.0 mmol/l).`
        : `Evaluate strictly.`;

      prompt += `You are an experienced endocrinologist. Patients do not read long walls of text. With NO greetings or filler, provide an ULTRA-CONCISE 3-point recommendation (strictly 4-6 lines total):

PATIENT DATA:
- Age: ${age || "not specified"}, Diabetes: ${dLabel}
- GLUCOSE READING: ${measT}

RULES:
1. ${mealRuleEn}
2. Keep it ultra-concise, single-line bullets only.

OUTPUT FORMAT:
**1. GLUCOSE STATUS**
• [1 short sentence on reading and norm]

**2. NUTRITION TODAY**
• Recommended: [2-3 specific foods]
• Avoid: [2-3 specific foods]

**3. ACTION STEP**
• [1 clear actionable step]${urgentAlert}`;

    } else {
      // Default: Uzbek
      const mealRuleUz = isPostMeal
        ? `DIQQAT: Qand miqdori OVQATDAN KEYIN (TO'Q QORINGA) o'lchangan (${latestSugar} mmol/l)! Uni ASLO "och qoringa" deb atamang! Ovqatdan keyingi me'yor bo'yicha baholang (diabetda ovqatdan 2 soat keyin 8.5 mmol/l gacha me'yorda hisoblanadi, 7.0 mmol/l bo'lsa bu juda yaxshi natija!).`
        : isFasting
        ? `DIQQAT: Qand miqdori OCH QORINGA (NAHORGA) o'lchangan (${latestSugar} mmol/l)! Uni ASLO "to'q qoringa" deb atamang! Och qorindagi me'yor bo'yicha baholang (diabetda och qoringa 4.0-7.0 mmol/l me'yor).`
        : `DIQQAT: Ko'rsatkichni to'g'ri baholang.`;

      prompt += `Siz tajribali endokrinolog shifokorsiz. Bemorlar uzun matnlarni o'qimaydi. Shuning uchun HECH QANDAY salomlashish, kirish va cho'zilgan gaplarsiz, TO'G'RIDAN-TO'G'RI quyidagi 3 ta bo'limda, har birini 1-2 ta LO'NDA va ANIQ punkt bilan yozing (umumiy matn 4-6 qatordan oshmasin):

BEMOR MA'LUMOTLARI:
- Yosh: ${age ? `${age} yosh` : "kiritilmagan"}, Diabet turi: ${dLabel}
- O'LCHOV TURI VA QAND MIQDORI: ${measT}

QAT'IY QOIDALAR:
1. ${mealRuleUz}
2. MATN JUDA QISQA VA ANIQ BO'LSIN! Hech qanday umumiy so'zlar yoki keraksiz gaplarsiz, bemor 5 soniyada o'qib tushunadigan lo'nda punktlar bo'lsin.

JAVOB FORMATI (AYNAN SHUNDAY CHIQARING):
**1. QAND HOLATI**
• [Ko'rsatkich va me'yor haqida 1 ta qisqa jumla (och yoki to'q qorindagi holatni aniq to'g'ri ayting)]

**2. TAOMLANISH**
• Tavsiya: [Bugun nima yeyish mumkin - faqat 2-3 ta mahsulot]
• Cheklov: [Bugun nimadan tiyilish shart - faqat 2-3 ta zararli narsa]

**3. AMALIY HARAKAT**
• [1 ta lo'nda amaliy harakat: suv, piyoda yurish yoki keyingi o'lchov vaqti]${urgentAlert}`;
    }

    // ─── Call AI API (Gemini Primary with Groq Fallback) ─────────────
    let text = '';
    let provider = 'Gemini 2.5 Flash';
    try {
      text = await callGeminiAPI(prompt);
      console.log('🤖 Recommendation generated via Gemini 2.5 Flash');
    } catch (geminiErr) {
      console.error('⚠️ Gemini failed, falling back to Groq if available:', geminiErr.message);
      const groqKey = getGroqKey();
      if (groqKey && !groqKey.includes('your_') && !groqKey.startsWith('gsk_scJ5NN')) {
        try {
          text = await callGroqAPI(prompt);
          provider = 'Groq';
          console.log('🤖 Recommendation generated via Groq (Fallback)');
        } catch (groqErr) {
          console.error('❌ Both AI providers failed:', groqErr.message);
          throw new Error(`Gemini: ${geminiErr.message} | Groq: ${groqErr.message}`);
        }
      } else {
        throw geminiErr;
      }
    }

    if (!text) {
      return res.status(500).json({ success: false, message: 'AI javob bermadi. Qaytadan urinib ko\'ring.' });
    }

    const resultMeta = {
      provider,
      age,
      height,
      weight,
      bmi,
      bmiLabel,
      bmr,
      dailyCalories,
      diabetesType,
      avgFasting,
      avgPostMeal,
      latestSugar,
      sugarStatus,
    };

    return res.json({
      success: true,
      recommendation: text,
      meta: resultMeta,
    });

  } catch (err) {
    console.error('Nutrition AI error:', err.message);

    if (err.message?.includes('429') || err.message?.toLowerCase().includes('quota')) {
      return res.status(429).json({ success: false, message: 'AI so\'rovlar limiti tugadi (Groq/Gemini). Bir oz kuting va qayta urinib ko\'ring.' });
    }
    if (err.message?.includes('API_KEY') || err.message?.includes('403')) {
      return res.status(403).json({ success: false, message: 'AI API kaliti (Groq yoki Gemini) noto\'g\'ri yoki muddati o\'tgan.' });
    }
    if (err.message?.includes('503') || err.message?.toLowerCase().includes('demand')) {
      return res.status(503).json({ success: false, message: 'AI xizmatida hozirda yuqori yuklanish (navbat ko\'p). Iltimos, birozdan so\'ng yana bir marta urinib ko\'ring.' });
    }

    return res.status(500).json({
      success: false,
      message: 'AI tavsiya berishda xato: ' + err.message,
    });
  }
};

module.exports = { getNutritionRecommendation };
