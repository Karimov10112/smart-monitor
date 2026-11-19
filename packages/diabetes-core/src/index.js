/**
 * Diabetes Risk Core SDK (To'liq xalqaro klinik ekotizim)
 * Qandli diabet bemorlari holatini monitoring qilish, asoratlar xavfini baholash,
 * apparat integratsiyasi (Bluetooth BLE va Serial USB), ovqatlanish, turmush tarzi, insulin,
 * FINDRISC xavf testi, CGM CSV parser va shifokor uchun HTML hisobot generatori
 */

const { calculateGlycemicMetrics, DEFAULT_THRESHOLDS } = require('./metrics');
const {
  calculateBMI,
  calculateAge,
  assessRetinopathyRisk,
  assessNephropathyRisk,
  assessCardiovascularRisk,
  assessNeuropathyFootRisk,
  assessFullDiabetesRisk
} = require('./riskModels');
const {
  calculateICR,
  calculateISF,
  calculateBolusDose
} = require('./insulin');
const {
  mmolToMgDl,
  mgDlToMmol,
  normalizeToMmol,
  GLUCOSE_CONVERSION_FACTOR
} = require('./converters');
const { parseFHIRObservations, toFHIRRiskAssessment } = require('./fhirAdapter');
const { getNutritionAdvice, NUTRITION_DATABASE } = require('./nutrition');
const { evaluateDoctorAlert, CRITICAL_LIMITS } = require('./doctorAlert');
const { analyzeLifestyleImpact } = require('./lifestyle');
const { generateRecommendedSchedule } = require('./reminders');
const { buildMedicalAIContext } = require('./agentContext');
const { parseGlucoseCSV } = require('./cgmParser');
const { calculateFINDRISC } = require('./findrisc');
const { generateDoctorReportHTML } = require('./reportGenerator');
const {
  BLUETOOTH_GLUCOSE_UUIDS,
  parseBluetoothGlucosePacket,
  parseSerialGlucosePacket,
  parseSFLOAT
} = require('./deviceSync');
const { t } = require('./i18n');
const {
  GLYCEMIC_PROFILE_POINTS,
  buildGlycemicProfilePlan,
  needsGlycemicProfile,
  analyzeGlycemicProfile
} = require('./glycemicProfile');
const { analyzeGlucoseTrend, detectHypoglycemiaEpisodes } = require('./trends');
const { PHYSIOLOGICAL_LIMITS, validateRecord, sanitizeRecords } = require('./validation');
const { createDiabetesHandlers } = require('./integration/handlers');
const { createExpressRouter } = require('./integration/express');
const { getOpenAPISpec } = require('./integration/openapi');
const {
  createPatientMonitor,
  signPayload,
  verifyWebhookSignature,
  sendWebhook
} = require('./integration/monitor');
const { version: VERSION } = require('../package.json');

module.exports = {
  // 1. Asosiy monitoring va asoratlar xavfi
  calculateGlycemicMetrics,
  assessFullDiabetesRisk,
  assessRetinopathyRisk,
  assessNephropathyRisk,
  assessCardiovascularRisk,
  assessNeuropathyFootRisk,

  // 2. Apparat integratsiyasi (Bluetooth BLE & USB Serial)
  BLUETOOTH_GLUCOSE_UUIDS,
  parseBluetoothGlucosePacket,
  parseSerialGlucosePacket,
  parseSFLOAT,

  // 3. CGM & Glyukometr CSV fayllari parseri
  parseGlucoseCSV,

  // 4. FINDRISC (10 yillik diabet xavfi so'rovnomasi)
  calculateFINDRISC,

  // 5. Shifokor va bemor uchun PDF/HTML hisobot generatori
  generateDoctorReportHTML,

  // 6. Ovqatlanish va parhez klinik tavsiyalari (Nutrition)
  getNutritionAdvice,
  NUTRITION_DATABASE,

  // 7. Shifokorga shoshilinch ogohlantirish (Emergency Clinical Triage)
  evaluateDoctorAlert,
  CRITICAL_LIMITS,

  // 8. Turmush tarzi va stress/mashq tahlili (Lifestyle & Biometrics)
  analyzeLifestyleImpact,

  // 9. O'lchov va dori eslatmalari generatori (Schedule & Reminders)
  generateRecommendedSchedule,

  // 10. AI & LLM uchun tibbiy tizim promptlari (AI Context Builder)
  buildMedicalAIContext,

  // 11. Insulin kalkulyatori (Bolus / Basal)
  calculateBolusDose,
  calculateICR,
  calculateISF,

  // 12. Birliklar o'zgartirgichi (mmol/L <-> mg/dL)
  mmolToMgDl,
  mgDlToMmol,
  normalizeToMmol,
  GLUCOSE_CONVERSION_FACTOR,

  // 13. Xalqaro HL7 / FHIR R4 standarti
  parseFHIRObservations,
  toFHIRRiskAssessment,

  // 14. Sutkalik glikemik profil (endokrinolog tavsiyasi bo'yicha 6 nuqtali o'lchov)
  GLYCEMIC_PROFILE_POINTS,
  buildGlycemicProfilePlan,
  needsGlycemicProfile,
  analyzeGlycemicProfile,

  // 15. Dinamika (trend) tahlili
  analyzeGlucoseTrend,
  detectHypoglycemiaEpisodes,

  // 16. Kiruvchi ma'lumotlarni tekshirish
  PHYSIOLOGICAL_LIMITS,
  validateRecord,
  sanitizeRecords,

  // 17. Integratsiya interfeyslari: REST handlerlar, Express router, OpenAPI, monitoring va webhook
  createDiabetesHandlers,
  createExpressRouter,
  getOpenAPISpec,
  createPatientMonitor,
  signPayload,
  verifyWebhookSignature,
  sendWebhook,

  // 18. Yordamchi modellar va standartlar
  VERSION,
  calculateBMI,
  calculateAge,
  t,
  DEFAULT_THRESHOLDS
};
