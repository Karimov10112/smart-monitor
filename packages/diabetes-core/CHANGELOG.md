# Changelog

## 1.4.0 — 2026-11-19

### Qo'shildi
- **Sutkalik glikemik profil**: `GLYCEMIC_PROFILE_POINTS`, `buildGlycemicProfilePlan`, `needsGlycemicProfile`, `analyzeGlycemicProfile` (uz/ru/en).
- **Dinamika**: `analyzeGlucoseTrend` (regressiya, R², davrlarni solishtirish), `detectHypoglycemiaEpisodes`.
- **GMI** (`glucoseManagementIndicator`) — `calculateGlycemicMetrics` natijasida.
- **Validatsiya**: `PHYSIOLOGICAL_LIMITS`, `validateRecord`, `sanitizeRecords`.
- **Integratsiya interfeyslari**: `createDiabetesHandlers`, `createExpressRouter`, `getOpenAPISpec`, `createPatientMonitor`, `signPayload`, `verifyWebhookSignature`, `sendWebhook`.
- `VERSION` eksporti; barcha yangi funksiyalar uchun TypeScript turlari.
- `node --test` asosidagi avtomatik testlar.

### O'zgardi
- `package.json`: `files`, `engines` (Node 18+), `repository`.

## 1.3.0
- Apparat integratsiyasi (BLE/USB), FINDRISC, CGM CSV parser, HTML hisobot generatori, HL7 FHIR R4.
