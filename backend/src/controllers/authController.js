const crypto = require('crypto');
const userRepository = require('../repositories/UserRepository');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateOTP } = require('../utils/jwt');
const { sendOTPEmail, sendPasswordResetEmail } = require('../services/emailService');

// ==================== REGISTER ====================
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const lowerEmail = email ? email.toLowerCase().trim() : '';
    const isGmailRegex = /^[a-zA-Z0-9._%+-]+@gmail(\.com)?$/;
    const isValidFormat = lowerEmail === 'admin' || isGmailRegex.test(lowerEmail);

    if (!isValidFormat) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faqat "admin" yoki "@gmail.com" bilan tugaydigan loginlar qabul qilinadi. Boshqa domenlar (.ru, va h.k.) taqiqlangan.' 
      });
    }

    const existingUser = await userRepository.findByEmail(lowerEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Bu login allaqachon ro\'yxatdan o\'tgan' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await userRepository.create({
      email: lowerEmail,
      password,
      firstName,
      lastName,
      emailOTP: otp,
      emailOTPExpires: otpExpires,
      isEmailVerified: false,
    });

    try {
      await sendOTPEmail(lowerEmail, otp, req.body.language || 'uz');
    } catch (emailErr) {
      console.error('Failed to send OTP email:', emailErr);
      // Even if email fails, User is created but they may need to request resend.
    }

    res.status(201).json({
      success: true,
      message: 'Emailingizga tasdiqlash kodi yuborildi',
      userId: user._id,
      needsOTP: true
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi', dbgObj: err.toString() });
  }
};

// ==================== VERIFY EMAIL OTP ====================
const verifyEmailOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await userRepository.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

    if (user.emailOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Noto\'g\'ri kod' });
    }

    if (new Date() > user.emailOTPExpires) {
      return res.status(400).json({ success: false, message: 'Kod muddati o\'tgan. Qayta so\'rang.' });
    }

    const refreshToken = generateRefreshToken(user._id);
    
    const updatedUser = await userRepository.findByIdAndUpdate(userId, {
      isEmailVerified: true,
      emailOTP: undefined,
      emailOTPExpires: undefined,
      lastLogin: new Date(),
      $inc: { loginCount: 1 },
      refreshToken: refreshToken
    });

    const accessToken = generateAccessToken(user._id);

    res.json({
      success: true,
      message: 'Email tasdiqlandi!',
      token: accessToken,
      refreshToken,
      user: updatedUser.toSafeObject(),
      needsProfile: !updatedUser.isProfileComplete,
    });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// ==================== LOGIN ====================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userRepository.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Email yoki parol noto\'g\'ri' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: `Hisobingiz bloklangan: ${user.banReason || 'Sabab ko\'rsatilmagan'}` });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email yoki parol noto\'g\'ri' });
    }

    if (!user.isEmailVerified) {
      // Resend OTP
      const otp = generateOTP();
      await userRepository.findByIdAndUpdate(user._id, {
        emailOTP: otp,
        emailOTPExpires: new Date(Date.now() + 10 * 60 * 1000)
      });
      await sendOTPEmail(email, otp, req.body.language || 'uz');

      return res.status(200).json({
        success: false,
        needsOTP: true,
        userId: user._id,
        message: 'Email tasdiqlanmagan. Yangi kod yuborildi.',
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    const updatedUser = await userRepository.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      $inc: { loginCount: 1 },
      refreshToken: refreshToken
    });

    res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: updatedUser.toSafeObject(),
      needsProfile: !updatedUser.isProfileComplete,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi', dbgObj: err.toString() });
  }
};

// ==================== EMAIL LOGIN (OTP only) ====================
const requestEmailLogin = async (req, res) => {
  try {
    const { email } = req.body;
    const lowerEmail = email ? email.toLowerCase().trim() : '';
    const isGmailRegex = /^[a-zA-Z0-9._%+-]+@gmail(\.com)?$/;
    const isValidFormat = lowerEmail === 'admin' || isGmailRegex.test(lowerEmail);

    if (!isValidFormat) {
      return res.status(400).json({ success: false, message: 'Login formati noto\'g\'ri' });
    }

    let user = await userRepository.findByEmail(lowerEmail);
    if (!user) {
      // Auto-register
      user = await userRepository.create({
        email: lowerEmail,
        isEmailVerified: true,
        authProvider: 'local',
        isProfileComplete: false,
      });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Hisobingiz bloklangan' });
    }

    const otp = generateOTP();
    await userRepository.findByIdAndUpdate(user._id, {
      emailOTP: otp,
      emailOTPExpires: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendOTPEmail(email, otp, req.body.language || 'uz');

    res.json({
      success: true,
      userId: user._id,
      message: 'Emailga tasdiqlash kodi yuborildi',
    });
  } catch (err) {
    console.error('Email login error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// ==================== FORGOT PASSWORD ====================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Bu email ro\'yxatdan o\'tmagan' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    await userRepository.findByIdAndUpdate(user._id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000)
    });

    await sendPasswordResetEmail(email, resetToken, req.body.language || 'uz');

    res.json({ success: true, message: 'Parolni tiklash havolasi emailga yuborildi' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// ==================== RESET PASSWORD ====================
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userRepository.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token yaroqsiz yoki muddati o\'tgan' });
    }

    // Use the document save middleware for hashing password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Parol muvaffaqiyatli yangilandi' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// ==================== REFRESH TOKEN ====================
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(401).json({ success: false, message: 'Refresh token kerak' });

    const decoded = verifyRefreshToken(token);
    const user = await userRepository.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Token yaroqsiz' });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    
    await userRepository.findByIdAndUpdate(user._id, {
      refreshToken: newRefreshToken
    });

    res.json({ success: true, token: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token yaroqsiz' });
  }
};

// ==================== COMPLETE PROFILE ====================
const completeProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, dateOfBirth, gender, region, district, mfy, diabetesType, doctorName, height, weight } = req.body;

    const isProfileComplete = !!(firstName && lastName && phone && dateOfBirth && gender && region && district && mfy && diabetesType);

    const user = await userRepository.findByIdAndUpdate(
      req.user._id,
      {
        firstName,
        lastName,
        phone,
        dateOfBirth,
        gender,
        region,
        district,
        mfy,
        diabetesType,
        doctorName,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        isProfileComplete,
      }
    );

    res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    console.error('Complete profile error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// ==================== UPDATE PROFILE CREDENTIALS ====================
const updateProfile = async (req, res) => {
  try {
    const { email, firstName, lastName, phone } = req.body;
    const user = await userRepository.findById(req.user._id);

    const updates = {};
    if (email && email !== user.email) {
      const emailExists = await userRepository.findByEmail(email);
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Bu email band' });
      }
      updates.email = email;
    }

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phone) updates.phone = phone;

    const updatedUser = await userRepository.findByIdAndUpdate(req.user._id, updates);
    res.json({ success: true, user: updatedUser.toSafeObject(), message: 'Profil muvaffaqiyatli yangilandi' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Yangilashda xato' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await userRepository.findById(req.user._id);

    if (user.password) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Eski parol noto\'g\'ri' });
      }
    }

    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Parol muvaffaqiyatli yangilandi' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
};

// ==================== GET ME ====================
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject ? req.user.toSafeObject() : req.user });
};

// ==================== LOGOUT ====================
const logout = async (req, res) => {
  try {
    await userRepository.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ success: true, message: 'Chiqish muvaffaqiyatli' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// ==================== OAUTH CALLBACK ====================
const oauthCallback = async (req, res) => {
  try {
    const user = req.user;
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const updatedUser = await userRepository.findByIdAndUpdate(user._id, {
      refreshToken: refreshToken,
      lastLogin: new Date(),
      $inc: { loginCount: 1 }
    });

    const params = new URLSearchParams({
      token: accessToken,
      refreshToken,
      needsProfile: (!updatedUser.isProfileComplete).toString(),
    });

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

module.exports = {
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
};
