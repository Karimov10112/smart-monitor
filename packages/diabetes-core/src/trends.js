/**
 * Dinamika (trend) tahlili: qand vaqt o'tishi bilan yaxshilanyaptimi yoki yomonlashyaptimi.
 * - chiziqli regressiya (mmol/L / hafta)
 * - oxirgi davrni oldingi davr bilan solishtirish (o'rtacha qand, TIR)
 * - gipoglikemiya epizodlarini aniqlash
 */

const { normalizeToMmol } = require('./converters');
const { calculateGlycemicMetrics } = require('./metrics');

const DAY = 24 * 3600 * 1000;
const round = (v, d = 2) => Number(v.toFixed(d));

const TEXT = {
  uz: {
    IMPROVING: 'Qand pasayib, yaxşilanmoqda ({slope} mmol/l haftasiga).',
    WORSENING: "Qand oşib bormoqda (+{slope} mmol/l haftasiga) — davolaş rejasini şifokor bilan kõrib çiqing.",
    STABLE: 'Qand darajasi barqaror.',
    INSUFFICIENT_DATA: "Dinamikani baholaş uçun kamida 2 xil kundagi 4 ta õlçov kerak."
  },
  ru: {
    IMPROVING: 'Сахар снижается, улучшение ({slope} ммоль/л в неделю).',
    WORSENING: 'Сахар растёт (+{slope} ммоль/л в неделю) — обсудите лечение с врачом.',
    STABLE: 'Уровень сахара стабилен.',
    INSUFFICIENT_DATA: 'Для оценки динамики нужно минимум 4 замера за 2 разных дня.'
  },
  en: {
    IMPROVING: 'Glucose is falling — improving ({slope} mmol/L per week).',
    WORSENING: 'Glucose is rising (+{slope} mmol/L per week) — review the treatment plan with your doctor.',
    STABLE: 'Glucose level is stable.',
    INSUFFICIENT_DATA: 'At least 4 readings on 2 different days are needed to assess the trend.'
  }
};

/** Yozuvlarni [{ t: ms, value: mmol }] nuqtalariga aylantiradi (och qoringa va ovqatdan keyin alohida nuqta). */
function toPoints(records = [], unit = 'auto') {
  const out = [];
  (records || []).forEach((r) => {
    if (!r) return;
    const t = new Date(r.date || r.createdAt || r.timestamp || Date.now()).getTime();
    if (isNaN(t)) return;
    [['fasting', r.fastingLevel], ['postMeal', r.postMealLevel], ['any', r.glucose ?? r.value]].forEach(([kind, v]) => {
      const mmol = normalizeToMmol(typeof v === 'string' ? parseFloat(v) : v, unit);
      if (typeof mmol === 'number' && mmol > 0) out.push({ t, value: mmol, kind });
    });
  });
  return out.sort((a, b) => a.t - b.t);
}

/**
 * Qand dinamikasini baholaydi.
 * @param {Array} records
 * @param {{ periodDays?: number, lang?: 'uz'|'ru'|'en', unit?: string, now?: Date|number }} [options]
 */
function analyzeGlucoseTrend(records = [], options = {}) {
  const { periodDays = 7, lang = 'uz', unit = 'auto' } = options;
  const t = TEXT[lang] || TEXT.uz;
  const pts = toPoints(records, unit);
  const days = new Set(pts.map((p) => new Date(p.t).toDateString()));

  if (pts.length < 4 || days.size < 2) {
    return { direction: 'INSUFFICIENT_DATA', slopePerWeek: null, message: t.INSUFFICIENT_DATA, current: null, previous: null, change: null, readings: pts.length };
  }

  // chiziqli regressiya: qiymat ~ vaqt (kunlarda)
  const t0 = pts[0].t;
  const xs = pts.map((p) => (p.t - t0) / DAY);
  const ys = pts.map((p) => p.value);
  const n = pts.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  const sxx = xs.reduce((a, x) => a + (x - mx) ** 2, 0);
  const sxy = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0);
  const slopePerDay = sxx > 0 ? sxy / sxx : 0;
  const slopePerWeek = round(slopePerDay * 7);
  // aniqlik: determinatsiya koeffitsiyenti R²
  const syy = ys.reduce((a, y) => a + (y - my) ** 2, 0);
  const r2 = sxx > 0 && syy > 0 ? round((sxy * sxy) / (sxx * syy)) : 0;

  // yo'nalish faqat sezilarli qiyalik (≥ 0.3 mmol/L/hafta) va yetarli aniqlik (R² ≥ 0.1) bo'lsa
  let direction = 'STABLE';
  if (r2 >= 0.1 && slopePerWeek <= -0.3) direction = 'IMPROVING';
  else if (r2 >= 0.1 && slopePerWeek >= 0.3) direction = 'WORSENING';

  // davrlarni solishtirish
  const end = options.now ? new Date(options.now).getTime() : pts[pts.length - 1].t;
  const cur = records.filter((r) => { const x = new Date(r.date || r.createdAt).getTime(); return x > end - periodDays * DAY && x <= end; });
  const prev = records.filter((r) => { const x = new Date(r.date || r.createdAt).getTime(); return x > end - 2 * periodDays * DAY && x <= end - periodDays * DAY; });
  const summarize = (rs) => {
    const m = calculateGlycemicMetrics(rs, { lang, unit });
    return m.totalReadings ? { readings: m.totalReadings, meanGlucose: m.meanGlucose, tir: m.timeInRange.tir } : null;
  };
  const current = summarize(cur);
  const previous = summarize(prev);
  const change = current && previous
    ? { meanGlucose: round(current.meanGlucose - previous.meanGlucose), tir: round(current.tir - previous.tir, 1) }
    : null;

  return {
    direction,
    slopePerWeek,
    confidence: r2,
    message: t[direction].replace('{slope}', (direction === 'IMPROVING' ? '−' : '') + Math.abs(slopePerWeek).toFixed(1)),
    periodDays,
    current,
    previous,
    change,
    readings: n
  };
}

/**
 * Gipoglikemiya epizodlari (< 3.9 mmol/L; < 3.0 — 2-daraja).
 * @returns {Array<{date:string, value:number, level:1|2, kind:string}>}
 */
function detectHypoglycemiaEpisodes(records = [], options = {}) {
  return toPoints(records, options.unit)
    .filter((p) => p.value < 3.9)
    .map((p) => ({ date: new Date(p.t).toISOString(), value: p.value, level: p.value < 3.0 ? 2 : 1, kind: p.kind }));
}

module.exports = { analyzeGlucoseTrend, detectHypoglycemiaEpisodes };
