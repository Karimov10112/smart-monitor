require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log('Sending test email to:', process.env.EMAIL_USER);

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: 'Test Email',
  text: 'This is a test email to verify SMTP settings.'
})
.then(info => {
  console.log('✅ Success! Email sent.');
  console.log('Message ID:', info.messageId);
})
.catch(err => {
  console.error('❌ Error sending email:');
  console.error(err);
});
