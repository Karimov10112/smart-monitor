const User = require('../models/User');
const BloodSugar = require('../models/BloodSugar');

const getAdminContacts = async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'superadmin' }).select('phone telegramUsername');
    res.json({
      success: true,
      contacts: {
        phone: admin?.phone || '',
        telegramUsername: admin?.telegramUsername || ''
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

const updateAdminContacts = async (req, res) => {
  try {
    const { phone, telegramUsername } = req.body;
    
    // Allow any superadmin to update these
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Faqatgina superadmin o\'zgartirishi mumkin' });
    }

    const admin = await User.findOneAndUpdate(
       { role: 'superadmin' }, 
       { phone, telegramUsername },
       { new: true }
    );
    
    res.json({ 
      success: true, 
      message: 'Kontaktlar yangilandi',
      contacts: { phone: admin.phone, telegramUsername: admin.telegramUsername }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isBanned, region } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    if (isBanned !== undefined) query.isBanned = isBanned === 'true';
    if (region) query.region = region;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -emailOTP -passwordResetToken -refreshToken')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Get single user details
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -emailOTP -passwordResetToken -refreshToken');
    if (!user) return res.status(404).json({ success: false, message: 'Topilmadi' });

    const records = await BloodSugar.find({ user: user._id })
      .sort({ date: -1 })
      .limit(30);

    res.json({ success: true, user, records });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'doctor', 'superadmin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Noto\'g\'ri rol' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true })
      .select('-password -emailOTP -passwordResetToken -refreshToken');

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Ban/Unban user
const toggleBanUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Topilmadi' });

    user.isBanned = !user.isBanned;
    user.banReason = user.isBanned ? reason : undefined;
    await user.save();

    res.json({
      success: true,
      isBanned: user.isBanned,
      message: user.isBanned ? 'Foydalanuvchi bloklandi' : 'Blok olib tashlandi',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Topilmadi' });
    await BloodSugar.deleteMany({ user: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Foydalanuvchi o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Add admin note
const addAdminNote = async (req, res) => {
  try {
    const { notes } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { adminNotes: notes }, { new: true })
      .select('-password -emailOTP -passwordResetToken -refreshToken');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const statsArray = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isEmailVerified: true }),
      User.countDocuments({ isBanned: true }),
      BloodSugar.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
      User.countDocuments({ lastSeen: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      User.aggregate([
        { $match: { region: { $exists: true, $ne: null } } },
        { $group: { _id: '$region', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.aggregate([
        { $match: { diabetesType: { $exists: true, $ne: null } } },
        { $group: { _id: '$diabetesType', count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: { gender: { $exists: true, $ne: null } } },
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $unwind: '$supportMessages' },
        { $match: { 'supportMessages.isReadByAdmin': false } },
        { $count: 'count' }
      ]),
    ]);

    const totalUnreadMessages = statsArray[9].length > 0 ? statsArray[9][0].count : 0;

    res.json({
      success: true,
      stats: {
        totalUsers: statsArray[0],
        verifiedUsers: statsArray[1],
        bannedUsers: statsArray[2],
        totalRecords: statsArray[3],
        newUsersToday: statsArray[4],
        activeToday: statsArray[5],
        regionStats: statsArray[6],
        diabetesTypeStats: statsArray[7],
        genderStats: statsArray[8],
        genderStats: statsArray[8],
        unreadSupportMessages: totalUnreadMessages,
      },
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Mark support messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.params.id },
      { $set: { 'supportMessages.$[].isReadByAdmin': true } }
    );
    
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.id).emit('messages-read');
    }

    res.json({ success: true, message: 'Xabarlar o\'qildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Get user blood sugar records for admin view
const getUserRecords = async (req, res) => {
  try {
    const records = await BloodSugar.find({ user: req.params.id })
      .sort({ date: -1 });
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Admin: Reply to user support message
const replyToUser = async (req, res) => {
  try {
    const { userId, text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Xabar bo\'sh' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

    user.supportMessages.push({
      text,
      sender: 'admin',
      isReadByAdmin: true,
      isReadByUser: false,
    });

    await user.save();
    
    // Real-time: Emit message via socket
    const io = req.app.get('io');
    if (io) {
      io.to(userId).emit('new-message', {
        text,
        sender: 'admin',
        createdAt: new Date()
      });
    }

    res.json({ success: true, message: 'Javob yuborildi', user });
  } catch (err) {
    console.error('Reply to user error:', err.message);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

module.exports = {
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
  getAdminContacts,
  updateAdminContacts,
};
