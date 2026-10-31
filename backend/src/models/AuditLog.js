const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false  // optional: admin actions use adminId, agent actions use user
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    action: {
      type: String,
      required: true,
      enum: [
        'DELETE_USER',
        'BAN_USER',
        'UNBAN_USER',
        'UPDATE_USER_ROLE',
        'ADD_PRODUCT',
        'UPDATE_PRODUCT',
        'DELETE_PRODUCT',
        'UPDATE_ADMIN_CONTACTS',
        'PURGE_INCOMPLETE_USERS',
        'AGENT_DOCTOR_ALERT'
      ]
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false // Optional, as some actions might not have a specific target
    },
    targetType: {
      type: String,
      enum: ['User', 'Product', 'System'],
      required: false
    },
    details: {
      type: Object,
      default: {}
    },
    ipAddress: String,
    userAgent: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
