const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    // Chat xonasi: doctor-patient juftligi
    room: { type: String, required: true, index: true }, // e.g. "doctorId_patientId"
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 2000 },
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

// Indexlar tezlik uchun
chatMessageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
