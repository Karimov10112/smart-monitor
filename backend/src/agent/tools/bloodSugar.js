/**
 * Tool: get_blood_sugar
 * Foydalanuvchining qon shakari yozuvlarini DB dan oladi.
 * userId -> req.user._id (JWT token orqali tekshirilgan)
 */

const BloodSugar = require('../../models/BloodSugar');

const CRITICAL_HIGH = 15;
const CRITICAL_LOW = 3;

/**
 * @param {string} userId  - req.user._id (token verified)
 * @param {object} args    - { limit?: number }
 * @returns {object}
 */
module.exports = async function getBloodSugar(userId, args) {
  const limit = Math.min(parseInt(args.limit) || 10, 30);

  const records = await BloodSugar.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean(); // performance: plain JS objects

  if (records.length === 0) {
    return { status: 'empty', message: 'Hali hech qanday qand ko\'rsatkichi kiritilmagan.' };
  }

  const fastingRecs = records.filter(r => r.fastingLevel > 0);
  const postMealRecs = records.filter(r => r.postMealLevel > 0);

  const avgFasting = fastingRecs.length > 0
    ? +(fastingRecs.reduce((s, r) => s + r.fastingLevel, 0) / fastingRecs.length).toFixed(1)
    : null;

  const avgPostMeal = postMealRecs.length > 0
    ? +(postMealRecs.reduce((s, r) => s + r.postMealLevel, 0) / postMealRecs.length).toFixed(1)
    : null;

  const latest = records[0];

  // Server-side critical check (never trust model alone)
  const latestVal = latest.postMealLevel || latest.fastingLevel || null;
  const isCriticalHigh = latestVal !== null && latestVal >= CRITICAL_HIGH;
  const isCriticalLow  = latestVal !== null && latestVal <= CRITICAL_LOW;

  const highCount = records.filter(r =>
    (r.fastingLevel && r.fastingLevel >= 7) || (r.postMealLevel && r.postMealLevel >= 10)
  ).length;

  const lowCount = records.filter(r =>
    (r.fastingLevel && r.fastingLevel < 3.9) || (r.postMealLevel && r.postMealLevel < 3.9)
  ).length;

  return {
    status: 'ok',
    total_records: records.length,
    latest: {
      date: new Date(latest.createdAt).toLocaleDateString('uz'),
      fasting: latest.fastingLevel || null,
      post_meal: latest.postMealLevel || null,
      notes: latest.notes || null,
      critical_high: isCriticalHigh,
      critical_low: isCriticalLow,
    },
    averages: { fasting: avgFasting, post_meal: avgPostMeal },
    high_count: highCount,
    low_count: lowCount,
    records_summary: records.slice(0, 7).map(r => ({
      date: new Date(r.createdAt).toLocaleDateString('uz'),
      fasting: r.fastingLevel || null,
      post_meal: r.postMealLevel || null,
    })),
  };
};
