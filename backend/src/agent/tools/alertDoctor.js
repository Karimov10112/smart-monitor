/**
 * Tool: alert_doctor
 *
 * XAVFSIZLIK ESLATMASI:
 * - Bu tool FAQAT token orqali tasdiqlangan userId uchun ishlatiladi
 * - Foydalanuvchi faqat o'zining shifokoriga xabar yuboradi (assignedDoctor)
 * - Kritik qand darajasi SERVER TOMONIDA tekshiriladi (modelga ishonilmaydi)
 * - Har bir ogohlantirish AuditLog'ga yoziladi
 *
 * Nima qiladi:
 * 1. Foydalanuvchining assignedDoctor'ini DB'dan oladi
 * 2. Socket.io orqali real-time xabar yuboradi (shifokor onlayinsa)
 * 3. AuditLog'ga yozadi
 * 4. Kelajakda: email / push notification qo'shilishi mumkin
 */

const User = require('../../models/User');
const AuditLog = require('../../models/AuditLog');

const CRITICAL_HIGH = 14; // mmol/l — strict server-side threshold
const CRITICAL_LOW  = 3.0;

/**
 * @param {string} userId - req.user._id (JWT verified)
 * @param {object} args   - { sugar_level: number, message: string }
 * @param {object} io     - socket.io instance (app.get('io'))
 * @param {string} lang   - 'uz' | 'ru' | 'en'
 */
module.exports = async function alertDoctor(userId, args, io, lang) {
  lang = lang || 'uz';
  const sugarLevel = parseFloat(args.sugar_level);

  // ── 1. Server-side critical threshold check ──────────────────────────────
  if (isNaN(sugarLevel) || sugarLevel <= 0) {
    return {
      sent: false,
      reason: lang === 'ru' ? 'Неверный уровень сахара.' : lang === 'en' ? 'Invalid sugar level.' : 'Noto\'g\'ri qand darajasi.',
    };
  }

  if (sugarLevel < CRITICAL_HIGH && sugarLevel > CRITICAL_LOW) {
    return {
      sent: false,
      reason: lang === 'ru'
        ? `Уровень ${sugarLevel} не является критическим. Оповещение не отправлено.`
        : lang === 'en'
        ? `Level ${sugarLevel} is not critical. Alert not sent.`
        : `${sugarLevel} mmol/l kritik emas. Shifokorga ogohlantirish yuborilmadi.`,
    };
  }

  // ── 2. Get user and their assigned doctor ────────────────────────────────
  const patient = await User.findById(userId)
    .select('firstName lastName assignedDoctor diabetesType')
    .lean();

  if (!patient) {
    return { sent: false, reason: 'Foydalanuvchi topilmadi.' };
  }

  if (!patient.assignedDoctor) {
    const noDocMsg = {
      uz: 'Sizga shifokor biriktirilmagan. Ogohlantirish yuborilmadi. Yaqin tibbiyot muassasasiga murojaat qiling.',
      ru: 'У вас нет прикреплённого врача. Обратитесь в ближайшее медучреждение.',
      en: 'You have no assigned doctor. Please contact the nearest medical facility.',
    };
    return { sent: false, reason: noDocMsg[lang] || noDocMsg.uz };
  }

  const alertType = sugarLevel >= CRITICAL_HIGH ? 'CRITICAL_HIGH' : 'CRITICAL_LOW';
  const patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Noma\'lum bemor';

  const alertMessages = {
    uz: `🚨 KRITIK OGOHLANTIRISH!\nBemor: ${patientName}\nQand darajasi: ${sugarLevel} mmol/l (${alertType === 'CRITICAL_HIGH' ? 'JUDA YUQORI' : 'JUDA PAST'})\nZudlik bilan murojaat talab etiladi!`,
    ru: `🚨 КРИТИЧЕСКОЕ ОПОВЕЩЕНИЕ!\nПациент: ${patientName}\nСахар крови: ${sugarLevel} ммоль/л (${alertType === 'CRITICAL_HIGH' ? 'КРИТИЧЕСКИ ВЫСОКИЙ' : 'КРИТИЧЕСКИ НИЗКИЙ'})\nТребуется срочное вмешательство!`,
    en: `🚨 CRITICAL ALERT!\nPatient: ${patientName}\nBlood sugar: ${sugarLevel} mmol/l (${alertType === 'CRITICAL_HIGH' ? 'CRITICALLY HIGH' : 'CRITICALLY LOW'})\nImmediate attention required!`,
  };

  const alertText = alertMessages[lang] || alertMessages.uz;

  // ── 3. Socket.io real-time notification to doctor ────────────────────────
  let socketSent = false;
  if (io) {
    try {
      io.to(patient.assignedDoctor.toString()).emit('doctor-alert', {
        type: alertType,
        patientId: userId,
        patientName,
        sugarLevel,
        message: alertText,
        timestamp: new Date().toISOString(),
      });
      socketSent = true;
      console.log(`🚨 Doctor alert socket sent to room: ${patient.assignedDoctor}`);
    } catch (socketErr) {
      console.error('Socket alert error:', socketErr.message);
    }
  }

  // ── 4. AuditLog — every alert is recorded ────────────────────────────────
  try {
    await AuditLog.create({
      user: userId,
      action: 'AGENT_DOCTOR_ALERT',
      details: {
        sugarLevel,
        alertType,
        doctorId: patient.assignedDoctor,
        socketSent,
        language: lang,
      },
    });
  } catch (logErr) {
    console.error('AuditLog error (non-critical):', logErr.message);
  }

  const successMsg = {
    uz: `Shifokorga ogohlantirish yuborildi. Qand darajasi: ${sugarLevel} mmol/l. Iltimos, tez yordam chaqiring!`,
    ru: `Оповещение отправлено врачу. Сахар: ${sugarLevel} ммоль/л. Пожалуйста, вызовите скорую помощь!`,
    en: `Doctor alert sent. Sugar: ${sugarLevel} mmol/l. Please call emergency services!`,
  };

  return {
    sent: true,
    socket_delivered: socketSent,
    message: successMsg[lang] || successMsg.uz,
    alert_type: alertType,
    timestamp: new Date().toISOString(),
  };
};
