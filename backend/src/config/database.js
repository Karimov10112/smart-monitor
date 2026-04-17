const mongoose = require('mongoose');
const dns = require('dns');

// Force usage of Google Public DNS to bypass local SRV resolution issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/diabetes_db';
    
    cached.promise = mongoose.connect(connStr, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }).then((mongoose) => {
      console.log(`✅ MongoDB ulandi: ${mongoose.connection.host}`);
      return mongoose;
    }).catch(error => {
      console.error(`❌ MongoDB ulanishda xato:`, error);
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};

module.exports = connectDB;