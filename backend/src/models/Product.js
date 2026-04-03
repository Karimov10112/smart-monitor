const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      uz: { type: String, required: true, trim: true },
      ru: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    category: { type: String, required: true },
    emoji: { type: String, default: '🍎' },
    gi: { type: Number, required: true }, // Glycemic Index
    gl: { type: Number, required: true }, // Glycemic Load
    carbs: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    advice: {
      uz: { type: String, trim: true },
      ru: { type: String, trim: true },
      en: { type: String, trim: true },
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
