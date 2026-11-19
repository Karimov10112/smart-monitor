# @karimov_dev/diabets

[![npm version](https://img.shields.io/npm/v/@karimov_dev/diabets.svg)](https://www.npmjs.com/package/@karimov_dev/diabets)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> **All-in-One Clinical Diabetes Ecosystem, Risk Assessment & Analytics SDK**  
> Compliant with **ADA (American Diabetes Association)** guidelines, **WHO FINDRISC** standard, and **HL7 FHIR R4** medical interoperability standard.

---

## 📦 O'rnatish / Installation

```bash
npm install @karimov_dev/diabets
```

---

## 🌟 To'liq Imkoniyatlar / Core Capabilities

1. 📊 **Glisemik nazorat & CGM tahlili**: Time in Range (**TIR**), **TAR**, **TBR**, Glisemik tebranish (**CV%**) va Taxminiy HbA1c (**eA1c** / Nathan formulasi).
2. 📡 **Aria va Glyukometrlar bilan Apparat Integratsiyasi (Hardware Sync)**: Bluetooth (BLE Glucose Service `0x1808` / `0x2A18`) va USB Serial COM kabel orqali qand o'lchovlarini to'g'ridan-to'g'ri o'qib olish dekoderi.
3. 🩺 **Ko'p omilli asoratlar xavfi skoringi**:
   - **Diabetik Retinopatiya** (Ko'z to'r pardasi) xavfi va klinik bosqichi.
   - **Diabetik Nefropatiya** (Buyrak yetishmovchiligi) xavfi.
   - **Kardiovaskulyar asoratlar** (ASCVD: insult, infarkt) xavfi.
   - **Diabetik polineyropatiya va Diabetik tovon** yaralari xavfi.
3. 📄 **CGM va Glyukometr CSV Parseri**: FreeStyle Libre, Dexcom va universal glyukometr CSV fayllarini 1 soniyada tahlil qilish.
4. 📋 **FINDRISC Skrining Testi**: Jahon Sog'liqni Saqlash Tashkiloti (WHO) standarti bo'yicha keyingi 10 yilda 2-tur diabet rivojlanish xavfini erta baholash.
5. 📑 **Shifokor uchun HTML/PDF Hisobot Generatori**: Klinika blankasi formatida, chop etishga tayyor rasmiy tibbiy xulosa (Print/PDF) generatsiyasi.
6. 🥗 **Klinik ovqatlanish dvigateli (Nutrition Engine)**: Qand darajasiga qarab tavsiya etiluvchi (`foods_ok`), taqiqlanuvchi (`foods_avoid`) taomlar va 15/15 qoidasi bo'yicha tezkor amallar.
7. 🚨 **Shoshilinch klinik triaj (Emergency Doctor Alert)**: Kritik giperglikemiya va gipoglikemiya holatlarida shifokorga real-time ogohlantirish matnlarini generatsiya qilish.
8. 🏃 **Turmush tarzi & Biometrik korrelyatsiya (Lifestyle Analytics)**: Jismoniy mashqlar, kayfiyat/stress va gipertoniyaning qand miqdoriga ilmiy ta'sirini baholash.
9. ⏰ **Tibbiy eslatmalar jadvali (Schedule Generator)**: Diabet turi va davolash sxemasiga mos kunlik o'lchov hamda dori qabuli jadvalini tuzish.
10. 🤖 **AI & LLM Tibbiy Kontekst Generator (AI Context Builder)**: ChatGPT, Gemini, DeepSeek va Claude kabi sun'iy intellekt botlari uchun xatosiz klinik system prompt tayyorlash.
11. 💉 **Insulin kalkulyatori (Bolus / Basal)**: 500-Rule (ICR) va 1800/100-Rule (ISF) asosida ovqat va qand korreksiyasi dozasi.
12. 🔄 **O'lchov birliklari**: `mmol/L` $\leftrightarrow$ `mg/dL`.
13. 🌍 **Ko'p tilli qo'llab-quvvatlash (i18n)**: **O'zbekcha (`uz`)**, **English (`en`)** va **Русский (`ru`)**.
14. 🏥 **HL7 FHIR R4 Standarti**: FHIR `Observation` resurslarini tahlil qilib, FHIR `RiskAssessment` eksport qilish.
15. 🗓 **Sutkalik glikemik profil** *(v1.4)*: endokrinolog tavsiyasi bo'yicha 6 nuqtali o'lchov rejasi (`buildGlycemicProfilePlan`), profil kerakligini aniqlash (`needsGlycemicProfile`) va to'ldirilgan profil tahlili (`analyzeGlycemicProfile`): tonggi giperglikemiya, ovqatdan keyingi sakrash, tungi gipoglikemiya xavfi, sutkalik tebranish.
16. 📈 **Dinamika (trend) tahlili** *(v1.4)*: chiziqli regressiya (mmol/L/hafta, R²), oxirgi davrni oldingisi bilan solishtirish, gipoglikemiya epizodlari (1- va 2-daraja).
17. 🧮 **GMI** *(v1.4)*: Glucose Management Indicator (Bergenstal, 2018) — `calculateGlycemicMetrics` natijasida.
18. ✅ **Validatsiya** *(v1.4)*: fiziologik chegaralar, mg/dL avtomatik aniqlash, mashina o'qiy oladigan xato kodlari (`validateRecord`, `sanitizeRecords`).
19. 🔌 **Integratsiya interfeyslari** *(v1.4)*: tayyor REST handlerlar (`createDiabetesHandlers`), bir qatorda ulanadigan Express router (`createExpressRouter`), OpenAPI 3.0 spetsifikatsiyasi (`getOpenAPISpec`), real vaqtdagi monitor (`createPatientMonitor`) va HMAC imzolangan webhooklar (`sendWebhook`, `verifyWebhookSignature`).

---

## 🚀 Ishlatish namunasi / Code Example

```javascript
const {
  parseGlucoseCSV,
  calculateFINDRISC,
  generateDoctorReportHTML,
  assessFullDiabetesRisk,
  calculateBolusDose
} = require('@karimov_dev/diabets');

// 1. CSV fayldan o'qish
const records = parseGlucoseCSV(csvDataString);

// 2. 10 yillik diabet xavfini baholash (FINDRISC)
const findrisc = calculateFINDRISC({
  age: 50, weight: 85, height: 175, waistCircumference: 96,
  physicalActivityDaily: false, familyHistory: 'first_degree'
}, 'uz');
console.log('10 yillik xavf:', findrisc.tenYearProbabilityPercent + '%', findrisc.description);

// 3. Shifokor uchun tayyor HTML hisobot olish
const htmlReport = generateDoctorReportHTML(
  { firstName: 'Ali', lastName: 'Valiyev', age: 50, diabetesType: 'type2' },
  records,
  { lang: 'uz' }
);
// Ushbu htmlReport ni faylga saqlab brauzerda ochish yoki chop etish mumkin!
```

---

## 🔌 Integratsiya interfeyslari (v1.4)

### 1) O'z serveringizga bir qatorda REST API qo'shish (Express)

```javascript
const express = require('express');
const { createExpressRouter } = require('@karimov_dev/diabets');

const app = express();
app.use('/api/diabetes', createExpressRouter(express, {
  onAlert: (alert) => console.log('Shifokorga signal:', alert.message)
}));
app.listen(3000);
// POST /api/diabetes/metrics | /risk | /alert | /trend | /findrisc | /insulin/bolus
// POST /api/diabetes/glycemic-profile/plan | /glycemic-profile/analyze | /fhir/observation
// GET  /api/diabetes/openapi.json   ← Swagger / Postman uchun OpenAPI 3.0
```

Boshqa freymvorklar (Fastify, Koa, Next.js, AWS Lambda) uchun `createDiabetesHandlers()` — har bir handler `(body) => { status, body }` qaytaradi.

### 2) Sutkalik glikemik profil

```javascript
const { needsGlycemicProfile, buildGlycemicProfilePlan, analyzeGlycemicProfile } = require('@karimov_dev/diabets');

needsGlycemicProfile({ fastingLevel: 15.6 });          // { required: true, severity: 'CRITICAL', ... }
buildGlycemicProfilePlan({ diabetesType: 'type1' });   // 6 ta o'lchov nuqtasi va ko'rsatmalar
analyzeGlycemicProfile(
  { fasting: 9.4, post_breakfast: 14.1, pre_lunch: 8, post_lunch: 9.5, pre_dinner: 7.1, bedtime: 8 },
  { diabetesType: 'type1' }
); // patterns: FASTING_HYPERGLYCEMIA, POSTPRANDIAL_SPIKE, ...
```

### 3) Real vaqtdagi monitoring va imzolangan webhook

```javascript
const { createPatientMonitor, verifyWebhookSignature } = require('@karimov_dev/diabets');

const monitor = createPatientMonitor({ webhookUrl: 'https://klinika.uz/hooks/diabet', webhookSecret: process.env.HOOK_SECRET });
monitor.on('critical', (e) => sendSms(doctorPhone, e.alert.message));
monitor.on('profile-required', (e) => notifyPatient(e.glycemicProfile.reason));
monitor.ingest({ fastingLevel: 15.6 }, { firstName: 'Aziza', lastName: 'Karimova' });

// Qabul qiluvchi tomonda: verifyWebhookSignature(rawBody, req.headers['x-diabets-signature'], secret)
```

### 4) Dinamika va validatsiya

```javascript
const { analyzeGlucoseTrend, sanitizeRecords } = require('@karimov_dev/diabets');
const { records, rejected } = sanitizeRecords(rawRecordsFromDevice);   // xato yozuvlar kod bilan ajratiladi
analyzeGlucoseTrend(records, { periodDays: 7 });  // { direction: 'WORSENING', slopePerWeek: 0.8, change: {...} }
```

## 🧪 Testlar

```bash
npm test   # node --test — 15 ta avtomatik test (assert)
```

Kutubxona **Qand Nazorati** platformasida (diabetmed.uz) ishlatiladi: shifokorga signal chegaralari, statistika sahifasidagi asoratlar xavfi va dinamika, shifokor panelidagi bemor tahlili va ochiq integratsiya API (`/api/v1/integration`) shu kutubxona asosida ishlaydi.

---

## 📜 Litsenziya
MIT License © 2026 Karimov Dev.
