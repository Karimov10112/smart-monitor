const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendOTPEmail = async (email, otp, language = 'uz') => {
  const transporter = createTransporter();

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
          <p style="color: #94a3b8; font-size: 14px;">Bu kod 10 daqiqa davomida amal qiladi. Agar siz so'ramagan bo'lsangiz, e'tibor bermang.</p>
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
          <p style="color: #94a3b8; font-size: 14px;">Код действителен 10 минут. Если вы не запрашивали, проигнорируйте это письмо.</p>
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
          <p style="color: #94a3b8; font-size: 14px;">This code is valid for 10 minutes. If you didn't request this, please ignore.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail({
    from: `"Qand Nazorati" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: subjects[language] || subjects.uz,
    html: bodies[language] || bodies.uz,
  });
};

const sendPasswordResetEmail = async (email, resetToken, language = 'uz') => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"Qand Nazorati" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: language === 'uz' ? 'Parolni tiklash' : language === 'ru' ? 'Сброс пароля' : 'Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 24px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0;">💙 Qand Nazorati</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 16px;">
          <h2 style="color: #1e293b;">Parolni tiklash</h2>
          <p style="color: #64748b;">Parolingizni tiklash uchun quyidagi tugmani bosing:</p>
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0; font-weight: bold;">
            Parolni tiklash
          </a>
          <p style="color: #94a3b8; font-size: 14px;">Bu havola 1 soat davomida amal qiladi.</p>
          <p style="color: #94a3b8; font-size: 12px;">Agar tugma ishlamasa, ushbu havolani brauzerga nusxalang: ${resetUrl}</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail, sendPasswordResetEmail };
