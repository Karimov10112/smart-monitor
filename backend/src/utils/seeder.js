const Product = require('../models/Product');

const initialProducts = [
  // --- MEVALAR (Fruits) ---
  {
    name: { uz: 'Olma', ru: 'Яблоко', en: 'Apple' },
    category: 'fruits', emoji: '🍎', gi: 38, gl: 5, calories: 52,
    advice: { uz: "Qobig'i bilan yeyish foydali.", ru: 'Полезно есть с кожурой.', en: 'It is useful to eat with the skin.' }
  },
  {
    name: { uz: 'Nok', ru: 'Груша', en: 'Pear' },
    category: 'fruits', emoji: '🍐', gi: 38, gl: 4, calories: 57,
    advice: { uz: 'Kletchatkaga boy.', ru: 'Богат клетчаткой.', en: 'Rich in fiber.' }
  },
  {
    name: { uz: 'Shaftoli', ru: 'Персик', en: 'Peach' },
    category: 'fruits', emoji: '🍑', gi: 42, gl: 5, calories: 39,
    advice: { uz: 'Yaxshi pishganini tanlang.', ru: 'Выбирайте спелые.', en: 'Choose ripe ones.' }
  },
  {
    name: { uz: "O'rik", ru: 'Абрикос', en: 'Apricot' },
    category: 'fruits', emoji: '🍑', gi: 31, gl: 3, calories: 48,
    advice: { uz: 'Yangi uzilgani foydali.', ru: 'Полезны свежесобранные.', en: 'Freshly picked ones are useful.' }
  },
  {
    name: { uz: 'Gilos', ru: 'Черешня', en: 'Cherry' },
    category: 'fruits', emoji: '🍒', gi: 25, gl: 3, calories: 50,
    advice: { uz: 'Antotsianlarga boy.', ru: 'Богат антоцианами.', en: 'Rich in anthocyanins.' }
  },
  {
    name: { uz: 'Qulupnay', ru: 'Клубника', en: 'Strawberry' },
    category: 'fruits', emoji: '🍓', gi: 41, gl: 1, calories: 32,
    advice: { uz: 'Vitamina C manbai.', ru: 'Источник витамина С.', en: 'Source of vitamin C.' }
  },
  {
    name: { uz: 'Malina', ru: 'Малина', en: 'Raspberry' },
    category: 'fruits', emoji: '🍇', gi: 32, gl: 2, calories: 52,
    advice: { uz: 'Kam uglevodli.', ru: 'Низкоуглеводный.', en: 'Low carb.' }
  },
  {
    name: { uz: 'Kivi', ru: 'Киви', en: 'Kiwi' },
    category: 'fruits', emoji: '🥝', gi: 50, gl: 7, calories: 61,
    advice: { uz: 'Hazm qilishni yaxshilaydi.', ru: 'Улучшает пищеварение.', en: 'Improves digestion.' }
  },
  {
    name: { uz: 'Ananas', ru: 'Ананас', en: 'Pineapple' },
    category: 'fruits', emoji: '🍍', gi: 59, gl: 7, calories: 50,
    advice: { uz: "Me'yorida iste'mol qiling.", ru: 'Употребляйте в умеренных количествах.', en: 'Eat in moderation.' }
  },
  {
    name: { uz: 'Greypfrut', ru: 'Грейпфрут', en: 'Grapefruit' },
    category: 'fruits', emoji: '🍊', gi: 25, gl: 3, calories: 42,
    advice: { uz: 'Insulinga sezgirlikni oshiradi.', ru: 'Повышает чувствительность к инсулину.', en: 'Increases insulin sensitivity.' }
  },
  {
    name: { uz: 'Limon', ru: 'Лимон', en: 'Lemon' },
    category: 'fruits', emoji: '🍋', gi: 20, gl: 2, calories: 29,
    advice: { uz: 'Choy bilan ichish foydali.', ru: 'Полезно пить с чаем.', en: 'Useful to drink with tea.' }
  },
  {
    name: { uz: 'Apelsin', ru: 'Апельсин', en: 'Orange' },
    category: 'fruits', emoji: '🍊', gi: 43, gl: 4, calories: 47,
    advice: { uz: 'Sharbati emas, ozi yaxshi.', ru: 'Лучше сам плод, чем сок.', en: 'Whole fruit is better than juice.' }
  },
  {
    name: { uz: 'Banan', ru: 'Банан', en: 'Banana' },
    category: 'fruits', emoji: '🍌', gi: 51, gl: 13, calories: 89,
    advice: { uz: "Yashilrog'i yaxshi.", ru: 'Лучше если чуть зеленый.', en: 'Slightly green is better.' }
  },
  {
    name: { uz: 'Uzum', ru: 'Виноград', en: 'Grapes' },
    category: 'fruits', emoji: '🍇', gi: 53, gl: 5, calories: 67,
    advice: { uz: "Me'yorida yeyish shart.", ru: 'Обязательно есть в меру.', en: 'Must eat in moderation.' }
  },
  {
    name: { uz: 'Anjir', ru: 'Инжир', en: 'Fig' },
    category: 'fruits', emoji: '🍈', gi: 61, gl: 8, calories: 74,
    advice: { uz: 'Yangi anjir yaxshiroq.', ru: 'Свежий инжир лучше.', en: 'Fresh figs are better.' }
  },
  {
    name: { uz: 'Xurmo', ru: 'Хурма', en: 'Persimmon' },
    category: 'fruits', emoji: '🍅', gi: 50, gl: 10, calories: 70,
    advice: { uz: 'Faqat pishganini yeng.', ru: 'Ешьте только спелую.', en: 'Eat only ripe ones.' }
  },
  {
    name: { uz: 'Tarvuz', ru: 'Арбуз', en: 'Watermelon' },
    category: 'fruits', emoji: '🍉', gi: 72, gl: 5, calories: 30,
    advice: { uz: 'GI yuqori, ozroq yeng.', ru: 'Высокий ГИ, ешьте понемногу.', en: 'High GI, eat sparingly.' }
  },
  {
    name: { uz: 'Qovun', ru: 'Дыня', en: 'Melon' },
    category: 'fruits', emoji: '🍈', gi: 65, gl: 4, calories: 34,
    advice: { uz: "Bo'laklarga bo'lib yeng.", ru: 'Ешьте дольками.', en: 'Eat in slices.' }
  },
  {
    name: { uz: 'Anor', ru: 'Гранат', en: 'Pomegranate' },
    category: 'fruits', emoji: '🍎', gi: 35, gl: 7, calories: 83,
    advice: { uz: "Qonni ko'paytiradi.", ru: 'Повышает уровень гемоглобина.', en: 'Increases hemoglobin.' }
  },
  {
    name: { uz: 'Behi', ru: 'Айва', en: 'Quince' },
    category: 'fruits', emoji: '🍐', gi: 35, gl: 4, calories: 57,
    advice: { uz: 'Dimlab yeyish mumkin.', ru: 'Можно тушить.', en: 'Can be stewed.' }
  },

  // --- SABZAVOTLAR (Vegetables) ---
  {
    name: { uz: 'Bodring', ru: 'Огурец', en: 'Cucumber' },
    category: 'vegetables', emoji: '🥒', gi: 15, gl: 1, calories: 15,
    advice: { uz: 'Cheksiz yeyish mumkin.', ru: 'Можно есть неограниченно.', en: 'Can be eaten unlimitedly.' }
  },
  {
    name: { uz: 'Pomidor', ru: 'Помидор', en: 'Tomato' },
    category: 'vegetables', emoji: '🍅', gi: 30, gl: 1, calories: 18,
    advice: { uz: 'Likopinga boy.', ru: 'Богат ликопином.', en: 'Rich in lycopene.' }
  },
  {
    name: { uz: 'Brokkoli', ru: 'Брокколи', en: 'Broccoli' },
    category: 'vegetables', emoji: '🥦', gi: 15, gl: 1, calories: 34,
    advice: { uz: 'Superfood hisoblanadi.', ru: 'Считается суперфудом.', en: 'Considered a superfood.' }
  },
  {
    name: { uz: 'Ismaloq', ru: 'Шпинат', en: 'Spinach' },
    category: 'vegetables', emoji: '🍃', gi: 15, gl: 1, calories: 23,
    advice: { uz: 'Temirga juda boy.', ru: 'Очень богат железом.', en: 'Very rich in iron.' }
  },
  {
    name: { uz: 'Sabzi', ru: 'Морковь', en: 'Carrot' },
    category: 'vegetables', emoji: '🥕', gi: 35, gl: 2, calories: 41,
    advice: { uz: 'Xomiligi yaxshiroq.', ru: 'Лучше есть сырым.', en: 'Raw is better.' }
  },
  {
    name: { uz: 'Baqlajon', ru: 'Баклажан', en: 'Eggplant' },
    category: 'vegetables', emoji: '🍆', gi: 15, gl: 1, calories: 25,
    advice: { uz: 'Pechnada pishiring.', ru: 'Запекайте в духовке.', en: 'Bake in the oven.' }
  },
  {
    name: { uz: 'Qovoqcha', ru: 'Кабачок', en: 'Zucchini' },
    category: 'vegetables', emoji: '🥒', gi: 15, gl: 1, calories: 17,
    advice: { uz: 'Past kaloriyali.', ru: 'Низкокалорийный.', en: 'Low calorie.' }
  },
  {
    name: { uz: 'Gulkaram', ru: 'Цветная капуста', en: 'Cauliflower' },
    category: 'vegetables', emoji: '🥦', gi: 15, gl: 1, calories: 25,
    advice: { uz: "Guruch o'rnida ishlatsa bo'ladi.", ru: 'Можно использовать вместо риса.', en: 'Can be used instead of rice.' }
  },
  {
    name: { uz: 'Karam', ru: 'Капуста', en: 'Cabbage' },
    category: 'vegetables', emoji: '🥬', gi: 15, gl: 1, calories: 25,
    advice: { uz: 'Sifatli kletchatka.', ru: 'Качественная клетчатка.', en: 'High-quality fiber.' }
  },
  {
    name: { uz: 'Lavlagi', ru: 'Свекла', en: 'Beetroot' },
    category: 'vegetables', emoji: '🥔', gi: 64, gl: 5, calories: 43,
    advice: { uz: 'Xom holda ozroq yeng.', ru: 'Ешьте понемногу в сыром виде.', en: 'Eat sparingly in raw form.' }
  },
  {
    name: { uz: 'Piyoz', ru: 'Лук', en: 'Onion' },
    category: 'vegetables', emoji: '🧅', gi: 15, gl: 1, calories: 40,
    advice: { uz: 'Antibakterial.', ru: 'Антибактериальный.', en: 'Antibacterial.' }
  },
  {
    name: { uz: 'Sarmisoq', ru: 'Чеснок', en: 'Garlic' },
    category: 'vegetables', emoji: '🧄', gi: 30, gl: 1, calories: 149,
    advice: { uz: 'Qand miqdorini pasaytiradi.', ru: 'Снижает уровень сахара.', en: 'Lowers sugar levels.' }
  },
  {
    name: { uz: 'Bolgar qalampiri', ru: 'Болгарский перец', en: 'Bell Pepper' },
    category: 'vegetables', emoji: '🫑', gi: 15, gl: 1, calories: 26,
    advice: { uz: 'Turli rangdagisi vitaminlarga boy.', ru: 'Разного цвета богат витаминами.', en: 'Different colors are rich in vitamins.' }
  },
  {
    name: { uz: 'Qovoq', ru: 'Тыква', en: 'Pumpkin' },
    category: 'vegetables', emoji: '🎃', gi: 75, gl: 4, calories: 26,
    advice: { uz: "Me'yorida yeng.", ru: 'Ешьте в умеренных количествах.', en: 'Eat in moderation.' }
  },
  {
    name: { uz: 'Makkajo\'xori', ru: 'Кукуруза', en: 'Corn' },
    category: 'vegetables', emoji: '🌽', gi: 55, gl: 15, calories: 86,
    advice: { uz: 'Konservalanganidan qoching.', ru: 'Избегайте консервированной.', en: 'Avoid canned variety.' }
  },

  // --- PROTEIN (Meat & Fish) ---
  {
    name: { uz: 'Tovuq go\'shti', ru: 'Куриное мясо', en: 'Chicken Meat' },
    category: 'protein', emoji: '🍗', gi: 0, gl: 0, calories: 165,
    advice: { uz: 'Laxm qismini yeng.', ru: 'Ешьте филе.', en: 'Eat the fillet.' }
  },
  {
    name: { uz: 'Baliq (Sazan)', ru: 'Рыба (Сазан)', en: 'Fish (Carp)' },
    category: 'protein', emoji: '🐟', gi: 0, gl: 0, calories: 121,
    advice: { uz: 'Bug\'da pishirish foydali.', ru: 'Полезно готовить на пару.', en: 'Steaming is useful.' }
  },
  {
    name: { uz: 'Tuxum', ru: 'Яйцо', en: 'Egg' },
    category: 'protein', emoji: '🥚', gi: 0, gl: 0, calories: 155,
    advice: { uz: 'Kuniga 1-2 ta mumkin.', ru: 'Можно 1-2 штуки в день.', en: '1-2 pieces a day is possible.' }
  },
  {
    name: { uz: 'Mol go\'shti', ru: 'Говядина', en: 'Beef' },
    category: 'protein', emoji: '🥩', gi: 0, gl: 0, calories: 250,
    advice: { uz: 'Yog\'sizini tanlang.', ru: 'Выбирайте постное.', en: 'Choose lean.' }
  },
  {
    name: { uz: 'Kurka go\'shti', ru: 'Индейка', en: 'Turkey' },
    category: 'protein', emoji: '🦃', gi: 0, gl: 0, calories: 189,
    advice: { uz: 'Dietik mahsulot.', ru: 'Диетический продукт.', en: 'Dietary product.' }
  },

  // --- DONLI MAHSULOTLAR (Grains) ---
  {
    name: { uz: 'Grechka', ru: 'Гречка', en: 'Buckwheat' },
    category: 'grains', emoji: '🥣', gi: 50, gl: 15, calories: 343,
    advice: { uz: 'Eng foydali don.', ru: 'Самая полезная крупа.', en: 'The most useful grain.' }
  },
  {
    name: { uz: 'Suli (Ovsyanika)', ru: 'Овсянка', en: 'Oats' },
    category: 'grains', emoji: '🥣', gi: 55, gl: 12, calories: 389,
    advice: { uz: 'Butun donlisini tanlang.', ru: 'Выбирайте цельнозерновую.', en: 'Choose whole grain.' }
  },
  {
    name: { uz: 'Yasmiq', ru: 'Чечевица', en: 'Lentils' },
    category: 'grains', emoji: '🍛', gi: 30, gl: 5, calories: 116,
    advice: { uz: 'Oqsil va kletchatkaga boy.', ru: 'Богат белком и клетчаткой.', en: 'Rich in protein and fiber.' }
  },
  {
    name: { uz: 'No\'xat', ru: 'Нут', en: 'Chickpeas' },
    category: 'grains', emoji: '🍛', gi: 28, gl: 8, calories: 164,
    advice: { uz: "Uzoq vaqt to'q tutadi.", ru: 'Долго сохраняет сытость.', en: 'Keeps you full for a long time.' }
  },
  {
    name: { uz: 'Kinoa', ru: 'Киноа', en: 'Quinoa' },
    category: 'grains', emoji: '🥣', gi: 53, gl: 13, calories: 120,
    advice: { uz: 'Super don hisoblanadi.', ru: 'Считается суперзерном.', en: 'Considered a supergrain.' }
  },

  // --- YONG'OQLAR (Nuts) ---
  {
    name: { uz: 'Bodom', ru: 'Миндаль', en: 'Almond' },
    category: 'nuts', emoji: '🥜', gi: 15, gl: 1, calories: 579,
    advice: { uz: 'Qon-tomirlar uchun foydali.', ru: 'Полезен для сосудов.', en: 'Useful for blood vessels.' }
  },
  {
    name: { uz: 'Yong\'oq', ru: 'Грецкий орех', en: 'Walnut' },
    category: 'nuts', emoji: '🥜', gi: 15, gl: 1, calories: 654,
    advice: { uz: 'Miya faoliyatini yaxshilaydi.', ru: 'Улучшает работу мозга.', en: 'Improves brain function.' }
  },
  {
    name: { uz: 'Pista', ru: 'Фисташки', en: 'Pistachios' },
    category: 'nuts', emoji: '🥜', gi: 15, gl: 1, calories: 562,
    advice: { uz: 'Shorsizini yeng.', ru: 'Ешьте несоленые.', en: 'Eat unsalted ones.' }
  },

  // --- SUT MAHSULOTLARI (Dairy) ---
  {
    name: { uz: 'Kefir', ru: 'Кефир', en: 'Kefir' },
    category: 'dairy', emoji: '🥛', gi: 25, gl: 1, calories: 41,
    advice: { uz: 'Ichak faoliyatiga foydali.', ru: 'Полезен для работы кишечника.', en: 'Useful for bowel function.' }
  },
  {
    name: { uz: 'Tvorog', ru: 'Творог', en: 'Cottage Cheese' },
    category: 'dairy', emoji: '🥣', gi: 30, gl: 1, calories: 98,
    advice: { uz: 'Kalsiy manbai.', ru: 'Источник кальция.', en: 'Source of calcium.' }
  }
];

// Helper to reach 100+ unique variants by adding specific sub-types or variations
const generateExtendedList = () => {
    const extended = [...initialProducts];
    const categorySupplements = {
        fruits: [
            { uz: 'Malina', ru: 'Малина', en: 'Raspberry', gi: 32, gl: 2, cal: 52, emoji: '🍇' },
            { uz: 'Smultoriya', ru: 'Земляника', en: 'Wild Strawberry', gi: 25, gl: 2, cal: 41, emoji: '🍓' },
            { uz: 'Klyukva', ru: 'Клюква', en: 'Cranberry', gi: 45, gl: 3, cal: 46, emoji: '🍒' },
            { uz: 'Chernika', ru: 'Черника', en: 'Blueberry', gi: 53, gl: 5, cal: 57, emoji: '🫐' },
            { uz: 'Smorodina', ru: 'Смородина', en: 'Currant', gi: 30, gl: 3, cal: 63, emoji: '🍇' },
            { uz: 'Olxo\'ri', ru: 'Слива', en: 'Plum', gi: 40, gl: 5, cal: 46, emoji: '🍑' },
            { uz: 'Mango', ru: 'Манго', en: 'Mango', gi: 56, gl: 8, cal: 60, emoji: '🥭' },
            { uz: 'Granadilla', ru: 'Гранадилла', en: 'Granadilla', gi: 51, gl: 6, cal: 97, emoji: '🍈' },
            { uz: 'Papayya', ru: 'Папайя', en: 'Papaya', gi: 59, gl: 6, cal: 43, emoji: '🥭' },
            { uz: 'Laym', ru: 'Лайм', en: 'Lime', gi: 20, gl: 2, cal: 30, emoji: '🍋' }
        ],
        vegetables: [
            { uz: 'Salat bargi', ru: 'Листья салата', en: 'Lettuce', gi: 15, gl: 1, cal: 15, emoji: '🥬' },
            { uz: 'Selderay', ru: 'Сельдерей', en: 'Celery', gi: 15, gl: 1, cal: 16, emoji: '🌿' },
            { uz: 'Petrushka', ru: 'Петрушка', en: 'Parsley', gi: 15, gl: 1, cal: 36, emoji: '🌿' },
            { uz: 'Ukrop', ru: 'Укроп', en: 'Dill', gi: 15, gl: 1, cal: 43, emoji: '🌿' },
            { uz: 'Kashnich', ru: 'Кинза', en: 'Cilantro', gi: 15, gl: 1, cal: 23, emoji: '🌿' },
            { uz: 'Turp', ru: 'Редька', en: 'Radish', gi: 15, gl: 1, cal: 20, emoji: '🥔' },
            { uz: 'Redis', ru: 'Редис', en: 'Red Radish', gi: 15, gl: 1, cal: 16, emoji: '🔴' },
            { uz: 'Zanjabil', ru: 'Имбирь', en: 'Ginger', gi: 15, gl: 1, cal: 80, emoji: '🫚' },
            { uz: 'Qalampir', ru: 'Перец чили', en: 'Chili Pepper', gi: 15, gl: 1, cal: 40, emoji: '🌶️' },
            { uz: 'Asparagus', ru: 'Спаржа', en: 'Asparagus', gi: 15, gl: 1, cal: 20, emoji: '🎍' },
            { uz: 'Pastroq', ru: 'Пастернак', en: 'Parsnip', gi: 52, gl: 4, cal: 75, emoji: '🥕' },
            { uz: 'Qizil karam', ru: 'Красная капуста', en: 'Red Cabbage', gi: 15, gl: 1, cal: 31, emoji: '🥬' }
        ],
        protein: [
            { uz: 'Losos', ru: 'Лосось', en: 'Salmon', gi: 0, gl: 0, cal: 208, emoji: '🐟' },
            { uz: 'Tunets', ru: 'Тунец', en: 'Tuna', gi: 0, gl: 0, cal: 132, emoji: '🐟' },
            { uz: 'Krevetka', ru: 'Креветки', en: 'Shrimp', gi: 0, gl: 0, cal: 99, emoji: '🦐' },
            { uz: 'Kalmar', ru: 'Кальмар', en: 'Squid', gi: 0, gl: 0, cal: 92, emoji: '🦑' },
            { uz: 'Qisqichbaqa', ru: 'Краб', en: 'Crab', gi: 0, gl: 0, cal: 84, emoji: '🦀' },
            { uz: 'Qo\'y go\'shti', ru: 'Баранина', en: 'Lamb', gi: 0, gl: 0, cal: 294, emoji: '🥩' },
            { uz: 'Tovuq jigar', ru: 'Куриная печень', en: 'Chicken Liver', gi: 0, gl: 0, cal: 172, emoji: '🥩' },
            { uz: 'Mol jigar', ru: 'Говяжья печень', en: 'Beef Liver', gi: 0, gl: 0, cal: 135, emoji: '🥩' },
            { uz: 'Quyon go\'shti', ru: 'Мясо кролика', en: 'Rabbit Meat', gi: 0, gl: 0, cal: 156, emoji: '🐇' }
        ],
        grains: [
            { uz: 'Javdar', ru: 'Рожь', en: 'Rye', gi: 45, gl: 10, cal: 259, emoji: '🌾' },
            { uz: 'Arpa', ru: 'Ячмень', en: 'Barley', gi: 25, gl: 10, cal: 352, emoji: '🌾' },
            { uz: 'Bulg\'ur', ru: 'Булгур', en: 'Bulgur', gi: 45, gl: 12, cal: 342, emoji: '🥣' },
            { uz: 'Kuskus', ru: 'Кускус', en: 'Couscous', gi: 65, gl: 14, cal: 112, emoji: '🥣' },
            { uz: 'Amarant', ru: 'Амарант', en: 'Amaranth', gi: 35, gl: 12, cal: 371, emoji: '🌾' },
            { uz: 'Mosh', ru: 'Маш', en: 'Mung Bean', gi: 25, gl: 8, cal: 347, emoji: '🍛' },
            { uz: 'Lobiya', ru: 'Фасоль', en: 'Common Bean', gi: 35, gl: 9, cal: 333, emoji: '🍛' }
        ],
        nuts: [
            { uz: 'Funtuk', ru: 'Фундук', en: 'Hazelnut', gi: 15, gl: 1, cal: 628, emoji: '🌰' },
            { uz: 'Keshju', ru: 'Кешью', en: 'Cashew', gi: 22, gl: 2, cal: 553, emoji: '🥜' },
            { uz: 'Kedr', ru: 'Кедровый орех', en: 'Pine Nut', gi: 15, gl: 1, cal: 673, emoji: '🌲' },
            { uz: 'Pekan', ru: 'Пекан', en: 'Pecan', gi: 15, gl: 1, cal: 691, emoji: '🌰' },
            { uz: 'Arxis', ru: 'Арахис', en: 'Peanut', gi: 14, gl: 1, cal: 567, emoji: '🥜' }
        ],
        dairy: [
            { uz: 'Ryajenka', ru: 'Ряженка', en: 'Ryazhenka', gi: 30, gl: 1, cal: 67, emoji: '🥛' },
            { uz: 'Ayron', ru: 'Айран', en: 'Ayran', gi: 15, gl: 1, cal: 24, emoji: '🥛' },
            { uz: 'Qatiq', ru: 'Катык', en: 'Katyk', gi: 20, gl: 1, cal: 56, emoji: '🍶' },
            { uz: 'Yogurt (Grecheskiy)', ru: 'Греческий йогурт', en: 'Greek Yogurt', gi: 20, gl: 1, cal: 59, emoji: '🍧' }
        ]
    };

    // Add all supplements
    Object.keys(categorySupplements).forEach(cat => {
        categorySupplements[cat].forEach(item => {
            extended.push({
                name: { uz: item.uz, ru: item.ru, en: item.en },
                category: cat,
                emoji: item.emoji,
                gi: item.gi,
                gl: item.gl,
                calories: item.cal,
                advice: {
                    uz: 'Foydali mahsulot.',
                    ru: 'Полезный продукт.',
                    en: 'Healthy product.'
                }
            });
        });
    });

    return extended;
};

const fullProducts = generateExtendedList();

const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(fullProducts);
      console.log(`✅ ${fullProducts.length} mahsulot muvaffaqiyatli yuklandi!`);
    } else {
      console.log('ℹ️ Mahsulotlar bazasi allaqachon to\'la.');
    }
  } catch (error) {
    console.error('❌ Seeding xatosi:', error);
  }
};

module.exports = seedProducts;
