const path = require('path');
const dns = require('dns');

// Fix for local DNS/SRV issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const helmet = require('helmet');
// Frontend dist path (only used if frontend is built locally)
// const distPath = path.join(__dirname, '../../frontend/dist');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

// Dynamic CORS — works for localhost, mobile devices (192.168.x.x), and Vercel
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'https://diabetmed.uz',
  'https://qandli-diabet.vercel.app',
  'https://smart-monitor-cbfm.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

const corsOriginFn = (origin, callback) => {
  // Allow requests with no origin (Postman, mobile apps, server-to-server)
  if (!origin) return callback(null, true);
  // Configured origins
  if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
  // Frontend deployments on Vercel
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return callback(null, true);
  // Local development: localhost and LAN devices (192.168.x.x, 10.x.x.x)
  if (/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)) return callback(null, true);
  return callback(null, false);
};

const io = new Server(server, {
  cors: {
    origin: corsOriginFn,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Global io instance setup optionally here. For now we expose it.
app.set('io', io);

// Socket autentifikatsiyasi: har bir ulanish JWT access token bilan bo'lishi shart.
// Foydalanuvchi ID si mijozdan emas, tokendan olinadi.
const { verifyAccessToken } = require('./utils/jwt');
const mongoose = require('mongoose');
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next(new Error('unauthorized'));
    const decoded = verifyAccessToken(token);
    await connectDB();
    const user = await User.findById(decoded.id).select('_id isActive isBanned');
    if (!user || !user.isActive || user.isBanned) return next(new Error('unauthorized'));
    socket.userId = user._id.toString();
    next();
  } catch (err) {
    next(new Error('unauthorized'));
  }
});

// Socket logic
io.on('connection', (socket) => {
  console.log('🔌 Yangi socket ulanishi:', socket.id);

  // Foydalanuvchi faqat o'z xonasiga qo'shiladi (ID tokendan olinadi)
  socket.join(socket.userId);
  socket.on('join-room', () => {
    socket.join(socket.userId);
  });

  // Chat xabari yuborish va bazaga saqlash
  socket.on('send-message', async (data) => {
    // data: { to, text } — yuboruvchi har doim socket.userId
    try {
      if (!data || !mongoose.isValidObjectId(data.to) || typeof data.text !== 'string' || !data.text.trim()) {
        return socket.emit('message-error', { error: 'Noto\'g\'ri xabar' });
      }
      const text = data.text.trim().slice(0, 5000);
      const ChatMessage = require('./models/ChatMessage');
      const getRoomId = (id1, id2) => [id1.toString(), id2.toString()].sort().join('_');
      const room = getRoomId(socket.userId, data.to);

      const message = await ChatMessage.create({
        room,
        sender: socket.userId,
        receiver: data.to,
        text,
      });

      const populated = await message.populate('sender', 'firstName lastName role avatar');

      // Qabul qiluvchiga yuborish
      io.to(String(data.to)).emit('new-message', { message: populated });
      // Yuboruvchiga ham echo
      socket.emit('message-sent', { message: populated });
    } catch (err) {
      console.error('Socket send-message error:', err);
      socket.emit('message-error', { error: 'Xabar yuborishda xato' });
    }
  });

  // Yozayapti indikatori
  socket.on('typing', (data) => {
    if (!data || !mongoose.isValidObjectId(data.to)) return;
    socket.to(String(data.to)).emit('user-typing', { isTyping: !!data.isTyping, userId: socket.userId });
  });

  // Xabarlarni o'qilgan deb belgilash (faqat o'ziga kelgan xabarlarni)
  socket.on('mark-read', async (data) => {
    try {
      if (!data || !mongoose.isValidObjectId(data.fromId)) return;
      const ChatMessage = require('./models/ChatMessage');
      const getRoomId = (id1, id2) => [id1.toString(), id2.toString()].sort().join('_');
      const room = getRoomId(socket.userId, data.fromId);
      await ChatMessage.updateMany(
        { room, receiver: socket.userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      io.to(String(data.fromId)).emit('messages-read', { by: socket.userId });
    } catch (err) {
      console.error('mark-read error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket uzildi:', socket.id);
  });
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Frontend alohida joylashtirilganligi sababli
}));
// Ochiq integratsiya API — har qanday manbadan, lekin cookie/credentials'siz
const openCors = cors({ origin: '*', credentials: false });
app.use('/api/v1/integration', openCors);
app.use('/integration', openCors);
app.use(cors({
  origin: corsOriginFn,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// Request Logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} (Origin: ${req.get('origin') || 'no-origin'})`);
  next();
});

// NOTE: Frontend static files not served here — frontend is deployed separately
// app.use(express.static(distPath));

// DB Connection Middleware for Serverless
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB Connection error:', err);
    res.status(500).json({ success: false, message: 'Database ulanishida xatolik' });
  }
});

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Juda ko\'p urinish. 15 daqiqadan keyin qayta urinib ko\'ring.' } });

app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// Routes - mounted both with and without /api prefix to support Vercel rewriting
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const bloodSugarRoutes = require('./routes/bloodSugar');
const aiRoutes = require('./routes/ai');
const doctorRoutes = require('./routes/doctor');

const reminderRoutes = require('./routes/reminders');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');
const integrationRoutes = require('./routes/integration');

app.use('/api/v1/integration', integrationRoutes);
app.use('/integration', integrationRoutes);

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);

app.use('/api/blood-sugar', bloodSugarRoutes);
app.use('/blood-sugar', bloodSugarRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

app.use('/api/doctor', doctorRoutes);
app.use('/doctor', doctorRoutes);

app.use('/api/reminders', reminderRoutes);
app.use('/reminders', reminderRoutes);

const cronRoutes = require('./routes/cron');
app.use('/api/cron', cronRoutes);
app.use('/cron', cronRoutes);

// Telegram Webhook route (Tezkor va 100% kafolatlangan xabar almashish)
const { handleTelegramUpdate } = require('./services/telegramService');
const telegramWebhookHandler = async (req, res) => {
  // Faqat Telegram'dan kelgan so'rovlar: setWebhook'da berilgan secret_token tekshiriladi
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const got = req.get('X-Telegram-Bot-Api-Secret-Token') || '';
  if (!expected || got.length !== expected.length ||
      !require('crypto').timingSafeEqual(Buffer.from(got), Buffer.from(expected))) {
    return res.sendStatus(401);
  }
  try {
    if (req.body) {
      await handleTelegramUpdate(req.body);
    }
  } catch (err) {
    console.error('Webhook error:', err);
  }
  res.sendStatus(200);
};
app.post('/api/telegram/webhook', telegramWebhookHandler);
app.post('/telegram/webhook', telegramWebhookHandler);

app.use('/api/chat', chatRoutes);
app.use('/chat', chatRoutes);

// Health check — v2.1 (createPatient endpoint included)
const healthCheck = (req, res) => res.json({ status: 'ok', version: '2.1', time: new Date() });
app.get('/api/health', healthCheck);
app.get('/health', healthCheck);


// Create super admin on startup
const createSuperAdmin = async () => {
  try {
    const adminEmail = process.env.SUPER_ADMIN_EMAIL;
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD;

    // Standart (taxmin qilinadigan) login/parol ishlatilmaydi
    if (!adminEmail || !adminPassword) {
      console.warn('⚠️ SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD o\'rnatilmagan — super admin yaratilmadi');
      return;
    }
    if (adminPassword.length < 12) {
      console.warn('⚠️ SUPER_ADMIN_PASSWORD kamida 12 belgidan iborat bo\'lishi kerak — super admin yaratilmadi');
      return;
    }

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = new User({
        email: adminEmail,
        password: adminPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'superadmin',
        isEmailVerified: true,
        isProfileComplete: true,
        authProvider: 'local',
      });
      await admin.save();
      console.log('✅ Yangi Super admin yaratildi:', adminEmail);
    } else {
      // Parol har ishga tushishda qayta yozilmaydi (admin panelda o'zgartirilgan parol saqlanadi).
      // Majburiy tiklash kerak bo'lsa: SUPER_ADMIN_RESET_PASSWORD=true
      let changed = false;
      if (admin.role !== 'superadmin') {
        admin.role = 'superadmin';
        changed = true;
      }
      if (process.env.SUPER_ADMIN_RESET_PASSWORD === 'true') {
        admin.password = adminPassword;
        changed = true;
        console.log('🔄 Super admin paroli env qiymatiga tiklandi:', adminEmail);
      }
      if (changed) await admin.save();
    }
  } catch (err) {
    console.error('Super admin yaratishda xato:', err.message);
  }
};

// Root route — API info
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DiabetMed API ishlayapti 🚀',
    version: '1.0.0',
    docs: '/api/health'
  });
});

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Endpoint topilmadi', url: req.originalUrl, path: req.path }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server xatosi' });
});

const PORT = process.env.PORT || 5000;

// Export for Vercel
const initialize = async () => {
  try {
    await connectDB();
    await createSuperAdmin();

    // Start Telegram Bot polling and Reminder Scheduler
    const { startPolling } = require('./services/telegramService');
    const { initReminderScheduler } = require('./services/reminderScheduler');
    startPolling().catch(e => console.error('Telegram polling error:', e));
    initReminderScheduler(io);
  } catch (err) {
    console.error('Initialization error:', err);
  }
};

if (!process.env.VERCEL) {
  server.listen(PORT, async () => {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.NODE_ENV === 'production' ? 'diabetmed.uz' : 'localhost';
    console.log(`🚀 Server ishlamoqda: ${protocol}://${host}:${PORT}`);
    await initialize();
  });
} else {
  // On Vercel, just run initialization
  initialize();
}

module.exports = app;
