/**
 * Ko'p tilli lokalizatsiya (Internationalization - i18n)
 * uz: O'zbekcha
 * en: English
 * ru: Русский
 */

const translations = {
  uz: {
    tirGood: "Glisemik nazorat yaxşi: Me'yordagi vaqt (TIR) 70% dan yuqori.",
    tirLow: "TIR past ({value}%). Xalqaro standart bõyiça kamida 70% bõlişi lozim.",
    unstableCV: "Qand miqdori õzgaruvçanligi yuqori (CV = {value}% > 36%). Gipoglikemiya xavfini kamaytiriş uçun davolaş sxemasini qayta kõriş lozim.",
    highTbr: "Gipoglikemiya çastotasi yuqori ({value}% > 4%). Zudlik bilan dori yoki insulin dozasini korreksiya qiliş talab etiladi.",
    retinopathyHigh: "Diabetik retinopatiya rivojlaniş xavfi yuqori. Zudlik bilan oftalmolog kõrigi (kõz tubi tekşiruvi) zarur.",
    retinopathyModerate: "Mõ'tadil xavf. Yilda kamida 1 marta oftalmolog nazorati tavsiya etiladi.",
    retinopathyLow: "Past xavf darajasi. Standart yillik kõrik kifoya.",
    nephropathyHigh: "Diabetik nefropatiya xavfi yuqori! Siydikdagi mikroalbuminuriya va kreatinin tahlilini topşiriş zarur.",
    nephropathyModerate: "Õrta darajali buyrak xavfi. Qon bosimi va qand miqdorini qat'iy nazoratda uşlang.",
    nephropathyLow: "Past xavf darajasi. Har yili albumin/kreatinin nisbati tekşirilişi tavsiya etiladi.",
    cardioHigh: "Kardiovaskulyar asoratlar (insult, infarkt) xavfi yuqori. Kardiolog maslahati, lipid profili va EKG talab qilinadi.",
    cardioModerate: "Õrta xavf. Qon bosimi profilaktikasi va vaznni kamaytiriş tavsiya etiladi.",
    cardioLow: "Yurak-qon tomir tizimi bõyiça barqaror holat.",
    neuropathyHigh: "Diabetik polineyropatiya va tovon yaralari xavfi yuqori. Har kuni oyoq terisini kõrikdan õtkaziş va podiatr kõrigi zarur.",
    neuropathyModerate: "Õrta xavf. Sezuvçanlik pasayişi yoki uvişiş bõlsa darhol şifokorga xabar bering.",
    neuropathyLow: "Past xavf darajasi. Gigiyena va qulay poyabzal kiyiş tavsiya etiladi.",
    alertHypo: "Tez-tez gipoglikemiya kuzatilmoqda! Huşdan ketiş va koma xavfi mavjud.",
    alertHyper: "Qand darajasi doimiy 13.9 mmol/l dan yuqori. Diabetik ketoatsidoz (DKA) xavfi mavjud."
  },
  en: {
    tirGood: "Optimal glycemic control: Time in Range (TIR) exceeds the 70% clinical target.",
    tirLow: "TIR is below target ({value}%). International guidelines recommend at least 70%.",
    unstableCV: "High glycemic variability (CV = {value}% > 36%). Therapy review advised to prevent hypoglycemia.",
    highTbr: "Elevated hypoglycemia frequency ({value}% > 4%). Immediate dose adjustment recommended.",
    retinopathyHigh: "High risk of diabetic retinopathy. Urgent ophthalmologic fundus examination required.",
    retinopathyModerate: "Moderate risk. Annual dilated eye exam recommended.",
    retinopathyLow: "Low risk profile. Standard annual screening is sufficient.",
    nephropathyHigh: "High risk of diabetic nephropathy! Spot urine albumin-to-creatinine ratio (uACR) test urgently recommended.",
    nephropathyModerate: "Moderate renal risk. Strict blood pressure and glucose management indicated.",
    nephropathyLow: "Low renal risk profile. Routine annual screening recommended.",
    cardioHigh: "Elevated cardiovascular risk (ASCVD). Cardiologist consultation, lipid panel, and ECG recommended.",
    cardioModerate: "Moderate cardiovascular risk. Lifestyle optimization and BP management advised.",
    cardioLow: "Favorable cardiovascular risk profile.",
    neuropathyHigh: "High risk of diabetic peripheral neuropathy and foot ulceration. Daily foot inspection and podiatrist evaluation required.",
    neuropathyModerate: "Moderate neuropathy risk. Report numbness or paresthesia promptly.",
    neuropathyLow: "Low neuropathy risk. Routine foot hygiene and appropriate footwear advised.",
    alertHypo: "Frequent hypoglycemia episodes detected! Serious risk of loss of consciousness.",
    alertHyper: "Persistent glucose readings > 13.9 mmol/L. Elevated risk of Diabetic Ketoacidosis (DKA)."
  },
  ru: {
    tirGood: "Оптимальный гликемический контроль: время в целевом диапазоне (TIR) превышает 70%.",
    tirLow: "TIR ниже целевого ({value}%). Международные стандарты рекомендуют не менее 70%.",
    unstableCV: "Высокая вариабельность гликемии (CV = {value}% > 36%). Рекомендуется коррекция терапии для снижения риска гипогликемий.",
    highTbr: "Повышенная частота гипогликемий ({value}% > 4%). Требуется срочная коррекция дозы инсулина или сахароснижающих препаратов.",
    retinopathyHigh: "Высокий риск диабетической ретинопатии. Необходим срочный осмотр офтальмолога (глазное дно).",
    retinopathyModerate: "Умеренный риск. Рекомендуется плановый осмотр офтальмолога не реже 1 раза в год.",
    retinopathyLow: "Низкий риск. Достаточно стандартного ежегодного скрининга.",
    nephropathyHigh: "Высокий риск диабетической нефропатии! Рекомендуется сдать анализ на микроальбуминурию и креатинин.",
    nephropathyModerate: "Умеренный почечный риск. Требуется строгий контроль АД и уровня сахара.",
    nephropathyLow: "Низкий риск поражения почек. Плановый ежегодный контроль альбумин/креатинин.",
    cardioHigh: "Высокий риск сердечно-сосудистых осложнений. Рекомендована консультация кардиолога, липидограмма и ЭКГ.",
    cardioModerate: "Умеренный риск. Рекомендуется коррекция давления и нормализация массы тела.",
    cardioLow: "Стабильное состояние сердечно-сосудистой системы.",
    neuropathyHigh: "Высокий риск полинейропатии и диабетической стопы. Ежедневный осмотр стоп и консультация подиатра обязательны.",
    neuropathyModerate: "Умеренный риск. При онемении или покалывании обратитесь к врачу.",
    neuropathyLow: "Низкий риск. Рекомендуется гигиена стоп и удобная обувь.",
    alertHypo: "Частые эпизоды гипогликемии! Риск гипогликемической комы.",
    alertHyper: "Уровень сахара стойко выше 13.9 ммоль/л. Риск диабетического кетоацидоза (ДКА)."
  }
};

function t(key, lang = 'uz', params = {}) {
  const dictionary = translations[lang] || translations.en;
  let text = dictionary[key] || translations.en[key] || key;
  Object.keys(params).forEach(k => {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
  });
  return text;
}

module.exports = {
  t,
  translations
};

