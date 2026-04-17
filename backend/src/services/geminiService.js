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
          content: 'Siz xalqaro darajadagi tajribali endokrinolog va dietologsiz. Bemorga tibbiy jihatdan chuqur, mukammal va "PRO" darajadagi maslahat berasiz. Oddiy yuzaki gaplar o\'rniga gormonlar, glikemik indeks, oqsillar va uglevodlar parchalanishini tushuntirib, aniq gramm/kkal o\'lchovlari bilan tibbiy tavsiya bering. Ammo matn tushunarli bo\'lsin.'
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
      prompt = `Действуйте как ведущий международный врач-эндокринолог и клинический диетолог. Дайте глубоко профессиональный, медицински обоснованный ("ПРО-уровня") совет для пациента с диабетом:
      
КЛИНИЧЕСКИЕ ДАННЫЕ: Возраст: ${age || '-'} лет, Вес: ${weight || '-'} кг, Рост: ${height || '-'} см, ИМТ: ${bmi || '-'}.
УРОВЕНЬ ГЛЮКОЗЫ: ${latestSugar || 'нет данных'} ммоль/л ${measT}.
ЦЕЛЕВАЯ КАЛОРИЙНОСТЬ: ${dailyCalories || '-'} ккал/день.

Структура клинического заключения:
**1. ЭНДОКРИННЫЙ АНАЛИЗ (Глюкоза: ${latestSugar || '-'} ммоль/л - ${measT}):** 
Проведите глубокий анализ: что означает эта цифра именно для этого времени измерения (натощак/после еды). Как это влияет на сосуды и инсулинорезистентность. Дайте строгий медицинский алгоритм действий при этом показателе.

**2. МЕТАБОЛИЗМ И БАЛАНС МАКРОНУТРИЕНТОВ:** При ИМТ ${bmi} объясните, как именно нужно распределить ${dailyCalories} ккал (сколько % белка, жиров, сложных углеводов) для контроля скачков сахара.

**3. ПЕРСОНАЛИЗИРОВАННЫЙ РАЦИОН (на ${dailyCalories} ккал):** Пропишите 4-5 конкретных продуктов с точным весом (в граммах), низким гликемическим индексом (ГИ), которые подойдут для возраста ${age} лет и веса ${weight} кг. Объясните их пользу с научной точки зрения.
**4. КРИТИЧЕСКИ ОПАСНЫЕ ПРОДУКТЫ:** Назовите 3-4 продукта, которые провоцируют резкий выброс инсулина в данной ситуации, и объясните биохимию вреда.
**5. БЕЗОПАСНАЯ АЛЬТЕРНАТИВА СЛАДКОМУ:** Чем заменить сахар без влияния на гликемическую кривую.
**6. КЛЮЧЕВОЙ ПРОТОКОЛ НА СЕГОДНЯ:** Одно самое важное клиническое действие.${urgentAlert}`;

    } else if (language === 'en') {
      prompt = `Act as an elite international endocrinologist and clinical dietitian. Provide a deep, scientifically-backed, "PRO-level" medical analysis and dietary plan for a diabetic patient:
      
CLINICAL DATA: Age: ${age || '-'}, Weight: ${weight || '-'} kg, Height: ${height || '-'} cm, BMI: ${bmi || '-'}.
GLUCOSE LEVEL: ${latestSugar || 'no data'} mmol/l ${measT}.
TARGET CALORIES: ${dailyCalories || '-'} kcal/day.

Clinical Report Structure:
**1. ENDOCRINE ANALYSIS (${latestSugar || '-'} mmol/l - ${measT}):** 
Provide a deep physiological analysis of this specific reading based on the measurement time. How does it impact insulin resistance and vascular health? Give a strict medical protocol for this exact level.

**2. METABOLIC CALORIC DISTRIBUTION:** Based on a BMI of ${bmi}, explain exactly how to distribute the ${dailyCalories} kcal intake into macronutrients (proteins, healthy fats, complex carbs) to avoid glucose spikes.

**3. PRECISION NUTRITION PLAN (${dailyCalories} kcal):** Recommend 4-5 specific foods with exact weights (in grams) and low Glycemic Index (GI) tailored for a ${age}-year-old weighing ${weight}kg. Explain their molecular benefit.
**4. HIGH-RISK FOODS:** Identify 3-4 specific foods that cause rapid insulin spikes in this condition and explain the biochemical reason.
**5. ZERO-SPIKE SWEET SWAPS:** Scientifically safe sweet alternatives that do not alter the glycemic curve.
**6. TODAY'S CLINICAL DIRECTIVE:** The absolute most critical medical/dietary action to take today.${urgentAlert}`;

    } else {
      // Default: Uzbek
      prompt = `Siz xalqaro darajadagi malakali endokrinologsiz. Yosh: ${age || '-'} yosh, Vazn: ${weight || '-'} kg (Bo'y: ${height || '-'} sm), BMI: ${bmi || '-'}. Kunlik kaloriya: ${dailyCalories || '-'} kkal. Qondagi qand: ${latestSugar || "ma'lumot yo'q"} mmol/l ${measT}.
      
Bemorga "PRO" darajadagi aniq tibbiy tahlil bering. Iltimos, javobni to'liq tugating. Quyidagilarni o'z ichiga olsin:
1. Endokrin holat: Qand ko'rsatkichi nima degani va organizmda qanday ta'sir qilmoqda.
2. Kaloriya va makronutriyent (oqsil, yog', uglevod) nisbati.
3. ${dailyCalories} kkal doirasida yeyish tavsiya qilinadigan aniq grammlari va Glikemik indeksiga ega 4 ta mahsulot.
4. Qandni keskin oshiruvchi 3 ta taqiqlangan oziq-ovqat va bu nega zararli ekanligi.
5. Eng xavfsiz shirinlik o'rinbosarlari.
6. Bugungi aniq va qat'iy tibbiy ko'rsatmalaringiz.${urgentAlert}`;
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
