/**
 * Glyukometr apparatlari bilan Bluetooth (BLE) va Kabel (USB / Serial COM) orqali integratsiya moduli
 * IEEE 11073 va Bluetooth SIG Glucose Service (0x1808 / 0x2A18) standartlari asosida.
 */

const { normalizeToMmol } = require('./converters');

// Xalqaro Bluetooth standart UUIDlari
const BLUETOOTH_GLUCOSE_UUIDS = {
  service: '00001808-0000-1000-8000-00805f9b34fb',         // Glucose Service (0x1808)
  measurement: '00002a18-0000-1000-8000-00805f9b34fb',     // Glucose Measurement (0x2A18)
  context: '00002a34-0000-1000-8000-00805f9b34fb',         // Glucose Measurement Context
  recordAccess: '00002a52-0000-1000-8000-00805f9b34fb'     // Record Access Control Point
};

/**
 * IEEE-11073 16-bit SFLOAT (Short Float) formatidagi 2 ta baytni haqiqiy son qiymatiga aylantirish
 * @param {number} raw - 16-bit integer
 * @returns {number}
 */
function parseSFLOAT(raw) {
  if (raw === 0x07FE) return NaN;
  if (raw === 0x07FF) return NaN;
  if (raw === 0x0800) return NaN;

  let mantissa = raw & 0x0FFF;
  if (mantissa >= 0x0800) {
    mantissa = -((0x0FFF + 1) - mantissa);
  }
  let exponent = raw >> 12;
  if (exponent >= 0x08) {
    exponent = -((0x0F + 1) - exponent);
  }
  return Number((mantissa * Math.pow(10, exponent)).toFixed(2));
}

/**
 * Bluetooth orqali kelgan binar DataView baytlarini o'qib qon shakari o'lchoviga aylantiradi
 * @param {DataView} dataView - Web Bluetooth characteristicvaluechanged eventidan olingan DataView
 * @returns {Object} { glucoseMmol, glucoseMgDl, date, unit, mealContext }
 */
function parseBluetoothGlucosePacket(dataView) {
  if (!dataView || typeof dataView.getUint8 !== 'function') {
    throw new Error("Yaroqsiz Bluetooth paketi: DataView ob'ekti talab qilinadi.");
  }

  // Flags bayti (birinchi bayt)
  const flags = dataView.getUint8(0);
  const timeOffsetPresent = (flags & 0x01) !== 0;
  const glucoseTypeAndSampleLocationPresent = (flags & 0x02) !== 0;
  const glucoseUnitsIsMolL = (flags & 0x04) !== 0; // 0: kg/L yoki mg/dL, 1: mol/L
  const sensorStatusAnnunciationPresent = (flags & 0x08) !== 0;
  const contextInformationFollows = (flags & 0x10) !== 0;

  let offset = 1;

  // Sequence number (2 bayt)
  const sequenceNumber = dataView.getUint16(offset, true);
  offset += 2;

  // Sana va vaqt (7 bayt: Base Time)
  const year = dataView.getUint16(offset, true);
  offset += 2;
  const month = dataView.getUint8(offset) - 1; // 0-based JS Month
  offset += 1;
  const day = dataView.getUint8(offset);
  offset += 1;
  const hours = dataView.getUint8(offset);
  offset += 1;
  const minutes = dataView.getUint8(offset);
  offset += 1;
  const seconds = dataView.getUint8(offset);
  offset += 1;

  const date = new Date(year, month, day, hours, minutes, seconds);

  // Time offset (agar mavjud bo'lsa)
  if (timeOffsetPresent) {
    offset += 2;
  }

  // Qand miqdori (SFLOAT 2 bayt)
  let rawGlucose = 0;
  let glucoseMmol = 0;
  let glucoseMgDl = 0;

  if (offset + 2 <= dataView.byteLength) {
    const rawSFLOAT = dataView.getUint16(offset, true);
    rawGlucose = parseSFLOAT(rawSFLOAT);
    offset += 2;

    if (glucoseUnitsIsMolL) {
      // mol/L formatida kelganda (odatda 1e-3, ya'ni mmol/l)
      glucoseMmol = Number((rawGlucose * 1000).toFixed(1));
      glucoseMgDl = Number((glucoseMmol * 18.0182).toFixed(1));
    } else {
      // kg/L formatida kelganda: kg/L * 100000 = mg/dL
      glucoseMgDl = Number((rawGlucose * 100000).toFixed(1));
      glucoseMmol = Number((glucoseMgDl / 18.0182).toFixed(1));
    }
  }

  return {
    sequenceNumber,
    date: !isNaN(date.getTime()) ? date : new Date(),
    glucoseMmol,
    glucoseMgDl,
    unit: glucoseUnitsIsMolL ? 'mmol/L' : 'mg/dL',
    isFasting: hours >= 6 && hours <= 9 // Ertalabki o'lchov taxmini
  };
}

/**
 * Kabel (USB/Serial COM) orqali oqib keladigan matn yoki baytlar qatorini tahlil qiladi
 * Masalan: "GLU:7.4,2026-11-03 14:30" yoki "7.4 mmol/L" yoki Aria USB protokoli
 * @param {string} rawString - COM-portdan o'qilgan xom matn
 * @returns {Object}
 */
function parseSerialGlucosePacket(rawString = '') {
  if (typeof rawString !== 'string') return null;

  // Har qanday kasr sonni qidirish (masalan: 6.8 yoki 120)
  const match = rawString.match(/(\d{1,3}[.,]\d{1,2}|\d{2,3})/);
  if (!match) return null;

  const num = parseFloat(match[1].replace(',', '.'));
  if (isNaN(num) || num <= 0) return null;

  const mmol = normalizeToMmol(num);
  const mgDl = Number((mmol * 18.0182).toFixed(1));

  return {
    raw: rawString.trim(),
    glucoseMmol: mmol,
    glucoseMgDl: mgDl,
    date: new Date()
  };
}

module.exports = {
  BLUETOOTH_GLUCOSE_UUIDS,
  parseBluetoothGlucosePacket,
  parseSerialGlucosePacket,
  parseSFLOAT
};

