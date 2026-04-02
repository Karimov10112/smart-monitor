const Product = require('../models/Product');

const initialProducts = [
  // Fruits
  {
    name: { uz: 'Olma', ru: 'Яблоко', en: 'Apple' },
    category: 'fruits',
    emoji: '🍎',
    gi: 36,
    gl: 6,
    advice: { 
      uz: 'Olma past GI ga ega va qon shakarini sekin oshiradi. Kuniga 1-2 ta iste\'mol qilish mumkin.',
      ru: 'Яблоко имеет низкий ГИ и медленно повышает уровень сахара. Можно употреблять 1-2 в день.',
      en: 'Apple has low GI and slowly raises blood sugar. Can consume 1-2 per day.'
    }
  },
  {
    name: { uz: 'Banan', ru: 'Банан', en: 'Banana' },
    category: 'fruits',
    emoji: '🍌',
    gi: 51,
    gl: 13,
    advice: { 
      uz: 'Banan o\'rtacha GI ga ega. Jismoniy mashqdan oldin yaxshi, lekin cheklangan miqdorda.',
      ru: 'Банан имеет средний ГИ. Хорош перед физическими упражнениями, но в ограниченном количестве.',
      en: 'Banana has medium GI. Good before exercise, but in limited amounts.'
    }
  },
  {
    name: { uz: 'Apelsin', ru: 'Апельсин', en: 'Orange' },
    category: 'fruits',
    emoji: '🍊',
    gi: 43,
    gl: 5,
    advice: { 
      uz: 'Apelsin vitamin C bilan boy va past GI ga ega. Kundalik iste\'mol uchun yaxshi.',
      ru: 'Апельсин богат витамином C и имеет низкий ГИ. Хорош для ежедневного употребления.',
      en: 'Orange is rich in vitamin C and has low GI. Good for daily consumption.'
    }
  },
  {
    name: { uz: 'Qulupnay', ru: 'Клубника', en: 'Strawberry' },
    category: 'fruits',
    emoji: '🍓',
    gi: 40,
    gl: 1,
    advice: { 
      uz: 'Qulupnay juda past GL ga ega. Diabetiklar uchun ideal meva.',
      ru: 'Клубника имеет очень низкую ГН. Идеальная ягода для диабетиков.',
      en: 'Strawberry has very low GL. Ideal fruit for diabetics.'
    }
  },
  {
    name: { uz: 'Uzum', ru: 'Виноград', en: 'Grapes' },
    category: 'fruits',
    emoji: '🍇',
    gi: 59,
    gl: 11,
    advice: { 
      uz: 'Uzum o\'rtacha-yuqori GI ga ega. Kichik porsiyalarda iste\'mol qiling.',
      ru: 'Виноград имеет средне-высокий ГИ. Употребляйте небольшими порциями.',
      en: 'Grapes have medium-high GI. Consume in small portions.'
    }
  },
  {
    name: { uz: 'Tarvuz', ru: 'Арбуз', en: 'Watermelon' },
    category: 'fruits',
    emoji: '🍉',
    gi: 76,
    gl: 5,
    advice: { 
      uz: 'Tarvuz yuqori GI ga ega, lekin past GL. O\'rtacha porsiyalar yaxshi.',
      ru: 'Арбуз имеет высокий ГИ, но низкую ГН. Умеренные порции подходят.',
      en: 'Watermelon has high GI but low GL. Moderate portions are fine.'
    }
  },
  // Vegetables
  {
    name: { uz: 'Pomidor', ru: 'Помидор', en: 'Tomato' },
    category: 'vegetables',
    emoji: '🍅',
    gi: 15,
    gl: 1,
    advice: { 
      uz: 'Pomidor juda past GI ga ega. Cheksiz iste\'mol qilish mumkin.',
      ru: 'Помидор имеет очень низкий ГИ. Можно употреблять без ограничений.',
      en: 'Tomato has very low GI. Can consume unlimited.'
    }
  },
  {
    name: { uz: 'Bodring', ru: 'Огурец', en: 'Cucumber' },
    category: 'vegetables',
    emoji: '🥒',
    gi: 15,
    gl: 0,
    advice: { 
      uz: 'Bodring juda past GI ga ega. Ideal sabzavot.',
      ru: 'Огурец имеет очень низкий ГИ. Идеальный овощ.',
      en: 'Cucumber has very low GI. Ideal vegetable.'
    }
  },
  {
    name: { uz: 'Brokkoli', ru: 'Брокколи', en: 'Broccoli' },
    category: 'vegetables',
    emoji: '🥦',
    gi: 10,
    gl: 1,
    advice: { 
      uz: 'Brokkoli juda past GI ga ega. Superfoods kategoriyasida.',
      ru: 'Брокколи имеет очень низкий ГИ. В категории суперфудов.',
      en: 'Broccoli has very low GI. In the superfood category.'
    }
  },
  {
    name: { uz: 'Ismaloq', ru: 'Шпинат', en: 'Spinach' },
    category: 'vegetables',
    emoji: '🥬',
    gi: 15,
    gl: 0,
    advice: { 
      uz: 'Ismaloq juda past GI ga ega. Temir bilan boy.',
      ru: 'Шпинат имеет очень низкий ГИ. Богат железом.',
      en: 'Spinach has very low GI. Rich in iron.'
    }
  },
  // National Dishes
  {
    name: { uz: 'Palov', ru: 'Плов', en: 'Plov' },
    category: 'nationalDishes',
    emoji: '🍛',
    gi: 65,
    gl: 40,
    advice: { 
      uz: 'Palov yuqori GI ga ega. Kichik porsiya va sabzavotlar bilan yaxshiroq.',
      ru: 'Плов имеет высокий ГИ. Лучше небольшая порция и с овощами.',
      en: 'Plov has high GI. Better in small portions with vegetables.'
    }
  },
  {
    name: { uz: 'Lagʻmon', ru: 'Лагман', en: 'Lagman' },
    category: 'nationalDishes',
    emoji: '🍜',
    gi: 55,
    gl: 30,
    advice: { 
      uz: 'Lag\'mon o\'rtacha GI ga ega. Sabzavotlar ko\'p bo\'lsa yaxshiroq.',
      ru: 'Лагман имеет средний ГИ. Лучше с большим количеством овощей.',
      en: 'Lagman has medium GI. Better with more vegetables.'
    }
  },
  {
    name: { uz: 'Shashlik', ru: 'Шашлык', en: 'Shashlik' },
    category: 'nationalDishes',
    emoji: '🍢',
    gi: 0,
    gl: 0,
    advice: { 
      uz: 'Shashlik GI ga ega emas. Go\'sht bo\'lgani uchun yaxshi, lekin yog\'ni chekling.',
      ru: 'Шашлык не имеет ГИ. Хорош, так как это мясо, но ограничьте жир.',
      en: 'Shashlik has no GI. Good as it\'s meat, but limit fat.'
    }
  },
  {
    name: { uz: 'Mastava', ru: 'Мастава', en: 'Mastava' },
    category: 'nationalDishes',
    emoji: '🍲',
    gi: 60,
    gl: 25,
    advice: { 
      uz: 'Mastava o\'rtacha GI ga ega. Sho\'rva bo\'lgani uchun yaxshiroq.',
      ru: 'Мастава имеет средний ГИ. Лучше, потому что это суп.',
      en: 'Mastava has medium GI. Better because it\'s a soup.'
    }
  },
  {
    name: { uz: 'Somsa', ru: 'Самса', en: 'Samsa' },
    category: 'nationalDishes',
    emoji: '🥟',
    gi: 70,
    gl: 30,
    advice: { 
      uz: 'Somsa yuqori GI ga ega. Kamroq iste\'mol qiling.',
      ru: 'Самса имеет высокий ГИ. Употребляйте реже.',
      en: 'Samsa has high GI. Consume less often.'
    }
  },
  // Grains
  {
    name: { uz: 'Qo\'ng\'ir guruch', ru: 'Коричневый рис', en: 'Brown Rice' },
    category: 'grains',
    emoji: '🌾',
    gi: 50,
    gl: 16,
    advice: { 
      uz: 'Qo\'ng\'ir guruch o\'rtacha GI ga ega. Oq guruchdan yaxshiroq.',
      ru: 'Коричневый рис имеет средний ГИ. Лучше белого риса.',
      en: 'Brown rice has medium GI. Better than white rice.'
    }
  },
  {
    name: { uz: 'Arpa', ru: 'Ячмень', en: 'Barley' },
    category: 'grains',
    emoji: '🌾',
    gi: 28,
    gl: 12,
    advice: { 
      uz: 'Arpa past GI ga ega. Diabetiklar uchun eng yaxshi don.',
      ru: 'Ячмень имеет низкий ГИ. Лучшее зерно для диабетиков.',
      en: 'Barley has low GI. Best grain for diabetics.'
    }
  },
  {
    name: { uz: 'Kinoa', ru: 'Киноа', en: 'Quinoa' },
    category: 'grains',
    emoji: '🌾',
    gi: 53,
    gl: 13,
    advice: { 
      uz: 'Kinoa o\'rtacha GI ga ega. Superfood va to\'liq oqsil manbai.',
      ru: 'Киноа имеет средний ГИ. Суперфуд и источник полноценного белка.',
      en: 'Quinoa has medium GI. Superfood and complete protein source.'
    }
  },
  // Proteins
  {
    name: { uz: 'Tovuq ko\'kragi', ru: 'Куриная грудка', en: 'Chicken Breast' },
    category: 'proteins',
    emoji: '🍗',
    gi: 0,
    gl: 0,
    advice: { 
      uz: 'Tovuq ko\'kragi GI ga ega emas. Sog\'lom oqsil manbai.',
      ru: 'Куриная грудка не имеет ГИ. Здоровый источник белка.',
      en: 'Chicken breast has no GI. Healthy protein source.'
    }
  },
  {
    name: { uz: 'Baliq (salmon)', ru: 'Рыба (лосось)', en: 'Fish (Salmon)' },
    category: 'proteins',
    emoji: '🐟',
    gi: 0,
    gl: 0,
    advice: { 
      uz: 'Salmon GI ga ega emas. Omega-3 bilan boy.',
      ru: 'Лосось не имеет ГИ. Богат Омега-3.',
      en: 'Salmon has no GI. Rich in Omega-3.'
    }
  },
  {
    name: { uz: 'Tuxum', ru: 'Яйцо', en: 'Egg' },
    category: 'proteins',
    emoji: '🥚',
    gi: 0,
    gl: 0,
    advice: { 
      uz: 'Tuxum GI ga ega emas. To\'liq oqsil manbai.',
      ru: 'Яйцо не имеет ГИ. Источник полноценного белка.',
      en: 'Egg has no GI. Complete protein source.'
    }
  },
  // Beverages
  {
    name: { uz: 'Yashil choy', ru: 'Зеленый чай', en: 'Green Tea' },
    category: 'beverages',
    emoji: '🍵',
    gi: 0,
    gl: 0,
    advice: { 
      uz: 'Yashil choy GI ga ega emas. Antioksidantlar bilan boy.',
      ru: 'Зеленый чай не имеет ГИ. Богат антиоксидантами.',
      en: 'Green tea has no GI. Rich in antioxidants.'
    }
  },
  {
    name: { uz: 'Qahva (shakarsiz)', ru: 'Кофе (без сахара)', en: 'Coffee (unsweetened)' },
    category: 'beverages',
    emoji: '☕',
    gi: 0,
    gl: 0,
    advice: { 
      uz: 'Qahva GI ga ega emas. Shakarsiz yaxshi, lekin cheklangan miqdorda.',
      ru: 'Кофе не имеет ГИ. Хорош без сахара, но в ограниченном количестве.',
      en: 'Coffee has no GI. Good without sugar but in moderation.'
    }
  }
];

const seedProducts = async () => {
  try {
    // Har safar server yonganda emas, faqat majburiy yuklash kerak bo'lsa tozalaymiz
    // Yoki shunchaki counterni tekshiramiz. Foydalanuvchi "o'chib ketdi" degani uchun
    // Hozir hammasini tozalab qayta yuklaymiz.
    await Product.deleteMany({});
    await Product.insertMany(initialProducts.map(p => ({ ...p, isActive: true })));
    console.log('✅ Barcha mahsulotlar muvaffaqiyatli tiklandi va bazaga yuklandi!');
  } catch (err) {
    console.error('Seeding xatosi:', err.message);
  }
};

module.exports = seedProducts;
