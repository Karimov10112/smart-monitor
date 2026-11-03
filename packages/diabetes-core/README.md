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

## 📜 Litsenziya
MIT License © 2026 Karimov Dev.
