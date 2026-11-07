const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/notifications - Get all notifications for current user (doctor)
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'firstName lastName avatar phone')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err) {
    console.error('get notifications error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Bildirishnoma topilmadi' });
    }

    res.json({ success: true, notification });
  } catch (err) {
    console.error('mark notification read error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, message: 'Barchasi o\'qildi deb belgilandi' });
  } catch (err) {
    console.error('read all notifications error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

// GET /api/notifications/vapid-key - Get public VAPID key for web push subscription
router.get('/vapid-key', (req, res) => {
  const { publicKey } = require('../services/pushService');
  res.json({ success: true, publicKey });
});

// POST /api/notifications/subscribe - Subscribe device to Web Push
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ success: false, message: 'Obuna ma\'lumotlari to\'liq emas' });
    }

    const PushSubscription = require('../models/PushSubscription');
    await PushSubscription.findOneAndUpdate(
      { user: req.user._id, endpoint: subscription.endpoint },
      {
        user: req.user._id,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userAgent: req.headers['user-agent'] || '',
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Push xabarnomaga muvaffaqiyatli obuna bo\'lindi' });
  } catch (err) {
    console.error('Push subscribe error:', err);
    res.status(500).json({ success: false, message: 'Obuna bo\'lishda xato' });
  }
});

// POST /api/notifications/unsubscribe - Unsubscribe device
router.post('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
      const PushSubscription = require('../models/PushSubscription');
      await PushSubscription.deleteOne({ user: req.user._id, endpoint });
    }
    res.json({ success: true, message: 'Push xabarnomadan chiqarildi' });
  } catch (err) {
    console.error('Push unsubscribe error:', err);
    res.status(500).json({ success: false, message: 'Xatolik' });
  }
});

module.exports = router;
