require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

// Har bir mahsulot uchun to'liq nutritional ma'lumotlar (100g uchun)
const nutritionData = {
  // MEVALAR
  'Apple':        { carbs: 14, sugar: 10, fiber: 2.4, protein: 0.3, fats: 0.2 },
  'Pear':         { carbs: 15, sugar: 10, fiber: 3.1, protein: 0.4, fats: 0.1 },
  'Peach':        { carbs: 10, sugar: 8,  fiber: 1.5, protein: 0.9, fats: 0.3 },
  'Apricot':      { carbs: 11, sugar: 9,  fiber: 2.0, protein: 1.4, fats: 0.4 },
  'Cherry':       { carbs: 12, sugar: 8,  fiber: 1.6, protein: 1.0, fats: 0.3 },
  'Strawberry':   { carbs: 8,  sugar: 5,  fiber: 2.0, protein: 0.7, fats: 0.3 },
  'Raspberry':    { carbs: 12, sugar: 4,  fiber: 6.5, protein: 1.2, fats: 0.7 },
  'Kiwi':         { carbs: 15, sugar: 9,  fiber: 3.0, protein: 1.1, fats: 0.5 },
  'Pineapple':    { carbs: 13, sugar: 10, fiber: 1.4, protein: 0.5, fats: 0.1 },
  'Grapefruit':   { carbs: 11, sugar: 7,  fiber: 1.6, protein: 0.8, fats: 0.1 },
  'Lemon':        { carbs: 9,  sugar: 2,  fiber: 2.8, protein: 1.1, fats: 0.3 },
  'Orange':       { carbs: 12, sugar: 9,  fiber: 2.4, protein: 0.9, fats: 0.1 },
  'Banana':       { carbs: 23, sugar: 12, fiber: 2.6, protein: 1.1, fats: 0.3 },
  'Grapes':       { carbs: 18, sugar: 16, fiber: 0.9, protein: 0.7, fats: 0.2 },
  'Fig':          { carbs: 19, sugar: 16, fiber: 2.9, protein: 0.8, fats: 0.3 },
  'Persimmon':    { carbs: 19, sugar: 13, fiber: 3.6, protein: 0.6, fats: 0.2 },
  'Watermelon':   { carbs: 8,  sugar: 6,  fiber: 0.4, protein: 0.6, fats: 0.2 },
  'Melon':        { carbs: 9,  sugar: 8,  fiber: 0.9, protein: 0.8, fats: 0.2 },
  'Pomegranate':  { carbs: 19, sugar: 14, fiber: 4.0, protein: 1.7, fats: 1.2 },
  'Quince':       { carbs: 15, sugar: 9,  fiber: 1.9, protein: 0.4, fats: 0.1 },
  'Mango':        { carbs: 15, sugar: 14, fiber: 1.6, protein: 0.8, fats: 0.4 },
  'Plum':         { carbs: 11, sugar: 10, fiber: 1.4, protein: 0.7, fats: 0.3 },
  'Blueberry':    { carbs: 14, sugar: 10, fiber: 2.4, protein: 0.7, fats: 0.3 },
  // SABZAVOTLAR
  'Cucumber':     { carbs: 3.6,sugar: 1.7,fiber: 0.5, protein: 0.7, fats: 0.1 },
  'Tomato':       { carbs: 3.9,sugar: 2.6,fiber: 1.2, protein: 0.9, fats: 0.2 },
  'Broccoli':     { carbs: 7,  sugar: 1.7,fiber: 2.6, protein: 2.8, fats: 0.4 },
  'Spinach':      { carbs: 3.6,sugar: 0.4,fiber: 2.2, protein: 2.9, fats: 0.4 },
  'Carrot':       { carbs: 10, sugar: 4.7,fiber: 2.8, protein: 0.9, fats: 0.2 },
  'Eggplant':     { carbs: 5.9,sugar: 3.5,fiber: 3.0, protein: 1.0, fats: 0.2 },
  'Zucchini':     { carbs: 3.1,sugar: 2.5,fiber: 1.0, protein: 1.2, fats: 0.3 },
  'Cauliflower':  { carbs: 5,  sugar: 1.9,fiber: 2.0, protein: 1.9, fats: 0.3 },
  'Cabbage':      { carbs: 5.8,sugar: 3.2,fiber: 2.5, protein: 1.3, fats: 0.1 },
  'Beetroot':     { carbs: 10, sugar: 7,  fiber: 2.8, protein: 1.6, fats: 0.2 },
  'Onion':        { carbs: 9,  sugar: 4.2,fiber: 1.7, protein: 1.1, fats: 0.1 },
  'Garlic':       { carbs: 33, sugar: 1,  fiber: 2.1, protein: 6.4, fats: 0.5 },
  'Bell Pepper':  { carbs: 6,  sugar: 4.2,fiber: 2.1, protein: 1.0, fats: 0.3 },
  'Pumpkin':      { carbs: 7,  sugar: 2.8,fiber: 0.5, protein: 1.0, fats: 0.1 },
  'Corn':         { carbs: 19, sugar: 3.2,fiber: 2.7, protein: 3.3, fats: 1.4 },
  'Lettuce':      { carbs: 2.9,sugar: 1.2,fiber: 1.3, protein: 1.4, fats: 0.2 },
  'Celery':       { carbs: 3,  sugar: 1.8,fiber: 1.6, protein: 0.7, fats: 0.2 },
  'Ginger':       { carbs: 18, sugar: 1.7,fiber: 2.0, protein: 1.8, fats: 0.8 },
  'Asparagus':    { carbs: 3.9,sugar: 1.9,fiber: 2.1, protein: 2.2, fats: 0.1 },
  // OQSILLAR
  'Chicken Meat': { carbs: 0,  sugar: 0,  fiber: 0,   protein: 31,  fats: 3.6 },
  'Fish (Carp)':  { carbs: 0,  sugar: 0,  fiber: 0,   protein: 18,  fats: 5.3 },
  'Egg':          { carbs: 1.1,sugar: 0.6,fiber: 0,   protein: 13,  fats: 11  },
  'Beef':         { carbs: 0,  sugar: 0,  fiber: 0,   protein: 26,  fats: 17  },
  'Turkey':       { carbs: 0,  sugar: 0,  fiber: 0,   protein: 29,  fats: 7.4 },
  'Salmon':       { carbs: 0,  sugar: 0,  fiber: 0,   protein: 20,  fats: 13  },
  'Tuna':         { carbs: 0,  sugar: 0,  fiber: 0,   protein: 30,  fats: 1.0 },
  'Shrimp':       { carbs: 0.9,sugar: 0,  fiber: 0,   protein: 20,  fats: 1.4 },
  'Lamb':         { carbs: 0,  sugar: 0,  fiber: 0,   protein: 25,  fats: 21  },
  // DONLAR
  'Buckwheat':    { carbs: 72, sugar: 0,  fiber: 10,  protein: 13,  fats: 3.4 },
  'Oats':         { carbs: 66, sugar: 0,  fiber: 11,  protein: 17,  fats: 7.0 },
  'Lentils':      { carbs: 20, sugar: 1.8,fiber: 7.9, protein: 9.0, fats: 0.4 },
  'Chickpeas':    { carbs: 27, sugar: 5,  fiber: 8.0, protein: 9.0, fats: 2.6 },
  'Quinoa':       { carbs: 21, sugar: 0.9,fiber: 2.8, protein: 4.4, fats: 1.9 },
  'Rye':          { carbs: 76, sugar: 1,  fiber: 15,  protein: 8.0, fats: 1.6 },
  'Barley':       { carbs: 78, sugar: 0.8,fiber: 17,  protein: 9.9, fats: 1.2 },
  'Bulgur':       { carbs: 76, sugar: 0.4,fiber: 18,  protein: 12,  fats: 1.3 },
  'Mung Bean':    { carbs: 63, sugar: 0,  fiber: 16,  protein: 24,  fats: 1.1 },
  'Common Bean':  { carbs: 61, sugar: 2,  fiber: 16,  protein: 21,  fats: 1.5 },
  // YONG'OQLAR
  'Almond':       { carbs: 22, sugar: 4,  fiber: 13,  protein: 21,  fats: 50  },
  'Walnut':       { carbs: 14, sugar: 2.6,fiber: 7,   protein: 15,  fats: 65  },
  'Pistachios':   { carbs: 28, sugar: 8,  fiber: 10,  protein: 20,  fats: 45  },
  'Hazelnut':     { carbs: 17, sugar: 4.3,fiber: 10,  protein: 15,  fats: 61  },
  'Cashew':       { carbs: 30, sugar: 6,  fiber: 3.3, protein: 18,  fats: 44  },
  'Peanut':       { carbs: 16, sugar: 4,  fiber: 8.5, protein: 26,  fats: 49  },
  // SUT MAHSULOTLARI
  'Kefir':        { carbs: 4.7,sugar: 4.7,fiber: 0,   protein: 3.4, fats: 1.0 },
  'Cottage Cheese':{ carbs: 3.4,sugar: 2.7,fiber: 0,  protein: 11,  fats: 4.3 },
  'Ryazhenka':    { carbs: 4.2,sugar: 4.2,fiber: 0,   protein: 2.8, fats: 4.0 },
  'Ayran':        { carbs: 3.5,sugar: 3.5,fiber: 0,   protein: 1.5, fats: 1.0 },
  'Katyk':        { carbs: 5,  sugar: 4.5,fiber: 0,   protein: 3.2, fats: 3.5 },
  'Greek Yogurt': { carbs: 3.6,sugar: 3.2,fiber: 0,   protein: 10,  fats: 5.0 },
};

async function updateNutrition() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB ulandi');

    const products = await Product.find({});
    console.log(`📦 Jami mahsulotlar: ${products.length}`);

    let updated = 0;
    let notFound = [];

    for (const product of products) {
      const enName = product.name?.en;
      const nutrition = nutritionData[enName];

      if (nutrition) {
        await Product.findByIdAndUpdate(product._id, {
          carbs:   nutrition.carbs,
          sugar:   nutrition.sugar,
          fiber:   nutrition.fiber,
          protein: nutrition.protein,
          fats:    nutrition.fats,
          isActive: true,
        });
        updated++;
        console.log(`  ✅ ${enName} — carbs:${nutrition.carbs}g, protein:${nutrition.protein}g, fat:${nutrition.fats}g`);
      } else {
        notFound.push(enName);
      }
    }

    console.log(`\n✅ ${updated} ta mahsulot yangilandi`);
    if (notFound.length > 0) {
      console.log(`⚠️  Ma'lumot topilmagan: ${notFound.join(', ')}`);
    }

    await mongoose.connection.close();
    console.log('🎉 Tayyor!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Xato:', err.message);
    process.exit(1);
  }
}

updateNutrition();
