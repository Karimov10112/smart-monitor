const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Product = require('../models/Product');

async function syncProductsFromFrontend() {
  try {
    console.log('🔄 Baza ulanmoqda...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://user:pass@cluster0.b9xoxyl.mongodb.net/diabetes?retryWrites=true&w=majority', {
    });

    console.log('✅ Baza ulandi. Frontend fayli oqilmoqda...');
    const frontendPath = 'c:/Users/Asus/Desktop/diabetes_project/diabetes_project/frontend/src/app/data/products.ts';
    let tsContent = fs.readFileSync(frontendPath, 'utf8');

    const startIndex = tsContent.indexOf('export const products: Product[] = [');
    const actualArrayStart = tsContent.indexOf('[', startIndex);

    const nextExportIndex = tsContent.indexOf('export const categories');
    let endOfArray = tsContent.lastIndexOf(']', nextExportIndex);

    if (actualArrayStart === -1 || endOfArray === -1) {
      throw new Error('Fayl ichidagi massiv (array) chegaralari topilmadi.');
    }

    const arrayString = tsContent.substring(actualArrayStart, endOfArray + 1);
    const originalProducts = eval('(' + arrayString + ')');

    const formattedProducts = originalProducts.map(p => ({
      name: p.name,
      category: p.category,
      emoji: p.emoji,
      gi: p.gi,
      gl: p.gl,
      advice: p.advice,
      isActive: true
    }));

    await Product.deleteMany({});
    await Product.insertMany(formattedProducts);

    console.log(`🎉 Muvaffaqiyatli! Jami ${formattedProducts.length} ta mahsulot bazaga kiritildi.`);
    process.exit(0);
  } catch (err) {
    console.error('Sinxronizatsiya xatosi:', err);
    process.exit(1);
  }
}

syncProductsFromFrontend();
