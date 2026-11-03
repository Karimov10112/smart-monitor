/**
 * Sun'iy intellekt (LLM: OpenAI, Gemini, DeepSeek, Claude) uchun klinik tizim prompti va kontekst yaratuvchi modul
 */

const { calculateGlycemicMetrics } = require('./metrics');
const { assessFullDiabetesRisk } = require('./riskModels');
const { evaluateDoctorAlert } = require('./doctorAlert');

/**
 * Bemor ma'lumotlari asosida AI botlar uchun boyitilgan tibbiy kontekst promptini tuzadi
 * @param {Object} params
 * @param {Object} params.profile - Bemor profili
 * @param {Array<Object>} params.records - Qon shakari yozuvlari
 * @param {'uz'|'en'|'ru'} [params.lang='uz']
 * @param {string} [params.role='patient'] - 'patient' | 'doctor'
 */
function buildMedicalAIContext({ profile = {}, records = [], lang = 'uz', role = 'patient' }) {
  // 1. Hisob-kitoblar
  const metrics = calculateGlycemicMetrics(records, { lang });
  const risk = assessFullDiabetesRisk(profile, records, { lang });

  // 2. So'nggi 5 ta o'lchov qisqacha xulosasi
  const recentSummary = records.slice(0, 5).map(r => {
    const f = r.fastingLevel ? `och qoringa: ${r.fastingLevel} mmol/l` : '';
    const p = r.postMealLevel ? `ovqatdan keyin: ${r.postMealLevel} mmol/l` : '';
    return `- ${[f, p].filter(Boolean).join(', ')}`;
  }).join('\n') || "So'nggi o'lchovlar mavjud emas.";

  // 3. Shoshilinch kritik holat tekshiruvi
  const latestRec = records[0] || {};
  const alertCheck = evaluateDoctorAlert({
    fastingLevel: latestRec.fastingLevel,
    postMealLevel: latestRec.postMealLevel,
    lang
  });

  // Til bo'yicha tibbiy tizim ko'rsatmasi (System Instruction)
  const prompts = {
    uz: `Siz professional diabetolog-shifokor yordamchisi (AI Clinical Assistant)siz.
Bemor profili: Yoshi: ${profile.age || 'Noma\'lum'}, Diabet turi: ${profile.diabetesType || '2-tur'}, BMI: ${risk.patientOverview.bmi}.
Glisemik ko'rsatkichlar:
- O'rtacha qand: ${metrics.meanGlucose} mmol/l
- TIR (Me'yordagi vaqt): ${metrics.timeInRange.tir}% (Standart: >= 70%)
- Taxminiy HbA1c: ${metrics.estimatedA1C}%
- Umumiy asoratlar xavf darajasi: ${risk.overallAssessment.level} (${risk.overallAssessment.score} ball)
So'nggi o'lchovlar:
${recentSummary}
${alertCheck.shouldAlert ? `DIQQAT: Oxirgi o'lchovda ${alertCheck.message}` : ''}

QOIDALAR:
1. Faqat tibbiy me'yorlar doirasida va faktlar asosida javob bering.
2. Qand miqdori 14 mmol/l dan yuqori yoki 3.5 dan past bo'lsa darhol tez yordam yoki shifokorga murojaat qilishni ayting.
3. Javoblarni qisqa, tushunarli va dalillarga asoslangan holda bering.`,

    en: `You are an AI Clinical Diabetes Assistant.
Patient Profile: Age: ${profile.age || 'N/A'}, Type: ${profile.diabetesType || 'Type 2'}, BMI: ${risk.patientOverview.bmi}.
Glycemic Status:
- Mean Glucose: ${metrics.meanGlucose} mmol/L
- TIR (Time in Range): ${metrics.timeInRange.tir}% (Target: >= 70%)
- Estimated HbA1c: ${metrics.estimatedA1C}%
- Overall Complication Risk: ${risk.overallAssessment.level} (${risk.overallAssessment.score} pts)
Recent Readings:
${recentSummary}
${alertCheck.shouldAlert ? `CRITICAL ALERT: ${alertCheck.message}` : ''}

RULES:
1. Provide accurate, evidence-based lifestyle and nutritional guidance.
2. In case of hypoglycemia (<3.5 mmol/L) or severe hyperglycemia (>14 mmol/L), recommend immediate medical evaluation.
3. Keep answers concise, empathetic, and actionable.`,

    ru: `Вы клинический AI-ассистент по диабету.
Профиль пациента: Возраст: ${profile.age || 'Не указан'}, Тип диабета: ${profile.diabetesType || '2 тип'}, ИМТ: ${risk.patientOverview.bmi}.
Гликемический профиль:
- Средний сахар: ${metrics.meanGlucose} ммоль/л
- Время в целевом диапазоне (TIR): ${metrics.timeInRange.tir}% (Цель: >= 70%)
- Расчетный HbA1c: ${metrics.estimatedA1C}%
- Общий риск осложнений: ${risk.overallAssessment.level} (${risk.overallAssessment.score} баллов)
Последние замеры:
${recentSummary}
${alertCheck.shouldAlert ? `ВНИМАНИЕ: ${alertCheck.message}` : ''}

ПРАВИЛА:
1. Отвечайте строго на основе доказательной медицины.
2. При критических значениях (<3.5 или >14 ммоль/л) незамедлительно рекомендуйте очный осмотр врача или скорую помощь.
3. Ответы формулируйте кратко, вежливо и понятно.`
  };

  return {
    systemPrompt: prompts[lang] || prompts.en,
    patientSummary: {
      metrics,
      risk,
      alertCheck
    }
  };
}

module.exports = {
  buildMedicalAIContext
};

