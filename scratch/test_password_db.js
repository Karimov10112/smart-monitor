const mongoose = require('mongoose');
const User = require('./backend/src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

async function testPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const email = 'karimovazamatjon231@gmail.com';
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`❌ User NOT found: ${email}`);
      process.exit(1);
    }

    console.log(`👤 User found: ${user.email}`);
    console.log(`🔑 Hashed password in DB: ${user.password}`);

    const testPass = '123456';
    const isMatch = await bcrypt.compare(testPass, user.password);

    console.log('-----------------------------------------');
    if (isMatch) {
      console.log(`✅ SUCCESS: Password "${testPass}" matches!`);
    } else {
      console.log(`❌ FAIL: Password "${testPass}" does NOT match!`);
      
      // Check if it's stored as plain text by mistake
      if (user.password === testPass) {
        console.log('⚠️ WARNING: Password is stored as PLAIN TEXT in DB. This is why login fails!');
      }
    }
    console.log('-----------------------------------------');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testPassword();
