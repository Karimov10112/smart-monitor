const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6 },

    // OAuth
    googleId: { type: String, sparse: true },
    facebookId: { type: String, sparse: true },
    authProvider: { type: String, enum: ['local', 'google', 'facebook'], default: 'local' },

    // Profile
    avatar: String,
    phone: String,
    telegramUsername: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    region: String,   // viloyat
    district: String, // tuman
    mfy: String,      // mahalla
    diabetesType: { type: String, enum: ['type1', 'type2', 'prediabetes', 'gestational', 'none'] },
    doctorName: String,
    deepseekApiKey: String,
    isProfileComplete: { type: Boolean, default: false },

    // Auth
    role: { type: String, enum: ['user', 'doctor', 'superadmin'], default: 'user' },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    banReason: String,

    // Email OTP
    emailOTP: String,
    emailOTPExpires: Date,

    // Password reset
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Refresh token
    refreshToken: String,

    // Activity
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
    lastSeen: Date,

    // Notes by admin
    adminNotes: String,
    doctorNotes: String,

    // Support and Notifications
    supportMessages: [
      {
        text: String,
        sender: { type: String, enum: ['user', 'admin'], default: 'user' },
        createdAt: { type: Date, default: Date.now },
        isReadByAdmin: { type: Boolean, default: false },
        isReadByUser: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe user object (no password)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailOTP;
  delete obj.emailOTPExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
