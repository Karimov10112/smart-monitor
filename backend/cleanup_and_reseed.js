const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./src/models/Product');
const seedProducts = require('./src/utils/seeder');

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for cleanup...');

    // Delete ALL products
    await Product.deleteMany({});
    console.log('🗑️ All products deleted.');

    // Seed again with the new idempotent seeder logic (which we just updated)
    await seedProducts();
    
    console.log('✨ Cleanup and reseed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup error:', err);
    process.exit(1);
  }
};

cleanup();
