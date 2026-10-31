/**
 * Tool: get_user_profile
 * Foydalanuvchi profil ma'lumotlarini DB dan oladi.
 * Faqat xavfsiz maydonlar qaytariladi (parol, OTP, token yo'q).
 */

const User = require('../../models/User');

/**
 * @param {string} userId - req.user._id (JWT token verified)
 * @returns {object}
 */
module.exports = async function getUserProfile(userId) {
  const user = await User.findById(userId)
    .select('firstName lastName dateOfBirth gender height weight diabetesType role assignedDoctor')
    .lean();

  if (!user) return { error: 'Foydalanuvchi topilmadi' };

  let age = null;
  if (user.dateOfBirth) {
    age = Math.floor((Date.now() - new Date(user.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  }

  let bmi = null, bmiLabel = '', dailyCalories = null;
  if (user.height && user.weight) {
    const h = user.height / 100;
    const bmiVal = user.weight / (h * h);
    bmi = +bmiVal.toFixed(1);

    if (bmiVal < 18.5)      bmiLabel = 'Kam vazn (Underweight)';
    else if (bmiVal < 25)   bmiLabel = 'Normal';
    else if (bmiVal < 30)   bmiLabel = 'Ortiqcha vazn (Overweight)';
    else                    bmiLabel = 'Semizlik (Obese)';

    if (age) {
      let bmr;
      if (user.gender === 'male') {
        bmr = 88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * age);
      } else {
        bmr = 447.593 + (9.247 * user.weight) + (3.098 * user.height) - (4.330 * age);
      }
      dailyCalories = Math.round(bmr * 1.375); // sedentary multiplier
    }
  }

  const diabetesLabels = {
    type1:        'I-tip diabet',
    type2:        'II-tip diabet',
    prediabetes:  'Prediabet',
    gestational:  'Homiladorlik diabeti',
    none:         'Diabet yo\'q',
  };

  return {
    name:           `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    age,
    gender:         user.gender || null,
    height_cm:      user.height || null,
    weight_kg:      user.weight || null,
    bmi,
    bmi_label:      bmiLabel || null,
    daily_calories: dailyCalories,
    diabetes_type:  diabetesLabels[user.diabetesType] || user.diabetesType || 'Noma\'lum',
    role:           user.role,
    has_doctor:     !!user.assignedDoctor,
  };
};
