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
} = require('../controllers/adminController');
const { protect, requireSuperAdmin } = require('../middleware/auth');

router.get('/contacts', protect, getAdminContacts);
router.put('/contacts', protect, requireSuperAdmin, updateAdminContacts);

router.use(protect, requireSuperAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.get('/users/:id/records', getUserRecords);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/ban', toggleBanUser);
router.patch('/users/:id/notes', addAdminNote);
router.delete('/users/:id', deleteUser);

module.exports = router;
