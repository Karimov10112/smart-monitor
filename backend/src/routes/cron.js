const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
require('../models/User');
const crypto = require('crypto');
const { notifyPatientReminder } = require('../services/telegramService');

// Barcha cron yo'llari faqat CRON_SECRET bilan chaqiriladi:
//   Authorization: Bearer <CRON_SECRET>
// CRON_SECRET o'rnatilmagan bo'lsa, yo'llar yopiq (fail closed).
const requireCronSecret = (req, res, next) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return res.status(503).json({ success: false, message: 'CRON_SECRET sozlanmagan' });
  }
  const header = req.headers.authorization || '';
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
};
router.use(requireCronSecret);

// GET /api/cron/check-reminders - Render uxlab qolmasligi va eslatmalarni 100% yuborishi uchun
router.get('/check-reminders', async (req, res) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Tashkent',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const currentTime = formatter.format(new Date());

    const reminders = await Reminder.find({
      isActive: true,
      time: currentTime,
    }).populate('user');

    let sentCount = 0;
    for (const rem of reminders) {
      if (rem.user && rem.user.telegramChatId) {
        await notifyPatientReminder(rem.user, rem);
        sentCount++;
      }
    }

    res.json({
      success: true,
      time: currentTime,
      found: reminders.length,
      sentCount,
      message: `${sentCount} ta eslatma Telegramga muvaffaqiyatli yuborildi`,
    });
  } catch (err) {
    console.error('Cron endpoint error:', err);
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
});

// GET /api/cron/test-telegram/:userId - Sinov xabarini yuborish
router.get('/test-telegram/:userId', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.userId);
    if (!user || !user.telegramChatId) {
      return res.status(400).json({ success: false, message: 'Foydalanuvchida Telegram ulanmagan' });
    }

    const { sendTelegramMessage } = require('../services/telegramService');
    const sent = await sendTelegramMessage(
      user.telegramChatId,
      `🔔 <b>Test Bildirishnomasi!</b>\n\n` +
      `Salom, ${user.firstName}! Tizim to'liq ishlamoqda.\n` +
      `Hozirgi vaqt: ${new Date().toLocaleTimeString('uz-UZ', { timeZone: 'Asia/Tashkent' })}`
    );

    res.json({ success: sent, message: sent ? 'Telegramga yuborildi' : 'Xatolik' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
});

module.exports = router;

