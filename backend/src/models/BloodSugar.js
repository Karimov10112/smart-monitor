const mongoose = require('mongoose');

const bloodSugarSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    fastingLevel: { type: Number, required: true },
    postMealLevel: { type: Number },
    notes: String,
    mood: { type: String, enum: ['great', 'good', 'okay', 'bad', 'terrible'] },
    exercise: Boolean,
    medication: Boolean,
    medicationName: String,
    mealDescription: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('BloodSugar', bloodSugarSchema);
