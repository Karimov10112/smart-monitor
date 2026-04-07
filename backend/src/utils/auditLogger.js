const AuditLog = require('../models/AuditLog');

/**
 * Log an administrative action to the AuditLog collection.
 * 
 * @param {string} adminId - The ID of the admin performing the action.
 * @param {string} action - The action type (from AuditLog enum).
 * @param {Object} options - Optional parameters: targetId, targetType, details, req (for IP/User-Agent).
 */
const logAction = async (adminId, action, { targetId, targetType, details, req } = {}) => {
  try {
    const logEntry = {
      adminId,
      action,
      targetId,
      targetType,
      details: details || {}
    };

    if (req) {
      logEntry.ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      logEntry.userAgent = req.headers['user-agent'];
    }

    await AuditLog.create(logEntry);
  } catch (err) {
    console.error('Audit Log Error:', err.message);
    // We don't want to fail the main request if logging fails, 
    // but in a production app we might want more robust error handling.
  }
};

module.exports = { logAction };
