// node --test — kutubxonaning avtomatik testlari (assert bilan)
const test = require('node:test');
const assert = require('node:assert/strict');
const sdk = require('../src');

const day = (n, h = 8) => new Date(Date.UTC(2026, 10, n, h)).toISOString();

test('metrics: TIR, eA1c va GMI hisoblanadi', () => {
  const m = sdk.calculateGlycemicMetrics([{ fastingLevel: 6 }, { fastingLevel: 8 }, { postMealLevel: 12 }, { fastingLevel: 3.5 }]);
  assert.equal(m.totalReadings, 4);
  assert.equal(m.timeInRange.tir, 50);
  assert.equal(m.timeInRange.tar, 25);
  assert.equal(m.timeInRange.tbr, 25);
  assert.ok(m.estimatedA1C > 6 && m.estimatedA1C < 8);
  assert.ok(m.glucoseManagementIndicator > 6 && m.glucoseManagementIndicator < 8);
});

test('doctor alert: shifokorga signal chegaralari (11 / 14 / 3.5)', () => {
  assert.equal(sdk.evaluateDoctorAlert({ fastingLevel: 11 }).shouldAlert, true);
  assert.equal(sdk.evaluateDoctorAlert({ fastingLevel: 10.9 }).shouldAlert, false);
  assert.equal(sdk.evaluateDoctorAlert({ postMealLevel: 13.9 }).shouldAlert, false);
  assert.equal(sdk.evaluateDoctorAlert({ postMealLevel: 14 }).alertType, 'CRITICAL_HIGH');
  assert.equal(sdk.evaluateDoctorAlert({ fastingLevel: 3.5 }).alertType, 'CRITICAL_LOW');
});

test('glikemik profil rejasi: 6 nuqta, 2-tipda tushlik oldi ixtiyoriy', () => {
  const p1 = sdk.buildGlycemicProfilePlan({ diabetesType: 'type1' });
  assert.equal(p1.totalPoints, 6);
  assert.equal(p1.points.find((p) => p.id === 'pre_lunch').required, true);
  const p2 = sdk.buildGlycemicProfilePlan({ diabetesType: 'type2', includeAll: false });
  assert.equal(p2.totalPoints, 5);
  assert.match(p1.points[5].instruction, /Lantus/);
  assert.match(sdk.buildGlycemicProfilePlan({ lang: 'ru' }).points[5].instruction, /Лантус/);
});

test('needsGlycemicProfile: 15.6 — profil kerak, 7.2 — kerak emas', () => {
  const r = sdk.needsGlycemicProfile({ fastingLevel: 15.6 });
  assert.equal(r.required, true);
  assert.equal(r.severity, 'CRITICAL');
  assert.equal(sdk.needsGlycemicProfile({ postMealLevel: 13.2 }).severity, 'HIGH');
  assert.equal(sdk.needsGlycemicProfile({ fastingLevel: 7.2 }).required, false);
  assert.equal(sdk.needsGlycemicProfile({ fastingLevel: 3.2 }).severity, 'CRITICAL');
});

test('analyzeGlycemicProfile: tonggi giperglikemiya va ovqatdan keyingi sakrash', () => {
  const a = sdk.analyzeGlycemicProfile(
    { fasting: 9.4, post_breakfast: 14.1, pre_lunch: 8, post_lunch: 9.5, pre_dinner: 7.1, bedtime: 8.0 },
    { diabetesType: 'type1' }
  );
  const codes = a.patterns.map((p) => p.code);
  assert.ok(codes.includes('FASTING_HYPERGLYCEMIA'));
  assert.ok(codes.includes('POSTPRANDIAL_SPIKE'));
  assert.equal(a.complete, true);
  assert.equal(a.overall, 'NEEDS_ATTENTION');
  assert.equal(a.summary.amplitude, 7.0);
});

test('analyzeGlycemicProfile: gipoglikemiya — shifokorga xabar, to\'liq emas', () => {
  const a = sdk.analyzeGlycemicProfile([{ point: 'fasting', value: 3.4 }, { point: 'bedtime', value: 6.5 }], { diabetesType: 'type2' });
  assert.equal(a.shouldNotifyDoctor, true);
  assert.equal(a.overall, 'CRITICAL');
  assert.equal(a.complete, false);
  assert.ok(a.missingNote);
});

test('analyzeGlycemicProfile: hammasi me\'yorda — GOOD', () => {
  const a = sdk.analyzeGlycemicProfile({ fasting: 5.5, post_breakfast: 7.8, post_lunch: 8.1, pre_dinner: 6.2, bedtime: 7.0 });
  assert.equal(a.overall, 'GOOD');
  assert.equal(a.patterns[0].code, 'ALL_IN_TARGET');
});

test('trend: qand oshib borayotgani aniqlanadi', () => {
  const rising = Array.from({ length: 14 }, (_, i) => ({ date: day(i + 1), fastingLevel: 6 + i * 0.3 }));
  const t = sdk.analyzeGlucoseTrend(rising, { now: day(14, 12) });
  assert.equal(t.direction, 'WORSENING');
  assert.ok(t.slopePerWeek > 1.5);
  assert.ok(t.change.meanGlucose > 0);
  const falling = rising.map((r, i) => ({ ...r, fastingLevel: 12 - i * 0.3 }));
  assert.equal(sdk.analyzeGlucoseTrend(falling).direction, 'IMPROVING');
  assert.equal(sdk.analyzeGlucoseTrend([{ date: day(1), fastingLevel: 6 }]).direction, 'INSUFFICIENT_DATA');
});

test('hypoglycemia episodes: 1- va 2-daraja', () => {
  const e = sdk.detectHypoglycemiaEpisodes([{ date: day(1), fastingLevel: 3.6 }, { date: day(2), postMealLevel: 2.8 }, { date: day(3), fastingLevel: 6 }]);
  assert.deepEqual(e.map((x) => x.level), [1, 2]);
});

test('validation: yaroqsiz qiymatlar kod bilan rad etiladi', () => {
  assert.equal(sdk.validateRecord({ fastingLevel: 6.1 }).valid, true);
  assert.equal(sdk.validateRecord({ fastingLevel: '6,1' }).normalized.fastingLevel, 6.1);
  assert.equal(sdk.validateRecord({ fastingLevel: 120 }).normalized.fastingLevel, 6.66); // mg/dL avtomatik
  assert.equal(sdk.validateRecord({ fastingLevel: 0.4 }).errors[0].code, 'OUT_OF_RANGE');
  assert.equal(sdk.validateRecord({ systolicPressure: 120 }).errors[0].code, 'NO_GLUCOSE');
  assert.equal(sdk.validateRecord({ fastingLevel: 6, systolicPressure: 80, diastolicPressure: 90 }).errors[0].code, 'SYS_LT_DIA');
  const s = sdk.sanitizeRecords([{ fastingLevel: 6 }, { fastingLevel: 'abc' }, null]);
  assert.equal(s.records.length, 1);
  assert.equal(s.rejected.length, 2);
});

test('handlers: REST javoblari va xato kodlari', () => {
  const h = sdk.createDiabetesHandlers();
  const ok = h.risk({ profile: { age: 56, diabetesType: 'type2' }, records: [{ fastingLevel: 8.4, postMealLevel: 13 }] });
  assert.equal(ok.status, 200);
  assert.ok(['LOW', 'MODERATE', 'HIGH'].includes(ok.body.data.overallAssessment.level));
  assert.equal(h.metrics({}).status, 400);
  assert.equal(h.metrics({ records: [{ fastingLevel: 'x' }] }).body.error.code, 'NO_VALID_RECORDS');
  const fhir = h.risk({ records: [{ fastingLevel: 7 }], format: 'fhir', patientId: 'p1' });
  assert.equal(fhir.body.data.resourceType, 'RiskAssessment');
  let fired = null;
  const h2 = sdk.createDiabetesHandlers({ onAlert: (a) => { fired = a; } });
  const al = h2.alert({ fastingLevel: 15.6, patientName: 'Test' });
  assert.equal(al.body.data.shouldAlert, true);
  assert.equal(al.body.data.glycemicProfile.required, true);
  assert.equal(fired.alertType, 'CRITICAL_HIGH');
});

test('openapi: barcha endpointlar tavsiflangan', () => {
  const spec = sdk.getOpenAPISpec();
  assert.equal(spec.openapi, '3.0.3');
  ['/metrics', '/risk', '/alert', '/glycemic-profile/plan', '/glycemic-profile/analyze', '/trend', '/fhir/observation'].forEach((p) => assert.ok(spec.paths[p], p));
  assert.equal(spec.info.version, sdk.VERSION);
});

test('monitor: kritik o\'lchovda hodisa va imzolangan webhook', async () => {
  const sent = [];
  const fakeFetch = async (url, init) => { sent.push({ url, init }); return { ok: true, status: 200 }; };
  const mon = sdk.createPatientMonitor({ webhookUrl: 'https://clinic.example/hook', webhookSecret: 's3cret', fetch: fakeFetch });
  const events = [];
  mon.on('critical', (e) => events.push(['critical', e.alert.criticalLevel]));
  mon.on('profile-required', () => events.push(['profile']));
  mon.on('invalid', () => events.push(['invalid']));
  mon.ingest({ fastingLevel: 15.6 }, { firstName: 'Aziza' });
  mon.ingest({ fastingLevel: 6.2 });
  mon.ingest({ fastingLevel: 'xx' });
  await new Promise((r) => setImmediate(r));
  assert.deepEqual(events, [['critical', 15.6], ['profile'], ['invalid']]);
  assert.equal(sent.length, 1);
  const sig = sent[0].init.headers['X-Diabets-Signature'];
  assert.equal(sdk.verifyWebhookSignature(sent[0].init.body, sig, 's3cret'), true);
  assert.equal(sdk.verifyWebhookSignature(sent[0].init.body, sig, 'wrong'), false);
});

test('express router: haqiqiy HTTP so\'rov', async (t) => {
  let express;
  try { express = require('express'); } catch { try { express = require('../../../backend/node_modules/express'); } catch { return t.skip('express o\'rnatilmagan'); } }
  const app = express();
  app.use('/api/diabetes', sdk.createExpressRouter(express));
  const server = app.listen(0);
  try {
    const base = `http://127.0.0.1:${server.address().port}/api/diabetes`;
    const r = await fetch(base + '/glycemic-profile/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ measurements: { fasting: 9.4, post_breakfast: 14.1 }, lang: 'en' }) });
    const j = await r.json();
    assert.equal(r.status, 200);
    assert.ok(j.data.patterns.some((p) => p.code === 'FASTING_HYPERGLYCEMIA'));
    const spec = await (await fetch(base + '/openapi.json')).json();
    assert.equal(spec.servers[0].url, '/api/diabetes');
    const bad = await fetch(base + '/trend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(bad.status, 400);
  } finally { server.close(); }
});
