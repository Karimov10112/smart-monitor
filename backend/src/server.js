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
const passport = require('./config/passport');
const connectDB = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const seedProducts = require('./utils/seeder');

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
  // Always allow any vercel.app subdomain (frontend deployments)
  if (origin.endsWith('.vercel.app') || origin === 'https://diabetmed.uz') return callback(null, true);
  // Allow configured origins
  if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
  // Allow localhost in development
  if (origin.startsWith('http://localhost') || origin.startsWith('http://192.168.')) return callback(null, true);
  callback(new Error('Not allowed by CORS'));
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

// Socket logic
io.on('connection', (socket) => {
  console.log('🔌 Yangi socket ulanishi:', socket.id);

  // Foydalanuvchi o'z xonasiga qo'shiladi (userId bo'yicha)
  socket.on('join-room', (userId) => {
    socket.join(userId);
    console.log(`🏠 Foydalanuvchi xonaga qo'shildi: ${userId}`);
  });

  // Chat xabari yuborish va bazaga saqlash
  socket.on('send-message', async (data) => {
    // data: { to, text, senderId, senderName }
    try {
      const ChatMessage = require('./models/ChatMessage');
      const getRoomId = (id1, id2) => [id1.toString(), id2.toString()].sort().join('_');
      const room = getRoomId(data.senderId, data.to);

      const message = await ChatMessage.create({
        room,
        sender: data.senderId,
        receiver: data.to,
        text: data.text,
      });

      const populated = await message.populate('sender', 'firstName lastName role avatar');

      // Qabul qiluvchiga yuborish
      io.to(data.to).emit('new-message', { message: populated });
      // Yuboruvchiga ham echo
      socket.emit('message-sent', { message: populated });
    } catch (err) {
      console.error('Socket send-message error:', err);
      socket.emit('message-error', { error: 'Xabar yuborishda xato' });
    }
  });

  // Yozayapti indikatori
  socket.on('typing', (data) => {
    socket.to(data.to).emit('user-typing', { isTyping: data.isTyping, userId: data.userId });
  });

  // Xabarlarni o'qilgan deb belgilash
  socket.on('mark-read', async (data) => {
    try {
      const ChatMessage = require('./models/ChatMessage');
      const getRoomId = (id1, id2) => [id1.toString(), id2.toString()].sort().join('_');
      const room = getRoomId(data.userId, data.fromId);
      await ChatMessage.updateMany(
        { room, receiver: data.userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      io.to(data.fromId).emit('messages-read', { by: data.userId });
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
app.use(cors({
  origin: corsOriginFn,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

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
    res.status(500).json({ success: false, message: 'Database ulanishida xatolik', dbgObj: err.toString() });
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

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/blood-sugar', bloodSugarRoutes);
app.use('/blood-sugar', bloodSugarRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

app.use('/api/doctor', doctorRoutes);
app.use('/doctor', doctorRoutes);



app.use('/api/reminders', reminderRoutes);
app.use('/reminders', reminderRoutes);

app.use('/api/chat', chatRoutes);
app.use('/chat', chatRoutes);

// Health check — v2.1 (createPatient endpoint included)
const healthCheck = (req, res) => res.json({ status: 'ok', version: '2.1', time: new Date() });
app.get('/api/health', healthCheck);
app.get('/health', healthCheck);


// Create super admin on startup
const createSuperAdmin = async () => {
  try {
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin';
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123';

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
      // Faqat parol va rolni yangilaymiz, kontakt ma'lumotlarini SAQLAYMIZ
      admin.password = adminPassword;
      admin.role = 'superadmin';
      // phone va telegramUsername ni O'ZGARTIRMAYMIZ — ular saqlanib qolsin
      await admin.save();
      console.log('🔄 Super admin yangilandi (kontaktlar saqlanib qoldi):', adminEmail);
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
  res.status(500).json({ success: false, message: 'Server xatosi', errorDetails: err.message });
});

const PORT = process.env.PORT || 5000;

// Export for Vercel
const initialize = async () => {
  try {
    await connectDB();
    await createSuperAdmin();
    await seedProducts();
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
