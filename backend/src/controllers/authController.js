const crypto = require('crypto');
const userRepository = require('../repositories/UserRepository');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

// ==================== LOGIN ====================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const lowerEmail = email ? email.toLowerCase().trim() : '';

    console.log(`🔑 Login attempt for: ${lowerEmail}`);

    const user = await userRepository.findOne({ email: lowerEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Login yoki parol noto\'g\'ri' });
    }

    if (!user.password) {
      return res.status(401).json({ success: false, message: 'Login yoki parol noto\'g\'ri' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: `Hisobingiz bloklangan: ${user.banReason || 'Sabab ko\'rsatilmagan'}` });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Login yoki parol noto\'g\'ri' });
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
    const { firstName, lastName, phone, telegramUsername, dateOfBirth, gender, region, district, mfy, diabetesType, doctorName, height, weight } = req.body;
    
    const isProfileComplete = !!(firstName && lastName && phone && dateOfBirth && gender && region && district && mfy && diabetesType);
    
    const user = await userRepository.findByIdAndUpdate(
      req.user._id,
      {
        firstName,
        lastName,
        phone,
        telegramUsername,
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

// ==================== UPDATE PROFILE ====================
const updateProfile = async (req, res) => {
  try {
    const { email, firstName, lastName, phone } = req.body;
    const user = await userRepository.findById(req.user._id);

    const updates = {};
    if (email && email !== user.email) {
      const emailExists = await userRepository.findByEmail(email);
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Bu login band' });
      }
      updates.email = email;
    }

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phone) updates.phone = phone;

    const updatedUser = await userRepository.findByIdAndUpdate(req.user._id, updates);
    res.json({ 
      success: true, 
      user: updatedUser.toSafeObject(), 
      message: 'Profil muvaffaqiyatli yangilandi'
    });
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

// ==================== DISABLED ROUTES ====================
const disabledRoute = (req, res) => {
  res.status(400).json({ success: false, message: 'Bu funksiya vaqtincha o\'chirilgan' });
};

module.exports = {
  login,
  refreshToken,
  completeProfile,
  getMe,
  logout,
  updateProfile,
  updatePassword,
  register: disabledRoute,
  verifyEmailOTP: disabledRoute,
  requestEmailLogin: disabledRoute,
  forgotPassword: disabledRoute,
  resetPassword: disabledRoute,
  verifyNewEmail: disabledRoute,
  oauthCallback: disabledRoute
};
