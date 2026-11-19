/**
 * Sutkalik glikemik profil (Daily Glycemic Profile) moduli
 *
 * Endokrinolog tavsiyasi: qand yuqori chiqqanda "bir necha kundan keyin qayta o'lchang" deyilmaydi,
 * balki bir kun davomida belgilangan nuqtalarda qand o'lchanib, sutkalik profil tuziladi.
 * Bu modul: (1) o'lchov rejasini tuzadi, (2) profil kerakligini aniqlaydi, (3) to'ldirilgan profilni tahlil qiladi.
 */

const { normalizeToMmol } = require('./converters');
const { CRITICAL_LIMITS } = require('./doctorAlert');

/** Profilning 6 ta o'lchov nuqtasi. target — shu nuqta uchun maqsadli oraliq (mmol/L). */
const GLYCEMIC_PROFILE_POINTS = [
  { id: 'fasting', time: '07:00', meal: 'breakfast', phase: 'pre', target: { min: 4.0, max: 7.0 } },
  { id: 'post_breakfast', time: '10:00', meal: 'breakfast', phase: 'post', target: { min: 4.0, max: 10.0 } },
  { id: 'pre_lunch', time: '13:00', meal: 'lunch', phase: 'pre', target: { min: 4.0, max: 7.0 }, type1Only: true },
  { id: 'post_lunch', time: '15:00', meal: 'lunch', phase: 'post', target: { min: 4.0, max: 10.0 } },
  { id: 'pre_dinner', time: '18:30', meal: 'dinner', phase: 'pre', target: { min: 4.0, max: 7.0 } },
  { id: 'bedtime', time: '21:30', meal: null, phase: 'night', target: { min: 5.0, max: 8.5 } }
];

const TEXT = {
  uz: {
    points: {
      fasting: 'Ertalab oç qoringa — insulin yoki tabletka içişdan oldin',
      post_breakfast: 'Nonuştadan 2 soat keyin',
      pre_lunch: "Tuşlikdan oldin — oddiy (qisqa ta'sirli) insulin olişdan oldin",
      post_lunch: 'Tuşlikdan 2 soat keyin',
      pre_dinner: 'Keçki ovqatdan oldin — oddiy insulin olişdan oldin',
      bedtime: "Uxlaşdan oldin, soat 21:00–22:00 da — õrta ta'sirli (Insulatard) yoki uzoq ta'sirli (Lantus) insulindan oldin"
    },
    title: 'Sutkalik glikemik profil',
    advice: "Qayta õlçaşni bir necha kunga qoldirmang — profilni bugun yoki ertaga qiling va natijani şifokorga kõrsating.",
    reasonCritical: "Qand xavfli darajada: {value} mmol/l. Sutkalik profil va şifokor nazorati zarur.",
    reasonHigh: 'Qand yuqori: {value} mmol/l. Sutkalik profil qiling.',
    patterns: {
      HYPOGLYCEMIA: "Gipoglikemiya aniqlandi ({points}). 15-15 qoidasini qõllang va dozani şifokor bilan kõrib çiqing.",
      FASTING_HYPERGLYCEMIA: "Ertalabki oç qoringa qand yuqori ({value} mmol/l) — tonggi fenomen yoki bazal insulin/tabletka dozasi yetarli emasligi ehtimoli.",
      POSTPRANDIAL_SPIKE: "Ovqatdan keyin qand keskin oşadi ({meals}: +{delta} mmol/l) — uglevod miqdori yoki ovqat oldi dozasini kõrib çiqing.",
      NOCTURNAL_HYPO_RISK: "Uxlaş oldidan qand past ({value} mmol/l) — tungi gipoglikemiya xavfi. Yengil kraxmalli tamaddi yoki dozani kamaytiriş haqida şifokor bilan maslahatlaşing.",
      BEDTIME_HIGH: "Uxlaş oldidan qand yuqori ({value} mmol/l) — keçki ovqat yoki keçki insulin dozasini tekşiring.",
      HIGH_VARIABILITY: "Kun davomidagi tebraniş katta ({value} mmol/l) — qand barqaror emas.",
      ALL_IN_TARGET: 'Barça nuqtalar maqsadli oraliqda — yaxşi nazorat.'
    },
    incomplete: "Profil toʻliq emas: {count} ta nuqta õlçanmagan ({points})."
  },
  ru: {
    points: {
      fasting: 'Утром натощак — до инсулина или таблеток',
      post_breakfast: 'Через 2 часа после завтрака',
      pre_lunch: 'Перед обедом — до введения короткого (простого) инсулина',
      post_lunch: 'Через 2 часа после обеда',
      pre_dinner: 'Перед ужином — до введения короткого инсулина',
      bedtime: 'Перед сном, в 21:00–22:00 — до инсулина средней продолжительности (Инсулатард) или длительного действия (Лантус)'
    },
    title: 'Суточный гликемический профиль',
    advice: 'Не откладывайте повторный замер на несколько дней — сделайте профиль сегодня или завтра и покажите результат врачу.',
    reasonCritical: 'Опасный уровень сахара: {value} ммоль/л. Нужен суточный профиль и контроль врача.',
    reasonHigh: 'Сахар повышен: {value} ммоль/л. Сделайте суточный профиль.',
    patterns: {
      HYPOGLYCEMIA: 'Выявлена гипогликемия ({points}). Примените правило 15-15 и обсудите дозу с врачом.',
      FASTING_HYPERGLYCEMIA: 'Высокий сахар натощак ({value} ммоль/л) — возможен феномен утренней зари или недостаточная базальная доза.',
      POSTPRANDIAL_SPIKE: 'Резкий подъём после еды ({meals}: +{delta} ммоль/л) — пересмотрите углеводы или дозу перед едой.',
      NOCTURNAL_HYPO_RISK: 'Низкий сахар перед сном ({value} ммоль/л) — риск ночной гипогликемии. Обсудите с врачом перекус или снижение дозы.',
      BEDTIME_HIGH: 'Высокий сахар перед сном ({value} ммоль/л) — проверьте ужин или вечернюю дозу инсулина.',
      HIGH_VARIABILITY: 'Большие колебания за день ({value} ммоль/л) — сахар нестабилен.',
      ALL_IN_TARGET: 'Все точки в целевом диапазоне — хороший контроль.'
    },
    incomplete: 'Профиль неполный: не измерено {count} точек ({points}).'
  },
  en: {
    points: {
      fasting: 'Morning fasting — before insulin or tablets',
      post_breakfast: '2 hours after breakfast',
      pre_lunch: 'Before lunch — before short-acting (regular) insulin',
      post_lunch: '2 hours after lunch',
      pre_dinner: 'Before dinner — before short-acting insulin',
      bedtime: 'At bedtime, 21:00–22:00 — before intermediate-acting (Insulatard) or long-acting (Lantus) insulin'
    },
    title: 'Daily glucose profile',
    advice: "Don't put the re-check off for days — do the profile today or tomorrow and show the results to your doctor.",
    reasonCritical: 'Dangerous glucose level: {value} mmol/L. A daily profile and doctor review are needed.',
    reasonHigh: 'Glucose is high: {value} mmol/L. Do a daily profile.',
    patterns: {
      HYPOGLYCEMIA: 'Hypoglycemia detected ({points}). Use the 15-15 rule and review the dose with your doctor.',
      FASTING_HYPERGLYCEMIA: 'High fasting glucose ({value} mmol/L) — possible dawn phenomenon or insufficient basal dose.',
      POSTPRANDIAL_SPIKE: 'Sharp rise after meals ({meals}: +{delta} mmol/L) — review carbohydrates or the pre-meal dose.',
      NOCTURNAL_HYPO_RISK: 'Low glucose at bedtime ({value} mmol/L) — risk of night-time hypoglycemia. Discuss a snack or a lower dose with your doctor.',
      BEDTIME_HIGH: 'High glucose at bedtime ({value} mmol/L) — check dinner or the evening insulin dose.',
      HIGH_VARIABILITY: 'Large swings during the day ({value} mmol/L) — glucose is unstable.',
      ALL_IN_TARGET: 'All points are in target — good control.'
    },
    incomplete: 'Profile incomplete: {count} point(s) not measured ({points}).'
  }
};

const fill = (s, p = {}) => Object.keys(p).reduce((acc, k) => acc.split(`{${k}}`).join(p[k]), s);
const tx = (lang) => TEXT[lang] || TEXT.uz;
const round1 = (v) => Math.round(v * 10) / 10;

/** Insulin oladigan bemormi (pre-lunch nuqtasi va tungi xavf tahlili shunga bog'liq). */
function usesInsulin({ diabetesType, treatmentType } = {}) {
  return diabetesType === 'type1' || treatmentType === 'insulin' || treatmentType === 'combined';
}

/**
 * Sutkalik glikemik profil o'lchov rejasini tuzadi.
 * @param {Object} [params]
 * @param {'type1'|'type2'|'gestational'|'prediabetes'} [params.diabetesType]
 * @param {'insulin'|'oral_meds'|'combined'|'lifestyle_only'} [params.treatmentType]
 * @param {boolean} [params.includeAll=true] — false bo'lsa, 1-tip/insulinsiz bemorlarga pre_lunch nuqtasi qo'shilmaydi
 * @param {'uz'|'ru'|'en'} [params.lang='uz']
 */
function buildGlycemicProfilePlan(params = {}) {
  const { lang = 'uz', includeAll = true } = params;
  const t = tx(lang);
  const insulin = usesInsulin(params);
  const points = GLYCEMIC_PROFILE_POINTS
    .filter((p) => includeAll || !p.type1Only || insulin)
    .map((p, i) => ({
      order: i + 1,
      id: p.id,
      time: p.time,
      instruction: t.points[p.id],
      target: { ...p.target },
      type1Only: !!p.type1Only,
      required: !p.type1Only || insulin
    }));
  return { title: t.title, advice: t.advice, points, totalPoints: points.length };
}

/**
 * Bitta o'lchov sutkalik profil qilishni talab qiladimi?
 * Qoidalar: och qoringa >= 11 yoki ovqatdan keyin >= 14 (shifokorga signal chegarasi) — CRITICAL;
 * har qanday qiymat >= 13 — HIGH; <= 3.5 — CRITICAL (gipoglikemiya).
 * @param {{fastingLevel?:number, postMealLevel?:number, glucose?:number, unit?:string, lang?:string}} reading
 */
function needsGlycemicProfile(reading = {}) {
  const unit = reading.unit || 'auto';
  const t = tx(reading.lang || 'uz');
  const fasting = normalizeToMmol(reading.fastingLevel, unit);
  const post = normalizeToMmol(reading.postMealLevel, unit);
  const any = normalizeToMmol(reading.glucose, unit);
  const vals = [fasting, post, any].filter((v) => typeof v === 'number' && v > 0);
  if (!vals.length) return { required: false, severity: 'NONE', reason: null, value: null };

  const critical =
    (fasting > 0 && (fasting >= CRITICAL_LIMITS.fasting.high || fasting <= CRITICAL_LIMITS.fasting.low)) ||
    (post > 0 && (post >= CRITICAL_LIMITS.postMeal.high || post <= CRITICAL_LIMITS.postMeal.low)) ||
    (any > 0 && (any >= CRITICAL_LIMITS.postMeal.high || any <= CRITICAL_LIMITS.fasting.low));
  const peak = Math.max(...vals);
  const trough = Math.min(...vals);
  const value = critical && trough <= CRITICAL_LIMITS.fasting.low ? trough : peak;

  if (critical) return { required: true, severity: 'CRITICAL', reason: fill(t.reasonCritical, { value }), value };
  if (peak >= 13.0) return { required: true, severity: 'HIGH', reason: fill(t.reasonHigh, { value: peak }), value: peak };
  return { required: false, severity: 'NONE', reason: null, value: peak };
}

/**
 * To'ldirilgan sutkalik profilni tahlil qiladi.
 * @param {Array<{point:string, value:number}>|Object<string,number>} measurements
 *   — [{ point: 'fasting', value: 9.4 }, ...] yoki { fasting: 9.4, post_breakfast: 12.1, ... }
 * @param {Object} [options] — { lang, unit, diabetesType, treatmentType }
 */
function analyzeGlycemicProfile(measurements, options = {}) {
  const { lang = 'uz', unit = 'auto' } = options;
  const t = tx(lang);
  const insulin = usesInsulin(options);

  const map = {};
  const list = Array.isArray(measurements)
    ? measurements
    : Object.entries(measurements || {}).map(([point, value]) => ({ point, value }));
  list.forEach((m) => {
    const v = normalizeToMmol(Number(m && m.value), unit);
    if (m && GLYCEMIC_PROFILE_POINTS.some((p) => p.id === m.point) && typeof v === 'number' && v > 0) map[m.point] = v;
  });

  const points = GLYCEMIC_PROFILE_POINTS.map((p) => {
    const value = map[p.id];
    let status = 'MISSING';
    if (typeof value === 'number') status = value < 3.9 ? 'LOW' : value < p.target.min ? 'BELOW_TARGET' : value > p.target.max ? 'HIGH' : 'IN_TARGET';
    return { id: p.id, time: p.time, instruction: t.points[p.id], target: { ...p.target }, value: value ?? null, status, required: !p.type1Only || insulin };
  });

  const measured = points.filter((p) => p.value !== null);
  const missing = points.filter((p) => p.value === null && p.required);
  const values = measured.map((p) => p.value);
  const mean = values.length ? round1(values.reduce((a, b) => a + b, 0) / values.length) : null;
  const amplitude = values.length > 1 ? round1(Math.max(...values) - Math.min(...values)) : null;
  const inTarget = measured.filter((p) => p.status === 'IN_TARGET').length;

  const patterns = [];
  const add = (code, severity, params) => patterns.push({ code, severity, message: fill(t.patterns[code], params) });

  const lows = measured.filter((p) => p.value < 3.9);
  if (lows.length) add('HYPOGLYCEMIA', 'CRITICAL', { points: lows.map((p) => t.points[p.id].split(' — ')[0]).join(', ') });

  if (map.fasting > 7.0) add('FASTING_HYPERGLYCEMIA', map.fasting >= CRITICAL_LIMITS.fasting.high ? 'CRITICAL' : 'WARNING', { value: map.fasting });

  const spikes = [
    ['fasting', 'post_breakfast', 'breakfast'],
    ['pre_lunch', 'post_lunch', 'lunch']
  ]
    .filter(([a, b]) => map[a] && map[b] && map[b] - map[a] > 3.0)
    .map(([a, b, meal]) => ({ meal, delta: round1(map[b] - map[a]) }));
  if (spikes.length) {
    const mealNames = { uz: { breakfast: 'nonuşta', lunch: 'tuşlik' }, ru: { breakfast: 'завтрак', lunch: 'обед' }, en: { breakfast: 'breakfast', lunch: 'lunch' } }[lang] || {};
    add('POSTPRANDIAL_SPIKE', 'WARNING', { meals: spikes.map((s) => mealNames[s.meal] || s.meal).join(', '), delta: Math.max(...spikes.map((s) => s.delta)) });
  }

  if (map.bedtime && map.bedtime < 6.0 && insulin && map.bedtime >= 3.9) add('NOCTURNAL_HYPO_RISK', 'WARNING', { value: map.bedtime });
  if (map.bedtime && map.bedtime > 10.0) add('BEDTIME_HIGH', 'WARNING', { value: map.bedtime });
  if (amplitude !== null && amplitude > 5.0) add('HIGH_VARIABILITY', 'WARNING', { value: amplitude });
  if (measured.length && !patterns.length && inTarget === measured.length) add('ALL_IN_TARGET', 'INFO', {});

  const critical = patterns.some((p) => p.severity === 'CRITICAL');
  return {
    title: t.title,
    complete: missing.length === 0,
    completeness: Math.round((measured.length / points.filter((p) => p.required).length) * 100),
    missingNote: missing.length ? fill(t.incomplete, { count: missing.length, points: missing.map((p) => p.time).join(', ') }) : null,
    points,
    summary: {
      measured: measured.length,
      meanGlucose: mean,
      amplitude,
      timeInTargetPercent: measured.length ? Math.round((inTarget / measured.length) * 100) : null,
      min: values.length ? Math.min(...values) : null,
      max: values.length ? Math.max(...values) : null
    },
    patterns,
    shouldNotifyDoctor: critical,
    overall: critical ? 'CRITICAL' : patterns.some((p) => p.severity === 'WARNING') ? 'NEEDS_ATTENTION' : measured.length ? 'GOOD' : 'NO_DATA'
  };
}

module.exports = {
  GLYCEMIC_PROFILE_POINTS,
  buildGlycemicProfilePlan,
  needsGlycemicProfile,
  analyzeGlycemicProfile
};
