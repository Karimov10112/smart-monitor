const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./src/models/Product');
const seedProducts = require('./src/utils/seeder');

dotenv.config({ path: path.join(__dirname, '.env') });

const run = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('Cleaning up Products collection...');
        await Product.deleteMany({});
        console.log('✅ Base cleaned!');

        console.log('Seeding real products...');
        // We'll call the seeder function directly
        // Note: our seeder.js now exports the function and has the new real list
        const results = await seedProducts();

        // Wait a bit for the seeder to finish its work if it's async
        // In our case it is.
        console.log('✅ 100+ Real products seeded!');

        process.exit(0);
    } catch (err) {
        console.error('Error during cleanup/seed:', err);
        process.exit(1);
    }
};

run();
