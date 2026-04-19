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

// ─── Groq API Call (Primary) ──────────────────────────────────
const callGroqAPI = async (prompt) => {
  const apiKey = getGroqKey();
  if (!apiKey || apiKey.includes('your_')) throw new Error('Groq API kaliti sozlanmagan');

  console.log(`🤖 Groq Key Prefix: ${apiKey.substring(0, 4)}... (Total: ${apiKey.length})`);
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
      temperature: 1.0,
      max_tokens: 1500,
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

// ─── Gemini API Call (Fallback) ───────────────────────────────
const callGeminiAPI = async (prompt, retries = 1) => {
  const apiKey = getGeminiKey();
  if (!apiKey || apiKey.includes('your_')) throw new Error('Gemini API kaliti sozlanmagan');
  
  console.log(`🤖 Gemini Key Prefix: ${apiKey.substring(0, 4)}... (Total: ${apiKey.length})`);
  const url = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  console.log(`🤖 Gemini so'rovi yuborilmoqda (Model: ${GEMINI_MODEL})...`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 1.0, maxOutputTokens: 1500 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'No error body');
    console.error(`❌ Gemini API error (${response.status}):`, errText);
    if (response.status === 429 && retries > 0) {
      console.log('🔄 Gemini 429 detected, retrying in 5s...');
      await new Promise(r => setTimeout(r, 5000));
      return callGeminiAPI(prompt, retries - 1);
    }
    throw new Error(`Gemini API xatosi ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
    const recentRecords = await BloodSugar.find({ user: user._id }).sort({ date: -1 }).limit(7);

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
    let measT = ''; // Measurement Time context

    if (lastRec) {
      // Check which level was recorded most recently. If both exist on the same day, maybe post-meal is later.
      if (lastRec.postMealLevel) {
        latestSugar = lastRec.postMealLevel;
        measT = language === 'uz' ? '(Toq qoringa o\'lchangan)' : language === 'ru' ? '(После еды)' : '(Post-meal)';
      } else if (lastRec.fastingLevel) {
        latestSugar = lastRec.fastingLevel;
        measT = language === 'uz' ? '(Och qoringa o\'lchangan)' : language === 'ru' ? '(Натощак)' : '(Fasting)';
      } else {
        measT = language === 'uz' ? '(Oddiy holatda)' : language === 'ru' ? '(Обычное состояние)' : '(Random)';
      }
    } else {
      measT = language === 'uz' ? '(Qand miqdori kiritilmagan)' : language === 'ru' ? '(Нет данных о сахаре)' : '(No sugar data)';
    }

    const sugarStatus = latestSugar
      ? (measT.includes('och') || measT.includes('fast') || measT.includes('Натощак')) 
          ? (latestSugar >= 7 ? 'high' : latestSugar < 3.9 ? 'low' : 'normal')
          : (latestSugar >= 10 ? 'high' : latestSugar < 3.9 ? 'low' : 'normal')
      : 'unknown';

    // ─── Cache check (Disabled for live prediction) ────────────
    /* 
    const cacheKey = `${user._id}_${language}_${latestSugar || 0}`;
    if (!forceRefresh && recommendationCache.has(cacheKey)) {
      const cached = recommendationCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json({ success: true, recommendation: cached.text, meta: cached.meta, fromCache: true });
      }
    }
    */

    // ─── Localized diabetes labels ──────────────────────────
    const dLabels = {
      type1: { uz: '1-tip qandli diabet', ru: 'Диабет 1 типа', en: 'Type 1 Diabetes' },
      type2: { uz: '2-tip qandli diabet', ru: 'Диабет 2 типа', en: 'Type 2 Diabetes' },
      prediabetes: { uz: 'Prediabet', ru: 'Предиабет', en: 'Prediabetes' },
      gestational: { uz: 'Homiladorlik diabeti', ru: 'Гест. диабет', en: 'Gestational Diabetes' },
      none: { uz: "Diabet yo'q", ru: 'Без диабета', en: 'No Diabetes' },
    };
    const dLabel = dLabels[diabetesType]?.[language] || diabetesType || "noma'lum";

    // ─── Add urgent alert if sugar is high ────────────────────
    let urgentAlert = "";
    if (latestSugar && parseFloat(latestSugar) > 13) {
      urgentAlert = language === 'uz' ? `\n\n!!! OGOHLANTIRISH: Qand miqdori juda yuqori (${latestSugar} mmol/l). Zudlik bilan shifokor bilan bog'laning va qandni tushirish choralarini ko'ring !!!\n`
        : language === 'ru' ? `\n\n!!! ПРЕДУПРЕЖДЕНИЕ: Сахар очень высокий (${latestSugar} ммоль/л). Срочно свяжитесь с врачом !!!\n`
          : `\n\n!!! URGENT WARNING: Sugar level is very high (${latestSugar} mmol/l). Contact your doctor immediately !!!\n`;
    }

    const genderUz = gender === 'male' ? 'Erkak' : gender === 'female' ? 'Ayol' : 'Boshqa';
    const genderRu = gender === 'male' ? 'Мужской' : gender === 'female' ? 'Женский' : 'Другой';

    // ─── Sugar status labels ─────────────────────────────────
    const sugarStatusLabel = {
      uz: { high: '🔴 YUQORI (xavfli)', low: '🟡 PAST (xavfli)', normal: '🟢 NORMAL' },
      ru: { high: '🔴 ВЫСОКИЙ', low: '🟡 НИЗКИЙ', normal: '🟢 НОРМА' },
      en: { high: '🔴 HIGH', low: '🟡 LOW', normal: '🟢 NORMAL' },
    };
    const sLabel = (sugarStatusLabel[language] || sugarStatusLabel.uz)[sugarStatus] || '';

    // ─── Build prompt with diversity nonce ───────────────────
    const nonce = Date.now().toString(36);
    let prompt = `[ID: ${nonce}]\n`;

    if (language === 'ru') {
      prompt = `Действуйте как врач-эндокринолог. Дайте КОРОТКИЙ, ЯСНЫЙ и ОСНОВНОЙ совет пациенту. Никаких длинных текстов, только самая суть!
      
КЛИНИЧЕСКИЕ ДАННЫЕ: Возраст: ${age || '-'} лет, Вес: ${weight || '-'} кг, ИМТ: ${bmi || '-'}.
УРОВЕНЬ ГЛЮКОЗЫ: ${latestSugar || 'нет данных'} ммоль/л ${measT}.

Пожалуйста, ответьте коротко (3-4 пункта):
1. Оценка состояния: Что означает уровень сахара (${latestSugar || '-'}) на данный момент?
2. Питание: Что съесть и чего избегать именно сегодня (кратко)?
3. Действие: Самое важное действие на сегодня.${urgentAlert}`;

    } else if (language === 'en') {
      prompt = `Act as an endocrinologist. Give a SHORT, CLEAR, and ESSENTIAL advice to the patient. No long texts, just the main logic!
      
CLINICAL DATA: Age: ${age || '-'}, Weight: ${weight || '-'} kg, BMI: ${bmi || '-'}.
GLUCOSE LEVEL: ${latestSugar || 'no data'} mmol/l ${measT}.

Please answer briefly (3 paragraphs max):
1. Status: What does the sugar level (${latestSugar || '-'}) mean right now?
2. Nutrition: What to eat and what to avoid today (briefly)?
3. Action: The single most important action to take today.${urgentAlert}`;

    } else {
      // Default: Uzbek
      prompt = `Siz tajribali endokrinologsiz. Bemorga faqat ENG ASOSIY, QISQA va TUSHUNARLI maslahat bering. Ortiqcha gaplarsiz, teksti o'zlashtirish oson va zerikarli bo'lmasin!
      
Ma'lumot: Yosh: ${age || '-'}, Vazn: ${weight || '-'} kg, BMI: ${bmi || '-'}.
Qondagi qand: ${latestSugar || "ma'lumot yo'q"} mmol/l ${measT}.

Javobni juda lo'nda holda 3 ta bandda tayyorlang:
1. Holat: Hozirgi qand ko'rsatkichi (${latestSugar || '-'}) qanday ahvolni bildiradi?
2. Ovqatlanish: Bugun nima yeyish tavsiya qilinadi va nimadan shartta voz kechish kerak (qisqacha)?
3. Harakat: Bugun qilinishi kerak bo'lgan asosiy amaliy qadam.${urgentAlert}`;
    }

    // ─── Call AI API (Groq with Gemini Fallback) ─────────────
    let text = '';
    let provider = 'Groq';
    try {
      text = await callGroqAPI(prompt);
      console.log('🤖 Recommendation generated via Groq');
    } catch (groqErr) {
      console.error('⚠️ Groq failed, falling back to Gemini:', groqErr.message);
      try {
        text = await callGeminiAPI(prompt);
        provider = 'Gemini';
        console.log('🤖 Recommendation generated via Gemini (Fallback)');
      } catch (geminiErr) {
        console.error('❌ Both AI providers failed:', geminiErr.message);
        throw new Error(`Groq: ${groqErr.message} | Gemini: ${geminiErr.message}`); // Let the catch block handle the response
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
