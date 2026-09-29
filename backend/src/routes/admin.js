const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleBanUser,
  deleteUser,
  addAdminNote,
  getDashboardStats,
  getUserRecords,
  getAdminContacts,
  updateAdminContacts,
  getAuditLogs,
  getDoctors,
  assignDoctor,
  purgeIncompleteUsers,
} = require('../controllers/adminController');
const { protect, requireSuperAdmin, requireStrictSuperAdmin } = require('../middleware/auth');

router.get('/contacts', protect, getAdminContacts);
router.put('/contacts', protect, requireStrictSuperAdmin, updateAdminContacts);

router.get('/audit-logs', protect, requireStrictSuperAdmin, getAuditLogs);

router.use(protect, requireSuperAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.get('/users/:id/records', getUserRecords);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/ban', toggleBanUser);
router.get('/doctors', getDoctors);
router.patch('/users/:id/assign-doctor', assignDoctor);
router.patch('/users/:id/notes', addAdminNote);
router.delete('/users/:id', deleteUser);
router.delete('/purge-incomplete', purgeIncompleteUsers);

module.exports = router;
