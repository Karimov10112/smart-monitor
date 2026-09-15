const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('⚠️ Warning: EMAIL_USER or EMAIL_PASS is not configured. Emails will not be sent.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // TLS
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  return transporter;
};

const sendOTPEmail = async (email, otp, language = 'uz') => {
  const subjects = {
    uz: 'Tasdiqlash kodi - Qand Nazorati',
    ru: 'Код подтверждения - Контроль Сахара',
    en: 'Verification Code - Sugar Control',
  };

  const bodies = {
    uz: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 24px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">💙 Qand Nazorati</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 16px;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Tasdiqlash kodi</h2>
          <p style="color: #64748b;">Tizimga kirish uchun quyidagi kodni kiriting:</p>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">Bu kod 10 daqiqa davomida amal qiladi.</p>
        </div>
      </div>
    `,
    ru: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 24px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">💙 Контроль Сахара</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 16px;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Код подтверждения</h2>
          <p style="color: #64748b;">Введите следующий код для входа в систему:</p>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">Код действителен 10 минут.</p>
        </div>
      </div>
    `,
    en: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 24px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">💙 Sugar Control</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 16px;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Verification Code</h2>
          <p style="color: #64748b;">Enter the following code to log into the system:</p>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">This code is valid for 10 minutes.</p>
        </div>
      </div>
    `,
  };

  // Always log OTP for emergency access / debugging
  console.log('-----------------------------------------');
  console.log(`🔑 OTP LOG [${email}]: ${otp}`);
  console.log('-----------------------------------------');

  const mail = getTransporter();
  if (!mail) return; // no transporter configured, OTP already logged above

  try {
    const info = await mail.sendMail({
      from: `"Qand Nazorati" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subjects[language] || subjects.uz,
      html: bodies[language] || bodies.uz,
    });
    console.log(`✅ OTP email sent to ${email}. MessageId: ${info.messageId}`);
  } catch (err) {
    console.error(`❌ Failed to send OTP email to ${email}:`, err.message);
    // Don't rethrow — OTP is already logged, login flow should not break
  }
};

const sendPasswordResetEmail = async (email, resetToken, language = 'uz') => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subjects = {
    uz: 'Parolni tiklash - Qand Nazorati',
    ru: 'Сброс пароля - Контроль Сахара',
    en: 'Password Reset - Sugar Control',
  };

  const templates = {
    uz: {
      title: 'Parolni tiklash',
      text: 'Parolingizni tiklash uchun quyidagi tugmani bosing:',
      button: 'Parolni tiklash',
      expire: 'Bu havola 2 soat davomida amal qiladi.',
      footer: 'Agar tugma ishlamasa, ushbu havolani brauzerga nusxalang:'
    },
    ru: {
      title: 'Сброс пароля',
      text: 'Чтобы сбросить пароль, нажмите кнопку ниже:',
      button: 'Сбросить пароль',
      expire: 'Эта ссылка действительна в течение 2 часов.',
      footer: 'Если кнопка не работает, скопируйте эту ссылку в браузер:'
    },
    en: {
      title: 'Password Reset',
      text: 'To reset your password, click the button below:',
      button: 'Reset Password',
      expire: 'This link is valid for 2 hours.',
      footer: "If the button doesn't work, copy this link into your browser:"
    }
  };

  const t = templates[language] || templates.uz;

  const mail = getTransporter();
  if (!mail) {
    console.warn(`⚠️ Cannot send reset email to ${email}: transporter not configured.`);
    return;
  }

  try {
    await mail.sendMail({
      from: `"Qand Nazorati" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subjects[language] || subjects.uz,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
          <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 24px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0;">💙 Qand Nazorati</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 16px;">
            <h2 style="color: #1e293b;">${t.title}</h2>
            <p style="color: #64748b;">${t.text}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
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
      `,
    });
    console.log(`✅ Reset email sent to ${email}`);
  } catch (err) {
    console.error(`❌ Failed to send reset email to ${email}:`, err.message);
    throw err;
  }
};

module.exports = { sendOTPEmail, sendPasswordResetEmail };
