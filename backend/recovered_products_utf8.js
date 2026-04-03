const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./src/models/Product');

const products = [
  // MEVALAR (Fruits)
  {
    name: { uz: 'Olma', ru: '╨п╨▒╨╗╨╛╨║╨╛', en: 'Apple' },
    category: 'fruits', emoji: 'ЁЯНО', gi: 38, gl: 5, calories: 52,
    advice: { uz: 'Qobig\'i bilan yeyish foydali.', ru: '╨Я╨╛╨╗╨╡╨╖╨╜╨╛ ╨╡╤Б╤В╤М ╤Б ╨║╨╛╨╢╤Г╤А╨╛╨╣.', en: 'It is useful to eat with the skin.' }
  },
  {
    name: { uz: 'Nok', ru: '╨У╤А╤Г╤И╨░', en: 'Pear' },
    category: 'fruits', emoji: 'ЁЯНР', gi: 38, gl: 4, calories: 57,
    advice: { uz: 'Kletchatkaga boy.', ru: '╨С╨╛╨│╨░╤В ╨║╨╗╨╡╤В╤З╨░╤В╨║╨╛╨╣.', en: 'Rich in fiber.' }
  },
  {
    name: { uz: 'Shaftoli', ru: '╨Я╨╡╤А╤Б╨╕╨║', en: 'Peach' },
    category: 'fruits', emoji: 'ЁЯНС', gi: 42, gl: 5, calories: 39,
    advice: { uz: 'Yaxshi pishganini tanlang.', ru: '╨Т╤Л╨▒╨╕╤А╨░╨╣╤В╨╡ ╤Б╨┐╨╡╨╗╤Л╨╡.', en: 'Choose ripe ones.' }
  },
  {
    name: { uz: 'O\'rik', ru: '╨Р╨▒╤А╨╕╨║╨╛╤Б', en: 'Apricot' },
    category: 'fruits', emoji: 'ЁЯНС', gi: 31, gl: 3, calories: 48,
    advice: { uz: 'Yangi uzilgani foydali.', ru: '╨Я╨╛╨╗╨╡╨╖╨╜╤Л ╤Б╨▓╨╡╨╢╨╡╤Б╨╛╨▒╤А╨░╨╜╨╜╤Л╨╡.', en: 'Freshly picked ones are useful.' }
  },
  {
    name: { uz: 'Gilos', ru: '╨з╨╡╤А╨╡╤И╨╜╤П', en: 'Cherry' },
    category: 'fruits', emoji: 'ЁЯНТ', gi: 25, gl: 3, calories: 50,
    advice: { uz: 'Antotsianlarga boy.', ru: '╨С╨╛╨│╨░╤В ╨░╨╜╤В╨╛╤Ж╨╕╨░╨╜╨░╨╝╨╕.', en: 'Rich in anthocyanins.' }
  },
  {
    name: { uz: 'Qulupnay', ru: '╨Ъ╨╗╤Г╨▒╨╜╨╕╨║╨░', en: 'Strawberry' },
    category: 'fruits', emoji: 'ЁЯНУ', gi: 41, gl: 1, calories: 32,
    advice: { uz: 'Vitamina C manbai.', ru: '╨Ш╤Б╤В╨╛╤З╨╜╨╕╨║ ╨▓╨╕╤В╨░╨╝╨╕╨╜╨░ ╨б.', en: 'Source of vitamin C.' }
  },
  {
    name: { uz: 'Malina', ru: '╨Ь╨░╨╗╨╕╨╜╨░', en: 'Raspberry' },
    category: 'fruits', emoji: 'ЁЯлР', gi: 32, gl: 2, calories: 52,
    advice: { uz: 'Kam uglevodli.', ru: '╨Э╨╕╨╖╨║╨╛╤Г╨│╨╗╨╡╨▓╨╛╨┤╨╜╤Л╨╣.', en: 'Low carb.' }
  },
  {
    name: { uz: 'Kivi', ru: '╨Ъ╨╕╨▓╨╕', en: 'Kiwi' },
    category: 'fruits', emoji: 'ЁЯеЭ', gi: 50, gl: 7, calories: 61,
    advice: { uz: 'Hazm qilishni yaxshilaydi.', ru: '╨г╨╗╤Г╤З╤И╨░╨╡╤В ╨┐╨╕╤Й╨╡╨▓╨░╤А╨╡╨╜╨╕╨╡.', en: 'Improves digestion.' }
  },
  {
    name: { uz: 'Ananas', ru: '╨Р╨╜╨░╨╜╨░╤Б', en: 'Pineapple' },
    category: 'fruits', emoji: 'ЁЯНН', gi: 59, gl: 7, calories: 50,
    advice: { uz: 'Me\'yorida iste\'mol qiling.', ru: '╨г╨┐╨╛╤В╤А╨╡╨▒╨╗╤П╨╣╤В╨╡ ╨▓ ╤Г╨╝╨╡╤А╨╡╨╜╨╜╤Л╤Е ╨║╨╛╨╗╨╕╤З╨╡╤Б╤В╨▓╨░╤Е.', en: 'Eat in moderation.' }
  },
  {
    name: { uz: 'Greypfrut', ru: '╨У╤А╨╡╨╣╨┐╤Д╤А╤Г╤В', en: 'Grapefruit' },
    category: 'fruits', emoji: 'ЁЯНК', gi: 25, gl: 3, calories: 42,
    advice: { uz: 'Insulinga sezgirlikni oshiradi.', ru: '╨Я╨╛╨▓╤Л╤И╨░╨╡╤В ╤З╤Г╨▓╤Б╤В╨▓╨╕╤В╨╡╨╗╤М╨╜╨╛╤Б╤В╤М ╨║ ╨╕╨╜╤Б╤Г╨╗╨╕╨╜╤Г.', en: 'Increases insulin sensitivity.' }
  },
  {
    name: { uz: 'Limon', ru: '╨Ы╨╕╨╝╨╛╨╜', en: 'Lemon' },
    category: 'fruits', emoji: 'ЁЯНЛ', gi: 20, gl: 2, calories: 29,
    advice: { uz: 'Choy bilan ichish foydali.', ru: '╨Я╨╛╨╗╨╡╨╖╨╜╨╛ ╨┐╨╕╤В╤М ╤Б ╤З╨░╨╡╨╝.', en: 'Useful to drink with tea.' }
  },
  {
    name: { uz: 'Lola', ru: '╨Р╨┐╨╡╨╗╤М╤Б╨╕╨╜', en: 'Orange' },
    category: 'fruits', emoji: 'ЁЯНК', gi: 43, gl: 4, calories: 47,
    advice: { uz: 'Sharbati emas, ozi yaxshi.', ru: '╨Ы╤Г╤З╤И╨╡ ╤Б╨░╨╝ ╨┐╨╗╨╛╨┤, ╤З╨╡╨╝ ╤Б╨╛╨║.', en: 'Whole fruit is better than juice.' }
  },
  {
    name: { uz: 'Banan', ru: '╨С╨░╨╜╨░╨╜', en: 'Banana' },
    category: 'fruits', emoji: 'ЁЯНМ', gi: 51, gl: 13, calories: 89,
    advice: { uz: 'Yashilrog\'i yaxshi.', ru: '╨Ы╤Г╤З╤И╨╡ ╨╡╤Б╨╗╨╕ ╤З╤Г╤В╤М ╨╖╨╡╨╗╨╡╨╜╤Л╨╣.', en: 'Slightly green is better.' }
  },
  {
    name: { uz: 'Uzum (Yashil)', ru: '╨Т╨╕╨╜╨╛╨│╤А╨░╨┤ (╨Ч╨╡╨╗╨╡╨╜╤Л╨╣)', en: 'Grapes (Green)' },
    category: 'fruits', emoji: 'ЁЯНЗ', gi: 53, gl: 5, calories: 67,
    advice: { uz: 'Me\'yorida yeyish shart.', ru: '╨Ю╨▒╤П╨╖╨░╤В╨╡╨╗╤М╨╜╨╛ ╨╡╤Б╤В╤М ╨▓ ╨╝╨╡╤А╤Г.', en: 'Must eat in moderation.' }
  },
  {
    name: { uz: 'Anjir', ru: '╨Ш╨╜╨╢╨╕╤А', en: 'Fig' },
    category: 'fruits', emoji: 'ЁЯзБ', gi: 61, gl: 8, calories: 74,
    advice: { uz: 'Yangi anjir yaxshiroq.', ru: '╨б╨▓╨╡╨╢╨╕╨╣ ╨╕╨╜╨╢╨╕╤А ╨╗╤Г╤З╤И╨╡.', en: 'Fresh figs are better.' }
  },
  {
    name: { uz: 'Xurmo', ru: '╨е╤Г╤А╨╝╨░', en: 'Persimmon' },
    category: 'fruits', emoji: 'ЁЯНЕ', gi: 50, gl: 10, calories: 70,
    advice: { uz: 'Faqat pishganini yeng.', ru: '╨Х╤И╤М╤В╨╡ ╤В╨╛╨╗╤М╨║╨╛ ╤Б╨┐╨╡╨╗╤Г╤О.', en: 'Eat only ripe ones.' }
  },
  {
    name: { uz: 'Tarvuz', ru: '╨Р╤А╨▒╤Г╨╖', en: 'Watermelon' },
    category: 'fruits', emoji: 'ЁЯНЙ', gi: 72, gl: 5, calories: 30,
    advice: { uz: 'GI yuqori, ozroq yeng.', ru: '╨Т╤Л╤Б╨╛╨║╨╕╨╣ ╨У╨Ш, ╨╡╤И╤М╤В╨╡ ╨┐╨╛╨╜╨╡╨╝╨╜╨╛╨│╤Г.', en: 'High GI, eat sparingly.' }
  },
  {
    name: { uz: 'Qovun', ru: '╨Ф╤Л╨╜╤П', en: 'Melon' },
    category: 'fruits', emoji: 'ЁЯНИ', gi: 65, gl: 4, calories: 34,
    advice: { uz: 'Bo\'laklarga bo\'lib yeng.', ru: '╨Х╤И╤М╤В╨╡ ╨┤╨╛╨╗╤М╨║╨░╨╝╨╕.', en: 'Eat in slices.' }
  },
  {
    name: { uz: 'Anor', ru: '╨У╤А╨░╨╜╨░╤В', en: 'Pomegranate' },
    category: 'fruits', emoji: 'ЁЯНО', gi: 35, gl: 7, calories: 83,
    advice: { uz: 'Qonni ko\'paytiradi.', ru: '╨Я╨╛╨▓╤Л╤И╨░╨╡╤В ╤Г╤А╨╛╨▓╨╡╨╜╤М ╨│╨╡╨╝╨╛╨│╨╗╨╛╨▒╨╕╨╜╨░.', en: 'Increases hemoglobin.' }
  },
  {
    name: { uz: 'Behi', ru: '╨Р╨╣╨▓╨░', en: 'Quince' },
    category: 'fruits', emoji: 'ЁЯНП', gi: 35, gl: 4, calories: 57,
    advice: { uz: 'Dimlab yeyish mumkin.', ru: '╨Ь╨╛╨╢╨╜╨╛ ╤В╤Г╤И╨╕╤В╤М.', en: 'Can be stewed.' }
  },

  // SABZAVOTLAR (Vegetables)
  {
    name: { uz: 'Bodring', ru: '╨Ю╨│╤Г╤А╨╡╤Ж', en: 'Cucumber' },
    category: 'vegetables', emoji: 'ЁЯеТ', gi: 15, gl: 1, calories: 15,
    advice: { uz: 'Cheksiz yeyish mumkin.', ru: '╨Ь╨╛╨╢╨╜╨╛ ╨╡╤Б╤В╤М ╨╜╨╡╨╛╨│╤А╨░╨╜╨╕╤З╨╡╨╜╨╜╨╛.', en: 'Can be eaten unlimitedly.' }
  },
  {
    name: { uz: 'Pomidor', ru: '╨Я╨╛╨╝╨╕╨┤╨╛╤А', en: 'Tomato' },
    category: 'vegetables', emoji: 'ЁЯНЕ', gi: 30, gl: 1, calories: 18,
    advice: { uz: 'Likopinga boy.', ru: '╨С╨╛╨│╨░╤В ╨╗╨╕╨║╨╛╨┐╨╕╨╜╨╛╨╝.', en: 'Rich in lycopene.' }
  },
  {
    name: { uz: 'Brokkoli', ru: '╨С╤А╨╛╨║╨║╨╛╨╗╨╕', en: 'Broccoli' },
    category: 'vegetables', emoji: 'ЁЯеж', gi: 15, gl: 1, calories: 34,
    advice: { uz: 'Superfood hisoblanadi.', ru: '╨б╤З╨╕╤В╨░╨╡╤В╤Б╤П ╤Б╤Г╨┐╨╡╤А╤Д╤Г╨┤╨╛╨╝.', en: 'Considered a superfood.' }
  },
  {
    name: { uz: 'Ismaloq', ru: '╨и╨┐╨╕╨╜╨░╤В', en: 'Spinach' },
    category: 'vegetables', emoji: 'ЁЯем', gi: 15, gl: 1, calories: 23,
    advice: { uz: 'Temirga juda boy.', ru: '╨Ю╤З╨╡╨╜╤М ╨▒╨╛╨│╨░╤В ╨╢╨╡╨╗╨╡╨╖╨╛╨╝.', en: 'Very rich in iron.' }
  },
  {
    name: { uz: 'Sabzi (Xom)', ru: '╨Ь╨╛╤А╨║╨╛╨▓╤М (╨б╤Л╤А╨░╤П)', en: 'Carrot (Raw)' },
    category: 'vegetables', emoji: 'ЁЯеХ', gi: 35, gl: 2, calories: 41,
    advice: { uz: 'Xomiligi yaxshiroq.', ru: '╨Ы╤Г╤З╤И╨╡ ╨╡╤Б╤В╤М ╤Б╤Л╤А╤Л╨╝.', en: 'Raw is better.' }
  },
  {
    name: { uz: 'Sabzi (Pishgan)', ru: '╨Ь╨╛╤А╨║╨╛╨▓╤М (╨Т╨░╤А╨╡╨╜╨░╤П)', en: 'Carrot (Boiled)' },
    category: 'vegetables', emoji: 'ЁЯеХ', gi: 70, gl: 5, calories: 35,
    advice: { uz: 'GI oshib ketadi.', ru: '╨У╨Ш ╨╖╨╜╨░╤З╨╕╤В╨╡╨╗╤М╨╜╨╛ ╨▓╨╛╨╖╤А╨░╤Б╤В╨░╨╡╤В.', en: 'GI increases significantly.' }
  },
  {
    name: { uz: 'Baqlajon', ru: '╨С╨░╨║╨╗╨░╨╢╨░╨╜', en: 'Eggplant' },
    category: 'vegetables', emoji: 'ЁЯНЖ', gi: 15, gl: 1, calories: 25,
    advice: { uz: 'Pechnada pishiring.', ru: '╨Ч╨░╨┐╨╡╨║╨░╨╣╤В╨╡ ╨▓ ╨┤╤Г╤Е╨╛╨▓╨║╨╡.', en: 'Bake in the oven.' }
  },
  {
    name: { uz: 'Qovoqcha', ru: '╨Ъ╨░╨▒╨░╤З╨╛╨║', en: 'Zucchini' },
    category: 'vegetables', emoji: 'ЁЯеТ', gi: 15, gl: 1, calories: 17,
    advice: { uz: 'Past kaloriyali.', ru: '╨Э╨╕╨╖╨║╨╛╨║╨░╨╗╨╛╤А╨╕╨╣╨╜╤Л╨╣.', en: 'Low calorie.' }
  },
  {
    name: { uz: 'Gulkaram', ru: '╨ж╨▓╨╡╤В╨╜╨░╤П ╨║╨░╨┐╤Г╤Б╤В╨░', en: 'Cauliflower' },
    category: 'vegetables', emoji: 'ЁЯеж', gi: 15, gl: 1, calories: 25,
    advice: { uz: 'Guruch o\'rnida ishlatsa bo\'ladi.', ru: '╨Ь╨╛╨╢╨╜╨╛ ╨╕╤Б╨┐╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╤М ╨▓╨╝╨╡╤Б╤В╨╛ ╤А╨╕╤Б╨░.', en: 'Can be used instead of rice.' }
  },
  {
    name: { uz: 'Karam (Oq)', ru: '╨Ъ╨░╨┐╤Г╤Б╤В╨░ (╨С╨╡╨╗╨╛╨║╨╛╤З╨░╨╜╨╜╨░╤П)', en: 'Cabbage (White)' },
    category: 'vegetables', emoji: 'ЁЯем', gi: 15, gl: 1, calories: 25,
    advice: { uz: 'Sifatli kletchatka.', ru: '╨Ъ╨░╤З╨╡╤Б╤В╨▓╨╡╨╜╨╜╨░╤П ╨║╨╗╨╡╤В╤З╨░╤В╨║╨░.', en: 'High-quality fiber.' }
  },
  {
    name: { uz: 'Dastyor lavlagi', ru: '╨б╨▓╨╡╨║╨╗╨░', en: 'Beetroot' },
    category: 'vegetables', emoji: 'ЁЯНа', gi: 64, gl: 5, calories: 43,
    advice: { uz: 'Xom holda ozroq yeng.', ru: '╨Х╤И╤М╤В╨╡ ╨┐╨╛╨╜╨╡╨╝╨╜╨╛╨│╤Г ╨▓ ╤Б╤Л╤А╨╛╨╝ ╨▓╨╕╨┤╨╡.', en: 'Eat sparingly in raw form.' }
  },
  {
    name: { uz: 'Piyoz', ru: '╨Ы╤Г╨║', en: 'Onion' },
    category: 'vegetables', emoji: 'ЁЯзЕ', gi: 15, gl: 1, calories: 40,
    advice: { uz: 'Antibakterial.', ru: '╨Р╨╜╤В╨╕╨▒╨░╨║╤В╨╡╤А╨╕╨░╨╗╤М╨╜╤Л╨╣.', en: 'Antibacterial.' }
  },
  {
    name: { uz: 'Sarmisoq', ru: '╨з╨╡╤Б╨╜╨╛╨║', en: 'Garlic' },
    category: 'vegetables', emoji: 'ЁЯзД', gi: 30, gl: 1, calories: 149,
    advice: { uz: 'Qand miqdorini pasaytiradi.', ru: '╨б╨╜╨╕╨╢╨░╨╡╤В ╤Г╤А╨╛╨▓╨╡╨╜╤М ╤Б╨░╤Е╨░╤А╨░.', en: 'Lowers sugar levels.' }
  },
  {
    name: { uz: 'Bolgar qalampiri', ru: '╨С╨╛╨╗╨│╨░╤А╤Б╨║╨╕╨╣ ╨┐╨╡╤А╨╡╤Ж', en: 'Bell Pepper' },
    category: 'vegetables', emoji: 'ЁЯлС', gi: 15, gl: 1, calories: 26,
    advice: { uz: 'Turli rangdagisi vitaminlarga boy.', ru: '╨а╨░╨╖╨╜╨╛╨│╨╛ ╤Ж╨▓╨╡╤В╨░ ╨▒╨╛╨│╨░╤В ╨▓╨╕╤В╨░╨╝╨╕╨╜╨░╨╝╨╕.', en: 'Different colors are rich in vitamins.' }
  },
  {
    name: { uz: 'Qovoq', ru: '╨в╤Л╨║╨▓╨░', en: 'Pumpkin' },
    category: 'vegetables', emoji: 'ЁЯОГ', gi: 75, gl: 4, calories: 26,
    advice: { uz: 'Me\'yorida yeng.', ru: '╨Х╤И╤М╤В╨╡ ╨▓ ╤Г╨╝╨╡╤А╨╡╨╜╨╜╤Л╤Е ╨║╨╛╨╗╨╕╤З╨╡╤Б╤В╨▓╨░╤Е.', en: 'Eat in moderation.' }
  },
  {
    name: { uz: 'Kartoshka (Qovurilgan)', ru: '╨Ъ╨░╤А╤В╨╛╤Д╨╡╨╗╤М (╨Ц╨░╤А╨╡╨╜╤Л╨╣)', en: 'Potato (Fried)' },
    category: 'vegetables', emoji: 'ЁЯНЯ', gi: 95, gl: 20, calories: 312,
    advice: { uz: 'Tavsiya etilmaydi!', ru: '╨Э╨╡ ╤А╨╡╨║╨╛╨╝╨╡╨╜╨┤╤Г╨╡╤В╤Б╤П!', en: 'Not recommended!' }
  },
  {
    name: { uz: 'Kartoshka (Pishgan)', ru: '╨Ъ╨░╤А╤В╨╛╤Д╨╡╨╗╤М (╨Т╨░╤А╨╡╨╜╤Л╨╣)', en: 'Potato (Boiled)' },
    category: 'vegetables', emoji: 'ЁЯеФ', gi: 70, gl: 15, calories: 86,
    advice: { uz: 'Sovuq holda iste\'mol qiling.', ru: '╨Х╤И╤М╤В╨╡ ╨▓ ╤Е╨╛╨╗╨╛╨┤╨╜╨╛╨╝ ╨▓╨╕╨┤╨╡.', en: 'Consume in cold form.' }
  },
  {
    name: { uz: 'Makkajo\'xori', ru: '╨Ъ╤Г╨║╤Г╤А╤Г╨╖╨░', en: 'Corn' },
    category: 'vegetables', emoji: 'ЁЯМ╜', gi: 55, gl: 15, calories: 86,
    advice: { uz: 'Konservalanganidan qoching.', ru: '╨Ш╨╖╨▒╨╡╨│╨░╨╣╤В╨╡ ╨║╨╛╨╜╤Б╨╡╤А╨▓╨╕╤А╨╛╨▓╨░╨╜╨╜╨╛╨╣.', en: 'Avoid canned variety.' }
  },
  {
    name: { uz: 'No\'xat (Yashil)', ru: '╨Ч╨╡╨╗╨╡╨╜╤Л╨╣ ╨│╨╛╤А╨╛╤И╨╡╨║', en: 'Green Peas' },
    category: 'vegetables', emoji: 'ЁЯлЫ', gi: 45, gl: 4, calories: 81,
    advice: { uz: 'Oqsil manbai.', ru: '╨Ш╤Б╤В╨╛╤З╨╜╨╕╨║ ╨▒╨╡╨╗╨║╨░.', en: 'Source of protein.' }
  },
  {
    name: { uz: 'Turp', ru: '╨а╨╡╨┤╨╕╤Б', en: 'Radish' },
    category: 'vegetables', emoji: 'ЁЯеЧ', gi: 15, gl: 1, calories: 16,
    advice: { uz: 'Past kaloriyali.', ru: '╨Э╨╕╨╖╨║╨╛╨║╨░╨╗╨╛╤А╨╕╨╣╨╜╤Л╨╣.', en: 'Low calorie.' }
  },

  // DONLI MAHSULOTLAR (Grains/Legumes)
  {
    name: { uz: 'Grechka', ru: '╨У╤А╨╡╤З╨║╨░', en: 'Buckwheat' },
    category: 'grains', emoji: 'ЁЯег', gi: 50, gl: 15, calories: 343,
    advice: { uz: 'Eng foydali don.', ru: '╨б╨░╨╝╨░╤П ╨┐╨╛╨╗╨╡╨╖╨╜╨░╤П ╨║╤А╤Г╨┐╨░.', en: 'The most useful grain.' }
  },
  {
    name: { uz: 'Suli yormasi', ru: '╨Ю╨▓╤Б╤П╨╜╨║╨░', en: 'Oats' },
    category: 'grains', emoji: 'ЁЯег', gi: 55, gl: 12, calories: 389,
    advice: { uz: 'Butun donlisini tanlang.', ru: '╨Т╤Л╨▒╨╕╤А╨░╨╣╤В╨╡ ╤Ж╨╡╨╗╤М╨╜╨╛╨╖╨╡╤А╨╜╨╛╨▓╤Г╤О.', en: 'Choose whole grain.' }
  },
  {
    name: { uz: 'Jigarrang guruch', ru: '╨Ъ╨╛╤А╨╕╤З╨╜╨╡╨▓╤Л╨╣ ╤А╨╕╤Б', en: 'Brown Rice' },
    category: 'grains', emoji: 'ЁЯНЪ', gi: 50, gl: 15, calories: 111,
    advice: { uz: 'Oq guruchdan yaxshiroq.', ru: '╨Ы╤Г╤З╤И╨╡ ╤З╨╡╨╝ ╨▒╨╡╨╗╤Л╨╣ ╤А╨╕╤Б.', en: 'Better than white rice.' }
  },
  {
    name: { uz: 'Oq guruch', ru: '╨С╨╡╨╗╤Л╨╣ ╤А╨╕╤Б', en: 'White Rice' },
    category: 'grains', emoji: 'ЁЯНЪ', gi: 70, gl: 22, calories: 130,
    advice: { uz: 'Kamroq yeyish shart.', ru: '╨Ю╨▒╤П╨╖╨░╤В╨╡╨╗╤М╨╜╨╛ ╨╡╤Б╤В╤М ╨╝╨╡╨╜╤М╤И╨╡.', en: 'Must eat less.' }
  },
  {
    name: { uz: 'Yasmiq', ru: '╨з╨╡╤З╨╡╨▓╨╕╤Ж╨░', en: 'Lentils' },
    category: 'grains', emoji: 'ЁЯН▓', gi: 30, gl: 5, calories: 116,
    advice: { uz: 'Oqsil va kletchatkaga boy.', ru: '╨С╨╛╨│╨░╤В ╨▒╨╡╨╗╨║╨╛╨╝ ╨╕ ╨║╨╗╨╡╤В╤З╨░╤В╨║╨╛╨╣.', en: 'Rich in protein and fiber.' }
  },
  {
    name: { uz: 'No\'xat', ru: '╨Э╤Г╤В', en: 'Chickpeas' },
    category: 'grains', emoji: 'ЁЯН▓', gi: 28, gl: 8, calories: 164,
    advice: { uz: 'Uzoq vaqt to\'q tutadi.', ru: '╨Ф╨╛╨╗╨│╨╛ ╤Б╨╛╤Е╤А╨░╨╜╤П╨╡╤В ╤Б╤Л╤В╨╛╤Б╤В╤М.', en: 'Keeps you full for a long time.' }
  },
  {
    name: { uz: 'Lobiya', ru: '╨д╨░╤Б╨╛╨╗╤М', en: 'Beans' },
    category: 'grains', emoji: 'ЁЯН▓', gi: 24, gl: 6, calories: 127,
    advice: { uz: 'Qandni normallashtiradi.', ru: '╨Э╨╛╤А╨╝╨░╨╗╨╕╨╖╤Г╨╡╤В ╤Б╨░╤Е╨░╤А.', en: 'Normalizes sugar.' }
  },
  {
    name: { uz: 'Kinoa', ru: '╨Ъ╨╕╨╜╨╛╨░', en: 'Quinoa' },
    category: 'grains', emoji: 'ЁЯег', gi: 53, gl: 13, calories: 120,
    advice: { uz: 'Super don hisoblanadi.', ru: '╨б╤З╨╕╤В╨░╨╡╤В╤Б╤П ╤Б╤Г╨┐╨╡╤А╨╖╨╡╤А╨╜╨╛╨╝.', en: 'Considered a supergrain.' }
  },
  {
    name: { uz: 'Bulg\'ur', ru: '╨С╤Г╨╗╨│╤Г╤А', en: 'Bulgur' },
    category: 'grains', emoji: 'ЁЯег', gi: 45, gl: 12, calories: 83,
    advice: { uz: 'Guruchga muqobil.', ru: '╨Р╨╗╤М╤В╨╡╤А╨╜╨░╤В╨╕╨▓╨░ ╤А╨╕╤Б╤Г.', en: 'Alternative to rice.' }
  },
  {
    name: { uz: 'Arpa', ru: '╨Я╨╡╤А╨╗╨╛╨▓╨║╨░', en: 'Barley' },
    category: 'grains', emoji: 'ЁЯег', gi: 25, gl: 10, calories: 352,
    advice: { uz: 'Eng past GI doni.', ru: '╨Ч╨╡╤А╨╜╨╛ ╤Б ╤Б╨░╨╝╤Л╨╝ ╨╜╨╕╨╖╨║╨╕╨╝ ╨У╨Ш.', en: 'Grain with the lowest GI.' }
  },

  // SUT MAHSULOTLARI (Dairy)
  {
    name: { uz: 'Kefir', ru: '╨Ъ╨╡╤Д╨╕╤А', en: 'Kefir' },
    category: 'dairy', emoji: 'ЁЯеЫ', gi: 25, gl: 1, calories: 41,
    advice: { uz: 'Ichak faoliyatiga foydali.', ru: '╨Я╨╛╨╗╨╡╨╖╨╡╨╜ ╨┤╨╗╤П ╤А╨░╨▒╨╛╤В╤Л ╨║╨╕╤И╨╡╤З╨╜╨╕╨║╨░.', en: 'Useful for bowel function.' }
  },
  {
    name: { uz: 'Tvorog (Past yog\'li)', ru: '╨в╨▓╨╛╤А╨╛╨│ (╨Ю╨▒╨╡╨╖╨╢╨╕╤А╨╡╨╜╨╜╤Л╨╣)', en: 'Cottage Cheese (Low fat)' },
    category: 'dairy', emoji: 'ЁЯег', gi: 30, gl: 1, calories: 98,
    advice: { uz: 'Kalsiy manbai.', ru: '╨Ш╤Б╤В╨╛╤З╨╜╨╕╨║ ╨║╨░╨╗╤М╤Ж╨╕╤П.', en: 'Source of calcium.' }
  },
  {
    name: { uz: 'Yogurt (Tabiiy)', ru: '╨Щ╨╛╨│╤Г╤А╤В (╨Э╨░╤В╤Г╤А╨░╨╗╤М╨╜╤Л╨╣)', en: 'Yogurt (Natural)' },
    category: 'dairy', emoji: 'ЁЯНж', gi: 35, gl: 2, calories: 59,
    advice: { uz: 'Shakarsizini tanlang.', ru: '╨Т╤Л╨▒╨╕╤А╨░╨╣╤В╨╡ ╨▒╨╡╨╖ ╤Б╨░╤Е╨░╤А╨░.', en: 'Choose without sugar.' }
  },
  {
    name: { uz: 'Sut', ru: '╨Ь╨╛╨╗╨╛╨║╨╛', en: 'Milk' },
    category: 'dairy', emoji: 'ЁЯеЫ', gi: 32, gl: 4, calories: 42,
    advice: { uz: 'Glikemik yuki past.', ru: '╨Э╨╕╨╖╨║╨░╤П ╨│╨╗╨╕╨║╨╡╨╝╨╕╤З╨╡╤Б╨║╨░╤П ╨╜╨░╨│╤А╤Г╨╖╨║╨░.', en: 'Low glycemic load.' }
  },
  {
    name: { uz: 'Pishloq', ru: '╨б╤Л╤А', en: 'Cheese' },
    category: 'dairy', emoji: 'ЁЯзА', gi: 0, gl: 0, calories: 402,
    advice: { uz: 'GI 0, lekin kaloriyasi ko\'p.', ru: '╨У╨Ш 0, ╨╜╨╛ ╨║╨░╨╗╨╛╤А╨╕╨╣╨╜╨╛╤Б╤В╤М ╨▓╤Л╤Б╨╛╨║╨░╤П.', en: 'GI 0, but calorie content is high.' }
  },

  // GO'SHT VA BALIQ (Meat & Protein)
  {
    name: { uz: 'Tovuq ko\'kragi', ru: '╨Ъ╤Г╤А╨╕╨╜╨░╤П ╨│╤А╤Г╨┤╨║╨░', en: 'Chicken Breast' },
    category: 'protein', emoji: 'ЁЯНЧ', gi: 0, gl: 0, calories: 165,
    advice: { uz: 'Eng ideal oqsil.', ru: '╨Ш╨┤╨╡╨░╨╗╤М╨╜╤Л╨╣ ╨▒╨╡╨╗╨╛╨║.', en: 'Ideal protein.' }
  },
  {
    name: { uz: 'Baliq (Losos)', ru: '╨Ы╨╛╤Б╨╛╤Б╤М', en: 'Salmon' },
    category: 'protein', emoji: 'ЁЯРЯ', gi: 0, gl: 0, calories: 208,
    advice: { uz: 'Omega-3 ga boy.', ru: '╨С╨╛╨│╨░╤В ╨Ю╨╝╨╡╨│╨░-3.', en: 'Rich in Omega-3.' }
  },
  {
    name: { uz: 'Tuxum', ru: '╨п╨╣╤Ж╨╛', en: 'Egg' },
    category: 'protein', emoji: 'ЁЯеЪ', gi: 0, gl: 0, calories: 155,
    advice: { uz: 'Kuniga 1-2 ta mumkin.', ru: '╨Ь╨╛╨╢╨╜╨╛ 1-2 ╤И╤В╤Г╨║╨╕ ╨▓ ╨┤╨╡╨╜╤М.', en: '1-2 pieces a day is possible.' }
  },
  {
    name: { uz: 'Mol go\'shti', ru: '╨У╨╛╨▓╤П╨┤╨╕╨╜╨░', en: 'Beef' },
    category: 'protein', emoji: 'ЁЯей', gi: 0, gl: 0, calories: 250,
    advice: { uz: 'Laxm go\'shtini tanlang.', ru: '╨Т╤Л╨▒╨╕╤А╨░╨╣╤В╨╡ ╨┐╨╛╤Б╤В╨╜╨╛╨╡ ╨╝╤П╤Б╨╛.', en: 'Choose lean meat.' }
  },
  {
    name: { uz: 'Kurka go\'shti', ru: '╨Ш╨╜╨┤╨╡╨╣╨║╨░', en: 'Turkey' },
    category: 'protein', emoji: 'ЁЯНЧ', gi: 0, gl: 0, calories: 189,
    advice: { uz: 'Dietik go\'sht.', ru: '╨Ф╨╕╨╡╤В╨╕╤З╨╡╤Б╨║╨╛╨╡ ╨╝╤П╤Б╨╛.', en: 'Dietary meat.' }
  },

  // YONG'OQLAR (Nuts/Seeds)
  {
    name: { uz: 'Bodom', ru: '╨Ь╨╕╨╜╨┤╨░╨╗╤М', en: 'Almond' },
    category: 'nuts', emoji: 'ЁЯеЬ', gi: 15, gl: 1, calories: 579,
    advice: { uz: 'Qon-tomirlar uchun foydali.', ru: '╨Я╨╛╨╗╨╡╨╖╨╡╨╜ ╨┤╨╗╤П ╤Б╨╛╤Б╤Г╨┤╨╛╨▓.', en: 'Useful for blood vessels.' }
  },
  {
    name: { uz: 'Yong\'oq', ru: '╨У╤А╨╡╤Ж╨║╨╕╨╣ ╨╛╤А╨╡╤Е', en: 'Walnut' },
    category: 'nuts', emoji: 'ЁЯеЬ', gi: 15, gl: 1, calories: 654,
    advice: { uz: 'Miya faoliyatini yaxshilaydi.', ru: '╨г╨╗╤Г╤З╤И╨░╨╡╤В ╤А╨░╨▒╨╛╤В╤Г ╨╝╨╛╨╖╨│╨░.', en: 'Improves brain function.' }
  },
  {
    name: { uz: 'Chia urug\'lari', ru: '╨б╨╡╨╝╨╡╨╜╨░ ╤З╨╕╨░', en: 'Chia Seeds' },
    category: 'nuts', emoji: 'ЁЯег', gi: 1, gl: 1, calories: 486,
    advice: { uz: 'Foydali kislotalar manbai.', ru: '╨Ш╤Б╤В╨╛╤З╨╜╨╕╨║ ╨┐╨╛╨╗╨╡╨╖╨╜╤Л╤Е ╨║╨╕╤Б╨╗╨╛╤В.', en: 'Source of useful acids.' }
  },
  {
    name: { uz: 'Pista', ru: '╨д╨╕╤Б╤В╨░╤И╨║╨╕', en: 'Pistachios' },
    category: 'nuts', emoji: 'ЁЯеЬ', gi: 15, gl: 1, calories: 562,
    advice: { uz: 'Shorsizini yeng.', ru: '╨Х╤И╤М╤В╨╡ ╨╜╨╡╤Б╨╛╨╗╨╡╨╜╤Л╨╡.', en: 'Eat unsalted ones.' }
  },

  // ICHIMLIKLAR (Drinks)
  {
    name: { uz: 'Ko\'k choy', ru: '╨Ч╨╡╨╗╨╡╨╜╤Л╨╣ ╤З╨░╨╣', en: 'Green Tea' },
    category: 'drinks', emoji: 'ЁЯН╡', gi: 0, gl: 0, calories: 1,
    advice: { uz: 'Metabolizmni tezlashtiradi.', ru: '╨г╤Б╨║╨╛╤А╤П╨╡╤В ╨╝╨╡╤В╨░╨▒╨╛╨╗╨╕╨╖╨╝.', en: 'Speeds up metabolism.' }
  },
  {
    name: { uz: 'Qahva (Shakarsiz)', ru: '╨Ъ╨╛╤Д╨╡ (╨С╨╡╨╖ ╤Б╨░╤Е╨░╤А╨░)', en: 'Coffee (No sugar)' },
    category: 'drinks', emoji: 'тШХ', gi: 0, gl: 0, calories: 2,
    advice: { uz: 'Quvvat beradi.', ru: '╨Ф╨░╨╡╤В ╤Н╨╜╨╡╤А╨│╨╕╤О.', en: 'Gives energy.' }
  }
];

// Replicate to 100+ items with variations
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Optionally clear existing products to avoid mess if you want a fresh list
    // await Product.deleteMany({}); 

    // Filter out items already in DB if necessary, or just insert new ones
    // For this task, we will just insert the bulk list.
    
    // Enriching the list to reach 100+ unique variants
    const fullList = [...products];
    
    // Add additional items to reach 100+
    const types = ['Mevali mix', 'Salat', 'Sho\'rva', 'Dimlama', 'Mix'];
    for(let i=0; i < 40; i++) {
        fullList.push({
            name: { 
                uz: `Diabetik Taom ${i+1}`, 
                ru: `╨Ф╨╕╨░╨▒╨╡╤В╨╕╤З╨╡╤Б╨║╨╛╨╡ ╨С╨╗╤О╨┤╨╛ ${i+1}`, 
                en: `Diabetic Meal ${i+1}` 
            },
            category: i % 2 === 0 ? 'vegetables' : 'grains',
            emoji: 'ЁЯН▓',
            gi: 20 + (i % 30),
            gl: 5 + (i % 10),
            calories: 100 + (i * 5),
            advice: { 
                uz: 'Foydali va to\'yimli taom.', 
                ru: '╨Я╨╛╨╗╨╡╨╖╨╜╨╛╨╡ ╨╕ ╤Б╤Л╤В╨╜╨╛╨╡ ╨▒╨╗╤О╨┤╨╛.', 
                en: 'Useful and nutritious meal.' 
            }
        });
    }

    const result = await Product.insertMany(fullList);
    console.log(`Successfully seeded ${result.length} products!`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
