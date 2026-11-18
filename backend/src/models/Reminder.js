const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['medication', 'insulin'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dose: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String, // HH:mm format
      required: true,
    },
    repeatDaily: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Toshkent vaqti bo'yicha oxirgi yuborilgan sana (YYYY-MM-DD) — kuniga bir marta yuborish uchun
    lastSentDate: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', reminderSchema);
