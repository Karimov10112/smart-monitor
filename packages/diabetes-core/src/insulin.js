/**
 * Insulin kalkulyatori (Bolus, Korreksiya va Tavsiya qilinuvchi dozalar)
 * Klinik diabetologiya qoidalari: 500-Rule (ICR) va 1800/100-Rule (ISF) asosida
 */

const { normalizeToMmol } = require('./converters');

/**
 * Insulin-to-Carbohydrate Ratio (ICR) ni hisoblash: 1 birlik insulin necha gramm uglevod qoplaydi
 * 500 qoidasi: ICR = 500 / Total Daily Dose (TDD)
 * @param {number} totalDailyDose - Bir kunda qabul qilinadigan jami insulin (birlik)
 */
function calculateICR(totalDailyDose) {
  if (!totalDailyDose || totalDailyDose <= 0) return 10; // O'rtacha 1:10
  return Number((500 / totalDailyDose).toFixed(1));
}

/**
 * Insulin Sensitivity Factor (ISF / Sezuvchanlik omili): 1 birlik insulin qandni qanchaga tushiradi
 * 100 qoidasi (mmol/L): ISF = 100 / TDD
 * @param {number} totalDailyDose - Jami sutkalik insulin (birlik)
 */
function calculateISF(totalDailyDose) {
  if (!totalDailyDose || totalDailyDose <= 0) return 2.0; // O'rtacha 2.0 mmol/L
  return Number((100 / totalDailyDose).toFixed(1));
}

/**
 * Ovqat oldi va korreksiya insulin dozasini hisoblash (Bolus Calculator)
 * @param {Object} params
 * @param {number} params.currentGlucose - Hozirgi qand miqdori (mmol/L yoki mg/dL)
 * @param {number} [params.targetGlucose=6.0] - Maqsadli qand miqdori (standart 6.0 mmol/L)
 * @param {number} params.carbsGrams - Yeyilayotgan uglevod miqdori (gramm)
 * @param {number} [params.icr] - 1 birlik insulin necha gramm uglevodga to'g'ri kelishi
 * @param {number} [params.isf] - 1 birlik insulin qandni qancha tushirishi (mmol/L)
 * @param {number} [params.totalDailyDose] - Agar icr/isf berilmagan bo'lsa, TDD dan hisoblanadi
 */
function calculateBolusDose({
  currentGlucose,
  targetGlucose = 6.0,
  carbsGrams = 0,
  icr,
  isf,
  totalDailyDose
}) {
  const current = normalizeToMmol(currentGlucose);
  const target = normalizeToMmol(targetGlucose);

  if (current === null) {
    throw new Error("currentGlucose parametri kiritilishi shart.");
  }

  // Agar ICR yoki ISF berilmagan bo'lsa, TDD orqali hisoblash
  const activeICR = icr || (totalDailyDose ? calculateICR(totalDailyDose) : 10);
  const activeISF = isf || (totalDailyDose ? calculateISF(totalDailyDose) : 2.0);

  // 1. Ovqat uchun doza (Food Bolus): Uglevod / ICR
  const foodBolus = carbsGrams > 0 ? carbsGrams / activeICR : 0;

  // 2. Qandni tushirish uchun korreksiya dozasi (Correction Bolus): (Hozirgi qand - Maqsadli qand) / ISF
  let correctionBolus = 0;
  if (current > target) {
    correctionBolus = (current - target) / activeISF;
  }

  // Jami tavsiya qilingan doza
  const totalSuggested = Number((foodBolus + correctionBolus).toFixed(1));

  return {
    currentGlucoseMmol: current,
    targetGlucoseMmol: target,
    carbsGrams,
    icrUsed: activeICR,
    isfUsed: activeISF,
    foodBolusUnits: Number(foodBolus.toFixed(1)),
    correctionBolusUnits: Number(correctionBolus.toFixed(1)),
    totalSuggestedUnits: Math.max(0, totalSuggested),
    warning: current < 4.0 ? "Diqqat: Gipoglikemiya! Insulin qabul qilishdan oldin tez ta'sir qiluvchi uglevod iste'mol qiling." : null
  };
}

module.exports = {
  calculateICR,
  calculateISF,
  calculateBolusDose
};

