const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmailOTP,
  login,
  requestEmailLogin,
  forgotPassword,
  resetPassword,
  refreshToken,
  completeProfile,
  getMe,
  logout,
  updateProfile,
  updatePassword,
  verifyNewEmail,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Local auth
router.post('/register', register);
router.post('/verify-otp', verifyEmailOTP);
router.post('/login', login);
router.post('/email-login', requestEmailLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);

// Protected
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/complete-profile', protect, completeProfile);
router.put('/update-profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.post('/verify-new-email', protect, verifyNewEmail);

module.exports = router;
