const userRepository = require('../repositories/UserRepository');
const bloodSugarRepository = require('../repositories/BloodSugarRepository');
const { logAction } = require('../utils/auditLogger');
const AuditLog = require('../models/AuditLog');

const getAdminContacts = async (req, res) => {
  try {
    const Config = require('../models/Config');
    const contacts = await Config.findOne({ key: 'admin_contacts' });
    res.json({
      success: true,
      contacts: contacts?.value || { phone: '', telegramUsername: '' }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

const updateAdminContacts = async (req, res) => {
  try {
    const Config = require('../models/Config');
    const { phone, telegramUsername } = req.body;
    
    let config = await Config.findOne({ key: 'admin_contacts' });
    if (!config) {
      config = new Config({ key: 'admin_contacts', value: {} });
    }
    
    config.value = { ...config.value, phone, telegramUsername };
    await config.save();
    
    res.json({ 
      success: true, 
      message: 'Sozlamalar yangilandi',
      contacts: config.value
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
      const searchRegex = { $regex: search, $options: 'i' };
      const searchTerms = search.split(/\s+/).filter(Boolean);
      
      if (searchTerms.length > 1) {
        // If multiple words, try matching them across firstName and lastName
        query.$or = [
          { $and: searchTerms.map(term => ({
            $or: [
              { firstName: { $regex: term, $options: 'i' } },
              { lastName: { $regex: term, $options: 'i' } },
              { email: { $regex: term, $options: 'i' } },
              { phone: { $regex: term, $options: 'i' } },
              { telegramUsername: { $regex: term, $options: 'i' } },
              { region: { $regex: term, $options: 'i' } }
            ]
          }))},
          { email: searchRegex },
          { phone: searchRegex }
        ];
      } else {
        query.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { telegramUsername: searchRegex },
          { region: searchRegex },
        ];
      }
    }
    if (role) query.role = role;
    if (isBanned !== undefined) query.isBanned = isBanned === 'true';
    if (region) query.region = region;
    
    // Always filter for verified users by default to avoid showing pending registrations
    query.isEmailVerified = true;

    const total = await userRepository.countDocuments(query);
    const users = await userRepository.find(query, {
      select: '-password -emailOTP -passwordResetToken -refreshToken',
      sort: { createdAt: -1 },
      skip: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
      populate: { path: 'assignedDoctor', select: 'firstName lastName' }
    });

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
    const user = await userRepository.findById(req.params.id, {
      populate: { path: 'assignedDoctor', select: 'firstName lastName' }
    });
    if (!user) return res.status(404).json({ success: false, message: 'Topilmadi' });

    // Restriction: Non-superadmins cannot view superadmin data
    if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Super Admin ma\'lumotlarini ko\'rish taqiqlangan' });
    }

    const records = await bloodSugarRepository.find({ user: user._id }, {
      sort: { date: -1 },
      limit: 30
    });

    res.json({ success: true, user, records });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

const getUserRecords = async (req, res) => {
  try {
    const targetUser = await userRepository.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'Topilmadi' });

    // Restriction: Non-superadmins cannot view superadmin records
    if (targetUser.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Super Admin tahlillarini ko\'rish taqiqlangan' });
    }

    const records = await bloodSugarRepository.find({ user: req.params.id }, {
      sort: { date: -1 },
      limit: 100
    });
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Noto\'g\'ri rol yoki Super Admin tayinlash mumkin emas' });
    }

    const targetUser = await userRepository.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'Topilmadi' });

    // Restriction: Cannot change Super Admin role
    if (targetUser.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Super Admin rolini o\'zgartirib bo\'lmaydi' });
    }

    const oldRole = targetUser.role;
    targetUser.role = role;
    await targetUser.save();

    // Log the action
    await logAction(req.user._id, 'UPDATE_USER_ROLE', {
      targetId: targetUser._id,
      targetType: 'User',
      details: { oldRole, newRole: role, userEmail: targetUser.email },
      req
    });

    res.json({ success: true, user: targetUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Ban/Unban user
const toggleBanUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await userRepository.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Topilmadi' });

    // Restriction: Cannot ban Super Admin
    if (user.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Super Adminni bloklash mumkin emas' });
    }

    user.isBanned = !user.isBanned;
    user.banReason = user.isBanned ? reason : undefined;
    await user.save();

    // Log the action
    await logAction(req.user._id, user.isBanned ? 'BAN_USER' : 'UNBAN_USER', {
      targetId: user._id,
      targetType: 'User',
      details: { userEmail: user.email, reason },
      req
    });

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
    const user = await userRepository.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Topilmadi' });
    
    // Restriction: Cannot delete Super Admin
    if (user.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Super Adminni o\'chirib bo\'lmaydi' });
    }

    const BloodSugarModel = require('../models/BloodSugar');
    await BloodSugarModel.deleteMany({ user: user._id });
    await userRepository.findByIdAndDelete(req.params.id);

    // Log the action
    await logAction(req.user._id, 'DELETE_USER', {
      targetId: user._id,
      targetType: 'User',
      details: { userEmail: user.email },
      req
    });

    res.json({ success: true, message: 'Foydalanuvchi o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Add admin note
const addAdminNote = async (req, res) => {
  try {
    const { notes } = req.body;
    const user = await userRepository.findByIdAndUpdate(req.params.id, { adminNotes: notes });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const statsArray = await Promise.all([
      userRepository.countDocuments({ role: 'user' }),
      userRepository.countDocuments({ role: 'user', isEmailVerified: true }),
      userRepository.countDocuments({ isBanned: true }),
      bloodSugarRepository.countDocuments(),
      userRepository.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
      userRepository.countDocuments({ lastSeen: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      userRepository.aggregate([
        { $match: { region: { $exists: true, $ne: null } } },
        { $group: { _id: '$region', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      userRepository.aggregate([
        { $match: { diabetesType: { $exists: true, $ne: null } } },
        { $group: { _id: '$diabetesType', count: { $sum: 1 } } },
      ]),
      userRepository.aggregate([
        { $match: { gender: { $exists: true, $ne: null } } },
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ])
    ]);

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
      },
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const logs = await AuditLog.find()
      .populate('adminId', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await AuditLog.countDocuments();

    res.json({
      success: true,
      logs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Audit jurnallarini yuklashda xato' });
  }
};

const getDoctors = async (req, res) => {
  try {
    const doctors = await userRepository.find({ role: 'doctor' }, {
      select: 'firstName lastName email region district'
    });
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

const assignDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const user = await userRepository.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

    user.assignedDoctor = doctorId || null;
    await user.save();

    await logAction(req.user._id, 'ASSIGN_DOCTOR', {
      targetId: user._id,
      targetType: 'User',
      details: { doctorId, userEmail: user.email },
      req
    });

    res.json({ success: true, message: 'Doktor biriktirildi', user });
  } catch (err) {
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
  getAdminContacts,
  updateAdminContacts,
  getAuditLogs,
  getDoctors,
  assignDoctor,
};
