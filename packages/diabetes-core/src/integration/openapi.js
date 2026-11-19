/**
 * OpenAPI 3.0 spetsifikatsiyasi — integratsiya interfeysining mashina o'qiy oladigan tavsifi.
 * Swagger UI, Postman yoki kod generatorlari (Python, Java, Dart, PHP mijozlari) uchun.
 */

const pkg = require('../../package.json');

function getOpenAPISpec({ serverUrl = '/api/v1/integration', title = 'Qand Nazorati — Diabetes Integration API' } = {}) {
  const record = {
    type: 'object',
    properties: {
      date: { type: 'string', format: 'date-time' },
      fastingLevel: { type: 'number', example: 7.8, description: 'Och qoringa qand, mmol/L (yoki mg/dL — avtomatik aniqlanadi)' },
      postMealLevel: { type: 'number', example: 11.2, description: 'Ovqatdan 2 soat keyin, mmol/L' },
      glucose: { type: 'number' },
      systolicPressure: { type: 'integer', example: 135 },
      diastolicPressure: { type: 'integer', example: 85 },
      pulse: { type: 'integer' }
    }
  };
  const profile = {
    type: 'object',
    properties: {
      age: { type: 'integer', example: 56 }, gender: { type: 'string', enum: ['male', 'female'] },
      height: { type: 'number', example: 162 }, weight: { type: 'number', example: 79 },
      diabetesType: { type: 'string', enum: ['type1', 'type2', 'gestational', 'prediabetes'] },
      diabetesYears: { type: 'integer', example: 7 }, systolicPressure: { type: 'integer' }, diastolicPressure: { type: 'integer' }
    }
  };
  const lang = { type: 'string', enum: ['uz', 'ru', 'en'], default: 'uz' };
  const recordsBody = (extra = {}) => ({
    required: true,
    content: { 'application/json': { schema: { type: 'object', required: ['records'], properties: { records: { type: 'array', items: { $ref: '#/components/schemas/Record' } }, lang, ...extra } } } }
  });
  const okResp = (desc) => ({ 200: { description: desc, content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } }, 400: { description: 'Noto\'g\'ri so\'rov', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } });
  const post = (summary, requestBody, desc) => ({ post: { summary, requestBody, responses: okResp(desc) } });

  return {
    openapi: '3.0.3',
    info: {
      title,
      version: pkg.version,
      description: 'Qandli diabet bemorlari holatini monitoring qilish va asoratlar xavfini baholash uchun ochiq integratsiya interfeysi. ' +
        `Asos: ${pkg.name} (npm). Klinika sayti, mobil ilova yoki shifoxona tizimi shu so'rovlar orqali ulanadi.`,
      license: { name: pkg.license }
    },
    servers: [{ url: serverUrl }],
    paths: {
      '/metrics': post('Glisemik ko\'rsatkichlar: TIR, TAR, TBR, eA1c, GMI, CV%', recordsBody(), 'Ko\'rsatkichlar'),
      '/risk': post('Asoratlar xavfi: retinopatiya, nefropatiya, yurak-qon tomir, neyropatiya', recordsBody({ profile: { $ref: '#/components/schemas/Profile' }, format: { type: 'string', enum: ['json', 'fhir'] } }), 'Xavf tahlili'),
      '/alert': post('Bitta o\'lchov — shifokorga shoshilinch signal kerakmi', { required: true, content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/Record' }, { type: 'object', properties: { patientName: { type: 'string' }, lang } }] } } } }, 'Signal qarori'),
      '/glycemic-profile/plan': post('Sutkalik glikemik profil rejasi (6 nuqta)', { content: { 'application/json': { schema: { type: 'object', properties: { diabetesType: profile.properties.diabetesType, treatmentType: { type: 'string', enum: ['insulin', 'oral_meds', 'combined', 'lifestyle_only'] }, lang } } } } }, 'Reja'),
      '/glycemic-profile/analyze': post('Sutkalik profil tahlili', { required: true, content: { 'application/json': { schema: { type: 'object', required: ['measurements'], properties: { measurements: { type: 'array', items: { type: 'object', properties: { point: { type: 'string', enum: ['fasting', 'post_breakfast', 'pre_lunch', 'post_lunch', 'pre_dinner', 'bedtime'] }, value: { type: 'number' } } } }, diabetesType: profile.properties.diabetesType, lang } } } } }, 'Profil tahlili'),
      '/trend': post('Dinamika (regressiya) va gipoglikemiya epizodlari', recordsBody({ periodDays: { type: 'integer', default: 7 } }), 'Dinamika'),
      '/findrisc': post('FINDRISC — 10 yillik 2-tip diabet xavfi (WHO)', { content: { 'application/json': { schema: { type: 'object' } } } }, 'FINDRISC natijasi'),
      '/insulin/bolus': post('Ovqat oldi insulin dozasi (ICR/ISF)', { content: { 'application/json': { schema: { type: 'object' } } } }, 'Doza'),
      '/fhir/observation': post('HL7 FHIR R4 Observation/Bundle → FHIR RiskAssessment', { content: { 'application/fhir+json': { schema: { type: 'object' } }, 'application/json': { schema: { type: 'object' } } } }, 'FHIR RiskAssessment'),
      '/openapi.json': { get: { summary: 'Shu spetsifikatsiya', responses: { 200: { description: 'OpenAPI 3.0 JSON' } } } }
    },
    components: {
      schemas: {
        Record: record,
        Profile: profile,
        Success: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'object' }, rejected: { type: 'array', items: { type: 'object' } } } },
        Error: { type: 'object', properties: { success: { type: 'boolean', example: false }, error: { type: 'object', properties: { code: { type: 'string' }, message: { type: 'string' }, details: {} } } } }
      }
    }
  };
}

module.exports = { getOpenAPISpec };
