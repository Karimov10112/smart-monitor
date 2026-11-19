/**
 * Kiruvchi ma'lumotlarni tekshirish (validation).
 * Boshqa tizimlardan (klinika sayti, mobil ilova, glyukometr) keladigan ma'lumot xato bo'lishi mumkin:
 * bu modul fiziologik chegaralarni tekshiradi va mashina o'qiy oladigan xato kodlarini qaytaradi.
 */

const { normalizeToMmol } = require('./converters');

/** Fiziologik jihatdan mumkin bo'lgan chegaralar. */
const PHYSIOLOGICAL_LIMITS = {
  glucoseMmol: { min: 1.0, max: 35.0 },
  systolicPressure: { min: 60, max: 260 },
  diastolicPressure: { min: 30, max: 160 },
  pulse: { min: 30, max: 220 },
  weight: { min: 2, max: 350 },
  height: { min: 40, max: 250 },
  age: { min: 0, max: 120 }
};

const MSG = {
  uz: { NOT_OBJECT: "Yozuv obyekt bõliși kerak", NOT_NUMBER: "Son bõliși kerak", OUT_OF_RANGE: "Qiymat {min}–{max} oraliğida bõliși kerak", NO_GLUCOSE: "Kamida bitta qand qiymati kerak", BAD_DATE: "Sana notõğri", FUTURE_DATE: "Sana kelajakda bõlişi mumkin emas", SYS_LT_DIA: "Sistolik bosim diastolikdan katta bõliși kerak" },
  ru: { NOT_OBJECT: 'Запись должна быть объектом', NOT_NUMBER: 'Должно быть числом', OUT_OF_RANGE: 'Значение должно быть в диапазоне {min}–{max}', NO_GLUCOSE: 'Нужно хотя бы одно значение сахара', BAD_DATE: 'Неверная дата', FUTURE_DATE: 'Дата не может быть в будущем', SYS_LT_DIA: 'Систолическое давление должно быть больше диастолического' },
  en: { NOT_OBJECT: 'Record must be an object', NOT_NUMBER: 'Must be a number', OUT_OF_RANGE: 'Value must be between {min} and {max}', NO_GLUCOSE: 'At least one glucose value is required', BAD_DATE: 'Invalid date', FUTURE_DATE: 'Date cannot be in the future', SYS_LT_DIA: 'Systolic pressure must be higher than diastolic' }
};

/**
 * Bitta qand yozuvini tekshiradi.
 * @param {Object} record
 * @param {{ lang?: string, unit?: string, requireGlucose?: boolean }} [options]
 * @returns {{ valid: boolean, errors: Array<{field:string, code:string, message:string}>, normalized: Object|null }}
 */
function validateRecord(record, options = {}) {
  const { lang = 'uz', unit = 'auto', requireGlucose = true } = options;
  const m = MSG[lang] || MSG.uz;
  const errors = [];
  const err = (field, code, p = {}) => errors.push({ field, code, message: Object.keys(p).reduce((s, k) => s.replace(`{${k}}`, p[k]), m[code]) });

  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    err('record', 'NOT_OBJECT');
    return { valid: false, errors, normalized: null };
  }

  const normalized = { ...record };
  const num = (v) => (v === undefined || v === null || v === '' ? undefined : typeof v === 'string' ? Number(v.replace(',', '.')) : v);

  let glucoseCount = 0;
  ['fastingLevel', 'postMealLevel', 'glucose', 'value'].forEach((f) => {
    const raw = num(record[f]);
    if (raw === undefined) return;
    if (typeof raw !== 'number' || isNaN(raw)) return err(f, 'NOT_NUMBER');
    const mmol = normalizeToMmol(raw, unit);
    const L = PHYSIOLOGICAL_LIMITS.glucoseMmol;
    if (mmol < L.min || mmol > L.max) return err(f, 'OUT_OF_RANGE', L);
    normalized[f] = mmol;
    glucoseCount++;
  });
  if (requireGlucose && glucoseCount === 0 && !errors.length) err('glucose', 'NO_GLUCOSE');

  ['systolicPressure', 'diastolicPressure', 'pulse'].forEach((f) => {
    const raw = num(record[f]);
    if (raw === undefined) return;
    if (typeof raw !== 'number' || isNaN(raw)) return err(f, 'NOT_NUMBER');
    const L = PHYSIOLOGICAL_LIMITS[f];
    if (raw < L.min || raw > L.max) return err(f, 'OUT_OF_RANGE', L);
    normalized[f] = raw;
  });
  if (normalized.systolicPressure && normalized.diastolicPressure && normalized.systolicPressure <= normalized.diastolicPressure) {
    err('systolicPressure', 'SYS_LT_DIA');
  }

  const d = record.date || record.createdAt;
  if (d !== undefined) {
    const time = new Date(d).getTime();
    if (isNaN(time)) err('date', 'BAD_DATE');
    else if (time > Date.now() + 24 * 3600 * 1000) err('date', 'FUTURE_DATE');
  }

  return { valid: errors.length === 0, errors, normalized: errors.length ? null : normalized };
}

/**
 * Yozuvlar ro'yxatini tozalaydi: yaroqlilarini qaytaradi, yaroqsizlarini sababi bilan ajratadi.
 * @returns {{ records: Object[], rejected: Array<{index:number, errors:Array}> }}
 */
function sanitizeRecords(records = [], options = {}) {
  const out = { records: [], rejected: [] };
  (Array.isArray(records) ? records : []).forEach((r, index) => {
    const v = validateRecord(r, options);
    if (v.valid) out.records.push(v.normalized);
    else out.rejected.push({ index, errors: v.errors });
  });
  return out;
}

module.exports = { PHYSIOLOGICAL_LIMITS, validateRecord, sanitizeRecords };
