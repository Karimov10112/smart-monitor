const User = require('../models/User');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9274539353:AAENcYinulD1dnfFjLrRR19W3mracruSUdY';
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'diabetmed_uz_bot';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * Send a message to a specific Telegram chat_id
 */
async function sendTelegramMessage(chatId, text, options = {}) {
  if (!chatId || !text) return false;
  try {
    const payload = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...options,
    };

    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data.ok;
  } catch (err) {
    console.error('sendTelegramMessage error:', err);
    return false;
  }
}

/**
 * Handle incoming updates from Telegram (Webhook or Polling)
 */
async function handleTelegramUpdate(update) {
  try {
    const message = update.message;
    if (!message || !message.text) return;

    const chatId = String(message.chat.id);
    const text = message.text.trim();

    // Command: /start [userId]
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const userId = parts[1]; // /start 66fa...

      if (userId) {
        // Link user
        const user = await User.findById(userId);
        if (user) {
          user.telegramChatId = chatId;
          if (message.from && message.from.username) {
            user.telegramUsername = message.from.username;
          }
          await user.save();

          const roleName = user.role === 'doctor' ? 'Hurmatli Shifokor' : 'Hurmatli Bemor';
          const welcomeMsg = `<b>Assalomu alaykum, ${roleName} ${user.firstName || ''}!</b>\n\n` +
            `✅ Sizning <b>Qand Nazorati (diabetmed.uz)</b> profilingiz ushbu Telegram bot bilan muvaffaqiyatli bog'landi.\n\n` +
            `🔔 <i>Endi dori eslatmalari, shakar tekshirish va shoshilinch ogohlantirishlar shu yerga keladi!</i>`;

          await sendTelegramMessage(chatId, welcomeMsg);
          return;
        }
      }

      // If already linked by chatId
      const existingUser = await User.findOne({ telegramChatId: chatId });
      if (existingUser) {
        await sendTelegramMessage(
          chatId,
          `<b>Assalomu alaykum, ${existingUser.firstName || ''}!</b>\n\n` +
          `Sizning hisobingiz tizimga ulangan. Barcha eslatmalar o'z vaqtida yuboriladi.`
        );
        return;
      }

      // Not linked
      await sendTelegramMessage(
        chatId,
        `<b>Assalomu alaykum!</b>\n\n` +
        `Bu <b>Qand Nazorati</b> tizimining rasmiy bildirishnoma boti.\n\n` +
        `Profilingizni ulash uchun, saytimizga (https://diabetmed.uz) kiring va <b>"Telegram orqali ulash"</b> tugmasini bosing.`
      );
    }
  } catch (err) {
    console.error('handleTelegramUpdate error:', err);
  }
}

/**
 * Start long-polling for local/Render environments
 */
let isPolling = false;
let lastUpdateId = 0;

async function startPolling() {
  if (isPolling) return;
  isPolling = true;
  console.log(`🤖 Telegram bot (@${BOT_USERNAME}) polling started...`);

  // Remove any leftover webhook before polling
  try {
    await fetch(`${TELEGRAM_API}/deleteWebhook`);
  } catch (e) {}

  const poll = async () => {
    try {
      const res = await fetch(`${TELEGRAM_API}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          await handleTelegramUpdate(update);
        }
      }
    } catch (err) {
      // ignore network glitch and retry
    }

    if (isPolling) {
      setTimeout(poll, 1000);
    }
  };

  poll();
}

/**
 * Shifokorga shoshilinch kritik shakar xabarini yuborish
 */
async function notifyDoctorCriticalSugar(doctor, patient, sugarLevel, category, alertType) {
  if (!doctor || !doctor.telegramChatId) return false;

  const patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Bemor';
  const catLabel = category === 'fasting' ? 'Och qoringa' : 'Ovqatdan keyin';
  const dangerTitle = alertType === 'CRITICAL_HIGH' ? '🔴 O\'TA YUQORI QAND' : '⚠️ XAVFLI PAST QAND (Gipoglikemiya)';

  const text =
    `🚨 <b>SHOSHILINCH OGOHLANTIRISH!</b>\n\n` +
    `<b>Holat:</b> ${dangerTitle}\n` +
    `👤 <b>Bemor:</b> ${patientName}\n` +
    `🩸 <b>Qand miqdori:</b> <code>${sugarLevel} mmol/l</code> (${catLabel})\n` +
    (patient.phone ? `📞 <b>Telefon:</b> <a href="tel:${patient.phone}">${patient.phone}</a>\n` : '') +
    `⏰ <b>Vaqt:</b> ${new Date().toLocaleTimeString('uz-UZ', { timeZone: 'Asia/Tashkent', hour: '2-digit', minute: '2-digit' })}\n\n` +
    `<i>Iltimos, zudlik bilan bemor holatini tekshiring yoki tavsiya bering!</i>\n` +
    `🌐 <a href="https://diabetmed.uz/doctor">Shifokor kabinetiga o'tish</a>`;

  return sendTelegramMessage(doctor.telegramChatId, text);
}

/**
 * Bemorga eslatma yuborish
 */
async function notifyPatientReminder(user, reminder) {
  if (!user || !user.telegramChatId) return false;

  const typeIcon = reminder.type === 'insulin' ? '💉' : '💊';
  const typeText = reminder.type === 'insulin' ? 'Insulin qabul qilish' : 'Dori ichish';

  const text =
    `⏰ <b>ESLATMA VAQTI BO'LDI!</b>\n\n` +
    `${typeIcon} <b>Muolaja:</b> ${typeText}\n` +
    `🔹 <b>Nomi:</b> ${reminder.name}\n` +
    `🔹 <b>Dozasi:</b> ${reminder.dose}\n` +
    (reminder.notes ? `📝 <b>Izoh:</b> ${reminder.notes}\n` : '') +
    `⏰ <b>Rejalashtirilgan vaqt:</b> ${reminder.time}\n\n` +
    `<i>Dorini o'z vaqtida qabul qiling va salomatligingizni asrang!</i>\n` +
    `🌐 <a href="https://diabetmed.uz">Qand Nazorati saytiga o'tish</a>`;

  return sendTelegramMessage(user.telegramChatId, text);
}

module.exports = {
  BOT_USERNAME,
  sendTelegramMessage,
  startPolling,
  notifyDoctorCriticalSugar,
  notifyPatientReminder,
};

