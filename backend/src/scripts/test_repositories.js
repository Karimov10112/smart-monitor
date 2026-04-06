const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const userRepository = require('../repositories/UserRepository');
const bloodSugarRepository = require('../repositories/BloodSugarRepository');
const productRepository = require('../repositories/ProductRepository');
const reminderRepository = require('../repositories/ReminderRepository');

async function test() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/diabetes_db');
    console.log('Connected!');

    console.log('--- Testing Repositories ---');

    const userCount = await userRepository.countDocuments();
    console.log(`UserRepository: Found ${userCount} users.`);

    const recordCount = await bloodSugarRepository.countDocuments();
    console.log(`BloodSugarRepository: Found ${recordCount} records.`);

    const productCount = await productRepository.countDocuments();
    console.log(`ProductRepository: Found ${productCount} products.`);

    const reminderCount = await reminderRepository.countDocuments();
    console.log(`ReminderRepository: Found ${reminderCount} reminders.`);

    console.log('--- Repository Methods Test ---');
    const admin = await userRepository.findOne({ role: 'superadmin' });
    console.log('Admin found:', admin ? 'Yes' : 'No');

    console.log('SUCCESS: All repositories loaded and performed basic queries.');
    process.exit(0);
  } catch (err) {
    console.error('ERROR during repository test:', err);
    process.exit(1);
  }
}

test();
