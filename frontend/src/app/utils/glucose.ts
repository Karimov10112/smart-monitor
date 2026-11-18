import type { GlucoseLevel } from '../../theme';

/**
 * Glucose classification used across the UI (mmol/L).
 * Bands follow the international consensus on CGM "time in range" reports.
 */
export const GLUCOSE_TARGET = { low: 3.9, high: 10.0 } as const;

export function classifyGlucose(value?: number | null): GlucoseLevel | null {
  if (value == null || Number.isNaN(value) || value <= 0) return null;
  if (value < 3.0) return 'veryLow';
  if (value < 3.9) return 'low';
  if (value <= 10.0) return 'inRange';
  if (value < 14.0) return 'high';
  return 'veryHigh';
}

const LABELS: Record<'uz' | 'ru' | 'en', Record<GlucoseLevel, string>> = {
  uz: { veryLow: 'Juda past', low: 'Past', inRange: "Me'yorda", high: 'Yuqori', veryHigh: 'Juda yuqori' },
  ru: { veryLow: 'Очень низкий', low: 'Низкий', inRange: 'В норме', high: 'Высокий', veryHigh: 'Очень высокий' },
  en: { veryLow: 'Very low', low: 'Low', inRange: 'In range', high: 'High', veryHigh: 'Very high' },
};

export function glucoseLabel(level: GlucoseLevel, language: string): string {
  const lang = (['uz', 'ru', 'en'].includes(language) ? language : 'uz') as 'uz' | 'ru' | 'en';
  return LABELS[lang][level];
}

export const GLUCOSE_BANDS: { level: GlucoseLevel; range: string }[] = [
  { level: 'veryLow', range: '< 3.0' },
  { level: 'low', range: '3.0–3.8' },
  { level: 'inRange', range: '3.9–10.0' },
  { level: 'high', range: '10.1–13.9' },
  { level: 'veryHigh', range: '≥ 14.0' },
];

/** "QÕLLAB-QUVVATLAŞ" -> "Qõllab-quvvatlaş" (keeps the new Uzbek alphabet intact). */
export function sentenceCase(text?: string): string {
  if (!text) return '';
  const lower = text.toLocaleLowerCase();
  return lower.charAt(0).toLocaleUpperCase() + lower.slice(1);
}
