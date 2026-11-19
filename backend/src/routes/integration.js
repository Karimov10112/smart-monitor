const express = require('express');
const router = express.Router();
const {
  getGlycemicMetricsAPI,
  assessRiskAPI,
  fhirIntegrationAPI,
  getIntegrationDocs
} = require('../controllers/integrationController');

// Ochiq API hujjatlari
router.get('/docs', getIntegrationDocs);

// Glisemik hisob-kitoblar interfeysi
router.post('/glycemic-metrics', getGlycemicMetricsAPI);

// Asoratlar xavfini baholash interfeysi
router.post('/assess-risk', assessRiskAPI);

// HL7 FHIR xalqaro integratsiya interfeysi
router.post('/fhir/observation', fhirIntegrationAPI);

// @karimov_dev/diabets kutubxonasining tayyor integratsiya interfeysi:
// /metrics, /risk, /alert, /glycemic-profile/plan, /glycemic-profile/analyze, /trend,
// /findrisc, /insulin/bolus, /fhir/observation va /openapi.json (OpenAPI 3.0)
const { sdk } = require('../lib/diabets');
router.use(sdk.createExpressRouter(express, { basePath: '/api/v1/integration' }));

module.exports = router;

