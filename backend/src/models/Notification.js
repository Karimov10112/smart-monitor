const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['CRITICAL_HIGH', 'CRITICAL_LOW', 'SYSTEM', 'REMINDER'],
    default: 'CRITICAL_HIGH',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  sugarLevel: {
    type: Number,
  },
  category: {
    type: String, // 'fasting' | 'post-meal'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  readAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);
