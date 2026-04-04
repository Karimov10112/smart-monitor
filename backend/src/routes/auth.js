const express = require('express');
const router = express.Router();
const passport = require('passport');
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
  oauthCallback,
  updateProfile,
  updatePassword,
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

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`, session: false }),
  oauthCallback
);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));
router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=facebook_failed`, session: false }),
  oauthCallback
);

module.exports = router;
