/**
 * Qandli diabet asoratlari xavfini baholash modellari
 * (Klinik mezonlar, UKPDS / ADA xalqaro tavsiyalari asosida tuzilgan skoring algoritmlari)
 */

const { calculateGlycemicMetrics } = require('./metrics');
const { t } = require('./i18n');

/**
 * Bemorning tana massasi indeksini (BMI) hisoblash
 * @param {number} weight - kg
 * @param {number} height - cm
 */
function calculateBMI(weight, height) {
  if (!weight || !height || height <= 0) return null;
  const heightM = height / 100;
  return Number((weight / (heightM * heightM)).toFixed(1));
}

/**
 * Bemorning yoshini hisoblash
 * @param {Date|string} dateOfBirth
 */
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

/**
 * Retinopatiya (Ko'z to'r pardasi asorati) xavfini hisoblash
 */
function assessRetinopathyRisk({ eA1c, durationYears = 5, systolicBP = 120, diabetesType = 'type2', lang = 'uz' }) {
  let score = 0;

  if (eA1c >= 9.0) score += 40;
  else if (eA1c >= 8.0) score += 28;
  else if (eA1c >= 7.0) score += 15;
  else score += 5;

  if (systolicBP >= 140) score += 25;
  else if (systolicBP >= 130) score += 15;
  else score += 5;

  if (durationYears >= 15) score += 25;
  else if (durationYears >= 10) score += 18;
  else if (durationYears >= 5) score += 10;
  else score += 5;

  if (diabetesType === 'type1') score += 10;

  const riskPercent = Math.min(Math.round(score), 98);
  let level = 'LOW';
  if (riskPercent >= 65) level = 'HIGH';
  else if (riskPercent >= 35) level = 'MODERATE';

  const descKey = level === 'HIGH' ? 'retinopathyHigh' : (level === 'MODERATE' ? 'retinopathyModerate' : 'retinopathyLow');

  return {
    riskPercent,
    level,
    description: t(descKey, lang)
  };
}

/**
 * Nefropatiya (Buyrak yetishmovchiligi) xavfini hisoblash
 */
function assessNephropathyRisk({ eA1c, systolicBP = 120, diastolicBP = 80, durationYears = 5, hasKidneyDisease = false, lang = 'uz' }) {
  let score = 0;

  if (hasKidneyDisease) {
    return {
      riskPercent: 95,
      level: 'CRITICAL',
      description: t('nephropathyHigh', lang)
    };
  }

  if (eA1c >= 9.0) score += 35;
  else if (eA1c >= 8.0) score += 25;
  else if (eA1c >= 7.0) score += 12;

  if (systolicBP >= 140 || diastolicBP >= 90) score += 30;
  else if (systolicBP >= 130 || diastolicBP >= 85) score += 18;

  if (durationYears >= 10) score += 25;
  else if (durationYears >= 5) score += 15;

  const riskPercent = Math.min(Math.round(score), 95);
  let level = 'LOW';
  if (riskPercent >= 60) level = 'HIGH';
  else if (riskPercent >= 30) level = 'MODERATE';

  const descKey = level === 'HIGH' ? 'nephropathyHigh' : (level === 'MODERATE' ? 'nephropathyModerate' : 'nephropathyLow');

  return {
    riskPercent,
    level,
    description: t(descKey, lang)
  };
}

/**
 * Yurak-qon tomir asoratlari (Kardiovaskulyar) xavfi
 */
function assessCardiovascularRisk({ age = 45, systolicBP = 120, bmi = 24, eA1c = 7.0, gender = 'male', lang = 'uz' }) {
  let score = 0;

  if (age >= 60) score += 25;
  else if (age >= 50) score += 18;
  else if (age >= 40) score += 10;
  if (gender === 'male') score += 5;

  if (systolicBP >= 150) score += 30;
  else if (systolicBP >= 140) score += 20;
  else if (systolicBP >= 130) score += 10;

  if (bmi >= 35) score += 20;
  else if (bmi >= 30) score += 15;
  else if (bmi >= 25) score += 8;

  if (eA1c >= 8.5) score += 20;
  else if (eA1c >= 7.5) score += 12;

  const riskPercent = Math.min(Math.round(score), 98);
  let level = 'LOW';
  if (riskPercent >= 65) level = 'HIGH';
  else if (riskPercent >= 35) level = 'MODERATE';

  const descKey = level === 'HIGH' ? 'cardioHigh' : (level === 'MODERATE' ? 'cardioModerate' : 'cardioLow');

  return {
    riskPercent,
    level,
    description: t(descKey, lang)
  };
}

/**
 * Neyropatiya va Diabetik tovon (Oyoq) asorati xavfi
 */
function assessNeuropathyFootRisk({ age = 45, durationYears = 5, eA1c = 7.0, cv = 30, lang = 'uz' }) {
  let score = 0;

  if (durationYears >= 10) score += 30;
  else if (durationYears >= 5) score += 15;

  if (eA1c >= 8.5) score += 30;
  else if (eA1c >= 7.5) score += 18;

  if (cv > 36) score += 20;
  if (age >= 60) score += 15;

  const riskPercent = Math.min(Math.round(score), 95);
  let level = 'LOW';
  if (riskPercent >= 60) level = 'HIGH';
  else if (riskPercent >= 30) level = 'MODERATE';

  const descKey = level === 'HIGH' ? 'neuropathyHigh' : (level === 'MODERATE' ? 'neuropathyModerate' : 'neuropathyLow');

  return {
    riskPercent,
    level,
    description: t(descKey, lang)
  };
}

/**
 * To'liq asoratlar xavfini kompleks baholash
 * @param {Object} profile - Bemor parametrlari
 * @param {Array<Object>} records - Qon shakari yozuvlari
 * @param {Object} [options] - Qo'shimcha sozlamalar (lang, unit)
 */
function assessFullDiabetesRisk(profile = {}, records = [], options = {}) {
  const lang = options.lang || profile.lang || 'uz';

  // 1. Glisemik ko'rsatkichlarni hisoblash
  const glycemicMetrics = calculateGlycemicMetrics(records, { lang, unit: options.unit });

  // 2. Bemor profili parametrlari
  const age = profile.age || calculateAge(profile.dateOfBirth) || 45;
  const bmi = profile.bmi || calculateBMI(profile.weight, profile.height) || 24.5;
  const eA1c = profile.hba1c || glycemicMetrics.estimatedA1C || 7.0;

  let systolicBP = profile.systolicPressure || 125;
  let diastolicBP = profile.diastolicPressure || 80;

  const validPressures = records.filter(r => r.systolicPressure && r.systolicPressure > 0);
  if (validPressures.length > 0) {
    const avgSys = validPressures.reduce((s, r) => s + r.systolicPressure, 0) / validPressures.length;
    const avgDia = validPressures.reduce((s, r) => s + (r.diastolicPressure || 80), 0) / validPressures.length;
    systolicBP = Math.round(avgSys);
    diastolicBP = Math.round(avgDia);
  }

  const durationYears = profile.durationYears || profile.diabetesYears || 5;
  const diabetesType = profile.diabetesType || 'type2';
  const gender = profile.gender || 'male';

  // 3. Asoratlarni baholash
  const retinopathy = assessRetinopathyRisk({ eA1c, durationYears, systolicBP, diabetesType, lang });
  const nephropathy = assessNephropathyRisk({ eA1c, systolicBP, diastolicBP, durationYears, lang });
  const cardiovascular = assessCardiovascularRisk({ age, systolicBP, bmi, eA1c, gender, lang });
  const neuropathy = assessNeuropathyFootRisk({ age, durationYears, eA1c, cv: glycemicMetrics.coefficientOfVariation, lang });

  // 4. Umumiy integratsiyalashgan xavf indeksi (0 - 100)
  const overallRiskScore = Math.round(
    (retinopathy.riskPercent * 0.25) +
    (nephropathy.riskPercent * 0.25) +
    (cardiovascular.riskPercent * 0.30) +
    (neuropathy.riskPercent * 0.20)
  );

  let overallLevel = 'LOW';
  if (overallRiskScore >= 65) overallLevel = 'HIGH';
  else if (overallRiskScore >= 35) overallLevel = 'MODERATE';

  // 5. Favqulodda ogohlantirishlar
  const alerts = [];
  if (glycemicMetrics.timeInRange.tbr > 5 || glycemicMetrics.timeInRange.veryLow > 1) {
    alerts.push({
      code: 'CRITICAL_HYPOGLYCEMIA_RISK',
      severity: 'WARNING',
      message: t('alertHypo', lang)
    });
  }

  if (glycemicMetrics.timeInRange.veryHigh > 10) {
    alerts.push({
      code: 'HYPERGLYCEMIA_CRISIS_RISK',
      severity: 'WARNING',
      message: t('alertHyper', lang)
    });
  }

  return {
    calculatedAt: new Date().toISOString(),
    lang,
    patientOverview: {
      age,
      bmi,
      diabetesType,
      averageBloodPressure: `${systolicBP}/${diastolicBP} mmHg`,
      hba1cUsed: eA1c
    },
    glycemicMetrics,
    overallAssessment: {
      score: overallRiskScore,
      level: overallLevel
    },
    complications: {
      retinopathy,
      nephropathy,
      cardiovascular,
      neuropathy
    },
    alerts
  };
}

module.exports = {
  calculateBMI,
  calculateAge,
  assessRetinopathyRisk,
  assessNephropathyRisk,
  assessCardiovascularRisk,
  assessNeuropathyFootRisk,
  assessFullDiabetesRisk
};
