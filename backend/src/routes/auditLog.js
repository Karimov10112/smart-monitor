const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/adminController');
const { protect, requireStrictSuperAdmin } = require('../middleware/auth');

// Only SuperAdmin can see audit logs
router.get('/', protect, requireStrictSuperAdmin, getAuditLogs);

module.exports = router;
