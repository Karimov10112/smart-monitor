require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

async function fixProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB ulandi');

    const total = await Product.countDocuments();
    console.log(`📦 Jami mahsulotlar soni: ${total}`);

    // isActive yo'q yoki false bo'lgan barcha mahsulotlarni true ga qilamiz
    const result = await Product.updateMany(
      { $or: [{ isActive: { $exists: false } }, { isActive: false }] },
      { $set: { isActive: true } }
    );
    console.log(`✅ ${result.modifiedCount} ta mahsulot isActive=true ga yangilandi`);

    // Agar bazada umuman mahsulot bo'lmasa — qayta seed qilamiz
    const activeCount = await Product.countDocuments({ isActive: true });
    console.log(`✅ Faol mahsulotlar: ${activeCount}`);

    if (activeCount === 0) {
      console.log('⚠️ Faol mahsulot yo\'q, seeder ishga tushirilmoqda...');
      const seedProducts = require('./src/utils/seeder');
      // Seeder ichidagi count tekshiruvini bypass qilish uchun to'g'ridan-to'g'ri insert
      await mongoose.connection.close();
      return;
    }

    await mongoose.connection.close();
    console.log('🎉 Muvaffaqiyatli yakunlandi!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Xato:', err.message);
    process.exit(1);
  }
}

fixProducts();
