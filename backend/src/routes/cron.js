const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
require('../models/User');
const { notifyPatientReminder } = require('../services/telegramService');

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
    res.status(500).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

