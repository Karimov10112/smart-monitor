/**
 * Shifokorga shoshilinch ogohlantirish (Emergency Clinical Triage) moduli
 * Qand darajasi hayot uchun xavfli bo'lganda avtomatik baholash va ogohlantirish matnlarini shakllantiradi.
 */

const { normalizeToMmol } = require('./converters');

const CRITICAL_LIMITS = {
  fasting: {
    high: 11.0, // Och qoringa >= 11.0 mmol/l
    low: 3.5    // Och qoringa <= 3.5 mmol/l
  },
  postMeal: {
    high: 14.0, // Ovqatdan keyin >= 14.0 mmol/l
    low: 3.5    // Ovqatdan keyin <= 3.5 mmol/l
  }
};

/**
 * Berilgan o'lchov shifokorga shoshilinch xabar yuborishni talab qiladimi-yo'qligini baholaydi
 * @param {Object} params
 * @param {number} [params.fastingLevel]
 * @param {number} [params.postMealLevel]
 * @param {number} [params.glucose]
 * @param {'fasting'|'postMeal'|'auto'} [params.category='auto']
 * @param {string} [params.patientName='Bemor']
 * @param {'uz'|'ru'|'en'} [params.lang='uz']
 */
function evaluateDoctorAlert(params = {}) {
  const { patientName = 'Bemor', lang = 'uz' } = params;

  let fasting = normalizeToMmol(params.fastingLevel);
  let postMeal = normalizeToMmol(params.postMealLevel);

  if (params.glucose) {
    const val = normalizeToMmol(params.glucose);
    if (params.category === 'postMeal') postMeal = val;
    else fasting = val;
  }

  let isCritical = false;
  let criticalLevel = 0;
  let detectedCategory = '';
  let alertType = 'NONE'; // 'CRITICAL_HIGH' | 'CRITICAL_LOW' | 'NONE'

  // 1. Och qoringa tekshiruv
  if (typeof fasting === 'number' && fasting > 0) {
    if (fasting >= CRITICAL_LIMITS.fasting.high) {
      isCritical = true;
      criticalLevel = fasting;
      detectedCategory = 'fasting';
      alertType = 'CRITICAL_HIGH';
    } else if (fasting <= CRITICAL_LIMITS.fasting.low) {
      isCritical = true;
      criticalLevel = fasting;
      detectedCategory = 'fasting';
      alertType = 'CRITICAL_LOW';
    }
  }

  // 2. Ovqatdan keyin tekshiruv
  if (!isCritical && typeof postMeal === 'number' && postMeal > 0) {
    if (postMeal >= CRITICAL_LIMITS.postMeal.high) {
      isCritical = true;
      criticalLevel = postMeal;
      detectedCategory = 'postMeal';
      alertType = 'CRITICAL_HIGH';
    } else if (postMeal <= CRITICAL_LIMITS.postMeal.low) {
      isCritical = true;
      criticalLevel = postMeal;
      detectedCategory = 'postMeal';
      alertType = 'CRITICAL_LOW';
    }
  }

  if (!isCritical) {
    return {
      shouldAlert: false,
      alertType: 'NONE',
      criticalLevel: null,
      message: null,
      title: null
    };
  }

  // Xabarlarni ko'p tilli shakllantirish
  let title = '';
  let message = '';
  const catLabelUz = detectedCategory === 'fasting' ? 'Och qoringa' : 'Ovqatdan so‘ng';
  const catLabelRu = detectedCategory === 'fasting' ? 'Натощак' : 'После еды';
  const catLabelEn = detectedCategory === 'fasting' ? 'Fasting' : 'Postprandial';

  if (lang === 'uz') {
    const dangerText = alertType === 'CRITICAL_HIGH' ? "O'TA YUQORI" : "XAVFLI DARAJADA PAST (GIPOGLIKEMIYA)";
    title = `🚨 Shoshilinch ogohlantirish: ${patientName}`;
    message = `Qand darajasi: ${criticalLevel} mmol/l (${catLabelUz}) — ${dangerText}! Zudlik bilan tekshiring va zarur chorani ko'ring.`;
  } else if (lang === 'ru') {
    const dangerText = alertType === 'CRITICAL_HIGH' ? 'КРИТИЧЕСКИ ВЫСОКИЙ' : 'ОПАСНО НИЗКИЙ (ГИПОГЛИКЕМИЯ)';
    title = `🚨 Срочное оповещение: ${patientName}`;
    message = `Уровень сахара: ${criticalLevel} ммоль/л (${catLabelRu}) — ${dangerText}! Требуется немедленное медицинское вмешательство.`;
  } else {
    const dangerText = alertType === 'CRITICAL_HIGH' ? 'CRITICALLY HIGH' : 'CRITICALLY LOW (HYPOGLYCEMIA)';
    title = `🚨 Emergency Alert: ${patientName}`;
    message = `Glucose reading: ${criticalLevel} mmol/L (${catLabelEn}) — ${dangerText}! Immediate clinical review required.`;
  }

  return {
    shouldAlert: true,
    alertType,
    criticalLevel,
    category: detectedCategory,
    title,
    message,
    severity: 'URGENT'
  };
}

module.exports = {
  CRITICAL_LIMITS,
  evaluateDoctorAlert
};

