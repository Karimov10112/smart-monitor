/**
 * Turmush tarzi, dori qabuli, kayfiyat va qon bosimi omillari tahlili (Lifestyle & Biometric Analytics)
 */

/**
 * Bemorning qon shakari yozuvlari va turmush tarzi omillari o'rtasidagi korrelyatsiyani tahlil qiladi
 * @param {Array<Object>} records - [{ fastingLevel, postMealLevel, exercise, mood, medication, systolicPressure, pulse, ... }]
 * @param {'uz'|'en'|'ru'} [lang='uz']
 */
function analyzeLifestyleImpact(records = [], lang = 'uz') {
  if (!Array.isArray(records) || records.length === 0) {
    return {
      hasData: false,
      message: "Tahlil uchun yozuvlar yetarli emas."
    };
  }

  // 1. Jismoniy mashq (Exercise) ta'siri
  const withExercise = [];
  const withoutExercise = [];

  // 2. Qon bosimi va gipertoniya
  let hypertensionCount = 0;
  let totalPressureReadings = 0;

  // 3. Kayfiyat ta'siri
  const moodMap = { great: [], good: [], okay: [], bad: [], terrible: [] };

  records.forEach(r => {
    const val = r.postMealLevel || r.fastingLevel || r.glucose;
    if (typeof val === 'number' && val > 0) {
      if (r.exercise === true) withExercise.push(val);
      else if (r.exercise === false) withoutExercise.push(val);

      if (r.mood && moodMap[r.mood]) {
        moodMap[r.mood].push(val);
      }
    }

    if (r.systolicPressure && r.systolicPressure > 0) {
      totalPressureReadings++;
      if (r.systolicPressure >= 140 || (r.diastolicPressure && r.diastolicPressure >= 90)) {
        hypertensionCount++;
      }
    }
  });

  // O'rtacha hisoblagich
  const getAvg = arr => arr.length > 0 ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : null;

  const avgWithExercise = getAvg(withExercise);
  const avgWithoutExercise = getAvg(withoutExercise);

  let exerciseInsight = null;
  if (avgWithExercise !== null && avgWithoutExercise !== null) {
    const diff = Number((avgWithoutExercise - avgWithExercise).toFixed(1));
    if (diff > 0) {
      exerciseInsight = lang === 'uz'
        ? `Jismoniy mashq qilingan kunlarda qand miqdori o'rtacha ${diff} mmol/l ga pastroq va barqarorroq bo'lgan.`
        : lang === 'ru'
        ? `В дни физической активности сахар в среднем был на ${diff} ммоль/л ниже и стабильнее.`
        : `On active days, average blood glucose was ${diff} mmol/L lower and more stable.`;
    } else {
      exerciseInsight = lang === 'uz'
        ? "Jismoniy faollik qand tebranishini muvozanatlashga yordam bermoqda."
        : "Physical activity is stabilizing glycemic variability.";
    }
  }

  // Qon bosimi tahlili
  const hypertensionPercentage = totalPressureReadings > 0
    ? Math.round((hypertensionCount / totalPressureReadings) * 100)
    : 0;

  // Kayfiyat/Stress ta'siri (Stress glyukozani oshiradi — kortizol gormoni)
  const positiveMoods = [...moodMap.great, ...moodMap.good];
  const negativeMoods = [...moodMap.bad, ...moodMap.terrible];
  const avgPositive = getAvg(positiveMoods);
  const avgNegative = getAvg(negativeMoods);

  let stressInsight = null;
  if (avgNegative !== null && avgPositive !== null && avgNegative > avgPositive) {
    const diff = Number((avgNegative - avgPositive).toFixed(1));
    stressInsight = lang === 'uz'
      ? `Stress va tushkun kayfiyat kunlarida qand miqdori o'rtacha ${diff} mmol/l ga ko'tarilgan. Stressni boshqarish qandni me'yorda ushlashda muhim ahamiyatga ega.`
      : lang === 'ru'
      ? `В периоды стресса и плохого самочувствия сахар повышался на ${diff} ммоль/л. Контроль стресса критически важен.`
      : `During elevated stress/bad mood days, glucose rose by ${diff} mmol/L on average. Stress mitigation recommended.`;
  }

  return {
    hasData: true,
    totalRecordsAnalyzed: records.length,
    exercise: {
      activeDaysCount: withExercise.length,
      inactiveDaysCount: withoutExercise.length,
      avgGlucoseWithExercise: avgWithExercise,
      avgGlucoseWithoutExercise: avgWithoutExercise,
      insight: exerciseInsight
    },
    bloodPressure: {
      totalReadings: totalPressureReadings,
      hypertensionPercentage,
      status: hypertensionPercentage >= 30 ? 'ELEVATED' : 'CONTROLLED',
      warning: hypertensionPercentage >= 30 
        ? (lang === 'uz' ? "O'lchovlarning 30% dan ko'pida gipertoniya qayd etilgan. Buyrak va yurak asoratlari xavfini oshiradi." : "Elevated BP detected in >30% of records.")
        : null
    },
    moodAndStress: {
      positiveMoodAvgGlucose: avgPositive,
      negativeMoodAvgGlucose: avgNegative,
      insight: stressInsight
    }
  };
}

module.exports = {
  analyzeLifestyleImpact
};

