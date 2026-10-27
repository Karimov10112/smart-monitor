const mongoose = require('mongoose');

const bloodSugarSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    fastingLevel: { type: Number },
    postMealLevel: { type: Number },
    notes: String,
    mood: { type: String, enum: ['great', 'good', 'okay', 'bad', 'terrible'] },
    exercise: Boolean,
    medication: Boolean,
    medicationName: String,
    mealDescription: String,
    systolicPressure: Number,
    diastolicPressure: Number,
    pulse: Number,
    insulinUnits: Number,
    carbsUnits: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('BloodSugar', bloodSugarSchema);
