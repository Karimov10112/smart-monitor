/**
 * Glisemik monitoring ko'rsatkichlari (Xalqaro ADA - American Diabetes Association standartlari asosida)
 */

const { normalizeToMmol } = require('./converters');
const { t } = require('./i18n');

// Standart chegaralar (mmol/L)
const DEFAULT_THRESHOLDS = {
  veryLow: 3.0,     // Og'ir gipoglikemiya (Level 2)
  low: 3.9,         // Gipoglikemiya chegarasi (Level 1)
  targetMin: 3.9,   // Maqsadli oraliq minimal
  targetMax: 10.0,  // Maqsadli oraliq maksimal
  high: 10.0,       // Giperglikemiya (Level 1)
  veryHigh: 13.9    // Og'ir giperglikemiya (Level 2)
};

/**
 * Qand miqdori yozuvlaridan glisemik ko'rsatkichlarni hisoblaydi
 * @param {Array<Object>} records - [{ fastingLevel, postMealLevel, date, ... }]
 * @param {Object} [options] - Qo'shimcha sozlamalar (lang, unit, thresholds)
 */
function calculateGlycemicMetrics(records = [], options = {}) {
  const lang = options.lang || 'uz';
  const unit = options.unit || 'auto';
  const thresholds = { ...DEFAULT_THRESHOLDS, ...(options.thresholds || {}) };

  if (!Array.isArray(records) || records.length === 0) {
    return {
      totalReadings: 0,
      meanGlucose: 0,
      estimatedA1C: 0,
      standardDeviation: 0,
      coefficientOfVariation: 0,
      stability: 'UNKNOWN',
      timeInRange: { tir: 0, tar: 0, tbr: 0, veryHigh: 0, veryLow: 0 },
      recommendations: []
    };
  }

  // Barcha mavjud o'lchovlarni bitta massivga yig'ish (och qoringa va ovqatdan keyin)
  const values = [];
  records.forEach(r => {
    if (r === undefined || r === null) return;
    const rawVals = [r.fastingLevel, r.postMealLevel, r.glucose, r.value];
    rawVals.forEach(val => {
      if (typeof val === 'number' && !isNaN(val) && val > 0) {
        values.push(normalizeToMmol(val, unit));
      }
    });
  });

  const count = values.length;
  if (count === 0) {
    return {
      totalReadings: 0,
      meanGlucose: 0,
      estimatedA1C: 0,
      standardDeviation: 0,
      coefficientOfVariation: 0,
      stability: 'UNKNOWN',
      timeInRange: { tir: 0, tar: 0, tbr: 0, veryHigh: 0, veryLow: 0 },
      recommendations: []
    };
  }

  // 1. O'rtacha qiymat (Mean)
  const sum = values.reduce((acc, val) => acc + val, 0);
  const meanGlucose = Number((sum / count).toFixed(2));

  // 2. Standart og'ish (Standard Deviation - SD)
  const variance = values.reduce((acc, val) => acc + Math.pow(val - meanGlucose, 2), 0) / count;
  const standardDeviation = Number(Math.sqrt(variance).toFixed(2));

  // 3. Glisemik o'zgaruvchanlik koeffitsiyenti (CV% = SD / Mean * 100)
  const coefficientOfVariation = meanGlucose > 0 
    ? Number(((standardDeviation / meanGlucose) * 100).toFixed(1))
    : 0;

  const stability = coefficientOfVariation <= 36 ? 'STABLE' : 'UNSTABLE';

  // 4. Taxminiy HbA1c (Nathan et al. ADA formulasi)
  const meanMgDl = meanGlucose * 18.0182;
  const estimatedA1C = Number(((meanMgDl + 46.7) / 28.7).toFixed(1));

  // 5. TIR, TAR, TBR taqsimoti
  let inRangeCount = 0;
  let highCount = 0;
  let veryHighCount = 0;
  let lowCount = 0;
  let veryLowCount = 0;

  values.forEach(v => {
    if (v >= thresholds.targetMin && v <= thresholds.targetMax) {
      inRangeCount++;
    } else if (v > thresholds.targetMax) {
      highCount++;
      if (v >= thresholds.veryHigh) {
        veryHighCount++;
      }
    } else if (v < thresholds.targetMin) {
      lowCount++;
      if (v <= thresholds.veryLow) {
        veryLowCount++;
      }
    }
  });

  const tir = Number(((inRangeCount / count) * 100).toFixed(1));
  const tar = Number(((highCount / count) * 100).toFixed(1));
  const tbr = Number(((lowCount / count) * 100).toFixed(1));
  const veryHigh = Number(((veryHighCount / count) * 100).toFixed(1));
  const veryLow = Number(((veryLowCount / count) * 100).toFixed(1));

  // Lokalizatsiyalangan tavsiyalar
  const recommendations = [];
  if (tir >= 70) {
    recommendations.push(t('tirGood', lang));
  } else {
    recommendations.push(t('tirLow', lang, { value: tir }));
  }

  if (stability === 'UNSTABLE') {
    recommendations.push(t('unstableCV', lang, { value: coefficientOfVariation }));
  }

  if (tbr > 4) {
    recommendations.push(t('highTbr', lang, { value: tbr }));
  }

  return {
    totalReadings: count,
    meanGlucose,
    meanGlucoseMgDl: Number(meanMgDl.toFixed(1)),
    estimatedA1C,
    standardDeviation,
    coefficientOfVariation,
    stability,
    timeInRange: {
      tir,
      tar,
      tbr,
      veryHigh,
      veryLow
    },
    recommendations
  };
}

module.exports = {
  DEFAULT_THRESHOLDS,
  calculateGlycemicMetrics
};
