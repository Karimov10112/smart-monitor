const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

// Xona ID hosil qilish (ikki foydalanuvchi uchun bir xil)
const getRoomId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('_');
};

// GET /api/chat/conversations — Barcha suhbatlarni olish (doctor uchun patients, bemor uchun doctor)
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Oxirgi xabarlarni topib, unique suhbatlar
    const messages = await ChatMessage.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'firstName lastName role avatar')
      .populate('receiver', 'firstName lastName role avatar');

    // Har bir suhbatdan faqat oxirgi xabar
    const conversationsMap = new Map();
    messages.forEach(msg => {
      const otherId = msg.sender._id.toString() === userId.toString()
        ? msg.receiver._id.toString()
        : msg.sender._id.toString();

      if (!conversationsMap.has(otherId)) {
        const other = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
        conversationsMap.set(otherId, {
          user: other,
          lastMessage: msg,
          room: msg.room,
          unreadCount: 0
        });
      }
    });

    // O'qilmagan xabarlar sonini hisoblash
    for (const [otherId, conv] of conversationsMap) {
      const unread = await ChatMessage.countDocuments({
        room: conv.room,
        receiver: userId,
        isRead: false
      });
      conv.unreadCount = unread;
    }

    res.json({ success: true, conversations: Array.from(conversationsMap.values()) });
  } catch (err) {
    console.error('Chat conversations error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

// GET /api/chat/messages/:userId — Muayyan foydalanuvchi bilan xabarlarni olish
router.get('/messages/:userId', protect, async (req, res) => {
  try {
    const myId = req.user._id;
    const otherId = req.params.userId;

    const room = getRoomId(myId, otherId);

    const messages = await ChatMessage.find({ room })
      .sort({ createdAt: 1 })
      .populate('sender', 'firstName lastName role avatar')
      .populate('receiver', 'firstName lastName role avatar')
      .limit(200);

    // O'qilmagan xabarlarni o'qilgan deb belgilash
    await ChatMessage.updateMany(
      { room, receiver: myId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, messages, room });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

// POST /api/chat/messages — Xabar yuborish (REST fallback, asosan Socket.io)
router.post('/messages', protect, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text?.trim()) {
      return res.status(400).json({ success: false, message: 'receiverId va text kerak' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    const room = getRoomId(req.user._id, receiverId);
    const message = await ChatMessage.create({
      room,
      sender: req.user._id,
      receiver: receiverId,
      text: text.trim(),
    });

    await message.populate('sender', 'firstName lastName role avatar');
    await message.populate('receiver', 'firstName lastName role avatar');

    // Real-time: Socket.io orqali jo'natish
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId.toString()).emit('new-message', { message });
    }

    res.json({ success: true, message });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

// GET /api/chat/unread-count — O'qilmagan xabarlar soni
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await ChatMessage.countDocuments({
      receiver: req.user._id,
      isRead: false
    });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

// GET /api/chat/available-users — Chat qilish mumkin bo'lgan foydalanuvchilar
router.get('/available-users', protect, async (req, res) => {
  try {
    const me = req.user;
    let users = [];

    if (me.role === 'doctor' || me.role === 'admin' || me.role === 'superadmin') {
      // Shifokor — o'ziga biriktirilgan bemorlar
      users = await User.find({
        assignedDoctor: me._id,
        isActive: true,
        isBanned: false
      }).select('firstName lastName role avatar isProfileComplete lastSeen');
    } else {
      // Bemor — o'ziga biriktirilgan shifokor
      if (me.assignedDoctor) {
        const doctor = await User.findById(me.assignedDoctor)
          .select('firstName lastName role avatar lastSeen');
        if (doctor) users = [doctor];
      }
    }

    res.json({ success: true, users });
  } catch (err) {
    console.error('Available users error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

module.exports = router;
