const path = require('path');
const {
  calculateGlycemicMetrics,
  assessFullDiabetesRisk,
  parseFHIRObservations,
  toFHIRRiskAssessment
} = require(path.resolve(__dirname, '../../../packages/diabetes-core'));

/**
 * 1. Glisemik ko'rsatkichlarni hisoblash API (TIR, TAR, TBR, eA1c, CV)
 * POST /api/v1/integration/glycemic-metrics
 */
const getGlycemicMetricsAPI = async (req, res) => {
  try {
    const { records, thresholds } = req.body;

    if (!records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        error: "Yaroqsiz so'rov: 'records' massiv bo'lishi shart."
      });
    }

    const metrics = calculateGlycemicMetrics(records, thresholds);

    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Glycemic metrics integration error:', error);
    return res.status(500).json({
      success: false,
      error: "Kutubxona hisoblash jarayonida ichki xatolik yuz berdi."
    });
  }
};

/**
 * 2. Kompleks asoratlar xavfini baholash API (Retinopatiya, Nefropatiya, Kardio, Neyropatiya)
 * POST /api/v1/integration/assess-risk
 */
const assessRiskAPI = async (req, res) => {
  try {
    const { patientProfile = {}, records = [] } = req.body;

    if (!Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        error: "'records' massiv ko'rinishida bo'lishi lozim."
      });
    }

    const assessment = assessFullDiabetesRisk(patientProfile, records);

    return res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Assess risk integration error:', error);
    return res.status(500).json({
      success: false,
      error: "Asoratlarni baholash jarayonida ichki xatolik yuz berdi."
    });
  }
};

/**
 * 3. HL7 FHIR R4 Standartidagi Observationlarni tahlil qilish va RiskAssessment qaytarish
 * POST /api/v1/integration/fhir/observation
 */
const fhirIntegrationAPI = async (req, res) => {
  try {
    const { patientId = 'unknown', observations = [], profile = {} } = req.body;

    if (!Array.isArray(observations)) {
      return res.status(400).json({
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'invalid',
            diagnostics: "'observations' FHIR resurslar massivi bo'lishi shart."
          }
        ]
      });
    }

    // FHIR observationlarini ichki formatga o'tkazamiz
    const records = parseFHIRObservations(observations);

    // Xavfni hisoblaymiz
    const assessment = assessFullDiabetesRisk(profile, records);

    // FHIR RiskAssessment standartiga o'tkazib javob beramiz
    const fhirResponse = toFHIRRiskAssessment(assessment, patientId);

    return res.status(200).json(fhirResponse);
  } catch (error) {
    console.error('FHIR integration error:', error);
    return res.status(500).json({
      resourceType: 'OperationOutcome',
      issue: [{ severity: 'fatal', code: 'exception', diagnostics: error.message }]
    });
  }
};

/**
 * 4. OpenAPI / Swagger va dasturchilar uchun hujjat ma'lumotlari
 * GET /api/v1/integration/docs
 */
const getIntegrationDocs = (req, res) => {
  res.json({
    title: "Diabetes Risk & Monitoring Integration Interface (API)",
    version: "1.0.0",
    description: "Qandli diabet monitoringi va asoratlar xavfini baholash uchun ochiq integratsiya interfeysi (REST API). Boshqa dasturchilar o'z dasturlariga (Python, Flutter, PHP, Java va boshqalar) ulab ishlatishi mumkin.",
    endpoints: [
      {
        path: "/api/v1/integration/glycemic-metrics",
        method: "POST",
        description: "Qand miqdori yozuvlari asosida glisemik ko'rsatkichlar (TIR, TAR, TBR, eA1c, CV%) hisoblash.",
        sampleRequest: {
          records: [
            { fastingLevel: 6.5, postMealLevel: 8.9 },
            { fastingLevel: 7.2, postMealLevel: 11.4 }
          ]
        }
      },
      {
        path: "/api/v1/integration/assess-risk",
        method: "POST",
        description: "Bemor profili va qon shakari asosida barcha asoratlar xavfini ko'p omilli baholash.",
        sampleRequest: {
          patientProfile: {
            age: 50,
            gender: "male",
            height: 175,
            weight: 85,
            diabetesType: "type2",
            diabetesYears: 6
          },
          records: [
            { fastingLevel: 7.0, postMealLevel: 10.5, systolicPressure: 135, diastolicPressure: 85 }
          ]
        }
      },
      {
        path: "/api/v1/integration/fhir/observation",
        method: "POST",
        description: "Xalqaro HL7 FHIR R4 standarti bo'yicha integratsiya. FHIR Observation qabul qilib, FHIR RiskAssessment qaytaradi."
      }
    ]
  });
};

module.exports = {
  getGlycemicMetricsAPI,
  assessRiskAPI,
  fhirIntegrationAPI,
  getIntegrationDocs
};
