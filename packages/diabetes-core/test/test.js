const {
  parseGlucoseCSV,
  calculateFINDRISC,
  generateDoctorReportHTML,
  assessFullDiabetesRisk
} = require('../src/index');

console.log('====================================================');
console.log('🧪 YANGI IMKONIYATLAR TESTI (CSV, FINDRISC, HTML)');
console.log('====================================================');

// 1. CSV Parser testi
console.log('\n📄 1. CSV Parser Testi:');
const sampleCSV = `Timestamp,Glucose (mmol/L),Type
2026-11-01 07:30,6.5,Fasting
2026-11-01 12:45,11.2,Post-meal
2026-11-01 19:15,8.4,Post-meal`;

const parsed = parseGlucoseCSV(sampleCSV);
console.log(` Muvaffaqiyatli o'qilgan o'lchovlar soni: ${parsed.length}`);
console.log(' Birinchi o\'lchov:', parsed[0]);

// 2. FINDRISC Testi
console.log('\n📋 2. FINDRISC (10 yillik diabet xavfi) Testi:');
const findriscResult = calculateFINDRISC({
  age: 52,
  weight: 88,
  height: 172,
  waistCircumference: 98,
  gender: 'male',
  physicalActivityDaily: false,
  eatVegetablesDaily: true,
  takesBloodPressureMeds: true,
  hasHighBloodGlucoseHistory: false,
  familyHistory: 'first_degree'
}, 'uz');

console.log(' Jami ball:', findriscResult.totalScore, '/', findriscResult.maxScore);
console.log(' Xavf toifasi:', findriscResult.riskLevel);
console.log(' 10 yillik ehtimollik:', findriscResult.tenYearProbabilityPercent + '%');
console.log(' Tavsif:', findriscResult.description);

// 3. Shifokor uchun HTML Hisobot Testi
console.log('\n📑 3. Shifokor uchun HTML Hisobot Testi:');
const htmlReport = generateDoctorReportHTML(
  { firstName: 'Asliddin', lastName: 'Karimov', diabetesType: 'type2', age: 52 },
  parsed,
  { lang: 'uz' }
);
console.log(` Generatsiya qilingan HTML hisobot uzunligi: ${htmlReport.length} belgi`);
console.log(' HTML sahifa sarlavhasi borligi:', htmlReport.includes('<!DOCTYPE html>'));

console.log('\n🎉 BARCHA 3 TA YANGI MODUL 100% XATOSIZ ISHLADI!');
