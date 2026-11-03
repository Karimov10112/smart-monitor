/**
 * Qand miqdoriga qarab ovqatlanish va parhez bo'yicha klinik tavsiyalar dvigateli (Nutrition Engine)
 * O'zbek, Rus va Ingliz tillarini qo'llab-quvvatlaydi.
 */

const { normalizeToMmol } = require('./converters');

const NUTRITION_DATABASE = {
  uz: {
    fasting: {
      low: {
        status: '🔴 Past — Gipoglikemiya',
        severity: 'CRITICAL',
        advice: 'Qand darajasi juda past! Darhol shirinlik yoki meva sharbati iching.',
        foods_ok: ['Shakarli suv (1 stakan)', 'Mevali sharbat (150-200 ml)', 'Glyukoza tabletkasi / asal (1 osh qoshiq)'],
        foods_avoid: ['Insulin inyeksiyasini qilmang, og\'ir jismoniy mashq qilmang'],
        action: '15g tez hazm bo\'ladigan uglevod iste\'mol qiling va 15 daqiqadan so\'ng qand miqdorini qayta o\'lchang (15/15 qoidasi).'
      },
      normal: {
        status: '🟢 Normal (och qoringa 4.0–7.0 mmol/l)',
        severity: 'NORMAL',
        advice: 'Qand darajangiz maqsadli oraliqda! Ajoyib!',
        foods_ok: ['Tuxum (qaynatma)', 'Sut / qatiq / kefir', 'To\'liq bug\'doy noni (1 bo\'lak)', 'Yangi sabzavotlar'],
        foods_avoid: ['Shirinliklar', 'Pechenye/shirin pishiriqlar', 'Oq un mahsulotlari', 'Gazli shirin ichimliklar'],
        action: 'Ertalabki sog\'lom nonushtani shu tartibda davom ettiring.'
      },
      high: {
        status: '🟡 Yuqori (och qorinda ≥7.0 mmol/l)',
        severity: 'HIGH',
        advice: 'Och qoringa qand miqdori yuqori — bugun parhezga qat\'iy e\'tibor qarating.',
        foods_ok: ['Sabzavotli yengil sho\'rva', 'Loviya / no‘xat', 'Bug\'da pishirilgan baliq / tovuq go\'shti', 'Tuxum oqsili', 'Yashil bargli ko\'katlar'],
        foods_avoid: ['Oq non', 'Guruch (osh)', 'Kartoshka', 'Qand / shakar', 'Meva sharbatlari'],
        action: '30 daqiqa yengil piyoda yuring va kamida 1.5–2 litr toza gazsiz suv iching.'
      }
    },
    post_meal: {
      low: {
        status: '🔴 Past (ovqatdan keyin gipoglikemiya)',
        severity: 'CRITICAL',
        advice: 'Ovqatdan keyin ham qand past — bu noxush holat, dori dozasini qayta ko\'rish lozim.',
        foods_ok: ['Sharbat', 'Meva', 'Glyukoza tabletkasi'],
        foods_avoid: ['Qo\'shimcha dori qabul qilish'],
        action: 'Zudlik bilan shifokorga murojaat qiling yoki tez yordam chaqiring.'
      },
      normal: {
        status: '🟢 Normal (ovqatdan 2 soat keyin ≤8.5 mmol/l)',
        severity: 'NORMAL',
        advice: 'Ovqatdan keyingi ko\'rsatkich me\'yorda! Juda yaxshi!',
        foods_ok: ['Sabzavotlar', 'Oqsilli taomlar (tovuq, baliq, mol go\'shti)', 'Yong\'oq (bir hovuch)'],
        foods_avoid: ['Desertlar', 'Shirin ichimliklar', 'Konfetlar'],
        action: 'Shu muvozanatli ovqatlanish tartibini davom ettiring.'
      },
      high: {
        status: '🟡 Yuqori (ovqatdan keyin ≥8.5 mmol/l)',
        severity: 'HIGH',
        advice: 'Ovqatdan keyin qand yuqori — keyingi taomda porsiya va uglevodlarni kamaytiring.',
        foods_ok: ['Sabzavotli salat (zaytun moyi bilan)', 'Tovuq ko\'kragi (qaynatma)', 'Limonli suv', 'Bodring'],
        foods_avoid: ['Shakar', 'Tort / pirog', 'Guruch / palov', 'Kartoshka pyuresi', 'Xurmo / uzum'],
        action: '20–30 daqiqa toza havoda yengil piyoda yuring (jismoniy harakat qandni pasaytiradi).'
      }
    }
  },
  en: {
    fasting: {
      low: {
        status: '🔴 Low — Hypoglycemia',
        severity: 'CRITICAL',
        advice: 'Blood sugar is dangerously low! Ingest fast-acting carbohydrates immediately.',
        foods_ok: ['Fruit juice (150-200 ml)', 'Sugar water (1 glass)', 'Glucose tablets / 1 tbsp honey'],
        foods_avoid: ['Do not administer meal insulin', 'Avoid intense workouts'],
        action: 'Consume 15g of fast-acting carbs and recheck blood sugar in 15 minutes (Rule of 15).'
      },
      normal: {
        status: '🟢 Normal (Fasting 4.0–7.0 mmol/L)',
        severity: 'NORMAL',
        advice: 'Fasting glucose is within target! Excellent!',
        foods_ok: ['Boiled eggs', 'Low-fat dairy / greek yogurt', 'Whole grain bread (1 slice)', 'Fresh greens & vegetables'],
        foods_avoid: ['Sweets', 'Refined pastries', 'Sugary breakfast cereals', 'Soda'],
        action: 'Maintain this balanced healthy breakfast habit.'
      },
      high: {
        status: '🟡 High (Fasting ≥7.0 mmol/L)',
        severity: 'HIGH',
        advice: 'Fasting sugar is elevated — prioritize low-glycemic foods today.',
        foods_ok: ['Vegetable soup', 'Legumes / lentils', 'Steamed poultry or fish', 'Egg whites', 'Leafy greens'],
        foods_avoid: ['White bread', 'White rice', 'Potatoes', 'Refined sugar', 'Fruit juices'],
        action: 'Engage in a 30-minute light walk and ensure proper hydration with water.'
      }
    },
    post_meal: {
      low: {
        status: '🔴 Low (Postprandial Hypoglycemia)',
        severity: 'CRITICAL',
        advice: 'Blood sugar is low after eating — insulin/medication mismatch likely.',
        foods_ok: ['Juice', 'Ripe banana', 'Glucose tablets'],
        foods_avoid: ['Additional anti-diabetic medication'],
        action: 'Consult your physician or seek urgent medical attention.'
      },
      normal: {
        status: '🟢 Normal (Post-meal ≤8.5 mmol/L)',
        severity: 'NORMAL',
        advice: 'Postprandial glucose is right on target! Very good!',
        foods_ok: ['Fibrous vegetables', 'Lean proteins (chicken, fish)', 'A small handful of nuts'],
        foods_avoid: ['Desserts', 'Sweet beverages', 'Candy'],
        action: 'Keep up this nutrient-dense meal pattern.'
      },
      high: {
        status: '🟡 High (Post-meal ≥8.5 mmol/L)',
        severity: 'HIGH',
        advice: 'Post-meal glucose is high — reduce carbohydrate portions in subsequent meals.',
        foods_ok: ['Fresh green salad with olive oil', 'Boiled chicken breast', 'Lemon water', 'Cucumbers'],
        foods_avoid: ['Added sugar', 'Pastries & cakes', 'Rice / pasta', 'Mashed potatoes', 'Dried fruits'],
        action: 'Take a 20-30 minute casual walk to enhance muscle glucose uptake.'
      }
    }
  },
  ru: {
    fasting: {
      low: {
        status: '🔴 Низкий — Гипогликемия',
        severity: 'CRITICAL',
        advice: 'Уровень сахара опасно низок! Немедленно примите быстрые углеводы.',
        foods_ok: ['Сладкая вода (1 стакан)', 'Фруктовый сок (150-200 мл)', 'Таблетки глюкозы / 1 ст. л. мёда'],
        foods_avoid: ['Не колите инсулин на еду', 'Избегайте тяжелых нагрузок'],
        action: 'Примите 15 г быстрых углеводов и измерьте сахар через 15 минут (Правило 15).'
      },
      normal: {
        status: '🟢 Норма (натощак 4.0–7.0 ммоль/л)',
        severity: 'NORMAL',
        advice: 'Сахар натощак в целевом диапазоне! Отлично!',
        foods_ok: ['Яйца вареные', 'Кефир / нежирный йогурт', 'Цельнозерновой хлеб (1 кусок)', 'Свежие овощи'],
        foods_avoid: ['Сладости', 'Сдоба и выпечка', 'Белый хлеб', 'Сладкая газировка'],
        action: 'Продолжайте придерживаться сбалансированного завтрака.'
      },
      high: {
        status: '🟡 Высокий (натощак ≥7.0 ммоль/л)',
        severity: 'HIGH',
        advice: 'Сахар натощак повышен — уделите особое внимание низкоуглеводной диете.',
        foods_ok: ['Овощной суп', 'Бобовые / чечевица', 'Отварная рыба или курица', 'Зелень и салаты'],
        foods_avoid: ['Белый хлеб', 'Белый рис', 'Картофель', 'Сахар', 'Фруктовые соки'],
        action: 'Совершите 30-минутную пешую прогулку и пейте достаточное количество чистой воды.'
      }
    },
    post_meal: {
      low: {
        status: '🔴 Низкий (после еды)',
        severity: 'CRITICAL',
        advice: 'Сахар ниже нормы после приема пищи — возможна передозировка инсулина.',
        foods_ok: ['Сок', 'Фрукты', 'Таблетки глюкозы'],
        foods_avoid: ['Дополнительный прием сахароснижающих препаратов'],
        action: 'Обратитесь к лечащему врачу для коррекции дозы.'
      },
      normal: {
        status: '🟢 Норма (через 2 часа после еды ≤8.5 ммоль/л)',
        severity: 'NORMAL',
        advice: 'Уровень сахара после еды в норме! Замечательно!',
        foods_ok: ['Овощи', 'Белковые блюда (птица, рыба)', 'Горсть орехов'],
        foods_avoid: ['Десерты', 'Сладкие напитки', 'Конфеты'],
        action: 'Сохраняйте этот рацион питания.'
      },
      high: {
        status: '🟡 Высокий (после еды ≥8.5 ммоль/л)',
        severity: 'HIGH',
        advice: 'Сахар после еды повышен — сократите углеводы в следующем приеме пищи.',
        foods_ok: ['Овощной салат с оливковым маслом', 'Куриное филе', 'Вода с лимоном', 'Огурцы'],
        foods_avoid: ['Сахар', 'Торты / выпечка', 'Плов / белый рис', 'Картофельное пюре', 'Виноград / изюм'],
        action: 'Прогуляйтесь пешком 20-30 минут (ходьба эффективно утилизирует глюкозу мышцами).'
      }
    }
  }
};

/**
 * Qand miqdori va ovqat holatiga qarab tavsiya olish
 * @param {Object} params
 * @param {number} params.glucose - Qand miqdori (mmol/L yoki mg/dL)
 * @param {'fasting'|'post_meal'} [params.mealType='fasting'] - Och qoringa yoki ovqatdan keyin
 * @param {'uz'|'en'|'ru'} [params.lang='uz'] - Til
 */
function getNutritionAdvice({ glucose, mealType = 'fasting', lang = 'uz' }) {
  const mmol = normalizeToMmol(glucose);
  if (mmol === null) {
    throw new Error("'glucose' parametri raqam ko'rinishida berilishi shart.");
  }

  const selectedLang = NUTRITION_DATABASE[lang] ? lang : 'en';
  const category = (mealType === 'post_meal' || mealType === 'postMeal') ? 'post_meal' : 'fasting';
  const subCategory = NUTRITION_DATABASE[selectedLang][category];

  let state = 'normal';
  if (category === 'fasting') {
    if (mmol < 3.9) state = 'low';
    else if (mmol >= 7.0) state = 'high';
  } else {
    if (mmol < 4.0) state = 'low';
    else if (mmol > 8.5) state = 'high';
  }

  const result = subCategory[state];

  return {
    glucoseMmol: mmol,
    mealType: category,
    lang: selectedLang,
    state,
    ...result
  };
}

module.exports = {
  getNutritionAdvice,
  NUTRITION_DATABASE
};

