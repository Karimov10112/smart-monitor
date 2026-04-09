require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

// Copy of seeder data
const initialProducts = [
  { name: { uz: 'Olma', ru: 'Яблоко', en: 'Apple' }, category: 'fruits', emoji: '🍎', gi: 38, gl: 5, calories: 52, advice: { uz: "Qobig'i bilan yeyish foydali.", ru: 'Полезно есть с кожурой.', en: 'Useful to eat with the skin.' } },
  { name: { uz: 'Nok', ru: 'Груша', en: 'Pear' }, category: 'fruits', emoji: '🍐', gi: 38, gl: 4, calories: 57, advice: { uz: 'Kletchatkaga boy.', ru: 'Богат клетчаткой.', en: 'Rich in fiber.' } },
  { name: { uz: 'Shaftoli', ru: 'Персик', en: 'Peach' }, category: 'fruits', emoji: '🍑', gi: 42, gl: 5, calories: 39, advice: { uz: 'Yaxshi pishganini tanlang.', ru: 'Выбирайте спелые.', en: 'Choose ripe ones.' } },
  { name: { uz: "O'rik", ru: 'Абрикос', en: 'Apricot' }, category: 'fruits', emoji: '🍑', gi: 31, gl: 3, calories: 48, advice: { uz: 'Yangi uzilgani foydali.', ru: 'Полезны свежесобранные.', en: 'Freshly picked ones are useful.' } },
  { name: { uz: 'Gilos', ru: 'Черешня', en: 'Cherry' }, category: 'fruits', emoji: '🍒', gi: 25, gl: 3, calories: 50, advice: { uz: 'Antotsianlarga boy.', ru: 'Богат антоцианами.', en: 'Rich in anthocyanins.' } },
  { name: { uz: 'Qulupnay', ru: 'Клубника', en: 'Strawberry' }, category: 'fruits', emoji: '🍓', gi: 41, gl: 1, calories: 32, advice: { uz: 'Vitamina C manbai.', ru: 'Источник витамина С.', en: 'Source of vitamin C.' } },
  { name: { uz: 'Malina', ru: 'Малина', en: 'Raspberry' }, category: 'fruits', emoji: '🍇', gi: 32, gl: 2, calories: 52, advice: { uz: 'Kam uglevodli.', ru: 'Низкоуглеводный.', en: 'Low carb.' } },
  { name: { uz: 'Kivi', ru: 'Киви', en: 'Kiwi' }, category: 'fruits', emoji: '🥝', gi: 50, gl: 7, calories: 61, advice: { uz: 'Hazm qilishni yaxshilaydi.', ru: 'Улучшает пищеварение.', en: 'Improves digestion.' } },
  { name: { uz: 'Ananas', ru: 'Ананас', en: 'Pineapple' }, category: 'fruits', emoji: '🍍', gi: 59, gl: 7, calories: 50, advice: { uz: "Me'yorida iste'mol qiling.", ru: 'Употребляйте в умеренных количествах.', en: 'Eat in moderation.' } },
  { name: { uz: 'Greypfrut', ru: 'Грейпфрут', en: 'Grapefruit' }, category: 'fruits', emoji: '🍊', gi: 25, gl: 3, calories: 42, advice: { uz: 'Insulinga sezgirlikni oshiradi.', ru: 'Повышает чувствительность к инсулину.', en: 'Increases insulin sensitivity.' } },
  { name: { uz: 'Limon', ru: 'Лимон', en: 'Lemon' }, category: 'fruits', emoji: '🍋', gi: 20, gl: 2, calories: 29, advice: { uz: 'Choy bilan ichish foydali.', ru: 'Полезно пить с чаем.', en: 'Useful to drink with tea.' } },
  { name: { uz: 'Apelsin', ru: 'Апельсин', en: 'Orange' }, category: 'fruits', emoji: '🍊', gi: 43, gl: 4, calories: 47, advice: { uz: "Sharbati emas, o'zi yaxshi.", ru: 'Лучше сам плод, чем сок.', en: 'Whole fruit is better than juice.' } },
  { name: { uz: 'Banan', ru: 'Банан', en: 'Banana' }, category: 'fruits', emoji: '🍌', gi: 51, gl: 13, calories: 89, advice: { uz: "Yashilrog'i yaxshi.", ru: 'Лучше если чуть зеленый.', en: 'Slightly green is better.' } },
  { name: { uz: 'Uzum', ru: 'Виноград', en: 'Grapes' }, category: 'fruits', emoji: '🍇', gi: 53, gl: 5, calories: 67, advice: { uz: "Me'yorida yeyish shart.", ru: 'Обязательно есть в меру.', en: 'Must eat in moderation.' } },
  { name: { uz: 'Anjir', ru: 'Инжир', en: 'Fig' }, category: 'fruits', emoji: '🍈', gi: 61, gl: 8, calories: 74, advice: { uz: 'Yangi anjir yaxshiroq.', ru: 'Свежий инжир лучше.', en: 'Fresh figs are better.' } },
  { name: { uz: 'Xurmo', ru: 'Хурма', en: 'Persimmon' }, category: 'fruits', emoji: '🍅', gi: 50, gl: 10, calories: 70, advice: { uz: 'Faqat pishganini yeng.', ru: 'Ешьте только спелую.', en: 'Eat only ripe ones.' } },
  { name: { uz: 'Tarvuz', ru: 'Арбуз', en: 'Watermelon' }, category: 'fruits', emoji: '🍉', gi: 72, gl: 5, calories: 30, advice: { uz: 'GI yuqori, ozroq yeng.', ru: 'Высокий ГИ, ешьте понемногу.', en: 'High GI, eat sparingly.' } },
  { name: { uz: 'Qovun', ru: 'Дыня', en: 'Melon' }, category: 'fruits', emoji: '🍈', gi: 65, gl: 4, calories: 34, advice: { uz: "Bo'laklarga bo'lib yeng.", ru: 'Ешьте дольками.', en: 'Eat in slices.' } },
  { name: { uz: 'Anor', ru: 'Гранат', en: 'Pomegranate' }, category: 'fruits', emoji: '🍎', gi: 35, gl: 7, calories: 83, advice: { uz: "Qonni ko'paytiradi.", ru: 'Повышает уровень гемоглобина.', en: 'Increases hemoglobin.' } },
  { name: { uz: 'Behi', ru: 'Айва', en: 'Quince' }, category: 'fruits', emoji: '🍐', gi: 35, gl: 4, calories: 57, advice: { uz: 'Dimlab yeyish mumkin.', ru: 'Можно тушить.', en: 'Can be stewed.' } },
  { name: { uz: 'Mango', ru: 'Манго', en: 'Mango' }, category: 'fruits', emoji: '🥭', gi: 56, gl: 8, calories: 60, advice: { uz: "Me'yorida yeng.", ru: 'Ешьте умеренно.', en: 'Eat in moderation.' } },
  { name: { uz: "Olxo'ri", ru: 'Слива', en: 'Plum' }, category: 'fruits', emoji: '🍑', gi: 40, gl: 5, calories: 46, advice: { uz: 'Pishgan holda yeng.', ru: 'Ешьте спелой.', en: 'Eat when ripe.' } },
  { name: { uz: 'Chernika', ru: 'Черника', en: 'Blueberry' }, category: 'fruits', emoji: '🫐', gi: 53, gl: 5, calories: 57, advice: { uz: 'Ko\'z uchun foydali.', ru: 'Полезна для зрения.', en: 'Good for eyesight.' } },
  // VEGETABLES
  { name: { uz: 'Bodring', ru: 'Огурец', en: 'Cucumber' }, category: 'vegetables', emoji: '🥒', gi: 15, gl: 1, calories: 15, advice: { uz: 'Cheksiz yeyish mumkin.', ru: 'Можно есть неограниченно.', en: 'Can be eaten unlimitedly.' } },
  { name: { uz: 'Pomidor', ru: 'Помидор', en: 'Tomato' }, category: 'vegetables', emoji: '🍅', gi: 30, gl: 1, calories: 18, advice: { uz: 'Likopinga boy.', ru: 'Богат ликопином.', en: 'Rich in lycopene.' } },
  { name: { uz: 'Brokkoli', ru: 'Брокколи', en: 'Broccoli' }, category: 'vegetables', emoji: '🥦', gi: 15, gl: 1, calories: 34, advice: { uz: 'Superfood hisoblanadi.', ru: 'Считается суперфудом.', en: 'Considered a superfood.' } },
  { name: { uz: 'Ismaloq', ru: 'Шпинат', en: 'Spinach' }, category: 'vegetables', emoji: '🍃', gi: 15, gl: 1, calories: 23, advice: { uz: 'Temirga juda boy.', ru: 'Очень богат железом.', en: 'Very rich in iron.' } },
  { name: { uz: 'Sabzi', ru: 'Морковь', en: 'Carrot' }, category: 'vegetables', emoji: '🥕', gi: 35, gl: 2, calories: 41, advice: { uz: 'Xomiligi yaxshiroq.', ru: 'Лучше есть сырым.', en: 'Raw is better.' } },
  { name: { uz: 'Baqlajon', ru: 'Баклажан', en: 'Eggplant' }, category: 'vegetables', emoji: '🍆', gi: 15, gl: 1, calories: 25, advice: { uz: 'Pechnada pishiring.', ru: 'Запекайте в духовке.', en: 'Bake in the oven.' } },
  { name: { uz: 'Qovoqcha', ru: 'Кабачок', en: 'Zucchini' }, category: 'vegetables', emoji: '🥒', gi: 15, gl: 1, calories: 17, advice: { uz: 'Past kaloriyali.', ru: 'Низкокалорийный.', en: 'Low calorie.' } },
  { name: { uz: 'Gulkaram', ru: 'Цветная капуста', en: 'Cauliflower' }, category: 'vegetables', emoji: '🥦', gi: 15, gl: 1, calories: 25, advice: { uz: "Guruch o'rnida ishlatsa bo'ladi.", ru: 'Можно использовать вместо риса.', en: 'Can be used instead of rice.' } },
  { name: { uz: 'Karam', ru: 'Капуста', en: 'Cabbage' }, category: 'vegetables', emoji: '🥬', gi: 15, gl: 1, calories: 25, advice: { uz: 'Sifatli kletchatka.', ru: 'Качественная клетчатка.', en: 'High-quality fiber.' } },
  { name: { uz: 'Lavlagi', ru: 'Свекла', en: 'Beetroot' }, category: 'vegetables', emoji: '🥔', gi: 64, gl: 5, calories: 43, advice: { uz: 'Xom holda ozroq yeng.', ru: 'Ешьте понемногу в сыром виде.', en: 'Eat sparingly in raw form.' } },
  { name: { uz: 'Piyoz', ru: 'Лук', en: 'Onion' }, category: 'vegetables', emoji: '🧅', gi: 15, gl: 1, calories: 40, advice: { uz: 'Antibakterial.', ru: 'Антибактериальный.', en: 'Antibacterial.' } },
  { name: { uz: 'Sarmisoq', ru: 'Чеснок', en: 'Garlic' }, category: 'vegetables', emoji: '🧄', gi: 30, gl: 1, calories: 149, advice: { uz: 'Qand miqdorini pasaytiradi.', ru: 'Снижает уровень сахара.', en: 'Lowers sugar levels.' } },
  { name: { uz: 'Bolgar qalampiri', ru: 'Болгарский перец', en: 'Bell Pepper' }, category: 'vegetables', emoji: '🫑', gi: 15, gl: 1, calories: 26, advice: { uz: 'Turli rangdagisi vitaminlarga boy.', ru: 'Разного цвета богат витаминами.', en: 'Different colors are rich in vitamins.' } },
  { name: { uz: 'Qovoq', ru: 'Тыква', en: 'Pumpkin' }, category: 'vegetables', emoji: '🎃', gi: 75, gl: 4, calories: 26, advice: { uz: "Me'yorida yeng.", ru: 'Ешьте в умеренных количествах.', en: 'Eat in moderation.' } },
  { name: { uz: "Makkajo'xori", ru: 'Кукуруза', en: 'Corn' }, category: 'vegetables', emoji: '🌽', gi: 55, gl: 15, calories: 86, advice: { uz: 'Konservalanganidan qoching.', ru: 'Избегайте консервированной.', en: 'Avoid canned variety.' } },
  { name: { uz: 'Salat bargi', ru: 'Листья салата', en: 'Lettuce' }, category: 'vegetables', emoji: '🥬', gi: 15, gl: 1, calories: 15, advice: { uz: 'Vitaminlarga boy.', ru: 'Богат витаминами.', en: 'Rich in vitamins.' } },
  { name: { uz: 'Selderay', ru: 'Сельдерей', en: 'Celery' }, category: 'vegetables', emoji: '🌿', gi: 15, gl: 1, calories: 16, advice: { uz: 'Kaloriyadar pastligi ajoyib.', ru: 'Отличается низкой калорийностью.', en: 'Excellent for low calorie diet.' } },
  { name: { uz: 'Zanjabil', ru: 'Имбирь', en: 'Ginger' }, category: 'vegetables', emoji: '🫚', gi: 15, gl: 1, calories: 80, advice: { uz: 'Immunitetni mustahkamlaydi.', ru: 'Укрепляет иммунитет.', en: 'Strengthens immunity.' } },
  { name: { uz: 'Asparagus', ru: 'Спаржа', en: 'Asparagus' }, category: 'vegetables', emoji: '🎍', gi: 15, gl: 1, calories: 20, advice: { uz: 'Buyraklar uchun foydali.', ru: 'Полезна для почек.', en: 'Useful for kidneys.' } },
  // PROTEIN
  { name: { uz: "Tovuq go'shti", ru: 'Куриное мясо', en: 'Chicken Meat' }, category: 'protein', emoji: '🍗', gi: 0, gl: 0, calories: 165, advice: { uz: 'Laxm qismini yeng.', ru: 'Ешьте филе.', en: 'Eat the fillet.' } },
  { name: { uz: 'Baliq (Sazan)', ru: 'Рыба (Сазан)', en: 'Fish (Carp)' }, category: 'protein', emoji: '🐟', gi: 0, gl: 0, calories: 121, advice: { uz: "Bug'da pishirish foydali.", ru: 'Полезно готовить на пару.', en: 'Steaming is useful.' } },
  { name: { uz: 'Tuxum', ru: 'Яйцо', en: 'Egg' }, category: 'protein', emoji: '🥚', gi: 0, gl: 0, calories: 155, advice: { uz: 'Kuniga 1-2 ta mumkin.', ru: 'Можно 1-2 штуки в день.', en: '1-2 pieces a day is possible.' } },
  { name: { uz: "Mol go'shti", ru: 'Говядина', en: 'Beef' }, category: 'protein', emoji: '🥩', gi: 0, gl: 0, calories: 250, advice: { uz: "Yog'sizini tanlang.", ru: 'Выбирайте постное.', en: 'Choose lean.' } },
  { name: { uz: "Kurka go'shti", ru: 'Индейка', en: 'Turkey' }, category: 'protein', emoji: '🦃', gi: 0, gl: 0, calories: 189, advice: { uz: 'Dietik mahsulot.', ru: 'Диетический продукт.', en: 'Dietary product.' } },
  { name: { uz: 'Losos', ru: 'Лосось', en: 'Salmon' }, category: 'protein', emoji: '🐟', gi: 0, gl: 0, calories: 208, advice: { uz: 'Omega-3 ga boy.', ru: 'Богат омега-3.', en: 'Rich in omega-3.' } },
  { name: { uz: 'Tunets', ru: 'Тунец', en: 'Tuna' }, category: 'protein', emoji: '🐟', gi: 0, gl: 0, calories: 132, advice: { uz: 'Oqsilga boy.', ru: 'Богат белком.', en: 'Rich in protein.' } },
  { name: { uz: 'Krevetka', ru: 'Креветки', en: 'Shrimp' }, category: 'protein', emoji: '🦐', gi: 0, gl: 0, calories: 99, advice: { uz: 'Past kaloriyali oqsil.', ru: 'Низкокалорийный белок.', en: 'Low calorie protein.' } },
  { name: { uz: "Qo'y go'shti", ru: 'Баранина', en: 'Lamb' }, category: 'protein', emoji: '🥩', gi: 0, gl: 0, calories: 294, advice: { uz: "Me'yorida yeng.", ru: 'Умеренно употребляйте.', en: 'Eat in moderation.' } },
  // GRAINS
  { name: { uz: 'Grechka', ru: 'Гречка', en: 'Buckwheat' }, category: 'grains', emoji: '🥣', gi: 50, gl: 15, calories: 343, advice: { uz: 'Eng foydali don.', ru: 'Самая полезная крупа.', en: 'The most useful grain.' } },
  { name: { uz: 'Suli (Ovsyanika)', ru: 'Овсянка', en: 'Oats' }, category: 'grains', emoji: '🥣', gi: 55, gl: 12, calories: 389, advice: { uz: 'Butun donlisini tanlang.', ru: 'Выбирайте цельнозерновую.', en: 'Choose whole grain.' } },
  { name: { uz: 'Yasmiq', ru: 'Чечевица', en: 'Lentils' }, category: 'grains', emoji: '🍛', gi: 30, gl: 5, calories: 116, advice: { uz: 'Oqsil va kletchatkaga boy.', ru: 'Богат белком и клетчаткой.', en: 'Rich in protein and fiber.' } },
  { name: { uz: "No'xat", ru: 'Нут', en: 'Chickpeas' }, category: 'grains', emoji: '🍛', gi: 28, gl: 8, calories: 164, advice: { uz: "Uzoq vaqt to'q tutadi.", ru: 'Долго сохраняет сытость.', en: 'Keeps you full for a long time.' } },
  { name: { uz: 'Kinoa', ru: 'Киноа', en: 'Quinoa' }, category: 'grains', emoji: '🥣', gi: 53, gl: 13, calories: 120, advice: { uz: 'Super don hisoblanadi.', ru: 'Считается суперзерном.', en: 'Considered a supergrain.' } },
  { name: { uz: 'Javdar', ru: 'Рожь', en: 'Rye' }, category: 'grains', emoji: '🌾', gi: 45, gl: 10, calories: 259, advice: { uz: "Non uchun yaxshi don.", ru: 'Хороший злак для хлеба.', en: 'Good grain for bread.' } },
  { name: { uz: 'Arpa', ru: 'Ячмень', en: 'Barley' }, category: 'grains', emoji: '🌾', gi: 25, gl: 10, calories: 352, advice: { uz: 'Past GI li don.', ru: 'Злак с низким ГИ.', en: 'Low GI grain.' } },
  { name: { uz: "Bulg'ur", ru: 'Булгур', en: 'Bulgur' }, category: 'grains', emoji: '🥣', gi: 45, gl: 12, calories: 342, advice: { uz: "O'rta GI.", ru: 'Средний ГИ.', en: 'Medium GI.' } },
  { name: { uz: 'Mosh', ru: 'Маш', en: 'Mung Bean' }, category: 'grains', emoji: '🍛', gi: 25, gl: 8, calories: 347, advice: { uz: 'Oshqozon uchun yengil.', ru: 'Легко усваивается.', en: 'Easy to digest.' } },
  { name: { uz: 'Lobiya', ru: 'Фасоль', en: 'Common Bean' }, category: 'grains', emoji: '🍛', gi: 35, gl: 9, calories: 333, advice: { uz: 'Uzoq to\'yintiradi.', ru: 'Долго насыщает.', en: 'Keeps you full long.' } },
  // NUTS
  { name: { uz: 'Bodom', ru: 'Миндаль', en: 'Almond' }, category: 'nuts', emoji: '🥜', gi: 15, gl: 1, calories: 579, advice: { uz: 'Qon-tomirlar uchun foydali.', ru: 'Полезен для сосудов.', en: 'Useful for blood vessels.' } },
  { name: { uz: "Yong'oq", ru: 'Грецкий орех', en: 'Walnut' }, category: 'nuts', emoji: '🥜', gi: 15, gl: 1, calories: 654, advice: { uz: 'Miya faoliyatini yaxshilaydi.', ru: 'Улучшает работу мозга.', en: 'Improves brain function.' } },
  { name: { uz: 'Pista', ru: 'Фисташки', en: 'Pistachios' }, category: 'nuts', emoji: '🥜', gi: 15, gl: 1, calories: 562, advice: { uz: 'Shorsizini yeng.', ru: 'Ешьте несоленые.', en: 'Eat unsalted ones.' } },
  { name: { uz: 'Funtuk', ru: 'Фундук', en: 'Hazelnut' }, category: 'nuts', emoji: '🌰', gi: 15, gl: 1, calories: 628, advice: { uz: "E vitaminga boy.", ru: 'Богат витамином E.', en: 'Rich in vitamin E.' } },
  { name: { uz: 'Keshju', ru: 'Кешью', en: 'Cashew' }, category: 'nuts', emoji: '🥜', gi: 22, gl: 2, calories: 553, advice: { uz: 'Magniyga boy.', ru: 'Богат магнием.', en: 'Rich in magnesium.' } },
  { name: { uz: 'Arxis', ru: 'Арахис', en: 'Peanut' }, category: 'nuts', emoji: '🥜', gi: 14, gl: 1, calories: 567, advice: { uz: 'Tabiiy yog\'ini yeng.', ru: 'Ешьте натуральный.', en: 'Eat natural ones.' } },
  // DAIRY
  { name: { uz: 'Kefir', ru: 'Кефир', en: 'Kefir' }, category: 'dairy', emoji: '🥛', gi: 25, gl: 1, calories: 41, advice: { uz: 'Ichak faoliyatiga foydali.', ru: 'Полезен для работы кишечника.', en: 'Useful for bowel function.' } },
  { name: { uz: 'Tvorog', ru: 'Творог', en: 'Cottage Cheese' }, category: 'dairy', emoji: '🥣', gi: 30, gl: 1, calories: 98, advice: { uz: 'Kalsiy manbai.', ru: 'Источник кальция.', en: 'Source of calcium.' } },
  { name: { uz: 'Ryajenka', ru: 'Ряженка', en: 'Ryazhenka' }, category: 'dairy', emoji: '🥛', gi: 30, gl: 1, calories: 67, advice: { uz: 'Hazm qilishni yaxshilaydi.', ru: 'Улучшает пищеварение.', en: 'Improves digestion.' } },
  { name: { uz: 'Ayron', ru: 'Айран', en: 'Ayran' }, category: 'dairy', emoji: '🥛', gi: 15, gl: 1, calories: 24, advice: { uz: 'Ichimlik sifatida foydali.', ru: 'Полезен как напиток.', en: 'Useful as a beverage.' } },
  { name: { uz: 'Qatiq', ru: 'Катык', en: 'Katyk' }, category: 'dairy', emoji: '🍶', gi: 20, gl: 1, calories: 56, advice: { uz: 'Milliy sut mahsuloti.', ru: 'Национальный молочный продукт.', en: 'Traditional dairy product.' } },
  { name: { uz: 'Yogurt (Grecheskiy)', ru: 'Греческий йогурт', en: 'Greek Yogurt' }, category: 'dairy', emoji: '🍧', gi: 20, gl: 1, calories: 59, advice: { uz: 'Oqsilga boy va past GI.', ru: 'Богат белком и низкий ГИ.', en: 'Rich in protein and low GI.' } },
];

async function reseedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB ulandi');

    // Delete old (possibly corrupted) records and re-insert fresh ones
    await Product.deleteMany({});
    console.log('🗑️ Eski mahsulotlar o\'chirildi');

    const allWithActive = initialProducts.map(p => ({ ...p, isActive: true }));
    await Product.insertMany(allWithActive);
    console.log(`✅ ${allWithActive.length} ta mahsulot muvaffaqiyatli yuklandi!`);

    const count = await Product.countDocuments({ isActive: true });
    console.log(`✅ Faol mahsulotlar: ${count}`);

    await mongoose.connection.close();
    console.log('🎉 Tayyor!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Xato:', err.message);
    process.exit(1);
  }
}

reseedProducts();
