/**
 * FINDRISC (Finnish Diabetes Risk Score)
 * 2-tur qandli diabetning 10 yillik rivojlanish xavfini baholovchi xalqaro standart test
 */

const { calculateBMI } = require('./riskModels');

/**
 * FINDRISC balli va 10 yillik xavf foizini hisoblaydi
 * @param {Object} data
 * @param {number} [data.age] - Yosh
 * @param {number} [data.bmi] - Tana massasi indeksi (agar bo'lmasa weight va height dan hisoblanadi)
 * @param {number} [data.weight] - kg
 * @param {number} [data.height] - cm
 * @param {number} [data.waistCircumference] - Bel aylanasi (sm)
 * @param {'male'|'female'} [data.gender='male'] - Jins
 * @param {boolean} [data.physicalActivityDaily] - Kuniga kamida 30 daqiqa jismoniy faollik bormi?
 * @param {boolean} [data.eatVegetablesDaily] - Har kuni meva-sabzavot yeydimi?
 * @param {boolean} [data.takesBloodPressureMeds] - Gipertoniya/qon bosimi dori ichadimi?
 * @param {boolean} [data.hasHighBloodGlucoseHistory] - Avval qonda qand ko'tarilishi kuzatilganmi?
 * @param {'none'|'second_degree'|'first_degree'} [data.familyHistory='none'] - Oilada diabet: none (yo'q), second_degree (buva, buvi, amaki, xola), first_degree (ota-ona, aka-uka, opa-singil, farzand)
 * @param {'uz'|'en'|'ru'} [lang='uz']
 */
function calculateFINDRISC(data = {}, lang = 'uz') {
  let score = 0;

  // 1. Yosh
  const age = data.age || 40;
  if (age < 45) score += 0;
  else if (age <= 54) score += 2;
  else if (age <= 64) score += 3;
  else score += 4;

  // 2. BMI
  const bmi = data.bmi || calculateBMI(data.weight, data.height) || 24;
  if (bmi < 25) score += 0;
  else if (bmi < 30) score += 1;
  else score += 3;

  // 3. Bel aylanasi (Erkaklar va ayollar uchun chegaralar har xil)
  const waist = data.waistCircumference || (data.gender === 'female' ? 78 : 88);
  if (data.gender === 'female') {
    if (waist < 80) score += 0;
    else if (waist <= 88) score += 3;
    else score += 4;
  } else {
    if (waist < 94) score += 0;
    else if (waist <= 102) score += 3;
    else score += 4;
  }

  // 4. Jismoniy faollik (kamida 30 daqiqa)
  if (data.physicalActivityDaily === false) score += 2;

  // 5. Meva/sabzavotlarni har kuni iste'mol qilish
  if (data.eatVegetablesDaily === false) score += 1;

  // 6. Qon bosimi dorilarini qabul qilish
  if (data.takesBloodPressureMeds === true) score += 2;

  // 7. Qonda qand oshishi tarixi (homiladorlikda yoki skriningda)
  if (data.hasHighBloodGlucoseHistory === true) score += 5;

  // 8. Oila tarixi (nasliy moyillik)
  if (data.familyHistory === 'first_degree') score += 5;
  else if (data.familyHistory === 'second_degree') score += 3;

  // Xavf toifasi va 10 yillik ehtimollik foizi
  let riskLevel = 'LOW';
  let probabilityPercent = 1; // 1%
  let description = '';

  if (score < 7) {
    riskLevel = 'LOW';
    probabilityPercent = 1;
    description = lang === 'uz'
      ? "Past xavf: Keyingi 10 yilda qandli diabetga chalinish ehtimoli taxminan 100 kishidan 1 kishida (1%)."
      : lang === 'ru'
      ? "Низкий риск: Вероятность развития диабета в течение 10 лет около 1% (1 из 100)."
      : "Low risk: 10-year probability of developing type 2 diabetes is approximately 1%.";
  } else if (score <= 11) {
    riskLevel = 'SLIGHTLY_ELEVATED';
    probabilityPercent = 4;
    description = lang === 'uz'
      ? "Biroz ko'tarilgan xavf: Keyingi 10 yilda diabet rivojlanish ehtimoli taxminan 4% (25 kishidan 1 kishida)."
      : lang === 'ru'
      ? "Слегка повышенный риск: Вероятность около 4% (1 из 25)."
      : "Slightly elevated risk: 10-year probability is approximately 4%.";
  } else if (score <= 14) {
    riskLevel = 'MODERATE';
    probabilityPercent = 17;
    description = lang === 'uz'
      ? "Mo'tadil xavf: 10 yillik ehtimollik taxminan 17% (har 6 kishidan birida). Vazn va parhez nazorati zarur."
      : lang === 'ru'
      ? "Умеренный риск: Вероятность около 17% (1 из 6). Рекомендуется коррекция диеты и контроль веса."
      : "Moderate risk: 10-year probability is approximately 17%. Lifestyle intervention advised.";
  } else if (score <= 20) {
    riskLevel = 'HIGH';
    probabilityPercent = 33;
    description = lang === 'uz'
      ? "Yuqori xavf: 10 yillik ehtimollik 33% (har 3 kishidan birida). Zudlik bilan turmush tarzini o'zgartirish va laboratoriya tekshiruvi tavsiya etiladi."
      : lang === 'ru'
      ? "Высокий риск: Вероятность 33% (1 из 3). Рекомендуется лабораторный скрининг (глюкоза, HbA1c)."
      : "High risk: 10-year probability is 33%. Urgent lifestyle modification and diagnostic screening indicated.";
  } else {
    riskLevel = 'VERY_HIGH';
    probabilityPercent = 50;
    description = lang === 'uz'
      ? "O'ta yuqori xavf: 10 yillik ehtimollik 50% (har 2 kishidan birida diabet rivojlanishi mumkin). Endokrinolog ko'rigi shart!"
      : lang === 'ru'
      ? "Очень высокий риск: Вероятность 50% (1 из 2). Необходима очная консультация эндокринолога!"
      : "Very high risk: 10-year probability is 50%. Immediate endocrinologist evaluation recommended.";
  }

  return {
    totalScore: score,
    maxScore: 26,
    riskLevel,
    tenYearProbabilityPercent: probabilityPercent,
    bmiCalculated: bmi,
    description,
    recommendations: score >= 12 ? [
      lang === 'uz' ? "Vaznni kamida 5-7% ga kamaytirish" : "Reduce body weight by at least 5-7%",
      lang === 'uz' ? "Haftada kamida 150 daqiqa o'rtacha jismoniy faollik" : "At least 150 mins of moderate weekly activity",
      lang === 'uz' ? "Har yili HbA1c va och qoringa glyukozani tekshirtirish" : "Annual HbA1c and fasting glucose screening"
    ] : [
      lang === 'uz' ? "Sog'lom turmush tarzi va muvozanatli ovqatlanishni davom ettirish" : "Maintain a healthy lifestyle and balanced diet"
    ]
  };
}

module.exports = {
  calculateFINDRISC
};

