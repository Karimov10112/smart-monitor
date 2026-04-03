require('dotenv').config();
const express = require('express');
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
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

const corsOriginFn = (origin, callback) => {
  // Allow requests with no origin (Postman, mobile apps, server-to-server)
  if (!origin) return callback(null, true);
  // In development allow any origin (local network, mobile)
  if (process.env.NODE_ENV !== 'production') return callback(null, true);
  // In production only allow configured origins
  if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
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

  socket.on('join-room', (userId) => {
    socket.join(userId);
    console.log(`🏠 Foydalanuvchi xonaga qo'shildi: ${userId}`);
  });

  socket.on('send-message', (data) => {
    // data: { toUserProfileId, text, sender }
    io.to(data.to).emit('new-message', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.to).emit('user-typing', { isTyping: data.isTyping });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket uzildi:', socket.id);
  });
});

// Middleware
app.use(cors({
  origin: corsOriginFn,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

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

// Rate limiting (Test uchun o'chirildi)
// const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
// const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Juda ko\'p urinish. 15 daqiqadan keyin qayta urinib ko\'ring.' } });

// app.use('/api', limiter);
// app.use('/api/auth', authLimiter);

// Routes - mounted both with and without /api prefix to support Vercel rewriting
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const bloodSugarRoutes = require('./routes/bloodSugar');
const aiRoutes = require('./routes/ai');
const doctorRoutes = require('./routes/doctor');
const productRoutes = require('./routes/product');
const reminderRoutes = require('./routes/reminders');

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

app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

app.use('/api/reminders', reminderRoutes);
app.use('/reminders', reminderRoutes);

// Health check
const healthCheck = (req, res) => res.json({ status: 'ok', time: new Date() });
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

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Endpoint topilmadi', url: req.originalUrl, path: req.path }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server xatosi', errorDetails: err.message });
});

const PORT = process.env.PORT || 5000;

// Export for Vercel
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  server.listen(PORT, async () => {
    console.log(`🚀 Server ishlamoqda: http://localhost:${PORT}`);
    try {
      await connectDB();
      await createSuperAdmin();
      await seedProducts();
    } catch (err) {
      console.error('Startup initialization error:', err);
    }
  });
} else {
  // On Vercel, we still need to run these once if possible, 
  // but serverless functions are stateless. 
  const initialize = async () => {
    try {
      await connectDB();
      await createSuperAdmin();
      await seedProducts();
    } catch (err) {
      console.error('Vercel initialization error:', err);
    }
  };
  initialize();
}

module.exports = app;
