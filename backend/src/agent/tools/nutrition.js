/**
 * Tool: get_nutrition_advice
 * Qon shakari darajasiga qarab ovqatlanish tavsiyasi beradi.
 * Bu tool faqat lokal logika ishlatadi — DB so'rovi yo'q.
 */

const ADVICE = {
  fasting: {
    low: {
      status: '🔴 Past — Gipoglikemiya',
      advice: 'Qand darajasi juda past! Darhol shirinlik yoki sharbat iching.',
      foods_ok:    ['Shakar suvi (1 stakan)', 'Mevali sharbat', 'Glukoza tabletkasi'],
      foods_avoid: ['Insulin inyeksiyasini o\'tkazib yubormang'],
      action:      '15g tez hazm bo\'ladigan uglevod iste\'mol qilib, 15 daqiqadan keyin qayta o\'lchang',
    },
    normal: {
      status: '🟢 Normal (och qoringa 4.0–7.0 mmol/l)',
      advice: 'Qand darajangiz maqsadda! Ajoyib!',
      foods_ok:    ['Tuxum (qaynatma)', 'Sut / kefir', 'Bug\'doy noni (1 bo\'lak)', 'Sabzavotlar'],
      foods_avoid: ['Shirinlik', 'Gazaklar', 'Oq un mahsulotlari', 'Shirin ichimliklar'],
      action:      'Ertalabki dasturxonni shu tartibda davom eting',
    },
    high: {
      status: '🟡 Yuqori (och qorinda ≥7.0 mmol/l)',
      advice: 'Och qorindag qand yuqori — bugun dietaga jiddiy e\'tibor bering.',
      foods_ok:    ['Sabzavot sho\'rva', 'Loviya/Nohut', 'Baliq (bug\'da pishirilgan)', 'Tuxum oqsili'],
      foods_avoid: ['Non (ayniqsa oq)', 'Guruch oshi', 'Kartoshka', 'Qand/shakar', 'Meva sharbati'],
      action:      '30 daqiqa piyoda yuring, kamida 2 litr suv iching',
    },
  },
  post_meal: {
    low: {
      status: '🔴 Past (ovqatdan keyin gipoglikemiya)',
      advice: 'Ovqatdan keyin ham qand past — bu noodatiy holat, shifokorga murojaat qiling.',
      foods_ok:    ['Sharbat', 'Meva', 'Glukoza tabletkasi'],
      foods_avoid: [],
      action:      'Zudlik bilan shifokorga murojaat qiling yoki tez yordam chaqiring',
    },
    normal: {
      status: '🟢 Normal (ovqatdan 2 soat keyin ≤8.5 mmol/l)',
      advice: 'Ovqatdan keyingi ko\'rsatkich maqsadda! Juda yaxshi!',
      foods_ok:    ['Sabzavotlar', 'Oqsilli taomlar (tovuq, baliq)', 'Yong\'oq (bir ovuch)'],
      foods_avoid: ['Dessert', 'Shirin ichimlik', 'Konfet'],
      action:      'Shu ovqatlanish tartibini davom eting',
    },
    high: {
      status: '🟡 Yuqori (ovqatdan keyin ≥8.5 mmol/l)',
      advice: 'Ovqatdan keyin qand yuqori — keyingi ovqatda porsiya va uglevodni kamaytiring.',
      foods_ok:    ['Sabzavot sho\'rva', 'Tovuq ko\'kragi (qaynatma)', 'Limon suvi', 'Yashil salat'],
      foods_avoid: ['Shakar', 'Konfet/pechene', 'Pirog', 'Guruch', 'Kartoshka püresi'],
      action:      '20–30 daqiqa engil yuring (ovqatdan keyin yurish qandni tushiradi)',
    },
  },
};

/**
 * @param {string} userId - not used (no DB call), kept for interface consistency
 * @param {object} args   - { sugar_level: number, meal_type: 'fasting' | 'post_meal' }
 */
module.exports = async function getNutritionAdvice(_userId, args) {
  const level = parseFloat(args.sugar_level);
  const mealType = args.meal_type === 'post_meal' ? 'post_meal' : 'fasting';

  if (isNaN(level) || level <= 0) {
    return { error: 'Yaroqli qand darajasi kiritilmagan.' };
  }

  let category;
  if (mealType === 'fasting') {
    category = level < 3.9 ? 'low' : level <= 7 ? 'normal' : 'high';
  } else {
    category = level < 3.9 ? 'low' : level <= 8.5 ? 'normal' : 'high';
  }

  return ADVICE[mealType][category];
};
