const BloodSugar = require('../models/BloodSugar');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Simple in-memory cache: userId_lang => { text, timestamp }
const recommendationCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// ─── Groq API Call (Primary) ──────────────────────────────────
const callGroqAPI = async (prompt) => {
  if (!GROQ_API_KEY) throw new Error('Groq API kaliti topilmadi');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { 
          role: 'system', 
          content: 'Siz diabet shifokorisiz. Javobingizni har doim QISQA, SODDA va TUSHUNARLI tilda bering. Yoshi kattalar ham qiynalmay o\'qishi uchun murakkab tibbiy so\'zlarni ishlatmang. Faqat eng muhim maslahatlarni yozing.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 1.0,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(`Groq API xatosi ${response.status}: ${errData?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
};

// ─── Gemini API Call (Fallback) ───────────────────────────────
const callGeminiAPI = async (prompt, retries = 1) => {
  if (!GEMINI_API_KEY) throw new Error('Gemini API kaliti topilmadi');
  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 1.0, maxOutputTokens: 1500 },
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    if (response.status === 429 && retries > 0) {
      await new Promise(r => setTimeout(r, 5000));
      return callGeminiAPI(prompt, retries - 1);
    }
    throw new Error(`Gemini API xatosi ${response.status}: ${JSON.stringify(errData?.error?.message || response.statusText)}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

// ── Nutrition Recommendation ──────────────────────────────────────
const getNutritionRecommendation = async (req, res) => {
  try {
    if (!GEMINI_API_KEY && !GROQ_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'AI API kalitlari (Groq yoki Gemini) sozlanmagan. Iltimos, muhit o\'zgaruvchilarini tekshiring.' 
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
      if (bmiVal < 18.5)      bmiLabel = language === 'uz' ? 'kam vazn' : language === 'ru' ? 'недовес' : 'underweight';
      else if (bmiVal < 25)   bmiLabel = language === 'uz' ? 'normal' : 'норма';
      else if (bmiVal < 30)   bmiLabel = language === 'uz' ? 'ortiqcha vazn' : language === 'ru' ? 'избыточный вес' : 'overweight';
      else                    bmiLabel = language === 'uz' ? 'semizlik' : language === 'ru' ? 'ожирение' : 'obese';
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
    const latestSugar = lastRec ? (lastRec.postMealLevel || lastRec.fastingLevel || null) : null;
    
    const sugarStatus = latestSugar
      ? latestSugar >= 7 ? 'high' : latestSugar < 3.9 ? 'low' : 'normal'
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
      type1:       { uz: '1-tip qandli diabet', ru: 'Диабет 1 типа', en: 'Type 1 Diabetes' },
      type2:       { uz: '2-tip qandli diabet', ru: 'Диабет 2 типа', en: 'Type 2 Diabetes' },
      prediabetes: { uz: 'Prediabet',           ru: 'Предиабет',     en: 'Prediabetes' },
      gestational: { uz: 'Homiladorlik diabeti',ru: 'Гест. диабет',  en: 'Gestational Diabetes' },
      none:        { uz: "Diabet yo'q",         ru: 'Без диабета',   en: 'No Diabetes' },
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
      ru: { high: '🔴 ВЫСОКИЙ',         low: '🟡 НИЗКИЙ',       normal: '🟢 НОРМА'  },
      en: { high: '🔴 HIGH',            low: '🟡 LOW',          normal: '🟢 NORMAL'  },
    };
    const sLabel = (sugarStatusLabel[language] || sugarStatusLabel.uz)[sugarStatus] || '';

    // ─── Build prompt with diversity nonce ───────────────────
    const nonce = Date.now().toString(36);
    let prompt = `[ID: ${nonce}]\n`;

    if (language === 'ru') {
      prompt = `Представьте, что вы заботливый врач-эндокринолог. Дайте ПРОСТОЙ И НАДЕЖНЫЙ совет пожилому человеку с диабетом, основываясь на его данных:
      
ДАННЫЕ: Возраст: ${age || '-'} лет, Вес: ${weight || '-'} кг, Рост: ${height || '-'} см, ИМТ (BMI): ${bmi || '-'}.
ПОСЛЕДНИЙ САХАР: ${latestSugar || 'нет данных'} ммоль/л.
ДНЕВНАЯ НОРМА КАЛОРИЙ: ${dailyCalories || '-'} ккал.

Структура совета:
**1. ВАШ ТЕКУЩИЙ САХАР (${latestSugar || '-'}):** 
Если сахар < 3.9: Правило 15 (съесть 15г сахара, ждать 15 мин). 
Если сахар > 13: Пить много воды, исключить все углеводы, связаться с врачом. 
Если норма: Продолжайте в том же духе.

**2. РЕКОМЕНДАЦИЯ ПО ВЕСУ:** Исходя из ИМТ (${bmi}), нужно ли снижать вес или поддерживать его. Упоминайте расчетную норму в ${dailyCalories} ккал.

**3. ЕДА (4-5 продукта):** Самые полезные для его возраста и веса.
**4. ЧТО НЕЛЬЗЯ (3-4 продукта):** Самые опасные продукты.
**5. ЗАМЕНА СЛАДКОМУ:** Чем порадовать себя без вреда.
**6. ГЛАВНЫЙ СОВЕТ:** Твердый шаг, который нужно сделать сегодня (с учетом возраста ${age} лет).${urgentAlert}`;

    } else if (language === 'en') {
      prompt = `Act as an expert diabetes coach for a senior user. Provide a CLEAR, ACTIONABLE, AND SIMPLE health prediction based on their metrics:
      
DATA: Age: ${age || '-'}, Weight: ${weight || '-'}, Height: ${height || '-'}, BMI: ${bmi || '-'}.
CURRENT SUGAR: ${latestSugar || 'no data'} mmol/l.
DAILY CALORIE LIMIT: ${dailyCalories || '-'} kcal.

Structure:
**1. CURRENT STATE (${latestSugar || '-'}):** 
If < 3.9: 15-15 Rule (15g sugar, wait 15 mins). 
If > 13: Hydrate heavily, zero carbs, contact doctor. 
If Normal: Maintain habits.

**2. WEIGHT & CALORIES:** Based on BMI (${bmi}), advice on weight management using the ${dailyCalories} kcal limit.

**3. RECOMMENDED FOODS (4-5):** Best for their specific age and weight.
**4. AVOID THESE (3-4):** High-risk foods for diabetes.
**5. SWEET SWAPS:** Low-sugar alternatives.
**6. KEY DAILY TIP:** One simple concrete step for today, considering their age of ${age}.${urgentAlert}`;

    } else {
      // Default: Uzbek
      prompt = `Siz mehribon va professional shifokorsiz. Yoshi katta diabetga chalingan bemor uchun uning bo'yi, vazni, yoshi va qand miqdori asosida SODDA va ANIQ "bashorat" (maslahat) bering:

BEMOR MA'LUMOTLARI:
• Yosh: ${age || '-'} yosh
• Vazn: ${weight || '-'} kg (Bo'y: ${height || '-'} sm)
• BMI (Vazn indeksi): ${bmi || '-'}
• Kunlik kaloriya normasi: ${dailyCalories || '-'} kkal
• HOZIRGI QAND: ${latestSugar || "ma'lumot yo'q"} mmol/l

Tavsiyalarni quyidagi qisqa bloklarda bering:

**1. HOZIRGI HOLATINGIZ (${latestSugar || 'yo\'q'}):**
Agar qand < 3.9 bo'lsa: "15-15 qoidasi" (Masalan: 1-2 bo'lak qand yeb, 15 daqiqa kuting). 
Agar qand > 13 bo'lsa: Ko'p suv iching, birorta ham uglevod (non, xamir) yemang, shifokorga xabar bering. 
Agar normal (3.9-7.8) bo'lsa: Shunday davom eting!

**2. VAZN VA KALORIYA:** VAZN INDEXINGIZ ${bmi} ekanini hisobga olib, vaznni qanday ushlash kerak. Kuniga ${dailyCalories} kkal'dan oshmaslikni tavsiya qiling.

**3. FOYDALI TAOMLAR (4-5 ta):** Sizning vazningiz va ${age} yoshingizga mos keladigan eng foydali narsalar.
**4. TAQIQLANGANLAR (3-4 ta):** Siz uchun eng zararli bo'lgan oziq-ovqatlar.
**5. SHIRINLIK O'RNIGA:** Qand darajangizni ko'tarmaydigan shirinlik muqobillari.
**6. BUGUNGI ASOSIY QADAM:** Sizning yoshingizda bugun qilishingiz kerak bo'lgan bitta eng muhim va xavfsiz harakat.${urgentAlert}`;
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
        throw geminiErr; // Let the catch block handle the response
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

    return res.status(500).json({
      success: false,
      message: 'AI tavsiya berishda xato: ' + err.message,
    });
  }
};

module.exports = { getNutritionRecommendation };
