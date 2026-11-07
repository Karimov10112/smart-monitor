const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const { notifyPatientReminder } = require('./telegramService');

/**
 * Har daqiqada ishga tushadigan cron job
 * Bemorlarning bugungi eslatmalarini tekshirib, Telegram orqali xabar yuboradi
 */
function initReminderScheduler(io) {
  // Ensure User model is loaded before populate
  require('../models/User');

  cron.schedule('* * * * *', async () => {
    try {
      // Toshkent vaqti bo'yicha (HH:MM)
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Tashkent',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const currentTime = formatter.format(now);
      console.log(`⏰ Cron checking reminders at ${currentTime} (Asia/Tashkent)...`);

      // Aktiv eslatmalarni qidirish
      const reminders = await Reminder.find({
        isActive: true,
        time: currentTime,
      }).populate('user');

      console.log(`Found ${reminders.length} reminders for ${currentTime}`);

      for (const rem of reminders) {
        if (!rem.user) continue;

        console.log(`Sending reminder to ${rem.user.firstName} (TG: ${rem.user.telegramChatId})`);

        // 1. Telegram orqali xabar yetkazish (100% yetib boradi!)
        notifyPatientReminder(rem.user, rem)
          .then(res => console.log('Telegram reminder result:', res))
          .catch(err => {
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

