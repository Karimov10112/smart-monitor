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

module.exports = router;

