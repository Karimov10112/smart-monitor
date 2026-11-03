/**
 * CGM va Glyukometr CSV eksportlarini o'quvchi universal parser (FreeStyle Libre, Dexcom, Standart CSV)
 */

const { normalizeToMmol } = require('./converters');

/**
 * CSV matnini tahlil qilib qon shakari o'lchovlariga aylantiradi
 * @param {string} csvText - CSV fayl tarkibi
 * @param {Object} [options]
 * @param {'auto'|'mmol/L'|'mg/dL'} [options.unit='auto']
 * @returns {Array<Object>} [{ date: Date, fastingLevel?: number, postMealLevel?: number, glucose: number }]
 */
function parseGlucoseCSV(csvText = '', options = {}) {
  if (typeof csvText !== 'string' || !csvText.trim()) {
    return [];
  }

  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // 1. Sarlavha qatorini aniqlash (Delimiter: vergul yoki nuqta-vergul)
  const delimiter = lines[0].includes(';') ? ';' : ',';
  const header = lines[0].toLowerCase().split(delimiter).map(h => h.trim().replace(/['"]/g, ''));

  // Ustun indekslarini aniqlash
  let dateIdx = header.findIndex(h => h.includes('date') || h.includes('time') || h.includes('vaqt') || h.includes('data') || h.includes('timestamp'));
  let glucoseIdx = header.findIndex(h => h.includes('glucose') || h.includes('historic') || h.includes('scan') || h.includes('qand') || h.includes('value') || h.includes('glikemiya'));
  let typeIdx = header.findIndex(h => h.includes('type') || h.includes('tur') || h.includes('meal') || h.includes('holat'));

  // Agar sarlavha topilmasa, standart 0 va 1 indeks deb olamiz
  if (dateIdx === -1) dateIdx = 0;
  if (glucoseIdx === -1) glucoseIdx = 1;

  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map(c => c.trim().replace(/['"]/g, ''));
    if (cols.length <= Math.max(dateIdx, glucoseIdx)) continue;

    const rawDate = cols[dateIdx];
    const rawVal = cols[glucoseIdx]?.replace(',', '.'); // 7,2 -> 7.2
    const numVal = parseFloat(rawVal);

    if (isNaN(numVal) || numVal <= 0) continue;

    const parsedDate = new Date(rawDate);
    const validDate = !isNaN(parsedDate.getTime()) ? parsedDate : new Date();

    const mmol = normalizeToMmol(numVal, options.unit);
    const mealType = typeIdx !== -1 ? cols[typeIdx]?.toLowerCase() : '';

    const rec = {
      date: validDate,
      glucose: mmol
    };

    if (mealType.includes('fast') || mealType.includes('och') || mealType.includes('before')) {
      rec.fastingLevel = mmol;
    } else if (mealType.includes('post') || mealType.includes('toq') || mealType.includes('after')) {
      rec.postMealLevel = mmol;
    } else {
      // Vaqtiga qarab taxminiy ajratish: ertalab 06:00 - 09:30 bo'lsa och qoringa
      const hour = validDate.getHours();
      if (hour >= 6 && hour <= 9) {
        rec.fastingLevel = mmol;
      } else {
        rec.postMealLevel = mmol;
      }
    }

    records.push(rec);
  }

  return records;
}

module.exports = {
  parseGlucoseCSV
};

