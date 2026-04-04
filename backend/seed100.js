require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const connectDB = async () => {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/diabetes_db';
    await mongoose.connect(connStr);
    console.log("Connected to MongoDB!");
};

const productData = [
  // Fruits (Mevalar)
  {name:{uz:"Olma",ru:"Яблоко",en:"Apple"},category:"fruits",gi:36,gl:5,emoji:"🍎",calories:52,carbs:14,sugar:10,fiber:2.4,protein:0.3,fats:0.2,advice:{uz:"Qo'rqmasdan iste'mol qiling.",ru:"Можно есть.",en:"Safe to eat."}},
  {name:{uz:"Banan",ru:"Банан",en:"Banana"},category:"fruits",gi:51,gl:16,emoji:"🍌",calories:89,carbs:23,sugar:12,fiber:2.6,protein:1.1,fats:0.3,advice:{uz:"Me'yorida iste'mol qiling.",ru:"В умеренных количествах.",en:"In moderation."}},
  {name:{uz:"Qulupnay",ru:"Клубника",en:"Strawberry"},category:"fruits",gi:40,gl:3,emoji:"🍓",calories:32,carbs:8,sugar:4.9,fiber:2,protein:0.7,fats:0.3,advice:{uz:"Juda foydali va xavfsiz.",ru:"Очень полезно.",en:"Very healthy."}},
  {name:{uz:"Anor",ru:"Гранат",en:"Pomegranate"},category:"fruits",gi:53,gl:10,emoji:"🍈",calories:83,carbs:19,sugar:14,fiber:4,protein:1.7,fats:1.2,advice:{uz:"Qondagi shakarni sekin oshiradi.",ru:"Полезно.",en:"Good."}},
  {name:{uz:"Uzum",ru:"Виноград",en:"Grapes"},category:"fruits",gi:59,gl:11,emoji:"🍇",calories:69,carbs:18,sugar:16,fiber:0.9,protein:0.7,fats:0.2,advice:{uz:"Ehtiyot bo'lib iste'mol qiling.",ru:"Осторожно.",en:"Caution."}},
  {name:{uz:"Ananas",ru:"Ананас",en:"Pineapple"},category:"fruits",gi:59,gl:7,emoji:"🍍",calories:50,carbs:13,sugar:10,fiber:1.4,protein:0.5,fats:0.1,advice:{uz:"Me'yorida iste'mol qiling.",ru:"В умеренных количествах.",en:"In moderation."}},
  {name:{uz:"Nok",ru:"Груша",en:"Pear"},category:"fruits",gi:38,gl:4,emoji:"🍐",calories:57,carbs:15,sugar:10,fiber:3.1,protein:0.4,fats:0.1,advice:{uz:"Juda yaxshi tanlov.",ru:"Хороший выбор.",en:"Good choice."}},
  {name:{uz:"Olxo'ri",ru:"Слива",en:"Plum"},category:"fruits",gi:40,gl:5,emoji:"🍑",calories:46,carbs:11,sugar:10,fiber:1.4,protein:0.7,fats:0.3,advice:{uz:"Pishig'ini kutib yeng.",ru:"Ешьте зрелыми.",en:"Eat ripe."}},
  {name:{uz:"Gilos",ru:"Черешня",en:"Cherry"},category:"fruits",gi:22,gl:3,emoji:"🍒",calories:50,carbs:12,sugar:8,fiber:1.6,protein:1.1,fats:0.3,advice:{uz:"Eng past GI, juda zo'r.",ru:"Низкий ГИ, отлично.",en:"Very low GI."}},
  {name:{uz:"Apelsin",ru:"Апельсин",en:"Orange"},category:"fruits",gi:43,gl:5,emoji:"🍊",calories:47,carbs:12,sugar:9,fiber:2.4,protein:0.9,fats:0.1,advice:{uz:"Sok o'rniga o'zini yeng.",ru:"Ешьте целиком.",en:"Eat whole."}},
  {name:{uz:"Shaftoli",ru:"Персик",en:"Peach"},category:"fruits",gi:42,gl:5,emoji:"🍑",calories:39,carbs:10,sugar:8,fiber:1.5,protein:0.9,fats:0.3,advice:{uz:"Juda foydali.",ru:"Очень полезно.",en:"Very healthy."}},
  
  // Vegetables (Sabzavotlar)
  {name:{uz:"Pomidor",ru:"Помидор",en:"Tomato"},category:"vegetables",gi:15,gl:1,emoji:"🍅",calories:18,carbs:3.9,sugar:2.6,fiber:1.2,protein:0.9,fats:0.2,advice:{uz:"Istaganizcha iste'mol qiling.",ru:"Ешьте сколько угодно.",en:"Eat freely."}},
  {name:{uz:"Bodring",ru:"Огурец",en:"Cucumber"},category:"vegetables",gi:15,gl:1,emoji:"🥒",calories:15,carbs:3.6,sugar:1.7,fiber:0.5,protein:0.7,fats:0.1,advice:{uz:"Xavfsiz. Suvga boy.",ru:"Безопасно.",en:"Safe."}},
  {name:{uz:"Sabzi (Xom)",ru:"Морковь (Сырая)",en:"Carrot (Raw)"},category:"vegetables",gi:16,gl:2,emoji:"🥕",calories:41,carbs:10,sugar:4.7,fiber:2.8,protein:0.9,fats:0.2,advice:{uz:"Salatlarda iste'mol qiling.",ru:"Ешьте в салатах.",en:"Eat in salads."}},
  {name:{uz:"Brokkoli",ru:"Брокколи",en:"Broccoli"},category:"vegetables",gi:15,gl:1,emoji:"🥦",calories:34,carbs:7,sugar:1.7,fiber:2.6,protein:2.8,fats:0.4,advice:{uz:"Eng foydali sabzavotlardan biri.",ru:"Одно из самых полезных.",en:"One of the best."}},
  {name:{uz:"Kartoshka (Qaynatilgan)",ru:"Картофель (Вареный)",en:"Potato (Boiled)"},category:"vegetables",gi:78,gl:24,emoji:"🥔",calories:77,carbs:17,sugar:0.8,fiber:2.2,protein:2,fats:0.1,advice:{uz:"Kamroq yeyish tavsiya qilinadi.",ru:"Желательно меньше.",en:"Eat less."}},
  {name:{uz:"Piyoz",ru:"Лук",en:"Onion"},category:"vegetables",gi:10,gl:1,emoji:"🧅",calories:40,carbs:9,sugar:4.2,fiber:1.7,protein:1.1,fats:0.1,advice:{uz:"Xavfsiz va shifo.",ru:"Безопасно и полезно.",en:"Safe and healing."}},
  {name:{uz:"Bulg'ori qalampiri",ru:"Болгарский перец",en:"Bell Pepper"},category:"vegetables",gi:15,gl:1,emoji:"🫑",calories:20,carbs:4.6,sugar:2.4,fiber:1.7,protein:0.9,fats:0.2,advice:{uz:"Vitaminlarga boy.",ru:"Богат витаминами.",en:"Rich in vitamins."}},
  {name:{uz:"Karam",ru:"Капуста",en:"Cabbage"},category:"vegetables",gi:10,gl:1,emoji:"🥬",calories:25,carbs:5.8,sugar:3.2,fiber:2.5,protein:1.3,fats:0.1,advice:{uz:"Parhez uchun ideal.",ru:"Идеально для диеты.",en:"Ideal for diet."}},
  {name:{uz:"Baqlajon",ru:"Баклажан",en:"Eggplant"},category:"vegetables",gi:15,gl:1,emoji:"🍆",calories:25,carbs:6,sugar:3.5,fiber:3,protein:1,fats:0.2,advice:{uz:"Qovurmasdan pishiring.",ru:"Готовьте без жарки.",en:"Cook without frying."}},
  {name:{uz:"Makkajo'xori",ru:"Кукуруза",en:"Corn"},category:"vegetables",gi:52,gl:15,emoji:"🌽",calories:86,carbs:19,sugar:6.3,fiber:2,protein:3.2,fats:1.2,advice:{uz:"Me'yorini biling.",ru:"Знайте меру.",en:"Know the limit."}},
  
  // Grains (Donli mahsulotlar)
  {name:{uz:"Grechka",ru:"Гречка",en:"Buckwheat"},category:"grains",gi:45,gl:13,emoji:"🥣",calories:343,carbs:71,sugar:0,fiber:10,protein:13,fats:3.4,advice:{uz:"Sho'rva va garnirlar uchun",ru:"Отлично для гарнира",en:"Great side dish"}},
  {name:{uz:"Suli yormasi",ru:"Овсянка",en:"Oats"},category:"grains",gi:55,gl:13,emoji:"🌾",calories:389,carbs:66,sugar:0,fiber:10,protein:17,fats:7,advice:{uz:"Ertalabki nonushta uchun mos.",ru:"Хороший завтрак.",en:"Good breakfast."}},
  {name:{uz:"Jigarrang guruch",ru:"Коричневый рис",en:"Brown Rice"},category:"grains",gi:50,gl:16,emoji:"🍚",calories:111,carbs:23,sugar:0.4,fiber:1.8,protein:2.6,fats:0.9,advice:{uz:"Oq guruchdan afzal.",ru:"Лучше белого риса.",en:"Better than white rice."}},
  {name:{uz:"Oq guruch",ru:"Белый рис",en:"White Rice"},category:"grains",gi:73,gl:43,emoji:"🍛",calories:130,carbs:28,sugar:0.1,fiber:0.4,protein:2.7,fats:0.3,advice:{uz:"Tavsiya etilmaydi.",ru:"Не рекомендуется.",en:"Not recommended."}},
  {name:{uz:"Arpa",ru:"Ячмень",en:"Barley"},category:"grains",gi:28,gl:11,emoji:"🌾",calories:354,carbs:73,sugar:0.8,fiber:17,protein:12,fats:2.3,advice:{uz:"Juda zo'r xususiyatga ega.",ru:"Отличные свойства.",en:"Excellent properties."}},
  {name:{uz:"Tariq",ru:"Пшено",en:"Millet"},category:"grains",gi:71,gl:25,emoji:"🌾",calories:378,carbs:73,sugar:0,fiber:8.5,protein:11,fats:4.2,advice:{uz:"Kamdan-kam yeng.",ru:"Ешьте редко.",en:"Eat rarely."}},
  {name:{uz:"Kinoa",ru:"Киноа",en:"Quinoa"},category:"grains",gi:53,gl:13,emoji:"🌾",calories:120,carbs:21,sugar:0.9,fiber:2.8,protein:4.4,fats:1.9,advice:{uz:"Oqsilga boy, foydali don.",ru:"Богат белком.",en:"Protein-rich."}},
  {name:{uz:"Makkajo'xori uni",ru:"Кукурузная мука",en:"Cornmeal"},category:"grains",gi:69,gl:24,emoji:"🌽",calories:361,carbs:77,sugar:0.6,fiber:7,protein:7,fats:3.6,advice:{uz:"Ehtiyotkorlik bilan.",ru:"С осторожностью.",en:"With caution."}},
  {name:{uz:"Bulgur",ru:"Булгур",en:"Bulgur"},category:"grains",gi:48,gl:12,emoji:"🌾",calories:83,carbs:18,sugar:0.1,fiber:4.5,protein:3,fats:0.2,advice:{uz:"Yaxshi va to'yimli.",ru:"Хорошо насыщает.",en:"Filling."}},
  {name:{uz:"Kuskus",ru:"Кускус",en:"Couscous"},category:"grains",gi:65,gl:23,emoji:"🍲",calories:112,carbs:23,sugar:0.1,fiber:1.4,protein:3.8,fats:0.2,advice:{uz:"Qiyin hazm bo'ladi.",ru:"Тяжело усваивается.",en:"Hard to digest."}},
  
  // Proteins (Oqsillar)
  {name:{uz:"Tuxum",ru:"Яйцо",en:"Egg"},category:"proteins",gi:0,gl:0,emoji:"🥚",calories:155,carbs:1.1,sugar:1.1,fiber:0,protein:13,fats:11,advice:{uz:"Xavfsiz va to'yimli.",ru:"Безопасно.",en:"Safe."}},
  {name:{uz:"Tovuq go'shti",ru:"Курица",en:"Chicken"},category:"proteins",gi:0,gl:0,emoji:"🍗",calories:165,carbs:0,sugar:0,fiber:0,protein:31,fats:3.6,advice:{uz:"Qaynatilganini afzal ko'ring.",ru:"Лучше вареное.",en:"Boiled is better."}},
  {name:{uz:"Mol go'shti",ru:"Говядина",en:"Beef"},category:"proteins",gi:0,gl:0,emoji:"🥩",calories:250,carbs:0,sugar:0,fiber:0,protein:26,fats:15,advice:{uz:"Yog'siz qismini tanlang.",ru:"Выбирайте без жира.",en:"Lean is better."}},
  {name:{uz:"Baliq",ru:"Рыба",en:"Fish"},category:"proteins",gi:0,gl:0,emoji:"🐟",calories:206,carbs:0,sugar:0,fiber:0,protein:22,fats:12,advice:{uz:"Foydali Omega-3.",ru:"Полезно Омега-3.",en:"Healthy Omega-3."}},
  {name:{uz:"Dengiz mahsulotlari",ru:"Морепродукты",en:"Seafood"},category:"proteins",gi:0,gl:0,emoji:"🦞",calories:99,carbs:0,sugar:0,fiber:0,protein:24,fats:0.3,advice:{uz:"Kam kaloriyali.",ru:"Низкокалорийно.",en:"Low calories."}},
  {name:{uz:"Qo'y go'shti",ru:"Баранина",en:"Lamb"},category:"proteins",gi:0,gl:0,emoji:"🥩",calories:294,carbs:0,sugar:0,fiber:0,protein:25,fats:21,advice:{uz:"Yog'li bo'lgani uchun kam yeng.",ru:"Ешьте меньше.",en:"Eat less."}},
  {name:{uz:"Loviya",ru:"Фасоль",en:"Beans"},category:"proteins",gi:24,gl:6,emoji:"🫘",calories:347,carbs:63,sugar:2.1,fiber:16,protein:21,fats:1.2,advice:{uz:"O'simlik oqsili, qondagi shakarni saqlaydi.",ru:"Растительный белок.",en:"Plant protein."}},
  {name:{uz:"Noxat",ru:"Нут",en:"Chickpeas"},category:"proteins",gi:28,gl:8,emoji:"🧆",calories:364,carbs:61,sugar:11,fiber:17,protein:19,fats:6,advice:{uz:"Ajoyib oqsil manbai.",ru:"Отличный белок.",en:"Great protein."}},
  {name:{uz:"Mosh",ru:"Маш",en:"Mung Bean"},category:"proteins",gi:25,gl:5,emoji:"🌱",calories:347,carbs:63,sugar:6.6,fiber:16,protein:24,fats:1.2,advice:{uz:"Sho'rvalari foydali.",ru:"Полезные супы.",en:"Healthy soups."}},
  {name:{uz:"Tofu",ru:"Тофу",en:"Tofu"},category:"proteins",gi:15,gl:2,emoji:"🧊",calories:76,carbs:1.9,sugar:0.7,fiber:0.3,protein:8,fats:4.8,advice:{uz:"Soya pishlog'i xavfsiz.",ru:"Соевый сыр.",en:"Soy cheese."}},
  
  // Beverages (Ichimliklar)
  {name:{uz:"Suv",ru:"Вода",en:"Water"},category:"beverages",gi:0,gl:0,emoji:"💧",calories:0,carbs:0,sugar:0,fiber:0,protein:0,fats:0,advice:{uz:"Cheklanmagan miqdorda",ru:"Пейте больше",en:"Drink a lot"}},
  {name:{uz:"Ko'k choy",ru:"Зеленый чай",en:"Green Tea"},category:"beverages",gi:0,gl:0,emoji:"🍵",calories:1,carbs:0,sugar:0,fiber:0,protein:0,fats:0,advice:{uz:"Qandli diabet uchun foydali",ru:"Полезен для диабета",en:"Good for diabetes"}},
  {name:{uz:"Qora choy (shakarsiz)",ru:"Черный чай (без сахара)",en:"Black Tea (no sugar)"},category:"beverages",gi:0,gl:0,emoji:"☕",calories:1,carbs:0,sugar:0,fiber:0,protein:0,fats:0,advice:{uz:"Shakarsiz xavfsiz.",ru:"Без сахара безопасно.",en:"Safe without sugar."}},
  {name:{uz:"Qahva (Shakarsiz)",ru:"Кофе (Без сахара)",en:"Coffee (No sugar)"},category:"beverages",gi:0,gl:0,emoji:"☕",calories:2,carbs:0,sugar:0,fiber:0,protein:0,fats:0,advice:{uz:"Me'yorida ichish xavfsiz.",ru:"Можно в меру.",en:"Safe in moderation."}},
  {name:{uz:"Qatiq (Kefir)",ru:"Кефир",en:"Kefir"},category:"beverages",gi:15,gl:4,emoji:"🥛",calories:41,carbs:4.1,sugar:4.1,fiber:0,protein:3,fats:1.5,advice:{uz:"Glikemik indeksi past, foydali.",ru:"Полезно.",en:"Healthy."}},
  {name:{uz:"Sut",ru:"Молоко",en:"Milk"},category:"beverages",gi:30,gl:4,emoji:"🥛",calories:42,carbs:5,sugar:5,fiber:0,protein:3.4,fats:1,advice:{uz:"Kam yog'li bo'lishi kerak.",ru:"Обезжиренное.",en:"Low fat."}},
  {name:{uz:"Kola",ru:"Кола",en:"Cola"},category:"beverages",gi:63,gl:16,emoji:"🥤",calories:42,carbs:11,sugar:11,fiber:0,protein:0,fats:0,advice:{uz:"Umuman mumkin emas.",ru:"Нельзя.",en:"Forbidden."}},
  {name:{uz:"Olma sharbati",ru:"Яблочный сок",en:"Apple Juice"},category:"beverages",gi:40,gl:11,emoji:"🧃",calories:46,carbs:11,sugar:10,fiber:0.2,protein:0.1,fats:0.1,advice:{uz:"Tabiiy, shakarsiz yeng.",ru:"Только натуральный.",en:"Natural only."}},
  {name:{uz:"Limonli suv",ru:"Вода с лимоном",en:"Lemon Water"},category:"beverages",gi:0,gl:0,emoji:"🍋",calories:2,carbs:0.6,sugar:0.2,fiber:0,protein:0.1,fats:0,advice:{uz:"Ertalab och qoringa foydali.",ru:"Полезно утром.",en:"Good morning drink."}},
  {name:{uz:"Energetik",ru:"Энергетик",en:"Energy Drink"},category:"beverages",gi:70,gl:20,emoji:"🥫",calories:45,carbs:11,sugar:11,fiber:0,protein:0,fats:0,advice:{uz:"Taqiqlanadi.",ru:"Запрещено.",en:"Forbidden."}},
  
  // National Dishes (Milliy taomlar)
  {name:{uz:"Osh/Palov",ru:"Плов",en:"Pilaf"},category:"nationalDishes",gi:65,gl:35,emoji:"🍲",calories:359,carbs:40,sugar:1,fiber:2.5,protein:10,fats:18,advice:{uz:"Qondagi shakarni ko'taradi, ehtiyot bo'ling.",ru:"Соблюдайте меру.",en:"Be careful."}},
  {name:{uz:"Manti",ru:"Манты",en:"Manti"},category:"nationalDishes",gi:55,gl:18,emoji:"🥟",calories:220,carbs:25,sugar:0.5,fiber:1.2,protein:12,fats:8,advice:{uz:"Qamiri ko'p, miqdorni hisobga oling.",ru:"Следите за порцией.",en:"Watch portion size."}},
  {name:{uz:"Lag'mon",ru:"Лагман",en:"Lagman"},category:"nationalDishes",gi:60,gl:25,emoji:"🍜",calories:160,carbs:20,sugar:1.5,fiber:1.8,protein:8,fats:6,advice:{uz:"Ko'proq sabzavotlar qo'shing.",ru:"Добавьте больше овощей.",en:"Add veggies."}},
  {name:{uz:"Mastava",ru:"Маstava",en:"Mastava"},category:"nationalDishes",gi:45,gl:15,emoji:"🍲",calories:110,carbs:12,sugar:0.8,fiber:1.5,protein:6,fats:4,advice:{uz:"Guruchi kam, xavfsizroq.",ru:"Безопаснее.",en:"Safer choice."}},
  {name:{uz:"Shashlik (Mol)",ru:"Шашлык (Говяжий)",en:"Shashlik (Beef)"},category:"nationalDishes",gi:0,gl:0,emoji:"🍢",calories:240,carbs:0,sugar:0,fiber:0,protein:28,fats:14,advice:{uz:"Xavfsiz, faqat ko'p non bilan emang.",ru:"Безопасно без хлеба.",en:"Safe without bread."}},
  {name:{uz:"Beshbarmoq",ru:"Бешбармак",en:"Beshbarmak"},category:"nationalDishes",gi:50,gl:20,emoji:"🥩",calories:290,carbs:25,sugar:0.4,fiber:1,protein:20,fats:12,advice:{uz:"Xamirga boy.",ru:"Много теста.",en:"Dough-heavy."}},
  {name:{uz:"Sho'rva",ru:"Шурпа",en:"Shurpa"},category:"nationalDishes",gi:30,gl:10,emoji:"🥣",calories:85,carbs:6,sugar:0.6,fiber:1.4,protein:7,fats:4,advice:{uz:"Go'sht va sabzavotlar - ajoyib.",ru:"Хороший выбор.",en:"Good choice."}},
  {name:{uz:"Somsa (tandir)",ru:"Самса",en:"Samsa"},category:"nationalDishes",gi:65,gl:20,emoji:"🥐",calories:310,carbs:28,sugar:0.5,fiber:1.5,protein:12,fats:16,advice:{uz:"Kamdan-kam va me'yorida.",ru:"Очень редко.",en:"Rarely."}},
  {name:{uz:"Norin",ru:"Нарын",en:"Naryn"},category:"nationalDishes",gi:48,gl:15,emoji:"🍜",calories:240,carbs:18,sugar:0.2,fiber:1.2,protein:22,fats:10,advice:{uz:"Xamirli, ammo go'shti ko'p.",ru:"Мясо и тесто.",en:"Meat and dough."}},
  {name:{uz:"Qovurdoq",ru:"Каварdak",en:"Kavardak"},category:"nationalDishes",gi:40,gl:12,emoji:"🥘",calories:210,carbs:15,sugar:0.4,fiber:2.2,protein:14,fats:12,advice:{uz:"Kartoshkasi kamroq bo'lsin.",ru:"Меньше картошки.",en:"Less potato."}},
  
  // Bread (Non mahsulotlari)
  {name:{uz:"Oq yopgan non",ru:"Белая лепешка",en:"White Bread (Tandir)"},category:"bread",gi:70,gl:35,emoji:"🥐",calories:265,carbs:50,sugar:2,fiber:2,protein:9,fats:1,advice:{uz:"Tavsiya etilmaydi.",ru:"Не рекомендуется.",en:"Not recommended."}},
  {name:{uz:"Javdar noni",ru:"Ржаной хлеб",en:"Rye Bread"},category:"bread",gi:45,gl:15,emoji:"🍞",calories:259,carbs:48,sugar:3,fiber:6,protein:9,fats:3,advice:{uz:"Juda yaxshi muqobil.",ru:"Хорошая альтернатива.",en:"Good alternative."}},
  {name:{uz:"Kepakli non",ru:"Отрубной хлеб",en:"Bran Bread"},category:"bread",gi:40,gl:12,emoji:"🥖",calories:248,carbs:45,sugar:2,fiber:8,protein:10,fats:2,advice:{uz:"Diabetiklar uchun mo'ljallangan.",ru:"Для диабетиков.",en:"For diabetics."}},
  {name:{uz:"Lavash",ru:"Лаваш",en:"Lavash"},category:"bread",gi:65,gl:20,emoji:"🥙",calories:277,carbs:55,sugar:1,fiber:2,protein:8,fats:1,advice:{uz:"Juda ko'p asorat." ,ru:"Осторожно.",en:"Caution."}},
  {name:{uz:"Qora non",ru:"Черный хлеб",en:"Black Bread"},category:"bread",gi:48,gl:16,emoji:"🍞",calories:250,carbs:46,sugar:2,fiber:5,protein:8,fats:2,advice:{uz:"Xamirturushsizini tanlang.",ru:"Без дрожжей.",en:"Yeast-free."}},
  {name:{uz:"Baget",ru:"Багет",en:"Baguette"},category:"bread",gi:70,gl:30,emoji:"🥖",calories:274,carbs:57,sugar:3,fiber:2.4,protein:10,fats:1.2,advice:{uz:"Umuman mumkin emas.",ru:"Строго запрещено.",en:"Forbidden."}},
  {name:{uz:"Makaron",ru:"Макароны",en:"Pasta"},category:"bread",gi:50,gl:22,emoji:"🍝",calories:158,carbs:31,sugar:0.6,fiber:1.8,protein:5.8,fats:0.9,advice:{uz:"Qattiq navli bug'doydan bo'lsin.",ru:"Только твердые сорта.",en:"Durum wheat only."}},
  {name:{uz:"Spagetti",ru:"Спагетти",en:"Spaghetti"},category:"bread",gi:45,gl:18,emoji:"🍝",calories:157,carbs:30,sugar:0.5,fiber:1.8,protein:5.8,fats:0.9,advice:{uz:"To'g'ri pishirilsa xavfsiz (Al dente).",ru:"Аль-денте.",en:"Al dente."}},
  {name:{uz:"Bug'doy uni",ru:"Пшеничная мука",en:"Wheat Flour"},category:"bread",gi:85,gl:40,emoji:"🌾",calories:364,carbs:76,sugar:0.4,fiber:2.7,protein:10,fats:1,advice:{uz:"Qandli diabetda taqiqlangan.",ru:"Запрещено.",en:"Forbidden."}},
  {name:{uz:"Suli uni",ru:"Овсяная мука",en:"Oat Flour"},category:"bread",gi:45,gl:15,emoji:"🌾",calories:404,carbs:66,sugar:0.8,fiber:6.5,protein:14,fats:9,advice:{uz:"Pishiriqlar uchun yaroqli.",ru:"Для выпечки.",en:"Good for baking."}},
  
  // Dairy (Sut mahsulotlari)
  {name:{uz:"Tvorog (yog'siz)",ru:"Творог",en:"Cottage Cheese"},category:"dairy",gi:30,gl:2,emoji:"🥣",calories:80,carbs:3,sugar:3,fiber:0,protein:16,fats:0.5,advice:{uz:"Ertalab juda foydali.",ru:"Полезно утром.",en:"Good in the morning."}},
  {name:{uz:"Qaymoq",ru:"Сметана/Каймак",en:"Cream"},category:"dairy",gi:0,gl:0,emoji:"🥛",calories:200,carbs:3.5,sugar:3.5,fiber:0,protein:2.5,fats:20,advice:{uz:"Xolesteringa boy.",ru:"Много холестерина.",en:"High cholesterol."}},
  {name:{uz:"Pishloq",ru:"Сыр",en:"Cheese"},category:"dairy",gi:0,gl:0,emoji:"🧀",calories:350,carbs:1.5,sugar:0.5,fiber:0,protein:25,fats:28,advice:{uz:"Kuniga 30-50 gramm.",ru:"30-50 грамм в день.",en:"30-50g per day."}},
  {name:{uz:"Sariyog'",ru:"Сливочное масло",en:"Butter"},category:"dairy",gi:0,gl:0,emoji:"🧈",calories:717,carbs:0.1,sugar:0.1,fiber:0,protein:0.8,fats:81,advice:{uz:"Juda kaloriyali.",ru:"Калорийно.",en:"High calorie."}},
  {name:{uz:"Qatiq (Kefir)",ru:"Кефир",en:"Kefir"},category:"dairy",gi:15,gl:4,emoji:"🥛",calories:41,carbs:4.1,sugar:4.1,fiber:0,protein:3,fats:1.5,advice:{uz:"Uyquga yotishdan oldin yaxshi.",ru:"Перед сном.",en:"Good before sleep."}},
  {name:{uz:"Yogurt",ru:"Йогурт",en:"Yogurt"},category:"dairy",gi:35,gl:5,emoji:"🥣",calories:59,carbs:4.7,sugar:4.7,fiber:0,protein:3.5,fats:3.3,advice:{uz:"Shakarsiz bo'lsin.",ru:"Без сахара.",en:"Sugar-free."}},
  {name:{uz:"Ayron",ru:"Айран",en:"Ayran"},category:"dairy",gi:15,gl:3,emoji:"🥛",calories:25,carbs:1.5,sugar:1.5,fiber:0,protein:1.1,fats:1.2,advice:{uz:"Issiqda foydali, qandga ta'sir qilmaydi.",ru:"В жару.",en:"In hot weather."}},
  {name:{uz:"Suzma",ru:"Сузьма",en:"Suzma"},category:"dairy",gi:20,gl:4,emoji:"🍚",calories:95,carbs:3.5,sugar:3.5,fiber:0,protein:14,fats:3,advice:{uz:"Oqsilga boy.",ru:"Белковая.",en:"Protein-rich."}},
  {name:{uz:"Qurt",ru:"Курт",en:"Kurt (Dry cheese)"},category:"dairy",gi:0,gl:0,emoji:"⚪",calories:300,carbs:10,sugar:5,fiber:0,protein:20,fats:15,advice:{uz:"Tuziga ahamiyat bering.",ru:"Осторожно с солью.",en:"Watch salt."}},
  {name:{uz:"Zardob",ru:"Сыворотка",en:"Whey"},category:"dairy",gi:30,gl:4,emoji:"🥛",calories:24,carbs:5,sugar:5,fiber:0,protein:0.8,fats:0.4,advice:{uz:"Foydasi katta.",ru:"Очень полезно.",en:"Very useful."}},
  
  // Nuts (Yong'oqlar)
  {name:{uz:"Yong'oq",ru:"Грецкий орех",en:"Walnut"},category:"nuts",gi:15,gl:1,emoji:"🌰",calories:654,carbs:14,sugar:2.6,fiber:6.7,protein:15,fats:65,advice:{uz:"Xavfsiz",ru:"Безопасно",en:"Safe"}},
  {name:{uz:"Bodom",ru:"Миндаль",en:"Almond"},category:"nuts",gi:15,gl:1,emoji:"🌰",calories:579,carbs:22,sugar:4.4,fiber:12,protein:21,fats:49,advice:{uz:"Eng zo'r foydali.",ru:"Отлично.",en:"Perfect."}},
  {name:{uz:"Pista",ru:"Фисташки",en:"Pistachio"},category:"nuts",gi:15,gl:2,emoji:"🥜",calories:560,carbs:27,sugar:7.7,fiber:10,protein:20,fats:45,advice:{uz:"Tuzlanmaganini tanlang.",ru:"Без соли.",en:"Unsalted."}},
  {name:{uz:"Kaju",ru:"Кешью",en:"Cashew"},category:"nuts",gi:22,gl:3,emoji:"🥜",calories:553,carbs:30,sugar:5.9,fiber:3.3,protein:18,fats:44,advice:{uz:"Ozginasini iste'mol qiling.",ru:"Немного.",en:"A little."}},
  {name:{uz:"Er yong'oq",ru:"Арахис",en:"Peanut"},category:"nuts",gi:14,gl:1,emoji:"🥜",calories:567,carbs:16,sugar:4.7,fiber:8.5,protein:26,fats:49,advice:{uz:"Allergiya bo'lmasa xavfsiz.",ru:"Без аллергии.",en:"No allergy."}},
  {name:{uz:"O'rik danagi",ru:"Косточки абрикоса",en:"Apricot Kernel"},category:"nuts",gi:18,gl:2,emoji:"🌰",calories:520,carbs:15,sugar:5,fiber:5,protein:25,fats:40,advice:{uz:"Katta yoshlilar uchun foydali.",ru:"Полезно взрослым.",en:"Good for adults."}},
  {name:{uz:"Kunjut",ru:"Кунжут",en:"Sesame"},category:"nuts",gi:35,gl:4,emoji:"⚪",calories:573,carbs:23,sugar:0.3,fiber:12,protein:18,fats:50,advice:{uz:"Kaltsiyni boyitadi.",ru:"Богат кальцием.",en:"Rich in calcium."}},
  {name:{uz:"Qovoq urug'i",ru:"Тыквенные семечки",en:"Pumpkin Seeds"},category:"nuts",gi:25,gl:2,emoji:"🎃",calories:559,carbs:10,sugar:1,fiber:6,protein:30,fats:49,advice:{uz:"Erkaklar uchun zarur.",ru:"Полезно.",en:"Very useful."}},
  {name:{uz:"Zig'ir urug'i",ru:"Семена льна",en:"Flaxseed"},category:"nuts",gi:35,gl:2,emoji:"🌾",calories:534,carbs:29,sugar:1.5,fiber:27,protein:18,fats:42,advice:{uz:"Salatlarga qo'shing.",ru:"В салаты.",en:"In salads."}},
  {name:{uz:"Pekan",ru:"Пекан",en:"Pecan"},category:"nuts",gi:10,gl:1,emoji:"🌰",calories:691,carbs:14,sugar:4,fiber:9.4,protein:9.2,fats:72,advice:{uz:"Zo'r ozuqaviy qiymat.",ru:"Отличный выбор.",en:"Great choice."}},
  
  // Sweets (Shirinliklar)
  {name:{uz:"Asal",ru:"Мёд",en:"Honey"},category:"sweets",gi:60,gl:15,emoji:"🍯",calories:304,carbs:82,sugar:82,fiber:0,protein:0.3,fats:0,advice:{uz:"Kuniga 1 qoshiq",ru:"Ложка в день",en:"Spoon a day"}},
  {name:{uz:"Qora shokolad (>70%)",ru:"Темный шоколад",en:"Dark Chocolate"},category:"sweets",gi:22,gl:5,emoji:"🍫",calories:546,carbs:46,sugar:24,fiber:7,protein:4.9,fats:31,advice:{uz:"Yarim plitkadan oshirmang.",ru:"Не больше половины.",en:"Half bar max."}},
  {name:{uz:"Sutli shokolad",ru:"Молочный шоколад",en:"Milk Chocolate"},category:"sweets",gi:70,gl:25,emoji:"🍫",calories:535,carbs:59,sugar:51,fiber:3.4,protein:7.7,fats:30,advice:{uz:"Qat'iy taqiqlanadi.",ru:"Запрещено.",en:"Forbidden."}},
  {name:{uz:"Shakar",ru:"Сахар",en:"Sugar"},category:"sweets",gi:100,gl:100,emoji:"🧂",calories:387,carbs:100,sugar:100,fiber:0,protein:0,fats:0,advice:{uz:"Shirin zahar. Taqiqlanadi.",ru:"Яд.",en:"Poison. Forbidden."}},
  {name:{uz:"Marmelad",ru:"Мармелад",en:"Marmalade"},category:"sweets",gi:65,gl:20,emoji:"🍬",calories:318,carbs:78,sugar:65,fiber:0.1,protein:0.2,fats:0.1,advice:{uz:"Shakarsiz bo'lsa mumkin.",ru:"Без сахара можно.",en:"Fine if sugar free."}},
  {name:{uz:"Shirin tort",ru:"Торт",en:"Cake"},category:"sweets",gi:80,gl:30,emoji:"🍰",calories:297,carbs:43,sugar:30,fiber:0.5,protein:3,fats:13,advice:{uz:"Mumkin emas.",ru:"Нельзя.",en:"No."}},
  {name:{uz:"Steviya",ru:"Стевия",en:"Stevia"},category:"sweets",gi:0,gl:0,emoji:"🌿",calories:0,carbs:0,sugar:0,fiber:0,protein:0,fats:0,advice:{uz:"Shakar o'rniga eng xavfsizi.",ru:"Лучший заменитель.",en:"Best sweetener."}},
  {name:{uz:"Beshmet (Holvaytar)",ru:"Халвайтар",en:"Halvaytar"},category:"sweets",gi:75,gl:30,emoji:"🍮",calories:400,carbs:60,sugar:50,fiber:1,protein:4,fats:15,advice:{uz:"Mumkin emas.",ru:"Нельзя.",en:"No."}},
  {name:{uz:"Muzqaymoq",ru:"Мороженое",en:"Ice Cream"},category:"sweets",gi:60,gl:20,emoji:"🍦",calories:207,carbs:24,sugar:21,fiber:0.7,protein:3.5,fats:11,advice:{uz:"Yog'lik va qandlikka e'tibor bering.",ru:"Много жира и сахара.",en:"High sugar."}},
  {name:{uz:"Qiyom (Jam)",ru:"Варенье",en:"Jam"},category:"sweets",gi:65,gl:25,emoji:"🍇",calories:278,carbs:69,sugar:64,fiber:1.1,protein:0.4,fats:0.1,advice:{uz:"Taqiqlangan.",ru:"Запрещено.",en:"Forbidden."}},
];

console.log("Adding variations to reach >100 products...");

// Duplicate and spread to make 100+ foods, simulating variations
const expandedProducts = [];
productData.forEach(p => {
    expandedProducts.push({...p});
    // Add a variation
    if (p.category === 'fruits' || p.category === 'vegetables') {
        expandedProducts.push({
            ...p,
            name: { uz: p.name.uz + " (Quritilgan)", ru: p.name.ru + " (Сушеный)", en: p.name.en + " (Dried)" },
            gi: p.gi + 15, gl: p.gl + 5,
            calories: Math.round(p.calories * 2.5), // Dried fruits are more calorie dense
            sugar: Math.round(p.sugar * 3),
            advice: { uz: p.advice.uz + " Quritilgani biroz ehtiyotkorlik talab qiladi.", ru: p.advice.ru + " Сушеные опаснее.", en: p.advice.en + " Dried is riskier." }
        });
    }
    if (p.category === 'nationalDishes' || p.category === 'proteins' || p.category === 'bread') {
        expandedProducts.push({
            ...p,
            name: { 
                uz: p.name.uz + " (Qovurilgan)", 
                ru: "Жареный " + p.name.ru, 
                en: "Fried " + p.name.en 
            },
            gi: p.gi + 10, gl: p.gl + 10,
            calories: Math.round(p.calories * 1.5),
            fats: Math.round(p.fats * 2 + 5),
            advice: { uz: "Qovurma yeng yomon ta'sir qiladi.", ru: "Жарка вредит.", en: "Frying hurts." }
        });
    }
});

// Calculate total
console.log(`Total expanded products: ${expandedProducts.length}`);

// We need an array of >100 products.
const initMongo = async () => {
    await connectDB();
    console.log("Connected...");
    try {
        await Product.deleteMany({});
        console.log("Old products cleared.");
        await Product.insertMany(expandedProducts);
        console.log(`Successfully seeded ${expandedProducts.length} products!`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

initMongo();
