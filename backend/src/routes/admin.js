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
  markMessagesAsRead,
  replyToUser,
} = require('../controllers/adminController');
const { protect, requireSuperAdmin } = require('../middleware/auth');

router.use(protect, requireSuperAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.get('/users/:id/records', getUserRecords);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/ban', toggleBanUser);
router.patch('/users/:id/notes', addAdminNote);
router.patch('/users/:id/read-messages', markMessagesAsRead);
router.post('/reply-to-user', replyToUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
