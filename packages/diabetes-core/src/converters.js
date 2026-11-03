/**
 * Tibbiy o'lchov birliklari konverteri (mmol/L <-> mg/dL)
 */

const GLUCOSE_CONVERSION_FACTOR = 18.0182;

/**
 * mmol/L dan mg/dL ga o'tkazish
 * @param {number} mmolL 
 * @returns {number}
 */
function mmolToMgDl(mmolL) {
  if (typeof mmolL !== 'number' || isNaN(mmolL)) return null;
  return Number((mmolL * GLUCOSE_CONVERSION_FACTOR).toFixed(1));
}

/**
 * mg/dL dan mmol/L ga o'tkazish
 * @param {number} mgDl 
 * @returns {number}
 */
function mgDlToMmol(mgDl) {
  if (typeof mgDl !== 'number' || isNaN(mgDl)) return null;
  return Number((mgDl / GLUCOSE_CONVERSION_FACTOR).toFixed(2));
}

/**
 * Har qanday o'lchovni avtomatik standart mmol/L ga normallashtirish
 * @param {number} value 
 * @param {'mmol/L'|'mg/dL'|'auto'} [unit='auto'] 
 */
function normalizeToMmol(value, unit = 'auto') {
  if (typeof value !== 'number' || isNaN(value)) return null;
  
  if (unit === 'mg/dL') return mgDlToMmol(value);
  if (unit === 'mmol/L') return value;

  // Agar 'auto' bo'lsa: Agar son > 33 bo'lsa, demak bu mg/dL (chunki inson qoni 33 mmol/L dan yuqori bo'lishi o'ta kamyob)
  if (value > 33.0) {
    return mgDlToMmol(value);
  }
  return value;
}

module.exports = {
  mmolToMgDl,
  mgDlToMmol,
  normalizeToMmol,
  GLUCOSE_CONVERSION_FACTOR
};

