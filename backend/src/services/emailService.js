const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const OTP_HTML = (otp, lang) => {
  const titles = { uz: 'Tasdiqlash kodi', ru: 'Код подтверждения', en: 'Verification Code' };
  const subtitles = {
    uz: 'Tizimga kirish uchun quyidagi kodni kiriting:',
    ru: 'Введите следующий код для входа в систему:',
    en: 'Enter the following code to log into the system:',
  };
  const expires = {
    uz: 'Bu kod 10 daqiqa davomida amal qiladi.',
    ru: 'Код действителен 10 минут.',
    en: 'This code is valid for 10 minutes.',
  };
  const appName = { uz: 'Qand Nazorati', ru: 'Контроль Сахара', en: 'Sugar Control' };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 24px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">💙 ${appName[lang] || appName.uz}</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 16px;">
        <h2 style="color: #1e293b; margin-bottom: 16px;">${titles[lang] || titles.uz}</h2>
        <p style="color: #64748b;">${subtitles[lang] || subtitles.uz}</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${otp}</span>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">${expires[lang] || expires.uz}</p>
      </div>
    </div>
  `;
};

const SUBJECTS = {
  uz: 'Tasdiqlash kodi - Qand Nazorati',
  ru: 'Код подтверждения - Контроль Сахара',
  en: 'Verification Code - Sugar Control',
};

const sendOTPEmail = async (email, otp, language = 'uz') => {
  console.log('-----------------------------------------');
  console.log(`🔑 EMERGENCY OTP LOG [${email}]: ${otp}`);
  console.log('-----------------------------------------');

  // Use Resend if API key exists, otherwise fall back to Nodemailer
  if (process.env.RESEND_API_KEY) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Qand Nazorati <onboarding@resend.dev>',
        to: [email],
        subject: SUBJECTS[language] || SUBJECTS.uz,
        html: OTP_HTML(otp, language),
      });

      if (error) {
        console.error(`❌ Resend error for ${email}:`, error);
        throw new Error(error.message || 'Resend failed');
      }

      console.log(`✅ Email sent via Resend to ${email}. ID: ${data?.id}`);
      return;
    } catch (err) {
      console.error(`❌ Resend failed for ${email}:`, err.message);
      // Fall through to nodemailer
    }
  }

  // Fallback: Nodemailer (Gmail SMTP)
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT == 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const result = await transporter.sendMail({
    from: `"Qand Nazorati" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: SUBJECTS[language] || SUBJECTS.uz,
    html: OTP_HTML(otp, language),
  });
  console.log(`✅ Email sent via Nodemailer to ${email}. ID: ${result.messageId}`);
};

const sendPasswordResetEmail = async (email, resetToken, language = 'uz') => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const templates = {
    uz: { title: 'Parolni tiklash', text: "Parolingizni tiklash uchun quyidagi tugmani bosing:", button: "Parolni tiklash", expire: "Bu havola 2 soat davomida amal qiladi.", footer: "Agar tugma ishlamasa, ushbu havolani brauzerga nusxalang:" },
    ru: { title: 'Сброс пароля', text: 'Чтобы сбросить пароль, нажмите кнопку ниже:', button: 'Сбросить пароль', expire: 'Эта ссылка действительна в течение 2 часов.', footer: 'Если кнопка не работает, скопируйте эту ссылку в браузер:' },
    en: { title: 'Password Reset', text: 'To reset your password, click the button below:', button: 'Reset Password', expire: 'This link is valid for 2 hours.', footer: "If the button doesn't work, copy this link into your browser:" },
  };

  const t = templates[language] || templates.uz;
  const subjects = {
    uz: 'Parolni tiklash - Qand Nazorati',
    ru: 'Сброс пароля - Контроль Сахара',
    en: 'Password Reset - Sugar Control',
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 24px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0;">💙 Qand Nazorati</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 16px;">
        <h2 style="color: #1e293b;">${t.title}</h2>
        <p style="color: #64748b;">${t.text}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            ${t.button}
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">${t.expire}</p>
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
          <p style="color: #94a3b8; font-size: 12px;">${t.footer}</p>
          <p style="color: #2563eb; font-size: 11px; word-break: break-all;">${resetUrl}</p>
        </div>
      </div>
    </div>
  `;

  if (process.env.RESEND_API_KEY) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Qand Nazorati <onboarding@resend.dev>',
        to: [email],
        subject: subjects[language] || subjects.uz,
        html,
      });
      if (error) throw new Error(error.message || 'Resend failed');
      console.log(`✅ Reset email sent via Resend to ${email}. ID: ${data?.id}`);
      return;
    } catch (err) {
      console.error(`❌ Resend failed for reset email to ${email}:`, err.message);
    }
  }

  // Fallback nodemailer
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT == 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  const result = await transporter.sendMail({
    from: `"Qand Nazorati" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subjects[language] || subjects.uz,
    html,
  });
  console.log(`✅ Reset email sent via Nodemailer to ${email}. ID: ${result.messageId}`);
};

module.exports = { sendOTPEmail, sendPasswordResetEmail };
