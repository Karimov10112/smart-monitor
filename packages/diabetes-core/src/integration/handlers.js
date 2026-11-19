/**
 * Freymvorkga bog'liq bo'lmagan integratsiya handlerlari.
 * Har bir handler: (body) => { status, body }. Express, Fastify, Koa, Next.js API route,
 * AWS Lambda yoki oddiy http serverga bir xil ulanadi.
 */

const { calculateGlycemicMetrics } = require('../metrics');
const { assessFullDiabetesRisk } = require('../riskModels');
const { evaluateDoctorAlert } = require('../doctorAlert');
const { buildGlycemicProfilePlan, analyzeGlycemicProfile, needsGlycemicProfile } = require('../glycemicProfile');
const { analyzeGlucoseTrend, detectHypoglycemiaEpisodes } = require('../trends');
const { calculateFINDRISC } = require('../findrisc');
const { calculateBolusDose } = require('../insulin');
const { parseFHIRObservations, toFHIRRiskAssessment } = require('../fhirAdapter');
const { sanitizeRecords, validateRecord } = require('../validation');

const LANGS = ['uz', 'ru', 'en'];
const ok = (data, extra = {}) => ({ status: 200, body: { success: true, data, ...extra } });
const bad = (code, message, details) => ({ status: 400, body: { success: false, error: { code, message, details } } });

function langOf(body, fallback) {
  const l = body && body.lang;
  return LANGS.includes(l) ? l : fallback;
}

/** Yozuvlarni tekshiradi; hammasi yaroqsiz bo'lsa — 400. */
function takeRecords(body, lang) {
  if (!body || !Array.isArray(body.records)) return { error: bad('RECORDS_REQUIRED', '`records` massiv bo\'lishi kerak') };
  const { records, rejected } = sanitizeRecords(body.records, { lang, unit: body.unit });
  if (!records.length) return { error: bad('NO_VALID_RECORDS', 'Yaroqli yozuv topilmadi', rejected) };
  return { records, rejected };
}

/**
 * @param {{ defaultLang?: 'uz'|'ru'|'en', onAlert?: (alert:Object, body:Object) => void }} [options]
 */
function createDiabetesHandlers(options = {}) {
  const defaultLang = options.defaultLang || 'uz';
  const safe = (fn) => (body = {}) => {
    try { return fn(body || {}); } catch (e) { return { status: 500, body: { success: false, error: { code: 'INTERNAL', message: e.message } } }; }
  };

  return {
    /** POST /metrics — TIR/TAR/TBR, eA1c, GMI, CV% */
    metrics: safe((body) => {
      const lang = langOf(body, defaultLang);
      const r = takeRecords(body, lang); if (r.error) return r.error;
      return ok(calculateGlycemicMetrics(r.records, { lang, thresholds: body.thresholds }), { rejected: r.rejected });
    }),

    /** POST /risk — 4 ta asorat xavfi + umumiy indeks (FHIR formatida ham) */
    risk: safe((body) => {
      const lang = langOf(body, defaultLang);
      const r = takeRecords(body, lang); if (r.error) return r.error;
      const result = assessFullDiabetesRisk(body.profile || body.patientProfile || {}, r.records, { lang });
      if (body.format === 'fhir') return ok(toFHIRRiskAssessment(result, body.patientId));
      return ok(result, { rejected: r.rejected });
    }),

    /** POST /alert — bitta o'lchov shifokorga shoshilinch signal talab qiladimi */
    alert: safe((body) => {
      const lang = langOf(body, defaultLang);
      const v = validateRecord(body, { lang, unit: body.unit });
      if (!v.valid) return bad('INVALID_READING', 'O\'lchov noto\'g\'ri', v.errors);
      const alert = evaluateDoctorAlert({ ...v.normalized, patientName: body.patientName, lang });
      const profile = needsGlycemicProfile({ ...v.normalized, lang });
      if (alert.shouldAlert && typeof options.onAlert === 'function') options.onAlert(alert, body);
      return ok({ ...alert, glycemicProfile: profile });
    }),

    /** POST /glycemic-profile/plan — 6 nuqtali sutkalik profil rejasi */
    profilePlan: safe((body) => ok(buildGlycemicProfilePlan({ ...body, lang: langOf(body, defaultLang) }))),

    /** POST /glycemic-profile/analyze — to'ldirilgan profil tahlili */
    profileAnalyze: safe((body) => {
      if (!body.measurements) return bad('MEASUREMENTS_REQUIRED', '`measurements` kerak: [{ point, value }]');
      return ok(analyzeGlycemicProfile(body.measurements, { ...body, lang: langOf(body, defaultLang) }));
    }),

    /** POST /trend — dinamika va gipoglikemiya epizodlari */
    trend: safe((body) => {
      const lang = langOf(body, defaultLang);
      const r = takeRecords(body, lang); if (r.error) return r.error;
      return ok({ ...analyzeGlucoseTrend(r.records, { lang, periodDays: body.periodDays }), hypoglycemiaEpisodes: detectHypoglycemiaEpisodes(r.records) });
    }),

    /** POST /findrisc — 10 yillik 2-tip diabet xavfi (WHO FINDRISC) */
    findrisc: safe((body) => ok(calculateFINDRISC(body, langOf(body, defaultLang)))),

    /** POST /insulin/bolus — ovqat oldi insulin dozasi */
    bolus: safe((body) => ok(calculateBolusDose(body))),

    /** POST /fhir/observation — HL7 FHIR Observation → xavf tahlili (FHIR RiskAssessment) */
    fhir: safe((body) => {
      const obs = Array.isArray(body) ? body : body.observations || (body.entry || []).map((e) => e.resource);
      if (!Array.isArray(obs) || !obs.length) return bad('OBSERVATIONS_REQUIRED', 'FHIR Observation massivi yoki Bundle kerak');
      const records = parseFHIRObservations(obs);
      const result = assessFullDiabetesRisk(body.profile || {}, records, { lang: langOf(body, defaultLang) });
      return ok(toFHIRRiskAssessment(result, body.patientId));
    })
  };
}

module.exports = { createDiabetesHandlers };
