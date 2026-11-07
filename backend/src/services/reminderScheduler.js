const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const { sendPushToUser } = require('./pushService');

/**
 * Har daqiqada ishga tushadigan cron job
 * Bemorlarning bugungi eslatmalarini tekshirib, brauzer push xabarnoma yuboradi
 */
function initReminderScheduler(io) {
  // Har daqiqada (har 60 soniyada)
  cron.schedule('* * * * *', async () => {
    try {
      // Hozirgi soat va daqiqani olish (HH:MM) - Toshkent vaqti
      const now = new Date();
      // Toshkent vaqti bo'yicha (UTC+5)
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Tashkent',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const currentTime = formatter.format(now); // Masalan "08:30"
      
      const dayOfWeek = now.getDay(); // 0 - Yakshanba, 1 - Dushanba ...

      // Aktiv eslatmalarni qidirish
      const reminders = await Reminder.find({
        isActive: true,
        time: currentTime,
      }).populate('user', 'firstName lastName');

      for (const rem of reminders) {
        // Agar maxsus kunlar (days) ko'rsatilgan bo'lsa va bugungi kun kirmasa, o'tkazib yuboramiz
        if (rem.days && rem.days.length > 0 && !rem.days.includes(dayOfWeek)) {
          continue;
        }

        const title = rem.title || 'Diabet eslatmasi';
        const typeLabels = {
          sugar: "Qon shakarini o'lchash vaqti keldi!",
          insulin: 'Insulin qabul qilish vaqti!',
          medication: 'Dorilarni ichish vaqti!',
          meal: 'Ovqatlanish vaqti!',
          doctor: 'Shifokor ko\'rigi vaqti!',
        };

        const body = rem.notes || typeLabels[rem.type] || 'Sog\'ligingizni nazorat qilish vaqti keldi!';

        // 1. Web Push orqali brauzer/ekranga yuborish (Sayt yopiq bo'lsa ham keladi!)
        sendPushToUser(rem.user._id, {
          title: `⏰ ${title}`,
          body,
          url: '/?tab=reminders',
          tag: `reminder-${rem._id}`,
        }).catch(() => {});

        // 2. Real-time Socket orqali agar saytda bo'lsa
        if (io) {
          io.to(rem.user._id.toString()).emit('reminder-alert', {
            _id: rem._id,
            title,
            body,
            type: rem.type,
            time: currentTime,
          });
        }
      }
    } catch (err) {
      console.error('Reminder scheduler error:', err);
    }
  });

  console.log('⏰ Reminder push scheduler initialized (Asia/Tashkent)');
}

module.exports = {
  initReminderScheduler,
};

