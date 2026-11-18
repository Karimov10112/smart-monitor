const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Bot token faqat muhit o'zgaruvchisidan olinadi (kodda saqlanmaydi)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'diabetmed_uz_bot';
const TELEGRAM_API = BOT_TOKEN ? `https://api.telegram.org/bot${BOT_TOKEN}` : null;
if (!BOT_TOKEN) console.warn("⚠️ TELEGRAM_BOT_TOKEN o'rnatilmagan — Telegram xabarlari yuborilmaydi");

// Sessiyalarni xotirada saqlash: chatId -> { step: 'awaiting_login' | 'awaiting_password', email: '' }
const userSessions = new Map();

// Bot orqali parolni taxmin qilishga qarshi: chatId -> { count, lockedUntil }
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;
const loginAttempts = new Map();

function isLocked(chatId) {
  const a = loginAttempts.get(chatId);
  return !!(a && a.lockedUntil && a.lockedUntil > Date.now());
}
function registerFailedAttempt(chatId) {
  const a = loginAttempts.get(chatId) || { count: 0, lockedUntil: 0 };
  a.count += 1;
  if (a.count >= MAX_LOGIN_ATTEMPTS) {
    a.count = 0;
    a.lockedUntil = Date.now() + LOCK_MS;
  }
  loginAttempts.set(chatId, a);
}

/**
 * Saytdagi "Botni ulash" havolasi uchun imzolangan token: <userId>_<hmac>
 * Faqat userId bilan boshqa birovning profilini ulab olishning oldi olinadi.
 */
function linkSecret() {
  return process.env.TELEGRAM_LINK_SECRET || process.env.JWT_SECRET;
}
function createTelegramLinkToken(userId) {
  const id = String(userId);
  const sig = crypto.createHmac('sha256', linkSecret()).update(`tg-link:${id}`).digest('hex').slice(0, 24);
  return `${id}_${sig}`;
}
function verifyTelegramLinkToken(token) {
  if (!token || !linkSecret()) return null;
  const [id, sig] = String(token).split('_');
  if (!id || !sig || !mongoose.isValidObjectId(id)) return null;
  const expected = createTelegramLinkToken(id).split('_')[1];
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return id;
}

/**
 * Send a message to a specific Telegram chat_id
 */
async function sendTelegramMessage(chatId, text, options = {}) {
  if (!chatId || !text || !TELEGRAM_API) return false;
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
 * Handle incoming updates from Telegram (Webhook)
 */
async function handleTelegramUpdate(update) {
  try {
    const message = update.message;
    if (!message || !message.text) return;

    const chatId = String(message.chat.id);
    const text = message.text.trim();

    // 1. Foydalanuvchi hisobini tekshirish
    let currentUser = await User.findOne({ telegramChatId: chatId });

    // Buyruqlar: /logout
    if (text === '/logout' || text === '/chiqish') {
      if (currentUser) {
        currentUser.telegramChatId = undefined;
        currentUser.telegramUsername = undefined;
        await currentUser.save();
        userSessions.delete(chatId);
        await sendTelegramMessage(
          chatId,
          `🚪 <b>Hisobdan chiqildi!</b>\n\nQayta ulanish uchun /login buyrug'ini yuboring.`
        );
        return;
      } else {
        await sendTelegramMessage(chatId, `Siz tizimga kirmagansiz. Kirish uchun /login buyrug'ini yuboring.`);
        return;
      }
    }

    // Buyruqlar: /start yoki /login
    if (text.startsWith('/start') || text === '/login' || text === '/kirish') {
      const parts = text.split(' ');
      // /start <userId>_<imzo> (sayt orqali havoladan kelganda). Imzo tekshiriladi.
      const directUserId = verifyTelegramLinkToken(parts[1]);

      if (parts[1] && !directUserId) {
        await sendTelegramMessage(chatId, `❌ Havola yaroqsiz. Saytdagi "Botni ulash" tugmasini qayta bosing yoki /login yuboring.`);
        return;
      }

      if (directUserId) {
        const user = await User.findById(directUserId);
        if (user) {
          user.telegramChatId = chatId;
          if (message.from && message.from.username) {
            user.telegramUsername = message.from.username;
          }
          await user.save();
          userSessions.delete(chatId);

          const roleName = user.role === 'doctor' ? 'Hurmatli Shifokor' : 'Hurmatli Bemor';
          const welcomeMsg =
            `<b>Assalomu alaykum, ${roleName} ${user.firstName || ''}!</b>\n\n` +
            `✅ Sizning <b>Qand Nazorati (diabetmed.uz)</b> profilingiz ushbu Telegram bot bilan muvaffaqiyatli bog'landi.\n\n` +
            (user.role === 'doctor'
              ? `👨‍⚕️ <b>Shifokor xizmati:</b> Biriktirilgan bemorlaringizda qon shakari xavfli darajaga yetsa, zudlik bilan sizga ogohlantirish keladi.\n\n`
              : `💊 <b>Eslatma xizmati:</b> Saytda kiritgan barcha dori va insulin vaqtlari aynan shu bot orqali sizga eslatib turiladi!\n\n`);

          await sendTelegramMessage(chatId, welcomeMsg);
          return;
        }
      }

      if (currentUser) {
        const roleLabel = currentUser.role === 'doctor' ? 'Shifokor' : 'Bemor';
        await sendTelegramMessage(
          chatId,
          `👋 <b>Assalomu alaykum, ${currentUser.firstName || ''}!</b>\n\n` +
          `Siz tizimga <b>${roleLabel}</b> sifatida ulangansiz.\n\n` +
          (currentUser.role === 'doctor'
            ? `🚨 Bemorlaringizning qon shakari me'yordan oshsa yoki tushib ketsa, sizga shu yerda ogohlantirish keladi.`
            : `⏰ Saytda belgilangan dori va insulin vaqtlari bo'yicha eslatmalar muntazam yuboriladi.`) +
          `\n\n<i>Hisobdan chiqish uchun: /logout</i>`
        );
        return;
      }

      // Login kiritishni so'rash
      userSessions.set(chatId, { step: 'awaiting_login' });
      await sendTelegramMessage(
        chatId,
        `👋 <b>Assalomu alaykum!</b>\n\n` +
        `Bu <b>Qand Nazorati (diabetmed.uz)</b> dori va insulin eslatmalari boti.\n\n` +
        `Profilingizni ulash uchun saytdagi <b>Loginingizni (Email)</b> kiriting:`
      );
      return;
    }

    // Login va parol jarayoni
    const session = userSessions.get(chatId);
    if (text === '/cancel' || text === '/bekor') {
      userSessions.delete(chatId);
      await sendTelegramMessage(chatId, `Bekor qilindi. Qayta boshlash: /login`);
      return;
    }

    if (session && isLocked(chatId)) {
      userSessions.delete(chatId);
      await sendTelegramMessage(chatId, `⛔ Juda ko'p noto'g'ri urinish. 15 daqiqadan keyin qayta urinib ko'ring.`);
      return;
    }

    if (session && session.step === 'awaiting_login') {
      // Email mavjudligi oshkor qilinmaydi — har doim parol so'raladi
      const emailInput = text.toLowerCase().trim();
      userSessions.set(chatId, { step: 'awaiting_password', email: emailInput });
      await sendTelegramMessage(
        chatId,
        `🔑 <b>Login qabul qilindi.</b>\n\nEndi saytdagi <b>parolingizni</b> kiriting:`
      );
      return;
    }

    if (session && session.step === 'awaiting_password') {
      const userToAuth = await User.findOne({ email: session.email });
      const isMatch = !!(userToAuth && userToAuth.password && await bcrypt.compare(text, userToAuth.password));
      if (!isMatch || !userToAuth.isActive || userToAuth.isBanned) {
        registerFailedAttempt(chatId);
        userSessions.set(chatId, { step: 'awaiting_login' });
        await sendTelegramMessage(
          chatId,
          `❌ <b>Login yoki parol noto'g'ri!</b>\n\nEmailingizni qayta kiriting (bekor qilish: /cancel):`
        );
        return;
      }
      loginAttempts.delete(chatId);

      // Bog'lash
      userToAuth.telegramChatId = chatId;
      if (message.from && message.from.username) {
        userToAuth.telegramUsername = message.from.username;
      }
      await userToAuth.save();
      userSessions.delete(chatId);

      const roleName = userToAuth.role === 'doctor' ? 'Hurmatli Shifokor' : 'Hurmatli Bemor';
      await sendTelegramMessage(
        chatId,
        `✅ <b>Tabriklaymiz, ${roleName} ${userToAuth.firstName || ''}!</b>\n\n` +
        `Sizning profilingiz botga muvaffaqiyatli bog'landi.\n\n` +
        (userToAuth.role === 'doctor'
          ? `🩺 Bemorlaringizning qon shakari kritik baland yoki xavfli past bo'lganda darhol sizga xabar yetkaziladi!`
          : `💊 Belgilangan vaqtlarda dori va insulin eslatmalari aynan shu yerga yuboriladi!`)
      );
      return;
    }

    // Agar tizimga allaqachon ulangan bo'lsa
    if (currentUser) {
      await sendTelegramMessage(
        chatId,
        `📌 <b>Bot xizmati faol:</b>\nSizga barcha eslatmalar va muhim bildirishnomalar o'z vaqtida yuboriladi.\n\nHisobdan chiqish: /logout`
      );
      return;
    }

    // Kirmagan bo'lsa
    await sendTelegramMessage(
      chatId,
      `Iltimos, avval tizimga kiring: <b>/login</b>`
    );
  } catch (err) {
    console.error('handleTelegramUpdate error:', err);
  }
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
 * Bemorga eslatma yuborish (Dori yoki Insulin)
 */
async function notifyPatientReminder(user, reminder) {
  if (!user || !user.telegramChatId) return false;

  const typeIcon = reminder.type === 'insulin' ? '💉' : '💊';
  const typeText = reminder.type === 'insulin' ? 'Insulin qabul qilish' : 'Dori ichish';

  const text =
    `⏰ <b>ESLATMA VAQTI BO'LDI!</b>\n\n` +
    `${typeIcon} <b>Muolaja turi:</b> ${typeText}\n` +
    `🔹 <b>Dori/Insulin:</b> ${reminder.name}\n` +
    `🔹 <b>Dozasi:</b> ${reminder.dose}\n` +
    (reminder.notes ? `📝 <b>Qo'shimcha izoh:</b> ${reminder.notes}\n` : '') +
    `⏰ <b>Belgilangan vaqt:</b> ${reminder.time}\n\n` +
    `<i>Salomatligingiz uchun dorilarni o'z vaqtida qabul qilishni unutmang!</i>\n` +
    `🌐 <a href="https://diabetmed.uz">Qand Nazorati sayti</a>`;

  return sendTelegramMessage(user.telegramChatId, text);
}

/**
 * Yangi eslatma qo'shilganda bemorga tasdiq xabari yuborish
 */
async function notifyReminderCreated(user, reminder) {
  if (!user || !user.telegramChatId) return false;

  const typeIcon = reminder.type === 'insulin' ? '💉' : '💊';
  const typeText = reminder.type === 'insulin' ? 'Insulin' : 'Dori';

  const text =
    `✅ <b>Yangi eslatma saqlandi!</b>\n\n` +
    `${typeIcon} <b>Turi:</b> ${typeText}\n` +
    `🔹 <b>Nomi:</b> ${reminder.name} (${reminder.dose})\n` +
    `⏰ <b>Eslatish vaqti:</b> Har kuni ${reminder.time} da\n\n` +
    `<i>Vaqti kelganda bot sizni avtomatik ogohlantiradi!</i>`;

  return sendTelegramMessage(user.telegramChatId, text);
}

module.exports = {
  BOT_USERNAME,
  createTelegramLinkToken,
  sendTelegramMessage,
  handleTelegramUpdate,
  notifyDoctorCriticalSugar,
  notifyPatientReminder,
  notifyReminderCreated,
};
