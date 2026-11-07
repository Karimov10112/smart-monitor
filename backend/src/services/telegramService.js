const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { getAIResponse } = require('./aiService');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9274539353:AAENcYinulD1dnfFjLrRR19W3mracruSUdY';
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'diabetmed_uz_bot';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Sessiyalarni xotirada saqlash: chatId -> { step: 'awaiting_login' | 'awaiting_password', login: '' }
const userSessions = new Map();

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

    // 1. Agar foydalanuvchi allaqachon ulangan bo'lsa
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
          `🚪 <b>Hisobdan muvaffaqiyatli chiqildi!</b>\n\nQayta ulanish uchun /login buyrug'ini bosing.`
        );
        return;
      } else {
        await sendTelegramMessage(chatId, `Siz hali hisobga kirmagansiz. Kirish uchun /login bosing.`);
        return;
      }
    }

    // Buyruqlar: /start yoki /login
    if (text.startsWith('/start') || text === '/login' || text === '/kirish') {
      const parts = text.split(' ');
      const directUserId = parts[1]; // /start 66fa... (saytdan bosilganda)

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
              ? `👨‍⚕️ <b>Shifokor xizmati:</b> Biriktirilgan bemorlaringizda qand miqdori xavfli darajaga (o'ta yuqori yoki gipoglikemiya) yetsa, zudlik bilan sizga xabar yetkaziladi!\n\n`
              : `💊 <b>Bemor xizmati:</b> Dori va insulin eslatmalari o'z vaqtida shu yerga keladi!\n\n`) +
            `🤖 <b>AI Yordamchi:</b> Botga diabet, ovqatlanish va qand nazorati bo'yicha istalgan savolingizni yozishingiz mumkin!`;

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
            ? `🚨 Bemorlaringizning kritik qand ko'rsatkichlari shu yerga keladi.`
            : `⏰ Dori va insulin eslatmalari sizga yuborib turiladi.`) +
          `\n\n💡 Savolingiz bo'lsa bemalol yozing, sun'iy intellekt yordamchimiz javob beradi!\n\n` +
          `<i>Hisobdan chiqish uchun: /logout</i>`
        );
        return;
      }

      // Agar kirmagan bo'lsa — login so'raymiz
      userSessions.set(chatId, { step: 'awaiting_login' });
      await sendTelegramMessage(
        chatId,
        `👋 <b>Assalomu alaykum!</b>\n\n` +
        `Bu <b>Qand Nazorati (diabetmed.uz)</b> rasmiy yordamchi boti.\n\n` +
        `Profilingizni ulash uchun, iltimos, saytdagi <b>Loginingizni (Email)</b> kiriting:`
      );
      return;
    }

    // Login/Parol orqali kirish bosqichlari
    const session = userSessions.get(chatId);
    if (session && session.step === 'awaiting_login') {
      const emailInput = text.toLowerCase().trim();
      const userFound = await User.findOne({ email: emailInput });

      if (!userFound) {
        await sendTelegramMessage(
          chatId,
          `❌ <b>Bunday login (email) topilmadi!</b>\n\nIltimos, saytda ro'yxatdan o'tgan emailingizni qaytadan kiriting (bekor qilish: /cancel):`
        );
        return;
      }

      userSessions.set(chatId, { step: 'awaiting_password', userId: userFound._id.toString() });
      await sendTelegramMessage(
        chatId,
        `🔑 <b>Login qabul qilindi.</b>\n\nEndi saytdagi <b>parolingizni</b> kiriting:`
      );
      return;
    }

    if (session && session.step === 'awaiting_password') {
      const userToAuth = await User.findById(session.userId);
      if (!userToAuth) {
        userSessions.delete(chatId);
        await sendTelegramMessage(chatId, `Xatolik yuz berdi. Qaytadan /login bosing.`);
        return;
      }

      const isMatch = await bcrypt.compare(text, userToAuth.password);
      if (!isMatch) {
        await sendTelegramMessage(
          chatId,
          `❌ <b>Parol noto'g'ri!</b>\n\nIltimos, parolni qaytadan kiriting (bekor qilish: /cancel):`
        );
        return;
      }

      // Parol to'g'ri! Botni bog'laymiz
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
        `Sizning hisobingiz botga muvaffaqiyatli bog'landi.\n\n` +
        (userToAuth.role === 'doctor'
          ? `🩺 <b>Siz shifokor profilidasiz:</b>\nBiriktirilgan bemorlaringiz qand miqdori xavfli ko'rsatkichga tushsa yoki ko'tarilsa, Telegramga shoshilinch xabar yetib keladi!`
          : `💊 <b>Siz bemor profilidasiz:</b>\nDori va insulin qabul qilish vaqtlari eslatib turiladi!`) +
        `\n\n🤖 <b>AI Agent faol:</b> Qandli diabet, parhez va salomatlik bo'yicha xohlagan savolingizni yozishingiz mumkin!`
      );
      return;
    }

    if (text === '/cancel' || text === '/bekor') {
      userSessions.delete(chatId);
      await sendTelegramMessage(chatId, `Amal bekor qilindi. Qayta boshlash: /login`);
      return;
    }

    // 2. Agar foydalanuvchi tizimga ulangan bo'lsa va oddiy matn yozsa — AI Agent javob beradi!
    if (currentUser) {
      // Telegram xabarlarida "Yozmoqda..." holatini yoqish
      try {
        await fetch(`${TELEGRAM_API}/sendChatAction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
        });
      } catch (e) {}

      try {
        const aiReply = await getAIResponse({
          userId: currentUser._id,
          role: currentUser.role,
          message: text,
          language: 'uz',
          conversationHistory: [],
        });

        await sendTelegramMessage(chatId, `🤖 <b>AI Maslahatchi:</b>\n\n${aiReply}`);
      } catch (aiErr) {
        console.error('Telegram AI error:', aiErr);
        await sendTelegramMessage(
          chatId,
          `Kechirasiz, sun'iy intellekt xizmatida vaqtinchalik uzilish. Birozdan so'ng qayta urinib ko'ring.`
        );
      }
      return;
    }

    // Agar tizimga ulanmagan bo'lsa
    await sendTelegramMessage(
      chatId,
      `Siz hali tizimga kirmagansiz.\n\nHisobingizni ulash uchun <b>/login</b> buyrug'ini bosing.`
    );
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
 * Shifokorga shoshilinch kritik shakar xabarini yuborish (Baland yoki Past bo'lganda)
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
 * Bemorga eslatma yuborish (Dori, Insulin)
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
  handleTelegramUpdate,
  startPolling,
  notifyDoctorCriticalSugar,
  notifyPatientReminder,
};
