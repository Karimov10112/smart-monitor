/**
 * Diabetda tavsiya etiluvchi o'lchov va dori qabul qilish jadvallari generatori (Schedule & Reminders Engine)
 */

/**
 * Bemor profili va davolash usuliga qarab optimal monitoring va dori jadvalini tuzib beradi
 * @param {Object} params
 * @param {'type1'|'type2'|'gestational'|'prediabetes'} [params.diabetesType='type2']
 * @param {'insulin'|'oral_meds'|'combined'|'lifestyle_only'} [params.treatmentType='oral_meds']
 * @param {'uz'|'en'|'ru'} [params.lang='uz']
 */
function generateRecommendedSchedule({ diabetesType = 'type2', treatmentType = 'oral_meds', lang = 'uz' }) {
  const schedules = [];

  if (diabetesType === 'type1' || treatmentType === 'insulin' || treatmentType === 'combined') {
    // 1-tur yoki insulin oluvchilar: intensiv monitoring talab etiladi
    schedules.push({
      time: '07:30',
      type: 'glucose_check',
      title: lang === 'uz' ? 'Och qoringa qand o\'lchovi' : 'Fasting Blood Sugar',
      notes: lang === 'uz' ? 'Nonushtadan oldin bazal/bolus insulin dozasini hisoblash uchun' : 'Before breakfast bolus calculation'
    });
    schedules.push({
      time: '08:00',
      type: 'insulin',
      title: lang === 'uz' ? 'Nonushta oldi insulini' : 'Breakfast Bolus Insulin',
      notes: lang === 'uz' ? 'Taomdan 10-15 daqiqa oldin' : '10-15 mins before meal'
    });
    schedules.push({
      time: '10:00',
      type: 'glucose_check',
      title: lang === 'uz' ? 'Nonushtadan 2 soat keyingi qand' : 'Post-Breakfast Glucose Check',
      notes: lang === 'uz' ? 'Maqsad: < 8.5 mmol/l' : 'Target: < 8.5 mmol/L'
    });
    schedules.push({
      time: '13:00',
      type: 'insulin',
      title: lang === 'uz' ? 'Tushlik oldi insulini' : 'Lunch Bolus Insulin',
      notes: lang === 'uz' ? 'Uglevod porsiyasiga mos doza' : 'Carb-adjusted dose'
    });
    schedules.push({
      time: '19:00',
      type: 'insulin',
      title: lang === 'uz' ? 'Kechki ovqat oldi insulini' : 'Dinner Bolus Insulin',
      notes: lang === 'uz' ? 'Yengil kechki taom bilan' : 'With evening meal'
    });
    schedules.push({
      time: '22:00',
      type: 'insulin_basal',
      title: lang === 'uz' ? 'Uzoq ta\'sir qiluvchi (Bazal) insulin' : 'Long-acting Basal Insulin',
      notes: lang === 'uz' ? 'Tungi va ertalabki qandni barqaror ushlash uchun' : 'Overnight basal coverage'
    });
  } else {
    // 2-tur tabletka oluvchilar: standart qulay rejim
    schedules.push({
      time: '08:00',
      type: 'glucose_check',
      title: lang === 'uz' ? 'Ertalabki qand o\'lchovi' : 'Morning Fasting Glucose',
      notes: lang === 'uz' ? 'Och qoringa haftada kamida 3-4 marta' : 'Fasting state'
    });
    schedules.push({
      time: '08:30',
      type: 'medication',
      title: lang === 'uz' ? 'Ertalabki qand tushiruvchi dori (masalan, Metformin)' : 'Morning Medication (e.g. Metformin)',
      notes: lang === 'uz' ? 'Nonushta paytida yoki undan so\'ng' : 'With or after breakfast'
    });
    schedules.push({
      time: '20:00',
      type: 'medication',
      title: lang === 'uz' ? 'Kechki dori qabuli' : 'Evening Medication',
      notes: lang === 'uz' ? 'Kechki ovqatdan keyin' : 'After dinner'
    });
    schedules.push({
      time: '21:30',
      type: 'lifestyle',
      title: lang === 'uz' ? 'Oyoq terisini ko\'rikdan o\'tkazish' : 'Daily Foot Inspection',
      notes: lang === 'uz' ? 'Diabetik tovon asoratining oldini olish uchun' : 'Diabetic foot prevention'
    });
  }

  return {
    diabetesType,
    treatmentType,
    lang,
    totalReminders: schedules.length,
    schedule: schedules
  };
}

module.exports = {
  generateRecommendedSchedule
};

