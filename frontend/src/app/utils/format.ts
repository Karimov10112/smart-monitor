/**
 * Date helpers. Browsers have poor `uz` locale data ("M11 18"), so Uzbek
 * month/weekday names are provided here (new Latin alphabet, as in translations.ts).
 */
const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const UZ_MONTHS_SHORT = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];
const UZ_WEEKDAYS = ['Yakşanba', 'Duşanba', 'Seşanba', 'Çorşanba', 'Payşanba', 'Juma', 'Şanba'];

const localeOf = (language: string) => (language === 'ru' ? 'ru-RU' : 'en-GB');

/** "18 noyabr" / "18 нояб." / "18 Nov" */
export function formatShortDate(input: string | number | Date, language: string): string {
  const d = new Date(input);
  if (language === 'uz' || !['ru', 'en'].includes(language)) return `${d.getDate()} ${UZ_MONTHS_SHORT[d.getMonth()]}`;
  return d.toLocaleDateString(localeOf(language), { day: 'numeric', month: 'short' });
}

/** "18.11.2026" */
export function formatDate(input: string | number | Date): string {
  const d = new Date(input);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

/** "14:05" */
export function formatTime(input: string | number | Date): string {
  const d = new Date(input);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** "Çorşanba, 18 noyabr" / "среда, 18 ноября" / "Wednesday, 18 November" */
export function formatLongToday(language: string, date: Date = new Date()): string {
  if (language === 'uz' || !['ru', 'en'].includes(language)) return `${UZ_WEEKDAYS[date.getDay()]}, ${date.getDate()} ${UZ_MONTHS[date.getMonth()]}`;
  return date.toLocaleDateString(localeOf(language), { weekday: 'long', day: 'numeric', month: 'long' });
}
