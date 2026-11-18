const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const { notifyPatientReminder } = require('./telegramService');

const TIME_ZONE = 'Asia/Tashkent';
// Server qayta ishga tushgan yoki biror daqiqa o'tkazib yuborilgan bo'lsa,
// shu oraliqdagi (daqiqa) yuborilmagan eslatmalar ham yuboriladi
const CATCH_UP_MINUTES = 30;

/** Toshkent vaqti bo'yicha bugungi sana (YYYY-MM-DD) va joriy vaqt (HH:mm) */
function tashkentNow(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  );
  const hour = parts.hour === '24' ? '00' : parts.hour;
  return { today: `${parts.year}-${parts.month}-${parts.day}`, time: `${hour}:${parts.minute}` };
}

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + m;
};

const fromMinutes = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

/**
 * Yangi yoki o'zgartirilgan eslatma uchun lastSentDate qiymati:
 * vaqti bugun allaqachon o'tgan bo'lsa, birinchi xabar ertaga keladi (darhol yuborilmaydi).
 */
function initialLastSentDate(time) {
  const { today, time: now } = tashkentNow();
  return toMinutes(time) <= toMinutes(now) ? today : null;
}

/**
 * Vaqti kelgan (yoki oxirgi CATCH_UP_MINUTES ichida o'tkazib yuborilgan) va bugun hali
 * yuborilmagan eslatmalarni yuboradi. Har bir eslatma kuniga bir marta yuboriladi.
 */
async function processDueReminders(io) {
  require('../models/User');

  // Bot token bo'lmasa (masalan eski servis nusxasida) eslatmalarni "yuborildi" deb belgilamaymiz
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return { skipped: 'TELEGRAM_BOT_TOKEN yo\'q', sent: 0 };
  }

  const { today, time: now } = tashkentNow();
  const nowMin = toMinutes(now);
  const fromMin = Math.max(0, nowMin - CATCH_UP_MINUTES);

  const due = await Reminder.find({
    isActive: true,
    time: { $gte: fromMinutes(fromMin), $lte: now },
    lastSentDate: { $ne: today },
  }).populate('user');

  let sent = 0;
  for (const rem of due) {
    // Atomar "band qilish": bir nechta jarayon bo'lsa ham faqat bittasi yuboradi
    const claimed = await Reminder.findOneAndUpdate(
      { _id: rem._id, lastSentDate: { $ne: today } },
      { $set: { lastSentDate: today } }
    );
    if (!claimed || !rem.user) continue;

    if (rem.user.telegramChatId) {
      const ok = await notifyPatientReminder(rem.user, rem).catch(() => false);
      if (ok) {
        sent++;
      } else {
        // Yuborilmadi — keyingi daqiqada qayta urinish uchun belgini qaytaramiz
        await Reminder.updateOne(
          { _id: rem._id, lastSentDate: today },
          { $set: { lastSentDate: claimed.lastSentDate ?? null } }
        );
        console.error(`Eslatma yuborilmadi (${rem._id}), qayta urinish bo'ladi`);
        continue;
      }
    }

    if (io) {
      io.to(rem.user._id.toString()).emit('reminder-alert', {
        _id: rem._id,
        title: rem.name,
        body: `${rem.name} - ${rem.dose}`,
        type: rem.type,
        time: rem.time,
      });
    }
  }

  if (due.length) console.log(`⏰ ${now}: ${due.length} ta eslatma topildi, ${sent} tasi Telegramga yuborildi`);
  return { time: now, found: due.length, sent };
}

/**
 * Har daqiqada ishga tushadigan cron job
 * Bemorlarning bugungi eslatmalarini tekshirib, Telegram orqali xabar yuboradi
 */
async function initReminderScheduler(io) {
  // Birinchi ishga tushishda: lastSentDate'i yo'q eski eslatmalardan vaqti bugun allaqachon
  // o'tganlarini "bugun yuborilgan" deb belgilaymiz (ikki marta yuborilmasligi uchun)
  try {
    const { today, time: now } = tashkentNow();
    await Reminder.updateMany(
      { lastSentDate: { $exists: false }, time: { $lte: now } },
      { $set: { lastSentDate: today } }
    );
  } catch (err) {
    console.error('Reminder migration error:', err);
  }

  cron.schedule('* * * * *', () => {
    processDueReminders(io).catch((err) => console.error('Reminder scheduler error:', err));
  });

  console.log(`⏰ Telegram Reminder scheduler initialized (${TIME_ZONE}, catch-up ${CATCH_UP_MINUTES} min)`);

  // 🔄 Self-Ping keep-alive: Server har 5 daqiqada o'zini o'zi uyg'otib turadi
  const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || 'https://smart-monitor-1-a037.onrender.com';
  cron.schedule('*/5 * * * *', async () => {
    try {
      await fetch(`${BACKEND_URL}/api/health`);
    } catch (err) {
      // Ignore ping network errors
    }
  });
  console.log(`💓 Keep-alive self-ping initialized for: ${BACKEND_URL}`);
}

module.exports = {
  initReminderScheduler,
  processDueReminders,
  initialLastSentDate,
  tashkentNow,
};
