/**
 * @karimov_dev/diabets kutubxonasi — monorepodagi manba (packages/diabetes-core).
 * Saytdagi barcha klinik hisob-kitoblar (signal chegaralari, TIR/eA1c/GMI, asoratlar xavfi,
 * dinamika, sutkalik glikemik profil) shu kutubxona orqali bajariladi.
 */
const path = require('path');
const sdk = require(path.resolve(__dirname, '../../../packages/diabetes-core'));

/** Bemorning saytdagi profili → kutubxona profili. */
function toProfile(user = {}) {
  const u = typeof user.toObject === 'function' ? user.toObject() : user;
  return {
    firstName: u.firstName,
    lastName: u.lastName,
    dateOfBirth: u.dateOfBirth,
    gender: u.gender === 'female' ? 'female' : 'male',
    height: u.height,
    weight: u.weight,
    diabetesType: u.diabetesType && u.diabetesType !== 'none' ? u.diabetesType : undefined,
    systolicPressure: u.systolicPressure,
    diastolicPressure: u.diastolicPressure
  };
}

/** Bemor uchun to'liq tahlil: ko'rsatkichlar, asoratlar xavfi, dinamika, profil rejasi. */
function buildPatientAnalytics(user, records = [], lang = 'uz') {
  const plain = records.map((r) => (typeof r.toObject === 'function' ? r.toObject() : r));
  const profile = toProfile(user || {});
  const risk = sdk.assessFullDiabetesRisk(profile, plain.slice(0, 90), { lang });
  return {
    library: { name: '@karimov_dev/diabets', version: sdk.VERSION },
    metrics: risk.glycemicMetrics,
    risk,
    trend: sdk.analyzeGlucoseTrend(plain, { lang, periodDays: 7 }),
    hypoglycemiaEpisodes: sdk.detectHypoglycemiaEpisodes(plain.slice(0, 90)).slice(0, 10),
    glycemicProfilePlan: sdk.buildGlycemicProfilePlan({ diabetesType: profile.diabetesType, lang })
  };
}

module.exports = { sdk, toProfile, buildPatientAnalytics };
