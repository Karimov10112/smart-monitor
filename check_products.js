const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const Product = require('../backend/src/models/Product');

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Product.countDocuments();
    const samples = await Product.find().limit(5);
    console.log(`Total Products: ${count}`);
    console.log('Sample Products:', JSON.stringify(samples, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkProducts();
