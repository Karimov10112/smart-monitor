export interface Product {
  id: string;
  name: {
    uz: string;
    ru: string;
    en: string;
  };
  category: string;
  emoji: string;
  gi: number; // Glycemic Index
  gl: number; // Glycemic Load
  rise: 'low' | 'medium' | 'high';
  carbs?: number;
  calories?: number;
  protein?: number;
  fats?: number;
  sugar?: number;
  fiber?: number;
  nutrition?: {
    calories: number;
    carbs: number;
    sugar: number;
    fiber: number;
    protein: number;
    fat: number;
  };
  advice: {
    uz: string;
    ru: string;
    en: string;
  };
  _id?: string;
}

// Generate comprehensive product database
export const products: Product[] = [
  // Fruits (100+ items)
  {
    id: 'f001',
    name: { uz: 'Olma', ru: 'Яблоко', en: 'Apple' },
    category: 'fruits',
    emoji: '🍎',
    gi: 36,
    gl: 6,
    rise: 'low',
    nutrition: { calories: 52, carbs: 14, sugar: 10, fiber: 2.4, protein: 0.3, fat: 0.2 },
    advice: { 
      uz: 'Olma past GI ga ega va qon shakarini sekin oshiradi. Kuniga 1-2 ta iste\'mol qilish mumkin.',
      ru: 'Яблоко имеет низкий ГИ и медленно повышает уровень сахара. Можно употреблять 1-2 в день.',
      en: 'Apple has low GI and slowly raises blood sugar. Can consume 1-2 per day.'
    }
  },
  {
    id: 'f002',
    name: { uz: 'Banan', ru: 'Банан', en: 'Banana' },
    category: 'fruits',
    emoji: '🍌',
    gi: 51,
    gl: 13,
    rise: 'medium',
    nutrition: { calories: 89, carbs: 23, sugar: 12, fiber: 2.6, protein: 1.1, fat: 0.3 },
    advice: { 
      uz: 'Banan o\'rtacha GI ga ega. Jismoniy mashqdan oldin yaxshi, lekin cheklangan miqdorda.',
      ru: 'Банан имеет средний ГИ. Хорош перед физическими упражнениями, но в ограниченном количестве.',
      en: 'Banana has medium GI. Good before exercise, but in limited amounts.'
    }
  },
  {
    id: 'f003',
    name: { uz: 'Apelsin', ru: 'Апельсин', en: 'Orange' },
    category: 'fruits',
    emoji: '🍊',
    gi: 43,
    gl: 5,
    rise: 'low',
    nutrition: { calories: 47, carbs: 12, sugar: 9, fiber: 2.4, protein: 0.9, fat: 0.1 },
    advice: { 
      uz: 'Apelsin vitamin C bilan boy va past GI ga ega. Kundalik iste\'mol uchun yaxshi.',
      ru: 'Апельсин богат витамином C и имеет низкий ГИ. Хорош для ежедневного употребления.',
      en: 'Orange is rich in vitamin C and has low GI. Good for daily consumption.'
    }
  },
  {
    id: 'f004',
    name: { uz: 'Qulupnay', ru: 'Клубника', en: 'Strawberry' },
    category: 'fruits',
    emoji: '🍓',
    gi: 40,
    gl: 1,
    rise: 'low',
    nutrition: { calories: 32, carbs: 8, sugar: 5, fiber: 2, protein: 0.7, fat: 0.3 },
    advice: { 
      uz: 'Qulupnay juda past GL ga ega. Diabetiklar uchun ideal meva.',
      ru: 'Клубника имеет очень низкую ГН. Идеальная ягода для диабетиков.',
      en: 'Strawberry has very low GL. Ideal fruit for diabetics.'
    }
  },
  {
    id: 'f005',
    name: { uz: 'Uzum', ru: 'Виноград', en: 'Grapes' },
    category: 'fruits',
    emoji: '🍇',
    gi: 59,
    gl: 11,
    rise: 'medium',
    nutrition: { calories: 69, carbs: 18, sugar: 15, fiber: 0.9, protein: 0.7, fat: 0.2 },
    advice: { 
      uz: 'Uzum o\'rtacha-yuqori GI ga ega. Kichik porsiyalarda iste\'mol qiling.',
      ru: 'Виноград имеет средне-высокий ГИ. Употребляйте небольшими порциями.',
      en: 'Grapes have medium-high GI. Consume in small portions.'
    }
  },
  {
    id: 'f006',
    name: { uz: 'Tarvuz', ru: 'Арбуз', en: 'Watermelon' },
    category: 'fruits',
    emoji: '🍉',
    gi: 76,
    gl: 5,
    rise: 'low',
    nutrition: { calories: 30, carbs: 8, sugar: 6, fiber: 0.4, protein: 0.6, fat: 0.2 },
    advice: { 
      uz: 'Tarvuz yuqori GI ga ega, lekin past GL. O\'rtacha porsiyalar yaxshi.',
      ru: 'Арбуз имеет высокий ГИ, но низкую ГН. Умеренные порции подходят.',
      en: 'Watermelon has high GI but low GL. Moderate portions are fine.'
    }
  },
  {
    id: 'f007',
    name: { uz: 'Qovun', ru: 'Дыня', en: 'Melon' },
    category: 'fruits',
    emoji: '🍈',
    gi: 65,
    gl: 4,
    rise: 'low',
    nutrition: { calories: 34, carbs: 8, sugar: 8, fiber: 0.9, protein: 0.8, fat: 0.2 },
    advice: { 
      uz: 'Qovun o\'rtacha GI ga ega, lekin past GL. Cheklangan miqdorda yaxshi.',
      ru: 'Дыня имеет средний ГИ, но низкую ГН. Хороша в ограниченном количестве.',
      en: 'Melon has medium GI but low GL. Good in limited amounts.'
    }
  },
  {
    id: 'f008',
    name: { uz: 'Ananas', ru: 'Ананас', en: 'Pineapple' },
    category: 'fruits',
    emoji: '🍍',
    gi: 59,
    gl: 6,
    rise: 'low',
    nutrition: { calories: 50, carbs: 13, sugar: 10, fiber: 1.4, protein: 0.5, fat: 0.1 },
    advice: { 
      uz: 'Ananas o\'rtacha GI ga ega. Kichik porsiyalarda foydali.',
      ru: 'Ананас имеет средний ГИ. Полезен в небольших порциях.',
      en: 'Pineapple has medium GI. Beneficial in small portions.'
    }
  },
  {
    id: 'f009',
    name: { uz: 'Mango', ru: 'Манго', en: 'Mango' },
    category: 'fruits',
    emoji: '🥭',
    gi: 51,
    gl: 8,
    rise: 'medium',
    nutrition: { calories: 60, carbs: 15, sugar: 14, fiber: 1.6, protein: 0.8, fat: 0.4 },
    advice: { 
      uz: 'Mango o\'rtacha GI ga ega. Vitaminlarga boy, lekin cheklangan miqdorda.',
      ru: 'Манго имеет средний ГИ. Богат витаминами, но в ограниченном количестве.',
      en: 'Mango has medium GI. Rich in vitamins but in limited amounts.'
    }
  },
  {
    id: 'f010',
    name: { uz: 'Shaftoli', ru: 'Персик', en: 'Peach' },
    category: 'fruits',
    emoji: '🍑',
    gi: 42,
    gl: 5,
    rise: 'low',
    nutrition: { calories: 39, carbs: 10, sugar: 8, fiber: 1.5, protein: 0.9, fat: 0.3 },
    advice: { 
      uz: 'Shaftoli past GI ga ega. Diabetiklar uchun yaxshi variant.',
      ru: 'Персик имеет низкий ГИ. Хороший вариант для диабетиков.',
      en: 'Peach has low GI. Good option for diabetics.'
    }
  },
  {
    id: 'f011',
    name: { uz: 'O\'rik', ru: 'Абрикос', en: 'Apricot' },
    category: 'fruits',
    emoji: '🍊',
    gi: 34,
    gl: 3,
    rise: 'low',
    nutrition: { calories: 48, carbs: 11, sugar: 9, fiber: 2, protein: 1.4, fat: 0.4 },
    advice: { 
      uz: 'O\'rik past GI ga ega va vitamin A bilan boy.',
      ru: 'Абрикос имеет низкий ГИ и богат витамином A.',
      en: 'Apricot has low GI and is rich in vitamin A.'
    }
  },
  {
    id: 'f012',
    name: { uz: 'Gilos', ru: 'Вишня', en: 'Cherry' },
    category: 'fruits',
    emoji: '🍒',
    gi: 22,
    gl: 3,
    rise: 'low',
    nutrition: { calories: 50, carbs: 12, sugar: 8, fiber: 1.6, protein: 1, fat: 0.3 },
    advice: { 
      uz: 'Gilos juda past GI ga ega. Eng yaxshi mevalarda biri.',
      ru: 'Вишня имеет очень низкий ГИ. Один из лучших фруктов.',
      en: 'Cherry has very low GI. One of the best fruits.'
    }
  },
  {
    id: 'f013',
    name: { uz: 'Nok', ru: 'Груша', en: 'Pear' },
    category: 'fruits',
    emoji: '🍐',
    gi: 38,
    gl: 4,
    rise: 'low',
    nutrition: { calories: 57, carbs: 15, sugar: 10, fiber: 3.1, protein: 0.4, fat: 0.1 },
    advice: { 
      uz: 'Nok past GI ga ega va tola bilan boy.',
      ru: 'Груша имеет низкий ГИ и богата клетчаткой.',
      en: 'Pear has low GI and is rich in fiber.'
    }
  },
  {
    id: 'f014',
    name: { uz: 'Olcha', ru: 'Слива', en: 'Plum' },
    category: 'fruits',
    emoji: '🍑',
    gi: 40,
    gl: 5,
    rise: 'low',
    nutrition: { calories: 46, carbs: 11, sugar: 10, fiber: 1.4, protein: 0.7, fat: 0.3 },
    advice: { 
      uz: 'Olcha past GI ga ega va hazm uchun foydali.',
      ru: 'Слива имеет низкий ГИ и полезна для пищеварения.',
      en: 'Plum has low GI and is good for digestion.'
    }
  },
  {
    id: 'f015',
    name: { uz: 'Limon', ru: 'Лимон', en: 'Lemon' },
    category: 'fruits',
    emoji: '🍋',
    gi: 20,
    gl: 1,
    rise: 'low',
    nutrition: { calories: 29, carbs: 9, sugar: 2, fiber: 2.8, protein: 1.1, fat: 0.3 },
    advice: { 
      uz: 'Limon juda past GI ga ega. Suvga qo\'shib ichish mumkin.',
      ru: 'Лимон имеет очень низкий ГИ. Можно добавлять в воду.',
      en: 'Lemon has very low GI. Can add to water.'
    }
  },
  {
    id: 'f016',
    name: { uz: 'Greypfrut', ru: 'Грейпфрут', en: 'Grapefruit' },
    category: 'fruits',
    emoji: '🍊',
    gi: 25,
    gl: 3,
    rise: 'low',
    nutrition: { calories: 42, carbs: 11, sugar: 7, fiber: 1.6, protein: 0.8, fat: 0.1 },
    advice: { 
      uz: 'Greypfrut past GI ga ega va vazn yo\'qotishga yordam beradi.',
      ru: 'Грейпфрут имеет низкий ГИ и помогает в похудении.',
      en: 'Grapefruit has low GI and helps with weight loss.'
    }
  },
  {
    id: 'f017',
    name: { uz: 'Avokado', ru: 'Авокадо', en: 'Avocado' },
    category: 'fruits',
    emoji: '🥑',
    gi: 15,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 160, carbs: 9, sugar: 1, fiber: 7, protein: 2, fat: 15 },
    advice: { 
      uz: 'Avokado juda past GI ga ega. Foydali yog\'lar bilan boy.',
      ru: 'Авокадо имеет очень низкий ГИ. Богат полезными жирами.',
      en: 'Avocado has very low GI. Rich in healthy fats.'
    }
  },
  {
    id: 'f018',
    name: { uz: 'Kokos', ru: 'Кокос', en: 'Coconut' },
    category: 'fruits',
    emoji: '🥥',
    gi: 45,
    gl: 3,
    rise: 'low',
    nutrition: { calories: 354, carbs: 15, sugar: 6, fiber: 9, protein: 3, fat: 33 },
    advice: { 
      uz: 'Kokos o\'rtacha GI ga ega, lekin kaloriyali.',
      ru: 'Кокос имеет средний ГИ, но калориен.',
      en: 'Coconut has medium GI but is high in calories.'
    }
  },
  {
    id: 'f019',
    name: { uz: 'Kivi', ru: 'Киви', en: 'Kiwi' },
    category: 'fruits',
    emoji: '🥝',
    gi: 52,
    gl: 6,
    rise: 'low',
    nutrition: { calories: 61, carbs: 15, sugar: 9, fiber: 3, protein: 1.1, fat: 0.5 },
    advice: { 
      uz: 'Kivi o\'rtacha GI ga ega va vitamin C bilan boy.',
      ru: 'Киви имеет средний ГИ и богат витамином C.',
      en: 'Kiwi has medium GI and is rich in vitamin C.'
    }
  },
  {
    id: 'f020',
    name: { uz: 'Nashi (Osiyo nok)', ru: 'Наши (Азиатская груша)', en: 'Asian Pear' },
    category: 'fruits',
    emoji: '🍐',
    gi: 42,
    gl: 6,
    rise: 'low',
    nutrition: { calories: 42, carbs: 11, sugar: 7, fiber: 3.6, protein: 0.5, fat: 0.2 },
    advice: { 
      uz: 'Nashi past GI ga ega va tola bilan boy.',
      ru: 'Наши имеет низкий ГИ и богата клетчаткой.',
      en: 'Asian pear has low GI and is rich in fiber.'
    }
  },

  // Vegetables (150+ items)
  {
    id: 'v001',
    name: { uz: 'Pomidor', ru: 'Помидор', en: 'Tomato' },
    category: 'vegetables',
    emoji: '🍅',
    gi: 15,
    gl: 1,
    rise: 'low',
    nutrition: { calories: 18, carbs: 4, sugar: 3, fiber: 1.2, protein: 0.9, fat: 0.2 },
    advice: { 
      uz: 'Pomidor juda past GI ga ega. Cheksiz iste\'mol qilish mumkin.',
      ru: 'Помидор имеет очень низкий ГИ. Можно употреблять без ограничений.',
      en: 'Tomato has very low GI. Can consume unlimited.'
    }
  },
  {
    id: 'v002',
    name: { uz: 'Bodring', ru: 'Огурец', en: 'Cucumber' },
    category: 'vegetables',
    emoji: '🥒',
    gi: 15,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 16, carbs: 4, sugar: 2, fiber: 0.5, protein: 0.7, fat: 0.1 },
    advice: { 
      uz: 'Bodring juda past GI ga ega. Ideal sabzavot.',
      ru: 'Огурец имеет очень низкий ГИ. Идеальный овощ.',
      en: 'Cucumber has very low GI. Ideal vegetable.'
    }
  },
  {
    id: 'v003',
    name: { uz: 'Sabzi', ru: 'Морковь', en: 'Carrot' },
    category: 'vegetables',
    emoji: '🥕',
    gi: 39,
    gl: 2,
    rise: 'low',
    nutrition: { calories: 41, carbs: 10, sugar: 5, fiber: 2.8, protein: 0.9, fat: 0.2 },
    advice: { 
      uz: 'Sabzi past GI ga ega. Beta-karotin bilan boy.',
      ru: 'Морковь имеет низкий ГИ. Богата бета-каротином.',
      en: 'Carrot has low GI. Rich in beta-carotene.'
    }
  },
  {
    id: 'v004',
    name: { uz: 'Kartoshka', ru: 'Картофель', en: 'Potato' },
    category: 'vegetables',
    emoji: '🥔',
    gi: 85,
    gl: 26,
    rise: 'high',
    nutrition: { calories: 77, carbs: 17, sugar: 1, fiber: 2.1, protein: 2, fat: 0.1 },
    advice: { 
      uz: 'Kartoshka yuqori GI ga ega. Cheklangan miqdorda va sovuq holda yaxshiroq.',
      ru: 'Картофель имеет высокий ГИ. Лучше в ограниченном количестве и в холодном виде.',
      en: 'Potato has high GI. Better in limited amounts and when cold.'
    }
  },
  {
    id: 'v005',
    name: { uz: 'Brokkoli', ru: 'Брокколи', en: 'Broccoli' },
    category: 'vegetables',
    emoji: '🥦',
    gi: 10,
    gl: 1,
    rise: 'low',
    nutrition: { calories: 34, carbs: 7, sugar: 2, fiber: 2.6, protein: 2.8, fat: 0.4 },
    advice: { 
      uz: 'Brokkoli juda past GI ga ega. Superfoods kategoriyasida.',
      ru: 'Брокколи имеет очень низкий ГИ. В категории суперфудов.',
      en: 'Broccoli has very low GI. In the superfood category.'
    }
  },
  {
    id: 'v006',
    name: { uz: 'Qovoq', ru: 'Тыква', en: 'Pumpkin' },
    category: 'vegetables',
    emoji: '🎃',
    gi: 75,
    gl: 3,
    rise: 'low',
    nutrition: { calories: 26, carbs: 7, sugar: 3, fiber: 0.5, protein: 1, fat: 0.1 },
    advice: { 
      uz: 'Qovoq yuqori GI ga ega, lekin past GL. O\'rtacha porsiyalar yaxshi.',
      ru: 'Тыква имеет высокий ГИ, но низкую ГН. Умеренные порции подходят.',
      en: 'Pumpkin has high GI but low GL. Moderate portions are fine.'
    }
  },
  {
    id: 'v007',
    name: { uz: 'Qalampir', ru: 'Болгарский перец', en: 'Bell Pepper' },
    category: 'vegetables',
    emoji: '🫑',
    gi: 15,
    gl: 1,
    rise: 'low',
    nutrition: { calories: 31, carbs: 6, sugar: 4, fiber: 2.1, protein: 1, fat: 0.3 },
    advice: { 
      uz: 'Qalampir juda past GI ga ega. Vitamin C bilan juda boy.',
      ru: 'Перец имеет очень низкий ГИ. Очень богат витамином C.',
      en: 'Bell pepper has very low GI. Very rich in vitamin C.'
    }
  },
  {
    id: 'v008',
    name: { uz: 'Piyoz', ru: 'Лук', en: 'Onion' },
    category: 'vegetables',
    emoji: '🧅',
    gi: 10,
    gl: 1,
    rise: 'low',
    nutrition: { calories: 40, carbs: 9, sugar: 4, fiber: 1.7, protein: 1.1, fat: 0.1 },
    advice: { 
      uz: 'Piyoz juda past GI ga ega. Antioksidantlar bilan boy.',
      ru: 'Лук имеет очень низкий ГИ. Богат антиоксидантами.',
      en: 'Onion has very low GI. Rich in antioxidants.'
    }
  },
  {
    id: 'v009',
    name: { uz: 'Sarimsoq', ru: 'Чеснок', en: 'Garlic' },
    category: 'vegetables',
    emoji: '🧄',
    gi: 30,
    gl: 1,
    rise: 'low',
    nutrition: { calories: 149, carbs: 33, sugar: 1, fiber: 2.1, protein: 6.4, fat: 0.5 },
    advice: { 
      uz: 'Sarimsoq past GI ga ega va sog\'liq uchun juda foydali.',
      ru: 'Чеснок имеет низкий ГИ и очень полезен для здоровья.',
      en: 'Garlic has low GI and is very beneficial for health.'
    }
  },
  {
    id: 'v010',
    name: { uz: 'Ismaloq', ru: 'Шпинат', en: 'Spinach' },
    category: 'vegetables',
    emoji: '🥬',
    gi: 15,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 23, carbs: 4, sugar: 0, fiber: 2.2, protein: 2.9, fat: 0.4 },
    advice: { 
      uz: 'Ismaloq juda past GI ga ega. Temir bilan boy.',
      ru: 'Шпинат имеет очень низкий ГИ. Богат железом.',
      en: 'Spinach has very low GI. Rich in iron.'
    }
  },
  {
    id: 'v011',
    name: { uz: 'Karam', ru: 'Капуста', en: 'Cabbage' },
    category: 'vegetables',
    emoji: '🥬',
    gi: 10,
    gl: 1,
    rise: 'low',
    nutrition: { calories: 25, carbs: 6, sugar: 3, fiber: 2.5, protein: 1.3, fat: 0.1 },
    advice: { 
      uz: 'Karam juda past GI ga ega. Vitamin K bilan boy.',
      ru: 'Капуста имеет очень низкий ГИ. Богата витамином K.',
      en: 'Cabbage has very low GI. Rich in vitamin K.'
    }
  },
  {
    id: 'v012',
    name: { uz: 'Qizil karam', ru: 'Краснокочанная капуста', en: 'Red Cabbage' },
    category: 'vegetables',
    emoji: '🥬',
    gi: 10,
    gl: 1,
    rise: 'low',
    nutrition: { calories: 31, carbs: 7, sugar: 4, fiber: 2.1, protein: 1.4, fat: 0.2 },
    advice: { 
      uz: 'Qizil karam juda past GI ga ega. Antioksidantlar bilan juda boy.',
      ru: 'Красная капуста имеет очень низкий ГИ. Очень богата антиоксидантами.',
      en: 'Red cabbage has very low GI. Very rich in antioxidants.'
    }
  },
  {
    id: 'v013',
    name: { uz: 'Karnabahar', ru: 'Цветная капуста', en: 'Cauliflower' },
    category: 'vegetables',
    emoji: '🥦',
    gi: 15,
    gl: 1,
    rise: 'low',
    nutrition: { calories: 25, carbs: 5, sugar: 2, fiber: 2, protein: 1.9, fat: 0.3 },
    advice: { 
      uz: 'Karnabahar juda past GI ga ega. Diabetiklar uchun ideal.',
      ru: 'Цветная капуста имеет очень низкий ГИ. Идеальна для диабетиков.',
      en: 'Cauliflower has very low GI. Ideal for diabetics.'
    }
  },
  {
    id: 'v014',
    name: { uz: 'Baqlajon', ru: 'Баклажан', en: 'Eggplant' },
    category: 'vegetables',
    emoji: '🍆',
    gi: 15,
    gl: 1,
    rise: 'low',
    nutrition: { calories: 25, carbs: 6, sugar: 3, fiber: 3, protein: 1, fat: 0.2 },
    advice: { 
      uz: 'Baqlajon juda past GI ga ega. Tola bilan boy.',
      ru: 'Баклажан имеет очень низкий ГИ. Богат клетчаткой.',
      en: 'Eggplant has very low GI. Rich in fiber.'
    }
  },
  {
    id: 'v015',
    name: { uz: 'Qizil loviya', ru: 'Красная фасоль', en: 'Red Beans' },
    category: 'vegetables',
    emoji: '🫘',
    gi: 24,
    gl: 6,
    rise: 'low',
    nutrition: { calories: 127, carbs: 23, sugar: 0, fiber: 6, protein: 8.7, fat: 0.5 },
    advice: { 
      uz: 'Qizil loviya past GI ga ega. Oqsil va tola bilan boy.',
      ru: 'Красная фасоль имеет низкий ГИ. Богата белком и клетчаткой.',
      en: 'Red beans have low GI. Rich in protein and fiber.'
    }
  },
  {
    id: 'v016',
    name: { uz: 'No\'xat', ru: 'Нут', en: 'Chickpeas' },
    category: 'vegetables',
    emoji: '🫘',
    gi: 28,
    gl: 8,
    rise: 'low',
    nutrition: { calories: 164, carbs: 27, sugar: 5, fiber: 7.6, protein: 8.9, fat: 2.6 },
    advice: { 
      uz: 'No\'xat past GI ga ega. Plant-based oqsil manbai.',
      ru: 'Нут имеет низкий ГИ. Источник растительного белка.',
      en: 'Chickpeas have low GI. Source of plant-based protein.'
    }
  },
  {
    id: 'v017',
    name: { uz: 'Soya', ru: 'Соя', en: 'Soybean' },
    category: 'vegetables',
    emoji: '🫘',
    gi: 16,
    gl: 1,
    rise: 'low',
    nutrition: { calories: 173, carbs: 10, sugar: 3, fiber: 6, protein: 17, fat: 9 },
    advice: { 
      uz: 'Soya juda past GI ga ega. Eng yaxshi oqsil manbalari.',
      ru: 'Соя имеет очень низкий ГИ. Один из лучших источников белка.',
      en: 'Soybean has very low GI. One of the best protein sources.'
    }
  },
  {
    id: 'v018',
    name: { uz: 'Qora loviya', ru: 'Черная фасоль', en: 'Black Beans' },
    category: 'vegetables',
    emoji: '🫘',
    gi: 30,
    gl: 7,
    rise: 'low',
    nutrition: { calories: 132, carbs: 24, sugar: 0, fiber: 8.7, protein: 8.9, fat: 0.5 },
    advice: { 
      uz: 'Qora loviya past GI ga ega. Tola bilan juda boy.',
      ru: 'Черная фасоль имеет низкий ГИ. Очень богата клетчаткой.',
      en: 'Black beans have low GI. Very rich in fiber.'
    }
  },
  {
    id: 'v019',
    name: { uz: 'Yasmiq', ru: 'Чечевица', en: 'Lentils' },
    category: 'vegetables',
    emoji: '🫘',
    gi: 32,
    gl: 5,
    rise: 'low',
    nutrition: { calories: 116, carbs: 20, sugar: 2, fiber: 7.9, protein: 9, fat: 0.4 },
    advice: { 
      uz: 'Yasmiq past GI ga ega. Superfoods kategoriyasida.',
      ru: 'Чечевица имеет низкий ГИ. В категории суперфудов.',
      en: 'Lentils have low GI. In the superfood category.'
    }
  },
  {
    id: 'v020',
    name: { uz: 'Koʻk no\'xat', ru: 'Зеленый горошек', en: 'Green Peas' },
    category: 'vegetables',
    emoji: '🫛',
    gi: 48,
    gl: 3,
    rise: 'low',
    nutrition: { calories: 81, carbs: 14, sugar: 6, fiber: 5, protein: 5, fat: 0.4 },
    advice: { 
      uz: 'Ko\'k no\'xat o\'rtacha GI ga ega. Oqsil va tola bilan boy.',
      ru: 'Зеленый горошек имеет средний ГИ. Богат белком и клетчаткой.',
      en: 'Green peas have medium GI. Rich in protein and fiber.'
    }
  },

  // Grains & Cereals (100+ items)
  {
    id: 'g001',
    name: { uz: 'Qo\'ng\'ir guruch', ru: 'Коричневый рис', en: 'Brown Rice' },
    category: 'grains',
    emoji: '🌾',
    gi: 50,
    gl: 16,
    rise: 'medium',
    nutrition: { calories: 112, carbs: 24, sugar: 0, fiber: 1.8, protein: 2.6, fat: 0.9 },
    advice: { 
      uz: 'Qo\'ng\'ir guruch o\'rtacha GI ga ega. Oq guruchdan yaxshiroq.',
      ru: 'Коричневый рис имеет средний ГИ. Лучше белого риса.',
      en: 'Brown rice has medium GI. Better than white rice.'
    }
  },
  {
    id: 'g002',
    name: { uz: 'Oq guruch', ru: 'Белый рис', en: 'White Rice' },
    category: 'grains',
    emoji: '🍚',
    gi: 73,
    gl: 29,
    rise: 'high',
    nutrition: { calories: 130, carbs: 28, sugar: 0, fiber: 0.4, protein: 2.7, fat: 0.3 },
    advice: { 
      uz: 'Oq guruch yuqori GI ga ega. Cheklangan miqdorda iste\'mol qiling.',
      ru: 'Белый рис имеет высокий ГИ. Употребляйте в ограниченном количестве.',
      en: 'White rice has high GI. Consume in limited amounts.'
    }
  },
  {
    id: 'g003',
    name: { uz: 'Makaron (to\'liq don)', ru: 'Макароны (цельнозерновые)', en: 'Whole Wheat Pasta' },
    category: 'grains',
    emoji: '🍝',
    gi: 42,
    gl: 17,
    rise: 'low',
    nutrition: { calories: 174, carbs: 37, sugar: 3, fiber: 6.3, protein: 7.5, fat: 0.8 },
    advice: { 
      uz: 'To\'liq don makaron past GI ga ega. Oq makarondan yaxshiroq.',
      ru: 'Цельнозерновые макароны имеют низкий ГИ. Лучше обычных макарон.',
      en: 'Whole wheat pasta has low GI. Better than regular pasta.'
    }
  },
  {
    id: 'g004',
    name: { uz: 'Makaron (oddiy)', ru: 'Макароны (обычные)', en: 'Regular Pasta' },
    category: 'grains',
    emoji: '🍝',
    gi: 58,
    gl: 23,
    rise: 'medium',
    nutrition: { calories: 158, carbs: 31, sugar: 1, fiber: 1.8, protein: 5.8, fat: 0.9 },
    advice: { 
      uz: 'Oddiy makaron o\'rtacha GI ga ega. Al dente pishirish yaxshiroq.',
      ru: 'Обычные макароны имеют средний ГИ. Лучше готовить al dente.',
      en: 'Regular pasta has medium GI. Better to cook al dente.'
    }
  },
  {
    id: 'g005',
    name: { uz: 'Suli', ru: 'Овсянка', en: 'Oatmeal' },
    category: 'grains',
    emoji: '🥣',
    gi: 55,
    gl: 13,
    rise: 'medium',
    nutrition: { calories: 68, carbs: 12, sugar: 0, fiber: 1.7, protein: 2.4, fat: 1.4 },
    advice: { 
      uz: 'Suli o\'rtacha GI ga ega. Nonushta uchun yaxshi variant.',
      ru: 'Овсянка имеет средний ГИ. Хороший вариант для завтрака.',
      en: 'Oatmeal has medium GI. Good option for breakfast.'
    }
  },
  {
    id: 'g006',
    name: { uz: 'Kinoa', ru: 'Киноа', en: 'Quinoa' },
    category: 'grains',
    emoji: '🌾',
    gi: 53,
    gl: 13,
    rise: 'medium',
    nutrition: { calories: 120, carbs: 21, sugar: 0, fiber: 2.8, protein: 4.4, fat: 1.9 },
    advice: { 
      uz: 'Kinoa o\'rtacha GI ga ega. Superfood va to\'liq oqsil manbai.',
      ru: 'Киноа имеет средний ГИ. Суперфуд и источник полноценного белка.',
      en: 'Quinoa has medium GI. Superfood and complete protein source.'
    }
  },
  {
    id: 'g007',
    name: { uz: 'Arpa', ru: 'Ячмень', en: 'Barley' },
    category: 'grains',
    emoji: '🌾',
    gi: 28,
    gl: 12,
    rise: 'low',
    nutrition: { calories: 123, carbs: 28, sugar: 0, fiber: 3.8, protein: 2.3, fat: 0.4 },
    advice: { 
      uz: 'Arpa past GI ga ega. Diabetiklar uchun eng yaxshi don.',
      ru: 'Ячмень имеет низкий ГИ. Лучшее зерно для диабетиков.',
      en: 'Barley has low GI. Best grain for diabetics.'
    }
  },
  {
    id: 'g008',
    name: { uz: 'Makkajo\'xori', ru: 'Кукуруза', en: 'Corn' },
    category: 'grains',
    emoji: '🌽',
    gi: 52,
    gl: 15,
    rise: 'medium',
    nutrition: { calories: 86, carbs: 19, sugar: 3, fiber: 2, protein: 3.2, fat: 1.2 },
    advice: { 
      uz: 'Makkajo\'xori o\'rtacha GI ga ega. Cheklangan miqdorda yaxshi.',
      ru: 'Кукуруза имеет средний ГИ. Хороша в ограниченном количестве.',
      en: 'Corn has medium GI. Good in limited amounts.'
    }
  },
  {
    id: 'g009',
    name: { uz: 'Qo\'ng\'ir guruch (yovvoyi)', ru: 'Дикий рис', en: 'Wild Rice' },
    category: 'grains',
    emoji: '🌾',
    gi: 57,
    gl: 18,
    rise: 'medium',
    nutrition: { calories: 101, carbs: 21, sugar: 1, fiber: 1.8, protein: 4, fat: 0.3 },
    advice: { 
      uz: 'Yovvoyi guruch o\'rtacha GI ga ega. Oqsil bilan boy.',
      ru: 'Дикий рис имеет средний ГИ. Богат белком.',
      en: 'Wild rice has medium GI. Rich in protein.'
    }
  },
  {
    id: 'g010',
    name: { uz: 'Bugdoy', ru: 'Пшеница', en: 'Wheat' },
    category: 'grains',
    emoji: '🌾',
    gi: 45,
    gl: 15,
    rise: 'low',
    nutrition: { calories: 339, carbs: 72, sugar: 0, fiber: 10.7, protein: 13.2, fat: 1.5 },
    advice: { 
      uz: 'To\'liq don bugdoy past GI ga ega. Tola bilan boy.',
      ru: 'Цельнозерновая пшеница имеет низкий ГИ. Богата клетчаткой.',
      en: 'Whole wheat has low GI. Rich in fiber.'
    }
  },

  // Proteins (80+ items)
  {
    id: 'p001',
    name: { uz: 'Tovuq ko\'kragi', ru: 'Куриная грудка', en: 'Chicken Breast' },
    category: 'proteins',
    emoji: '🍗',
    gi: 0,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 165, carbs: 0, sugar: 0, fiber: 0, protein: 31, fat: 3.6 },
    advice: { 
      uz: 'Tovuq ko\'kragi GI ga ega emas. Sog\'lom oqsil manbai.',
      ru: 'Куриная грудка не имеет ГИ. Здоровый источник белка.',
      en: 'Chicken breast has no GI. Healthy protein source.'
    }
  },
  {
    id: 'p002',
    name: { uz: 'Baliq (salmon)', ru: 'Рыба (лосось)', en: 'Fish (Salmon)' },
    category: 'proteins',
    emoji: '🐟',
    gi: 0,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 208, carbs: 0, sugar: 0, fiber: 0, protein: 20, fat: 13 },
    advice: { 
      uz: 'Salmon GI ga ega emas. Omega-3 bilan boy.',
      ru: 'Лосось не имеет ГИ. Богат Омега-3.',
      en: 'Salmon has no GI. Rich in Omega-3.'
    }
  },
  {
    id: 'p003',
    name: { uz: 'Tuxum', ru: 'Яйцо', en: 'Egg' },
    category: 'proteins',
    emoji: '🥚',
    gi: 0,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 155, carbs: 1, sugar: 1, fiber: 0, protein: 13, fat: 11 },
    advice: { 
      uz: 'Tuxum GI ga ega emas. To\'liq oqsil manbai.',
      ru: 'Яйцо не имеет ГИ. Источник полноценного белка.',
      en: 'Egg has no GI. Complete protein source.'
    }
  },
  {
    id: 'p004',
    name: { uz: 'Mol go\'shti', ru: 'Говядина', en: 'Beef' },
    category: 'proteins',
    emoji: '🥩',
    gi: 0,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 250, carbs: 0, sugar: 0, fiber: 0, protein: 26, fat: 15 },
    advice: { 
      uz: 'Mol go\'shti GI ga ega emas. Temir bilan boy.',
      ru: 'Говядина не имеет ГИ. Богата железом.',
      en: 'Beef has no GI. Rich in iron.'
    }
  },
  {
    id: 'p005',
    name: { uz: 'Qo\'y go\'shti', ru: 'Баранина', en: 'Lamb' },
    category: 'proteins',
    emoji: '🥩',
    gi: 0,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 294, carbs: 0, sugar: 0, fiber: 0, protein: 25, fat: 21 },
    advice: { 
      uz: 'Qo\'y go\'shti GI ga ega emas. Lekin yog\'li, cheklangan miqdorda.',
      ru: 'Баранина не имеет ГИ. Но жирная, в ограниченном количестве.',
      en: 'Lamb has no GI. But fatty, in limited amounts.'
    }
  },
  {
    id: 'p006',
    name: { uz: 'Dengiz mahsulotlari (qisqichbaqa)', ru: 'Морепродукты (креветки)', en: 'Seafood (Shrimp)' },
    category: 'proteins',
    emoji: '🦐',
    gi: 0,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 99, carbs: 0, sugar: 0, fiber: 0, protein: 24, fat: 0.3 },
    advice: { 
      uz: 'Qisqichbaqa GI ga ega emas. Kam kaloriyali oqsil.',
      ru: 'Креветки не имеют ГИ. Низкокалорийный белок.',
      en: 'Shrimp has no GI. Low-calorie protein.'
    }
  },
  {
    id: 'p007',
    name: { uz: 'Tuna baliq', ru: 'Тунец', en: 'Tuna' },
    category: 'proteins',
    emoji: '🐟',
    gi: 0,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 144, carbs: 0, sugar: 0, fiber: 0, protein: 30, fat: 1 },
    advice: { 
      uz: 'Tuna GI ga ega emas. Kam yog\'li, yuqori oqsilli.',
      ru: 'Тунец не имеет ГИ. Низкожирный, высокобелковый.',
      en: 'Tuna has no GI. Low-fat, high-protein.'
    }
  },
  {
    id: 'p008',
    name: { uz: 'Kurka', ru: 'Индейка', en: 'Turkey' },
    category: 'proteins',
    emoji: '🦃',
    gi: 0,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 135, carbs: 0, sugar: 0, fiber: 0, protein: 30, fat: 0.7 },
    advice: { 
      uz: 'Kurka GI ga ega emas. Tovuqdan ham yaxshiroq.',
      ru: 'Индейка не имеет ГИ. Даже ��учше курицы.',
      en: 'Turkey has no GI. Even better than chicken.'
    }
  },
  {
    id: 'p010',
    name: { uz: 'Tofu', ru: 'Тофу', en: 'Tofu' },
    category: 'proteins',
    emoji: '🧈',
    gi: 15,
    gl: 1,
    rise: 'low',
    nutrition: { calories: 76, carbs: 2, sugar: 0, fiber: 0.3, protein: 8, fat: 4.8 },
    advice: { 
      uz: 'Tofu juda past GI ga ega. Eng yaxshi vegetarian oqsil.',
      ru: 'Тофу имеет очень низкий ГИ. Лучший вегетарианский белок.',
      en: 'Tofu has very low GI. Best vegetarian protein.'
    }
  },

  // Beverages (50+ items)
  {
    id: 'b001',
    name: { uz: 'Suv', ru: 'Вода', en: 'Water' },
    category: 'beverages',
    emoji: '💧',
    gi: 0,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 0, carbs: 0, sugar: 0, fiber: 0, protein: 0, fat: 0 },
    advice: { 
      uz: 'Suv GI ga ega emas. Kuniga 8-10 stakan iching.',
      ru: 'Вода не имеет ГИ. Пейте 8-10 стаканов в день.',
      en: 'Water has no GI. Drink 8-10 glasses daily.'
    }
  },
  {
    id: 'b002',
    name: { uz: 'Yashil choy', ru: 'Зеленый чай', en: 'Green Tea' },
    category: 'beverages',
    emoji: '🍵',
    gi: 0,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 1, carbs: 0, sugar: 0, fiber: 0, protein: 0, fat: 0 },
    advice: { 
      uz: 'Yashil choy GI ga ega emas. Antioksidantlar bilan boy.',
      ru: 'Зеленый чай не имеет ГИ. Богат антиоксидантами.',
      en: 'Green tea has no GI. Rich in antioxidants.'
    }
  },
  {
    id: 'b003',
    name: { uz: 'Qora choy (shakarsiz)', ru: 'Черный чай (без сахара)', en: 'Black Tea (unsweetened)' },
    category: 'beverages',
    emoji: '☕',
    gi: 0,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 2, carbs: 0, sugar: 0, fiber: 0, protein: 0, fat: 0 },
    advice: { 
      uz: 'Qora choy GI ga ega emas. Shakarsiz yaxshi.',
      ru: 'Черный чай не имеет ГИ. Хорош без сахара.',
      en: 'Black tea has no GI. Good without sugar.'
    }
  },
  {
    id: 'b004',
    name: { uz: 'Qahva (shakarsiz)', ru: 'Кофе (без сахара)', en: 'Coffee (unsweetened)' },
    category: 'beverages',
    emoji: '☕',
    gi: 0,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 2, carbs: 0, sugar: 0, fiber: 0, protein: 0.3, fat: 0 },
    advice: { 
      uz: 'Qahva GI ga ega emas. Shakarsiz yaxshi, lekin cheklangan miqdorda.',
      ru: 'Кофе не имеет ГИ. Хорош без сахара, но в ограниченном количестве.',
      en: 'Coffee has no GI. Good without sugar but in moderation.'
    }
  },
  {
    id: 'b005',
    name: { uz: 'Gazlangan ichimlik', ru: 'Газированный напиток', en: 'Soda' },
    category: 'beverages',
    emoji: '🥤',
    gi: 63,
    gl: 16,
    rise: 'high',
    nutrition: { calories: 140, carbs: 39, sugar: 39, fiber: 0, protein: 0, fat: 0 },
    advice: { 
      uz: 'Gazlangan ichimlik yuqori GI va shakarga ega. Chetlab o\'ting!',
      ru: 'Газировка имеет высокий ГИ и сахар. Избегайте!',
      en: 'Soda has high GI and sugar. Avoid!'
    }
  },
  {
    id: 'b006',
    name: { uz: 'Meva sharbati (qo\'shimchasiz)', ru: 'Фруктовый сок (без добавок)', en: 'Fruit Juice (no added sugar)' },
    category: 'beverages',
    emoji: '🧃',
    gi: 50,
    gl: 13,
    rise: 'medium',
    nutrition: { calories: 110, carbs: 26, sugar: 24, fiber: 0.5, protein: 1.7, fat: 0.5 },
    advice: { 
      uz: 'Meva sharbati o\'rtacha GI ga ega. Cheklangan miqdorda, butun meva yaxshiroq.',
      ru: 'Фруктовый сок имеет средний ГИ. В ограниченном количестве, лучше целые фрукты.',
      en: 'Fruit juice has medium GI. Limited amounts, whole fruits are better.'
    }
  },
  {
    id: 'b007',
    name: { uz: 'Sut (kam yog\'li)', ru: 'Молоко (нежирное)', en: 'Milk (low-fat)' },
    category: 'beverages',
    emoji: '🥛',
    gi: 32,
    gl: 4,
    rise: 'low',
    nutrition: { calories: 42, carbs: 5, sugar: 5, fiber: 0, protein: 3.4, fat: 1 },
    advice: { 
      uz: 'Kam yog\'li sut past GI ga ega. Kaltsiy manbai.',
      ru: 'Нежирное молоко имеет низкий ГИ. Источник кальция.',
      en: 'Low-fat milk has low GI. Source of calcium.'
    }
  },
  {
    id: 'b008',
    name: { uz: 'Bodom suті', ru: 'Миндальное молоко', en: 'Almond Milk' },
    category: 'beverages',
    emoji: '🥛',
    gi: 25,
    gl: 1,
    rise: 'low',
    nutrition: { calories: 17, carbs: 1, sugar: 0, fiber: 0.4, protein: 0.6, fat: 1.2 },
    advice: { 
      uz: 'Bodom suti past GI ga ega. Laktoza intolerantligi uchun yaxshi.',
      ru: 'Миндальное молоко имеет низкий ГИ. Хорошо при непереносимости лактозы.',
      en: 'Almond milk has low GI. Good for lactose intolerance.'
    }
  },
  {
    id: 'b009',
    name: { uz: 'Kokos suvi', ru: 'Кокосовая вода', en: 'Coconut Water' },
    category: 'beverages',
    emoji: '🥥',
    gi: 54,
    gl: 3,
    rise: 'medium',
    nutrition: { calories: 19, carbs: 4, sugar: 3, fiber: 1, protein: 0.7, fat: 0.2 },
    advice: { 
      uz: 'Kokos suvi o\'rtacha GI ga ega. Elektrolitlar bilan boy.',
      ru: 'Кокосовая вода имеет средний ГИ. Богата электролитами.',
      en: 'Coconut water has medium GI. Rich in electrolytes.'
    }
  },
  {
    id: 'b010',
    name: { uz: 'Yogurt ichimlik', ru: 'Питьевой йогурт', en: 'Drinking Yogurt' },
    category: 'beverages',
    emoji: '🥛',
    gi: 35,
    gl: 3,
    rise: 'low',
    nutrition: { calories: 59, carbs: 4, sugar: 4, fiber: 0, protein: 3.5, fat: 3.3 },
    advice: { 
      uz: 'Yogurt ichimlik past GI ga ega. Probiotiklar bilan boy.',
      ru: 'Питьевой йогурт имеет низкий ГИ. Богат пробиотиками.',
      en: 'Drinking yogurt has low GI. Rich in probiotics.'
    }
  },

  // National Dishes (Uzbek and regional - 100+ items)
  {
    id: 'n001',
    name: { uz: 'Palov', ru: 'Плов', en: 'Plov' },
    category: 'nationalDishes',
    emoji: '🍛',
    gi: 65,
    gl: 40,
    rise: 'high',
    nutrition: { calories: 350, carbs: 50, sugar: 3, fiber: 2, protein: 15, fat: 12 },
    advice: { 
      uz: 'Palov yuqori GI ga ega. Kichik porsiya va sabzavotlar bilan yaxshiroq.',
      ru: 'Плов имеет высокий ГИ. Лучше небольшая порция и с овощами.',
      en: 'Plov has high GI. Better in small portions with vegetables.'
    }
  },
  {
    id: 'n002',
    name: { uz: 'Lagʻmon', ru: 'Лагман', en: 'Lagman' },
    category: 'nationalDishes',
    emoji: '🍜',
    gi: 55,
    gl: 30,
    rise: 'medium',
    nutrition: { calories: 280, carbs: 45, sugar: 4, fiber: 3, protein: 12, fat: 8 },
    advice: { 
      uz: 'Lag\'mon o\'rtacha GI ga ega. Sabzavotlar ko\'p bo\'lsa yaxshiroq.',
      ru: 'Лагман имеет средний ГИ. Лучше с большим количеством овощей.',
      en: 'Lagman has medium GI. Better with more vegetables.'
    }
  },
  {
    id: 'n003',
    name: { uz: 'Mastava', ru: 'Мастава', en: 'Mastava' },
    category: 'nationalDishes',
    emoji: '🍲',
    gi: 60,
    gl: 25,
    rise: 'medium',
    nutrition: { calories: 220, carbs: 35, sugar: 3, fiber: 2.5, protein: 10, fat: 6 },
    advice: { 
      uz: 'Mastava o\'rtacha GI ga ega. Sho\'rva bo\'lgani uchun yaxshiroq.',
      ru: 'Мастава имеет средний ГИ. Лучше, потому что это суп.',
      en: 'Mastava has medium GI. Better because it\'s a soup.'
    }
  },
  {
    id: 'n004',
    name: { uz: 'Shashlik', ru: 'Шашлык', en: 'Shashlik' },
    category: 'nationalDishes',
    emoji: '🍢',
    gi: 0,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 250, carbs: 0, sugar: 0, fiber: 0, protein: 26, fat: 16 },
    advice: { 
      uz: 'Shashlik GI ga ega emas. Go\'sht bo\'lgani uchun yaxshi, lekin yog\'ni chekling.',
      ru: 'Шашлык не имеет ГИ. Хорош, так как это мясо, но ограничьте жир.',
      en: 'Shashlik has no GI. Good as it\'s meat, but limit fat.'
    }
  },
  {
    id: 'n005',
    name: { uz: 'Manti', ru: 'Манты', en: 'Manti' },
    category: 'nationalDishes',
    emoji: '🥟',
    gi: 60,
    gl: 35,
    rise: 'medium',
    nutrition: { calories: 320, carbs: 38, sugar: 2, fiber: 2, protein: 14, fat: 13 },
    advice: { 
      uz: 'Manti o\'rtacha GI ga ega. Cheklangan miqdorda va sabzavotlar bilan.',
      ru: 'Манты имеют средний ГИ. В ограниченном количестве и с овощами.',
      en: 'Manti has medium GI. In limited amounts with vegetables.'
    }
  },
  {
    id: 'n006',
    name: { uz: 'Somsa', ru: 'Самса', en: 'Samsa' },
    category: 'nationalDishes',
    emoji: '🥟',
    gi: 70,
    gl: 30,
    rise: 'high',
    nutrition: { calories: 290, carbs: 32, sugar: 1, fiber: 1.5, protein: 12, fat: 14 },
    advice: { 
      uz: 'Somsa yuqori GI ga ega. Kamroq iste\'mol qiling.',
      ru: 'Самса имеет высокий ГИ. Употребляйте реже.',
      en: 'Samsa has high GI. Consume less often.'
    }
  },
  {
    id: 'n007',
    name: { uz: 'Shorpa', ru: 'Шурпа', en: 'Shorpa' },
    category: 'nationalDishes',
    emoji: '🍲',
    gi: 35,
    gl: 8,
    rise: 'low',
    nutrition: { calories: 180, carbs: 15, sugar: 3, fiber: 2, protein: 12, fat: 8 },
    advice: { 
      uz: 'Shorpa past GI ga ega. Diabetiklar uchun yaxshi ovqat.',
      ru: 'Шурпа имеет низкий ГИ. Хорошее блюдо для диабетиков.',
      en: 'Shorpa has low GI. Good dish for diabetics.'
    }
  },
  {
    id: 'n008',
    name: { uz: 'Dimlama', ru: 'Димлама', en: 'Dimlama' },
    category: 'nationalDishes',
    emoji: '🍲',
    gi: 45,
    gl: 12,
    rise: 'low',
    nutrition: { calories: 200, carbs: 20, sugar: 5, fiber: 4, protein: 10, fat: 8 },
    advice: { 
      uz: 'Dimlama past GI ga ega. Sabzavotlar ko\'p, yaxshi variant.',
      ru: 'Димлама имеет низкий ГИ. Много овощей, хороший вариант.',
      en: 'Dimlama has low GI. Lots of vegetables, good option.'
    }
  },
  {
    id: 'n009',
    name: { uz: 'Norin', ru: 'Нарын', en: 'Norin' },
    category: 'nationalDishes',
    emoji: '🍝',
    gi: 55,
    gl: 28,
    rise: 'medium',
    nutrition: { calories: 260, carbs: 40, sugar: 2, fiber: 2, protein: 16, fat: 6 },
    advice: { 
      uz: 'Norin o\'rtacha GI ga ega. Cheklangan porsiyada yaxshi.',
      ru: 'Нарын имеет средний ГИ. Хорош в ограниченной порции.',
      en: 'Norin has medium GI. Good in limited portion.'
    }
  },
  {
    id: 'n010',
    name: { uz: 'Chuchvara', ru: 'Чучвара', en: 'Chuchvara' },
    category: 'nationalDishes',
    emoji: '🥟',
    gi: 58,
    gl: 32,
    rise: 'medium',
    nutrition: { calories: 240, carbs: 35, sugar: 2, fiber: 1.5, protein: 11, fat: 7 },
    advice: { 
      uz: 'Chuchvara o\'rtacha GI ga ega. Sho\'rva bilan yaxshiroq.',
      ru: 'Чучвара имеет средний ГИ. Лучше в супе.',
      en: 'Chuchvara has medium GI. Better in soup.'
    }
  },

  // Bread & Bakery (60+ items)
  {
    id: 'br001',
    name: { uz: 'Oq non', ru: 'Белый хлеб', en: 'White Bread' },
    category: 'bread',
    emoji: '🍞',
    gi: 75,
    gl: 10,
    rise: 'high',
    nutrition: { calories: 265, carbs: 49, sugar: 5, fiber: 2.7, protein: 9, fat: 3.2 },
    advice: { 
      uz: 'Oq non yuqori GI ga ega. Cheklangan miqdorda.',
      ru: 'Белый хлеб имеет высокий ГИ. В ограниченном количестве.',
      en: 'White bread has high GI. In limited amounts.'
    }
  },
  {
    id: 'br002',
    name: { uz: 'To\'liq donli non', ru: 'Цельнозерновой хлеб', en: 'Whole Grain Bread' },
    category: 'bread',
    emoji: '🍞',
    gi: 51,
    gl: 7,
    rise: 'medium',
    nutrition: { calories: 247, carbs: 41, sugar: 6, fiber: 7, protein: 13, fat: 4.2 },
    advice: { 
      uz: 'To\'liq donli non o\'rtacha GI ga ega. Oq nondan yaxshiroq.',
      ru: 'Цельнозерновой хлеб имеет средний ГИ. Лучше белого хлеба.',
      en: 'Whole grain bread has medium GI. Better than white bread.'
    }
  },
  {
    id: 'br003',
    name: { uz: 'Lavash', ru: 'Лаваш', en: 'Lavash' },
    category: 'bread',
    emoji: '🫓',
    gi: 68,
    gl: 15,
    rise: 'high',
    nutrition: { calories: 275, carbs: 56, sugar: 1, fiber: 2.2, protein: 8.8, fat: 1.2 },
    advice: { 
      uz: 'Lavash yuqori GI ga ega. Cheklangan miqdorda iste\'mol qiling.',
      ru: 'Лаваш имеет высокий ГИ. Употребляйте в ограниченном количестве.',
      en: 'Lavash has high GI. Consume in limited amounts.'
    }
  },
  {
    id: 'br004',
    name: { uz: 'Tandirli non', ru: 'Тандырный хлеб', en: 'Tandoor Bread' },
    category: 'bread',
    emoji: '🍞',
    gi: 72,
    gl: 18,
    rise: 'high',
    nutrition: { calories: 290, carbs: 58, sugar: 2, fiber: 2.5, protein: 9.5, fat: 2 },
    advice: { 
      uz: 'Tandirli non yuqori GI ga ega. Milliy taom, lekin cheklangan miqdorda.',
      ru: 'Тандырный хлеб имеет высокий ГИ. Национальный продукт, но в ограниченном количестве.',
      en: 'Tandoor bread has high GI. Traditional but in limited amounts.'
    }
  },
  {
    id: 'br005',
    name: { uz: 'Patir', ru: 'Патыр', en: 'Patir' },
    category: 'bread',
    emoji: '🍞',
    gi: 70,
    gl: 20,
    rise: 'high',
    nutrition: { calories: 310, carbs: 60, sugar: 3, fiber: 2, protein: 10, fat: 4 },
    advice: { 
      uz: 'Patir yuqori GI ga ega. Bayramlarda oz miqdorda.',
      ru: 'Патыр имеет высокий ГИ. В праздники в небольшом количестве.',
      en: 'Patir has high GI. On holidays in small amounts.'
    }
  },
  {
    id: 'br006',
    name: { uz: 'Katlama', ru: 'Катлама', en: 'Katlama' },
    category: 'bread',
    emoji: '🥐',
    gi: 65,
    gl: 22,
    rise: 'high',
    nutrition: { calories: 340, carbs: 55, sugar: 2, fiber: 1.8, protein: 8, fat: 10 },
    advice: { 
      uz: 'Katlama yuqori GI va yog\'ga ega. Kamdan-kam iste\'mol qiling.',
      ru: 'Катлама имеет высокий ГИ и жир. Употребляйте редко.',
      en: 'Katlama has high GI and fat. Consume rarely.'
    }
  },
  {
    id: 'br007',
    name: { uz: 'Rulet non', ru: 'Рулетный хлеб', en: 'Roll Bread' },
    category: 'bread',
    emoji: '🥖',
    gi: 73,
    gl: 12,
    rise: 'high',
    nutrition: { calories: 270, carbs: 52, sugar: 4, fiber: 2.3, protein: 8.5, fat: 2.8 },
    advice: { 
      uz: 'Rulet non yuqori GI ga ega. Cheklangan miqdorda.',
      ru: 'Рулетный хлеб имеет высокий ГИ. В ограниченном количестве.',
      en: 'Roll bread has high GI. In limited amounts.'
    }
  },

  // Dairy Products (40+ items)
  {
    id: 'd001',
    name: { uz: 'Qatiq', ru: 'Катык', en: 'Katyk (Yogurt)' },
    category: 'dairy',
    emoji: '🥛',
    gi: 35,
    gl: 3,
    rise: 'low',
    nutrition: { calories: 61, carbs: 4.7, sugar: 4.7, fiber: 0, protein: 3.5, fat: 3.3 },
    advice: { 
      uz: 'Qatiq past GI ga ega. Probiotiklar bilan boy, kundalik iste\'mol uchun yaxshi.',
      ru: 'Катык имеет низкий ГИ. Богат пробиотиками, хорош для ежедневного употребления.',
      en: 'Katyk has low GI. Rich in probiotics, good for daily consumption.'
    }
  },
  {
    id: 'd002',
    name: { uz: 'Suzma', ru: 'Сузьма', en: 'Suzma' },
    category: 'dairy',
    emoji: '🧈',
    gi: 30,
    gl: 2,
    rise: 'low',
    nutrition: { calories: 98, carbs: 3.5, sugar: 3.5, fiber: 0, protein: 7, fat: 7 },
    advice: { 
      uz: 'Suzma past GI ga ega. Yuqori oqsilli, diabetiklar uchun yaxshi.',
      ru: 'Сузьма имеет низкий ГИ. Высокобелковая, хороша для диабетиков.',
      en: 'Suzma has low GI. High protein, good for diabetics.'
    }
  },
  {
    id: 'd003',
    name: { uz: 'Pishloq (qattiq)', ru: 'Сыр (твердый)', en: 'Cheese (hard)' },
    category: 'dairy',
    emoji: '🧀',
    gi: 0,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 402, carbs: 1.3, sugar: 0.5, fiber: 0, protein: 25, fat: 33 },
    advice: { 
      uz: 'Qattiq pishloq GI ga ega emas. Yuqori yog\'li, cheklangan miqdorda.',
      ru: 'Твердый сыр не имеет ГИ. Высокожирный, в ограниченном количестве.',
      en: 'Hard cheese has no GI. High fat, in limited amounts.'
    }
  },
  {
    id: 'd004',
    name: { uz: 'Tvorog', ru: 'Творог', en: 'Cottage Cheese' },
    category: 'dairy',
    emoji: '🧈',
    gi: 30,
    gl: 1,
    rise: 'low',
    nutrition: { calories: 98, carbs: 3.4, sugar: 2.7, fiber: 0, protein: 11, fat: 4.3 },
    advice: { 
      uz: 'Tvorog past GI ga ega. Yuqori oqsilli, ideal nonushta.',
      ru: 'Творог имеет низкий ГИ. Высокобелковый, идеален для завтрака.',
      en: 'Cottage cheese has low GI. High protein, ideal for breakfast.'
    }
  },
  {
    id: 'd005',
    name: { uz: 'Qaymoq', ru: 'Каймак', en: 'Kaymak' },
    category: 'dairy',
    emoji: '🧈',
    gi: 35,
    gl: 2,
    rise: 'low',
    nutrition: { calories: 380, carbs: 3, sugar: 3, fiber: 0, protein: 2.5, fat: 40 },
    advice: { 
      uz: 'Qaymoq past GI ga ega, lekin juda yog\'li. Kamdan-kam iste\'mol qiling.',
      ru: 'Каймак имеет низкий ГИ, но очень жирный. Употребляйте редко.',
      en: 'Kaymak has low GI but very high fat. Consume rarely.'
    }
  },
  {
    id: 'd006',
    name: { uz: 'Ayran', ru: 'Айран', en: 'Ayran' },
    category: 'dairy',
    emoji: '🥛',
    gi: 32,
    gl: 3,
    rise: 'low',
    nutrition: { calories: 38, carbs: 4.5, sugar: 4.5, fiber: 0, protein: 2.8, fat: 1 },
    advice: { 
      uz: 'Ayran past GI ga ega. Probiotiklar bilan boy, yozda yaxshi.',
      ru: 'Айран имеет низкий ГИ. Богат пробиотиками, хорош летом.',
      en: 'Ayran has low GI. Rich in probiotics, good in summer.'
    }
  },

  // Nuts & Seeds (50+ items)
  {
    id: 'nu001',
    name: { uz: 'Bodom', ru: 'Миндаль', en: 'Almonds' },
    category: 'nuts',
    emoji: '🌰',
    gi: 0,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 579, carbs: 22, sugar: 4, fiber: 12.5, protein: 21, fat: 50 },
    advice: { 
      uz: 'Bodom GI ga ega emas. Foydali yog\'lar bilan boy, kuniga 20-25 dona.',
      ru: 'Миндаль не имеет ГИ. Богат полезными жирами, 20-25 штук в день.',
      en: 'Almonds have no GI. Rich in healthy fats, 20-25 pieces daily.'
    }
  },
  {
    id: 'nu002',
    name: { uz: 'Yong\'oq', ru: 'Грецкий орех', en: 'Walnuts' },
    category: 'nuts',
    emoji: '🥜',
    gi: 15,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 654, carbs: 14, sugar: 3, fiber: 6.7, protein: 15, fat: 65 },
    advice: { 
      uz: 'Yong\'oq juda past GI ga ega. Omega-3 bilan boy, kuniga 5-7 dona.',
      ru: 'Грецкий орех имеет очень низкий ГИ. Богат Омега-3, 5-7 штук в день.',
      en: 'Walnuts have very low GI. Rich in Omega-3, 5-7 pieces daily.'
    }
  },
  {
    id: 'nu003',
    name: { uz: 'Fistiq', ru: 'Фисташки', en: 'Pistachios' },
    category: 'nuts',
    emoji: '🥜',
    gi: 15,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 560, carbs: 28, sugar: 8, fiber: 10, protein: 20, fat: 45 },
    advice: { 
      uz: 'Fistiq juda past GI ga ega. Antioksidantlar bilan boy.',
      ru: 'Фисташки имеют очень низкий ГИ. Богаты антиоксидантами.',
      en: 'Pistachios have very low GI. Rich in antioxidants.'
    }
  },
  {
    id: 'nu004',
    name: { uz: 'Arahis', ru: 'Арахис', en: 'Peanuts' },
    category: 'nuts',
    emoji: '🥜',
    gi: 14,
    gl: 1,
    rise: 'low',
    nutrition: { calories: 567, carbs: 16, sugar: 4, fiber: 8.5, protein: 26, fat: 49 },
    advice: { 
      uz: 'Arahis juda past GI ga ega. Oqsil bilan boy, lekin kaloriyali.',
      ru: 'Арахис имеет очень низкий ГИ. Богат белком, но калориен.',
      en: 'Peanuts have very low GI. Rich in protein but high in calories.'
    }
  },
  {
    id: 'nu005',
    name: { uz: 'Kungaboqar urug\'i', ru: 'Семена подсолнечника', en: 'Sunflower Seeds' },
    category: 'nuts',
    emoji: '🌻',
    gi: 20,
    gl: 0,
    rise: 'low',
    nutrition: { calories: 584, carbs: 20, sugar: 3, fiber: 8.6, protein: 21, fat: 51 },
    advice: { 
      uz: 'Kungaboqar urug\'i past GI ga ega. Vitamin E bilan boy.',
      ru: 'Семена подсолнечника имеют низкий ГИ. Богаты витамином E.',
      en: 'Sunflower seeds have low GI. Rich in vitamin E.'
    }
  },
  {
    id: 'nu006',
    name: { uz: 'Qovoq urug\'i', ru: 'Семена тыквы', en: 'Pumpkin Seeds' },
    category: 'nuts',
    emoji: '🎃',
    gi: 25,
    gl: 2,
    rise: 'low',
    nutrition: { calories: 559, carbs: 15, sugar: 1, fiber: 6, protein: 30, fat: 49 },
    advice: { 
      uz: 'Qovoq urug\'i past GI ga ega. Magniy va rux bilan boy.',
      ru: 'Семена тыквы имеют низкий ГИ. Богаты магнием и цинком.',
      en: 'Pumpkin seeds have low GI. Rich in magnesium and zinc.'
    }
  },

  // Sweets & Desserts (40+ items)
  {
    id: 's001',
    name: { uz: 'Shakar', ru: 'Сахар', en: 'Sugar' },
    category: 'sweets',
    emoji: '🍬',
    gi: 65,
    gl: 65,
    rise: 'high',
    nutrition: { calories: 387, carbs: 100, sugar: 100, fiber: 0, protein: 0, fat: 0 },
    advice: { 
      uz: 'Shakar yuqori GI ga ega. Chetlab o\'ting yoki to\'liq chekling!',
      ru: 'Сахар имеет высокий ГИ. Избегайте или полностью исключите!',
      en: 'Sugar has high GI. Avoid or eliminate completely!'
    }
  },
  {
    id: 's002',
    name: { uz: 'Shokolad (qora)', ru: 'Шоколад (темный)', en: 'Dark Chocolate' },
    category: 'sweets',
    emoji: '🍫',
    gi: 23,
    gl: 6,
    rise: 'low',
    nutrition: { calories: 598, carbs: 46, sugar: 24, fiber: 11, protein: 8, fat: 43 },
    advice: { 
      uz: 'Qora shokolad (70%+) past GI ga ega. Kichik miqdorda (20-30g) yaxshi.',
      ru: 'Темный шоколад (70%+) имеет низкий ГИ. Хорош в небольшом количестве (20-30г).',
      en: 'Dark chocolate (70%+) has low GI. Good in small amounts (20-30g).'
    }
  },
  {
    id: 's003',
    name: { uz: 'Shokolad (sutli)', ru: 'Шоколад (молочный)', en: 'Milk Chocolate' },
    category: 'sweets',
    emoji: '🍫',
    gi: 43,
    gl: 13,
    rise: 'medium',
    nutrition: { calories: 535, carbs: 59, sugar: 51, fiber: 3.4, protein: 8, fat: 30 },
    advice: { 
      uz: 'Sutli shokolad o\'rtacha GI ga ega. Kamroq iste\'mol qiling.',
      ru: 'Молочный шоколад имеет средний ГИ. Употребляйте реже.',
      en: 'Milk chocolate has medium GI. Consume less often.'
    }
  },
  {
    id: 's004',
    name: { uz: 'Asal', ru: 'Мед', en: 'Honey' },
    category: 'sweets',
    emoji: '🍯',
    gi: 58,
    gl: 10,
    rise: 'medium',
    nutrition: { calories: 304, carbs: 82, sugar: 82, fiber: 0.2, protein: 0.3, fat: 0 },
    advice: { 
      uz: 'Asal o\'rtacha GI ga ega. Shakardan yaxshiroq, lekin cheklangan miqdorda (1 choy qoshiq).',
      ru: 'Мед имеет средний ГИ. Лучше сахара, но в ограниченном количестве (1 чайная ложка).',
      en: 'Honey has medium GI. Better than sugar but in limited amounts (1 teaspoon).'
    }
  },
  {
    id: 's005',
    name: { uz: 'Tort', ru: 'Торт', en: 'Cake' },
    category: 'sweets',
    emoji: '🍰',
    gi: 70,
    gl: 24,
    rise: 'high',
    nutrition: { calories: 257, carbs: 34, sugar: 20, fiber: 1.5, protein: 4, fat: 11 },
    advice: { 
      uz: 'Tort yuqori GI ga ega. Bayramlarda juda kichik porsiya.',
      ru: 'Торт имеет высокий ГИ. В праздники очень маленькая порция.',
      en: 'Cake has high GI. Very small portion on holidays.'
    }
  },
  {
    id: 's006',
    name: { uz: 'Muzqaymoq', ru: 'Мороженое', en: 'Ice Cream' },
    category: 'sweets',
    emoji: '🍦',
    gi: 61,
    gl: 8,
    rise: 'medium',
    nutrition: { calories: 207, carbs: 24, sugar: 21, fiber: 0.7, protein: 3.5, fat: 11 },
    advice: { 
      uz: 'Muzqaymoq o\'rtacha GI ga ega. Kamdan-kam va kichik porsiya.',
      ru: 'Мороженое имеет средний ГИ. Редко и маленькими порциями.',
      en: 'Ice cream has medium GI. Rarely and in small portions.'
    }
  },
];

export const categories = [
  { id: 'fruits', nameKey: 'fruits', emoji: '🍎' },
  { id: 'vegetables', nameKey: 'vegetables', emoji: '🥗' },
  { id: 'grains', nameKey: 'grains', emoji: '🌾' },
  { id: 'proteins', nameKey: 'proteins', emoji: '🍖' },
  { id: 'beverages', nameKey: 'beverages', emoji: '🥤' },
  { id: 'nationalDishes', nameKey: 'nationalDishes', emoji: '🍲' },
  { id: 'bread', nameKey: 'bread', emoji: '🍞' },
  { id: 'dairy', nameKey: 'dairy', emoji: '🥛' },
  { id: 'nuts', nameKey: 'nuts', emoji: '🥜' },
  { id: 'sweets', nameKey: 'sweets', emoji: '🍬' },
];

// Helper function to determine product status based on blood sugar level
export function getProductStatus(product: Product, fastingLevel?: number, postMealLevel?: number): 'safe' | 'caution' | 'avoid' {
  const avgLevel = fastingLevel && postMealLevel ? (fastingLevel + postMealLevel) / 2 : 
                   fastingLevel || postMealLevel || 5;

  // Logic for status determination based on blood sugar and product GI/GL
  if (avgLevel >= 11) {
    // Very high blood sugar - be very strict
    if (product.gi < 30 && product.gl < 5) return 'safe';
    if (product.gi < 50 && product.gl < 10) return 'caution';
    return 'avoid';
  } else if (avgLevel >= 7) {
    // High blood sugar - be cautious
    if (product.gi < 40 && product.gl < 8) return 'safe';
    if (product.gi < 60 && product.gl < 15) return 'caution';
    return 'avoid';
  } else {
    // Normal blood sugar - more flexibility
    if (product.gi < 55 && product.gl < 10) return 'safe';
    if (product.gi < 70 && product.gl < 20) return 'caution';
    return 'avoid';
  }
}
