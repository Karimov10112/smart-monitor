const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const { notifyPatientReminder } = require('./telegramService');

/**
 * Har daqiqada ishga tushadigan cron job
 * Bemorlarning bugungi eslatmalarini tekshirib, Telegram orqali xabar yuboradi
 */
function initReminderScheduler(io) {
  cron.schedule('* * * * *', async () => {
    try {
      // Toshkent vaqti bo'yicha (HH:MM)
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Tashkent',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const currentTime = formatter.format(new Date());

      // Aktiv eslatmalarni qidirish
      const reminders = await Reminder.find({
        isActive: true,
        time: currentTime,
      }).populate('user', 'firstName lastName telegramChatId');

      for (const rem of reminders) {
        if (!rem.user) continue;

        // 1. Telegram orqali xabar yetkazish (100% yetib boradi!)
        notifyPatientReminder(rem.user, rem).catch(err => {
          console.error('Telegram reminder send error:', err);
        });

        // 2. Real-time Socket orqali agar saytda bo'lsa
        if (io) {
          io.to(rem.user._id.toString()).emit('reminder-alert', {
            _id: rem._id,
            title: rem.name,
            body: `${rem.name} - ${rem.dose}`,
            type: rem.type,
            time: currentTime,
          });
        }
      }
    } catch (err) {
      console.error('Telegram reminder scheduler error:', err);
    }
  });

  console.log('⏰ Telegram Reminder scheduler initialized (Asia/Tashkent)');
}

module.exports = {
  initReminderScheduler,
};

