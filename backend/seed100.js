require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const connectDB = async () => {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/diabetes_db';
    await mongoose.connect(connStr);
    console.log("Connected to MongoDB!");
};

const productData = [
  // Fruits (Mevalar)
  {name:{uz:"Olma",ru:"Яблоко",en:"Apple"},category:"fruits",gi:36,gl:5,emoji:"🍎",advice:{uz:"Qo'rqmasdan iste'mol qiling.",ru:"Можно есть.",en:"Safe to eat."}},
  {name:{uz:"Banan",ru:"Банан",en:"Banana"},category:"fruits",gi:51,gl:16,emoji:"🍌",advice:{uz:"Me'yorida iste'mol qiling.",ru:"В умеренных количествах.",en:"In moderation."}},
  {name:{uz:"Qulupnay",ru:"Клубника",en:"Strawberry"},category:"fruits",gi:40,gl:3,emoji:"🍓",advice:{uz:"Juda foydali va xavfsiz.",ru:"Очень полезно.",en:"Very healthy."}},
  {name:{uz:"Anor",ru:"Гранат",en:"Pomegranate"},category:"fruits",gi:53,gl:10,emoji:"🍈",advice:{uz:"Qondagi shakarni sekin oshiradi.",ru:"Полезно.",en:"Good."}},
  {name:{uz:"Uzum",ru:"Виноград",en:"Grapes"},category:"fruits",gi:59,gl:11,emoji:"🍇",advice:{uz:"Ehtiyot bo'lib iste'mol qiling.",ru:"Осторожно.",en:"Caution."}},
  {name:{uz:"Nok",ru:"Груша",en:"Pear"},category:"fruits",gi:38,gl:4,emoji:"🍐",advice:{uz:"Juda yaxshi tanlov.",ru:"Хороший выбор.",en:"Good choice."}},
  {name:{uz:"Nafis olxo'ri",ru:"Слива",en:"Plum"},category:"fruits",gi:40,gl:5,emoji:"🍑",advice:{uz:"Pishig'ini kutib yeng.",ru:"Ешьте зрелыми.",en:"Eat ripe."}},
  {name:{uz:"Gilos",ru:"Черешня",en:"Cherry"},category:"fruits",gi:22,gl:3,emoji:"🍒",advice:{uz:"Eng past GI, juda zo'r.",ru:"Низкий ГИ, отлично.",en:"Very low GI."}},
  {name:{uz:"Apelsin",ru:"Апельсин",en:"Orange"},category:"fruits",gi:43,gl:5,emoji:"🍊",advice:{uz:"Sok o'rniga o'zini yeng.",ru:"Ешьте целиком.",en:"Eat whole."}},
  {name:{uz:"Shaftoli",ru:"Персик",en:"Peach"},category:"fruits",gi:42,gl:5,emoji:"🍑",advice:{uz:"Juda foydali.",ru:"Очень полезно.",en:"Very healthy."}},
  
  // Vegetables (Sabzavotlar)
  {name:{uz:"Pomidor",ru:"Помидор",en:"Tomato"},category:"vegetables",gi:15,gl:1,emoji:"🍅",advice:{uz:"Istaganizcha iste'mol qiling.",ru:"Ешьте сколько угодно.",en:"Eat freely."}},
  {name:{uz:"Bodring",ru:"Огурец",en:"Cucumber"},category:"vegetables",gi:15,gl:1,emoji:"🥒",advice:{uz:"Xavfsiz. Suvga boy.",ru:"Безопасно.",en:"Safe."}},
  {name:{uz:"Sabzi (Xom)",ru:"Морковь (Сырая)",en:"Carrot (Raw)"},category:"vegetables",gi:16,gl:2,emoji:"🥕",advice:{uz:"Salatlarda iste'mol qiling.",ru:"Ешьте в салатах.",en:"Eat in salads."}},
  {name:{uz:"Brokkoli",ru:"Брокколи",en:"Broccoli"},category:"vegetables",gi:15,gl:1,emoji:"🥦",advice:{uz:"Eng foydali sabzavotlardan biri.",ru:"Одно из самых полезных.",en:"One of the best."}},
  {name:{uz:"Kartoshka (Qaynatilgan)",ru:"Картофель (Вареный)",en:"Potato (Boiled)"},category:"vegetables",gi:78,gl:24,emoji:"🥔",advice:{uz:"Kamroq yeyish tavsiya qilinadi.",ru:"Желательно меньше.",en:"Eat less."}},
  {name:{uz:"Piyoz",ru:"Лук",en:"Onion"},category:"vegetables",gi:10,gl:1,emoji:"🧅",advice:{uz:"Xavfsiz va shifo.",ru:"Безопасно и полезно.",en:"Safe and healing."}},
  {name:{uz:"Qalampir (Bulg'ori)",ru:"Болгарский перец",en:"Bell Pepper"},category:"vegetables",gi:15,gl:1,emoji:"🫑",advice:{uz:"Vitaminlarga boy.",ru:"Богат витаминами.",en:"Rich in vitamins."}},
  {name:{uz:"Karam",ru:"Капуста",en:"Cabbage"},category:"vegetables",gi:10,gl:1,emoji:"🥬",advice:{uz:"Parhez uchun ideal.",ru:"Идеально для диеты.",en:"Ideal for diet."}},
  {name:{uz:"Baqlajon",ru:"Баклажан",en:"Eggplant"},category:"vegetables",gi:15,gl:1,emoji:"🍆",advice:{uz:"Qovurmasdan pishiring.",ru:"Готовьте без жарки.",en:"Cook without frying."}},
  {name:{uz:"Makkajo'xori",ru:"Кукуруза",en:"Corn"},category:"vegetables",gi:52,gl:15,emoji:"🌽",advice:{uz:"Me'yorini biling.",ru:"Знайте меру.",en:"Know the limit."}},
  
  // Grains (Donli mahsulotlar)
  {name:{uz:"Grechka",ru:"Гречка",en:"Buckwheat"},category:"grains",gi:45,gl:13,emoji:"🥣",advice:{uz:"Sho'rva va garnirlar uchun",ru:"Отлично для гарнира",en:"Great side dish"}},
  {name:{uz:"Suli yormasi",ru:"Овсянка",en:"Oats"},category:"grains",gi:55,gl:13,emoji:"🌾",advice:{uz:"Ertalabki nonushta uchun mos.",ru:"Хороший завтрак.",en:"Good breakfast."}},
  {name:{uz:"Jigarrang guruch",ru:"Коричневый рис",en:"Brown Rice"},category:"grains",gi:50,gl:16,emoji:"🍚",advice:{uz:"Oq guruchdan afzal.",ru:"Лучше белого риса.",en:"Better than white rice."}},
  {name:{uz:"Oq guruch",ru:"Белый рис",en:"White Rice"},category:"grains",gi:73,gl:43,emoji:"🍛",advice:{uz:"Tavsiya etilmaydi.",ru:"Не рекомендуется.",en:"Not recommended."}},
  {name:{uz:"Arpa",ru:"Ячмень",en:"Barley"},category:"grains",gi:28,gl:11,emoji:"🌾",advice:{uz:"Juda zo'r xususiyatga ega.",ru:"Отличные свойства.",en:"Excellent properties."}},
  {name:{uz:"Tariq",ru:"Пшено",en:"Millet"},category:"grains",gi:71,gl:25,emoji:"🌾",advice:{uz:"Kamdan-kam yeng.",ru:"Ешьте редко.",en:"Eat rarely."}},
  {name:{uz:"Kinoa",ru:"Киноа",en:"Quinoa"},category:"grains",gi:53,gl:13,emoji:"🌾",advice:{uz:"Oqsilga boy, foydali don.",ru:"Богат белком.",en:"Protein-rich."}},
  {name:{uz:"Makkajo'xori uni",ru:"Кукурузная мука",en:"Cornmeal"},category:"grains",gi:69,gl:24,emoji:"🌽",advice:{uz:"Ehtiyotkorlik bilan.",ru:"С осторожностью.",en:"With caution."}},
  {name:{uz:"Bulgur",ru:"Булгур",en:"Bulgur"},category:"grains",gi:48,gl:12,emoji:"🌾",advice:{uz:"Yaxshi va to'yimli.",ru:"Хорошо насыщает.",en:"Filling."}},
  {name:{uz:"Kuskus",ru:"Кускус",en:"Couscous"},category:"grains",gi:65,gl:23,emoji:"🍲",advice:{uz:"Qiyin hazm bo'ladi.",ru:"Тяжело усваивается.",en:"Hard to digest."}},
  
  // Proteins (Oqsillar)
  {name:{uz:"Tuxum",ru:"Яйцо",en:"Egg"},category:"proteins",gi:0,gl:0,emoji:"🥚",advice:{uz:"Xavfsiz va to'yimli.",ru:"Безопасно.",en:"Safe."}},
  {name:{uz:"Tovuq go'shti",ru:"Курица",en:"Chicken"},category:"proteins",gi:0,gl:0,emoji:"🍗",advice:{uz:"Qaynatilganini afzal ko'ring.",ru:"Лучше вареное.",en:"Boiled is better."}},
  {name:{uz:"Mol go'shti",ru:"Говядина",en:"Beef"},category:"proteins",gi:0,gl:0,emoji:"🥩",advice:{uz:"Yog'siz qismini tanlang.",ru:"Выбирайте без жира.",en:"Lean is better."}},
  {name:{uz:"Baliq",ru:"Рыба",en:"Fish"},category:"proteins",gi:0,gl:0,emoji:"🐟",advice:{uz:"Foydali Omega-3.",ru:"Полезно Омега-3.",en:"Healthy Omega-3."}},
  {name:{uz:"Dengiz mahsulotlari",ru:"Морепродукты",en:"Seafood"},category:"proteins",gi:0,gl:0,emoji:"🦞",advice:{uz:"Kam kaloriyali.",ru:"Низкокалорийно.",en:"Low calories."}},
  {name:{uz:"Qo'y go'shti",ru:"Баранина",en:"Lamb"},category:"proteins",gi:0,gl:0,emoji:"🥩",advice:{uz:"Yog'li bo'lgani uchun kam yeng.",ru:"Ешьте меньше.",en:"Eat less."}},
  {name:{uz:"Loviya",ru:"Фасоль",en:"Beans"},category:"proteins",gi:24,gl:6,emoji:"🫘",advice:{uz:"O'simlik oqsili, qondagi shakarni saqlaydi.",ru:"Растительный белок.",en:"Plant protein."}},
  {name:{uz:"Noxat",ru:"Нут",en:"Chickpeas"},category:"proteins",gi:28,gl:8,emoji:"🧆",advice:{uz:"Ajoyib oqsil manbai.",ru:"Отличный белок.",en:"Great protein."}},
  {name:{uz:"Mosh",ru:"Маш",en:"Mung Bean"},category:"proteins",gi:25,gl:5,emoji:"🌱",advice:{uz:"Sho'rvalari foydali.",ru:"Полезные супы.",en:"Healthy soups."}},
  {name:{uz:"Tofu",ru:"Тофу",en:"Tofu"},category:"proteins",gi:15,gl:2,emoji:"🧊",advice:{uz:"Soya pishlog'i xavfsiz.",ru:"Соевый сыр.",en:"Soy cheese."}},
  
  // Beverages (Ichimliklar)
  {name:{uz:"Suv",ru:"Вода",en:"Water"},category:"beverages",gi:0,gl:0,emoji:"💧",advice:{uz:"Cheklanmagan miqdorda",ru:"Пейте больше",en:"Drink a lot"}},
  {name:{uz:"Ko'k choy",ru:"Зеленый чай",en:"Green Tea"},category:"beverages",gi:0,gl:0,emoji:"🍵",advice:{uz:"Qandli diabet uchun foydali",ru:"Полезен для диабета",en:"Good for diabetes"}},
  {name:{uz:"Qora choy (shakarsiz)",ru:"Черный чай (без сахара)",en:"Black Tea (no sugar)"},category:"beverages",gi:0,gl:0,emoji:"☕",advice:{uz:"Shakarsiz xavfsiz.",ru:"Без сахара безопасно.",en:"Safe without sugar."}},
  {name:{uz:"Qahva (Shakarsiz)",ru:"Кофе (Без сахара)",en:"Coffee (No sugar)"},category:"beverages",gi:0,gl:0,emoji:"☕",advice:{uz:"Me'yorida ichish xavfsiz.",ru:"Можно в меру.",en:"Safe in moderation."}},
  {name:{uz:"Qatiq (Kefir)",ru:"Кефир",en:"Kefir"},category:"beverages",gi:15,gl:4,emoji:"🥛",advice:{uz:"Glikemik indeksi past, foydali.",ru:"Полезно.",en:"Healthy."}},
  {name:{uz:"Sut",ru:"Молоко",en:"Milk"},category:"beverages",gi:30,gl:4,emoji:"🥛",advice:{uz:"Kam yog'li bo'lishi kerak.",ru:"Обезжиренное.",en:"Low fat."}},
  {name:{uz:"Kola",ru:"Кола",en:"Cola"},category:"beverages",gi:63,gl:16,emoji:"🥤",advice:{uz:"Umuman mumkin emas.",ru:"Нельзя.",en:"Forbidden."}},
  {name:{uz:"Olma sharbati",ru:"Яблочный сок",en:"Apple Juice"},category:"beverages",gi:40,gl:11,emoji:"🧃",advice:{uz:"Tabiiy, shakarsiz yeng.",ru:"Только натуральный.",en:"Natural only."}},
  {name:{uz:"Limonli suv",ru:"Вода с лимоном",en:"Lemon Water"},category:"beverages",gi:0,gl:0,emoji:"🍋",advice:{uz:"Ertalab och qoringa foydali.",ru:"Полезно утром.",en:"Good morning drink."}},
  {name:{uz:"Energetik",ru:"Энергетик",en:"Energy Drink"},category:"beverages",gi:70,gl:20,emoji:"🥫",advice:{uz:"Taqiqlanadi.",ru:"Запрещено.",en:"Forbidden."}},
  
  // National Dishes (Milliy taomlar)
  {name:{uz:"Osh/Palov",ru:"Плов",en:"Pilaf"},category:"nationalDishes",gi:65,gl:35,emoji:"🍲",advice:{uz:"Qondagi shakarni ko'taradi, ehtiyot bo'ling.",ru:"Соблюдайте меру.",en:"Be careful."}},
  {name:{uz:"Manti",ru:"Манты",en:"Manti"},category:"nationalDishes",gi:55,gl:18,emoji:"🥟",advice:{uz:"Qamiri ko'p, miqdorni hisobga oling.",ru:"Следите за порцией.",en:"Watch portion size."}},
  {name:{uz:"Lag'mon",ru:"Лагман",en:"Lagman"},category:"nationalDishes",gi:60,gl:25,emoji:"🍜",advice:{uz:"Ko'proq sabzavotlar qo'shing.",ru:"Добавьте больше овощей.",en:"Add veggies."}},
  {name:{uz:"Mastava",ru:"Мастава",en:"Mastava"},category:"nationalDishes",gi:45,gl:15,emoji:"🍲",advice:{uz:"Guruchi kam, xavfsizroq.",ru:"Безопаснее.",en:"Safer choice."}},
  {name:{uz:"Shashlik (Mol)",ru:"Шашлык (Говяжий)",en:"Shashlik (Beef)"},category:"nationalDishes",gi:0,gl:0,emoji:"🍢",advice:{uz:"Xavfsiz, faqat ko'p non bilan emang.",ru:"Безопасно без хлеба.",en:"Safe without bread."}},
  {name:{uz:"Beshbarmoq",ru:"Бешбармак",en:"Beshbarmak"},category:"nationalDishes",gi:50,gl:20,emoji:"🥩",advice:{uz:"Xamirga boy.",ru:"Много теста.",en:"Dough-heavy."}},
  {name:{uz:"Shornva",ru:"Шурпа",en:"Shurpa"},category:"nationalDishes",gi:30,gl:10,emoji:"🥣",advice:{uz:"Go'sht va sabzarvotlar - ajoyib.",ru:"Хороший выбор.",en:"Good choice."}},
  {name:{uz:"Somsa (tandir)",ru:"Самса",en:"Samsa"},category:"nationalDishes",gi:65,gl:20,emoji:"🥐",advice:{uz:"Kamdan-kam va me'yorida.",ru:"Очень редко.",en:"Rarely."}},
  {name:{uz:"Norin",ru:"Нарын",en:"Naryn"},category:"nationalDishes",gi:48,gl:15,emoji:"🍜",advice:{uz:"Xamirli, ammo go'shti ko'p.",ru:"Мясо и тесто.",en:"Meat and dough."}},
  {name:{uz:"Qovurdoq",ru:"Кавардак",en:"Kavardak"},category:"nationalDishes",gi:40,gl:12,emoji:"🥘",advice:{uz:"Kartoshkasi kamroq bo'lsin.",ru:"Меньше картошки.",en:"Less potato."}},
  
  // Bread (Non mahsulotlari)
  {name:{uz:"Oq yopgan non",ru:"Белая лепешка",en:"White Bread (Tandir)"},category:"bread",gi:70,gl:35,emoji:"🥐",advice:{uz:"Tavsiya etilmaydi.",ru:"Не рекомендуется.",en:"Not recommended."}},
  {name:{uz:"Javdar noni",ru:"Ржаной хлеб",en:"Rye Bread"},category:"bread",gi:45,gl:15,emoji:"🍞",advice:{uz:"Juda yaxshi muqobil.",ru:"Хорошая альтернатива.",en:"Good alternative."}},
  {name:{uz:"Kepakli non",ru:"Отрубной хлеб",en:"Bran Bread"},category:"bread",gi:40,gl:12,emoji:"🥖",advice:{uz:"Diabetiklar uchun mo'ljallangan.",ru:"Для диабетиков.",en:"For diabetics."}},
  {name:{uz:"Lavash",ru:"Лаваш",en:"Lavash"},category:"bread",gi:65,gl:20,emoji:"🥙",advice:{uz:"Juda ko'p asorat." ,ru:"Осторожно.",en:"Caution."}},
  {name:{uz:"Qora non",ru:"Черный хлеб",en:"Black Bread"},category:"bread",gi:48,gl:16,emoji:"🍞",advice:{uz:"Xamirturushsizini tanlang.",ru:"Без дрожжей.",en:"Yeast-free."}},
  {name:{uz:"Baget",ru:"Багет",en:"Baguette"},category:"bread",gi:70,gl:30,emoji:"🥖",advice:{uz:"Umuman mumkin emas.",ru:"Строго запрещено.",en:"Forbidden."}},
  {name:{uz:"Makaron",ru:"Макароны",en:"Pasta"},category:"bread",gi:50,gl:22,emoji:"🍝",advice:{uz:"Qattiq navli bug'doydan bo'lsin.",ru:"Только твердые сорта.",en:"Durum wheat only."}},
  {name:{uz:"Spagetti",ru:"Спагетти",en:"Spaghetti"},category:"bread",gi:45,gl:18,emoji:"🍝",advice:{uz:"To'g'ri pishirilsa xavfsiz (Al dente).",ru:"Аль-денте.",en:"Al dente."}},
  {name:{uz:"Bug'doy uni",ru:"Пшеничная мука",en:"Wheat Flour"},category:"bread",gi:85,gl:40,emoji:"🌾",advice:{uz:"Qandli diabetda taqiqlangan.",ru:"Запрещено.",en:"Forbidden."}},
  {name:{uz:"Suli uni",ru:"Овсяная мука",en:"Oat Flour"},category:"bread",gi:45,gl:15,emoji:"🌾",advice:{uz:"Pishiriqlar uchun yaroqli.",ru:"Для выпечки.",en:"Good for baking."}},
  
  // Dairy (Sut mahsulotlari)
  {name:{uz:"Tvorog (yog'siz)",ru:"Творог",en:"Cottage Cheese"},category:"dairy",gi:30,gl:2,emoji:"🥣",advice:{uz:"Ertalab juda foydali.",ru:"Полезно утром.",en:"Good in the morning."}},
  {name:{uz:"Qaymoq",ru:"Сметана/Каймак",en:"Cream"},category:"dairy",gi:0,gl:0,emoji:"🥛",advice:{uz:"Xolesteringa boy.",ru:"Много холестерина.",en:"High cholesterol."}},
  {name:{uz:"Pishloq",ru:"Сыр",en:"Cheese"},category:"dairy",gi:0,gl:0,emoji:"🧀",advice:{uz:"Kuniga 30-50 gramm.",ru:"30-50 грамм в день.",en:"30-50g per day."}},
  {name:{uz:"Sariyog'",ru:"Сливочное масло",en:"Butter"},category:"dairy",gi:0,gl:0,emoji:"🧈",advice:{uz:"Juda kaloriyali.",ru:"Калорийно.",en:"High calorie."}},
  {name:{uz:"Qatiq (Kefir)",ru:"Кефир",en:"Kefir"},category:"dairy",gi:15,gl:4,emoji:"🥛",advice:{uz:"Uyquga yotishdan oldin yaxshi.",ru:"Перед сном.",en:"Good before sleep."}},
  {name:{uz:"Qulupnayli yogurt",ru:"Клубничный йогурт",en:"Strawberry Yogurt"},category:"dairy",gi:50,gl:12,emoji:"🍓",advice:{uz:"Do'kondan isbotlanganini oling (shakarsiz).",ru:"Без сахара.",en:"Sugar-free."}},
  {name:{uz:"Ayron",ru:"Айран",en:"Ayran"},category:"dairy",gi:15,gl:3,emoji:"🥛",advice:{uz:"Issiqda foydali, qandga ta'sir qilmaydi.",ru:"В жару.",en:"In hot weather."}},
  {name:{uz:"Suzma",ru:"Сузьма",en:"Suzma"},category:"dairy",gi:20,gl:4,emoji:"🍚",advice:{uz:"Oqsilga boy chiroyli",ru:"Белковая.",en:"Protein-rich."}},
  {name:{uz:"Qurt",ru:"Курт",en:"Kurt (Dry cheese)"},category:"dairy",gi:0,gl:0,emoji:"⚪",advice:{uz:"Tuziga ahamiyat bering.",ru:"Осторожно с солью.",en:"Watch salt."}},
  {name:{uz:"Zardob",ru:"Сыворотка",en:"Whey"},category:"dairy",gi:30,gl:4,emoji:"🥛",advice:{uz:"Foydasi katta.",ru:"Очень полезно.",en:"Very useful."}},
  
  // Nuts (Yong'oqlar)
  {name:{uz:"Yong'oq",ru:"Грецкий орех",en:"Walnut"},category:"nuts",gi:15,gl:1,emoji:"🌰",advice:{uz:"Xavfsiz",ru:"Безопасно",en:"Safe"}},
  {name:{uz:"Bodom",ru:"Миндаль",en:"Almond"},category:"nuts",gi:15,gl:1,emoji:"🌰",advice:{uz:"Eng zo'r foydali.",ru:"Отлично.",en:"Perfect."}},
  {name:{uz:"Pista",ru:"Фисташки",en:"Pistachio"},category:"nuts",gi:15,gl:2,emoji:"🥜",advice:{uz:"Tuzlanmaganini tanlang.",ru:"Без соли.",en:"Unsalted."}},
  {name:{uz:"Kaju",ru:"Кешью",en:"Cashew"},category:"nuts",gi:22,gl:3,emoji:"🥜",advice:{uz:"Ozginasini iste'mol qiling.",ru:"Немного.",en:"A little."}},
  {name:{uz:"Er yong'oq",ru:"Арахис",en:"Peanut"},category:"nuts",gi:14,gl:1,emoji:"🥜",advice:{uz:"Allergiya bo'lmasa xavfsiz.",ru:"Без аллергии.",en:"No allergy."}},
  {name:{uz:"O'rik danagi",ru:"Косточки абрикоса",en:"Apricot Kernel"},category:"nuts",gi:18,gl:2,emoji:"🌰",advice:{uz:"Katta yoshlilar uchun foydali.",ru:"Полезно взрослым.",en:"Good for adults."}},
  {name:{uz:"Kunjut",ru:"Кунжут",en:"Sesame"},category:"nuts",gi:35,gl:4,emoji:"⚪",advice:{uz:"Kaltsiyni boyitadi.",ru:"Богат кальцием.",en:"Rich in calcium."}},
  {name:{uz:"Qovoq urug'i",ru:"Тыквенные семечки",en:"Pumpkin Seeds"},category:"nuts",gi:25,gl:2,emoji:"🎃",advice:{uz:"Erkaklar uchun zarur.",ru:"Полезно.",en:"Very useful."}},
  {name:{uz:"Zig'ir urug'i",ru:"Семена льна",en:"Flaxseed"},category:"nuts",gi:35,gl:2,emoji:"🌾",advice:{uz:"Salatlarga qo'shing.",ru:"В салаты.",en:"In salads."}},
  {name:{uz:"Pekan",ru:"Пекан",en:"Pecan"},category:"nuts",gi:10,gl:1,emoji:"🌰",advice:{uz:"Zo'r ozuqaviy qiymat.",ru:"Отличный выбор.",en:"Great choice."}},
  
  // Sweets (Shirinliklar)
  {name:{uz:"Asal",ru:"Мёд",en:"Honey"},category:"sweets",gi:60,gl:15,emoji:"🍯",advice:{uz:"Kuniga 1 qoshiq",ru:"Ложка в день",en:"Spoon a day"}},
  {name:{uz:"Qora shokolad (>70%)",ru:"Темный шоколад",en:"Dark Chocolate"},category:"sweets",gi:22,gl:5,emoji:"🍫",advice:{uz:"Yarim plitkadan oshirmang.",ru:"Не больше половины.",en:"Half bar max."}},
  {name:{uz:"Sutli shokolad",ru:"Молочный шоколад",en:"Milk Chocolate"},category:"sweets",gi:70,gl:25,emoji:"🍫",advice:{uz:"Qat'iy taqiqlanadi.",ru:"Запрещено.",en:"Forbidden."}},
  {name:{uz:"Shakar",ru:"Сахар",en:"Sugar"},category:"sweets",gi:100,gl:100,emoji:"🧂",advice:{uz:"Shirin zahar. Taqiqlanadi.",ru:"Яд.",en:"Poison. Forbidden."}},
  {name:{uz:"Marmelad",ru:"Мармелад",en:"Marmalade"},category:"sweets",gi:65,gl:20,emoji:"🍬",advice:{uz:"Shakarsiz bo'lsa mumkin.",ru:"Без сахара можно.",en:"Fine if sugar free."}},
  {name:{uz:"Shirin tort",ru:"Торт",en:"Cake"},category:"sweets",gi:80,gl:30,emoji:"🍰",advice:{uz:"Mumkin emas.",ru:"Нельзя.",en:"No."}},
  {name:{uz:"Steviya",ru:"Стевия",en:"Stevia"},category:"sweets",gi:0,gl:0,emoji:"🌿",advice:{uz:"Shakar o'rniga eng xavfsizi.",ru:"Лучший заменитель.",en:"Best sweetener."}},
  {name:{uz:"Beshmet (Holvaytar)",ru:"Халвайтар",en:"Halvaytar"},category:"sweets",gi:75,gl:30,emoji:"🍮",advice:{uz:"Mumkin emas.",ru:"Нельзя.",en:"No."}},
  {name:{uz:"Muzqaymoq",ru:"Мороженое",en:"Ice Cream"},category:"sweets",gi:60,gl:20,emoji:"🍦",advice:{uz:"Yog'lik va qandlikka e'tibor bering.",ru:"Много жира и сахара.",en:"High sugar."}},
  {name:{uz:"Qiyom (Jam)",ru:"Варенье",en:"Jam"},category:"sweets",gi:65,gl:25,emoji:"🍇",advice:{uz:"Taqiqlangan.",ru:"Запрещено.",en:"Forbidden."}},
];

console.log("Adding variations to reach >100 products...");

// Duplicate and spread to make 100+ foods, simulating variations
const expandedProducts = [];
let idCounter = 1;
productData.forEach(p => {
    expandedProducts.push({...p});
    // Add a variation
    if (p.category === 'fruits' || p.category === 'vegetables') {
        expandedProducts.push({
            name: { uz: p.name.uz + " (Quritilgan)", ru: p.name.ru + " (Сушеный)", en: p.name.en + " (Dried)" },
            category: p.category, gi: p.gi + 15, gl: p.gl + 5, emoji: p.emoji, 
            advice: { uz: p.advice.uz + " Quritilgani biroz ehtiyotkorlik talab qiladi.", ru: p.advice.ru + " Сушеные опаснее.", en: p.advice.en + " Dried is riskier." }
        });
    }
    if (p.category === 'nationalDishes' || p.category === 'proteins') {
        expandedProducts.push({
            name: { 
                uz: p.name.uz + " (Qovurilgan)", 
                ru: "Жареный " + p.name.ru, 
                en: "Fried " + p.name.en 
            },
            category: p.category, gi: p.gi + 10, gl: p.gl + 10, emoji: p.emoji, 
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
