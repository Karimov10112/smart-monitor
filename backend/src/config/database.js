const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Agar .env dan o'qiy olmasa, vaqtincha to'g'ridan-to'g'ri yozib ko'ramiz
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/diabetes_db';
    
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB ulandi: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB ulanishda xato: ${error.message}`);
    console.log('⚠️ Server bazasiz ishlashni davom ettiradi (ba\'zi funksiyalar ishlamasligi mumkin).');
  }
};

module.exports = connectDB;