const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token kerak' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select('-password -emailOTP -passwordResetToken -refreshToken');
    if (!user) return res.status(401).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    if (!user.isActive || user.isBanned) {
      return res.status(403).json({ success: false, message: 'Hisobingiz bloklangan. Admin bilan bog\'laning.' });
    }

    // lastSeen ni har so'rovda emas, ko'pi bilan 5 daqiqada bir marta yangilaymiz
    const LAST_SEEN_INTERVAL_MS = 5 * 60 * 1000;
    if (!user.lastSeen || Date.now() - new Date(user.lastSeen).getTime() > LAST_SEEN_INTERVAL_MS) {
      User.updateOne({ _id: user._id }, { lastSeen: new Date() }).catch(() => {});
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token yaroqsiz yoki muddati o\'tgan' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Ruxsat yo\'q' });
    }
    next();
  };
};

const requireSuperAdmin = requireRole('superadmin', 'admin');
const requireStrictSuperAdmin = requireRole('superadmin');
const requireDoctor = requireRole('superadmin', 'admin', 'doctor');

module.exports = { protect, requireRole, requireSuperAdmin, requireStrictSuperAdmin, requireDoctor };
