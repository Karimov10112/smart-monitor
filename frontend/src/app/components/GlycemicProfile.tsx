import React from 'react';
import { Alert, AlertTitle, Box, Chip, Stack, Typography } from '@mui/material';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';

/**
 * Daily glycemic profile ("sutkalik glikemik profil") — shown when a high reading is entered.
 * Doctor's instruction: do not tell the patient to re-check in a few days; ask for a full-day
 * profile at these fixed points instead.
 */
type Lang = 'uz' | 'ru' | 'en';
type Point = { text: string; type1?: boolean };

const TEXT: Record<Lang, { title: string; intro: string; type1: string; footer: string; points: Point[] }> = {
  uz: {
    title: 'Sutkalik glikemik profil qiling',
    intro: "Qand yuqori çiqdi. Bir kun davomida quyidagi vaqtlarda qandni õlçab, kundalikka yozing va natijani şifokoringizga kõrsating:",
    type1: '1-tip diabet',
    footer: "Qayta õlçaşni bir necha kunga qoldirmang — profilni bugun yoki ertaga qiling.",
    points: [
      { text: 'Ertalab oç qoringa — insulin yoki tabletka içişdan oldin' },
      { text: 'Nonuştadan 2 soat keyin' },
      { text: "Tuşlikdan oldin — oddiy (qisqa ta'sirli) insulin olişdan oldin", type1: true },
      { text: 'Tuşlikdan 2 soat keyin' },
      { text: 'Keçki ovqatdan oldin — oddiy insulin olişdan oldin' },
      { text: "Uxlaşdan oldin, soat 21:00–22:00 da — õrta ta'sirli (Insulatard) yoki uzoq ta'sirli (Lantus) insulindan oldin" },
    ],
  },
  ru: {
    title: 'Сделайте суточный гликемический профиль',
    intro: 'Сахар повышен. В течение одного дня измерьте сахар в следующее время, запишите в дневник и покажите результат врачу:',
    type1: '1 тип',
    footer: 'Не откладывайте повторный замер на несколько дней — сделайте профиль сегодня или завтра.',
    points: [
      { text: 'Натощак — до инсулина или таблеток' },
      { text: 'Через 2 часа после завтрака' },
      { text: 'Перед обедом — до введения короткого (простого) инсулина', type1: true },
      { text: 'Через 2 часа после обеда' },
      { text: 'Перед ужином — до введения короткого инсулина' },
      { text: 'Перед сном, в 21:00–22:00 — до инсулина средней продолжительности (Инсулатард) или длительного действия (Лантус)' },
    ],
  },
  en: {
    title: 'Do a daily glucose profile',
    intro: 'Your sugar is high. Over one day, measure it at the times below, log each reading and show the results to your doctor:',
    type1: 'Type 1',
    footer: "Don't put the re-check off for days — do the profile today or tomorrow.",
    points: [
      { text: 'Fasting in the morning — before insulin or tablets' },
      { text: '2 hours after breakfast' },
      { text: 'Before lunch — before short-acting (regular) insulin', type1: true },
      { text: '2 hours after lunch' },
      { text: 'Before dinner — before short-acting insulin' },
      { text: 'At bedtime, 21:00–22:00 — before intermediate-acting (Insulatard) or long-acting (Lantus) insulin' },
    ],
  },
};

export function GlycemicProfileAdvice({ language }: { language: string }) {
  const tx = TEXT[(language as Lang)] || TEXT.uz;
  return (
    <Alert severity="info" icon={<ScheduleRoundedIcon fontSize="inherit" />}>
      <AlertTitle>{tx.title}</AlertTitle>
      <Typography variant="body2" sx={{ mb: 1 }}>{tx.intro}</Typography>
      <Stack component="ol" spacing={0.75} sx={{ m: 0, pl: 0, listStyle: 'none' }}>
        {tx.points.map((p, i) => (
          <Box component="li" key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Box sx={{ flex: '0 0 22px', height: 22, borderRadius: '50%', bgcolor: 'info.main', color: 'info.contrastText', fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center', mt: '1px' }}>
              {i + 1}
            </Box>
            <Typography variant="body2" sx={{ flex: 1 }}>
              {p.text}
              {p.type1 && <Chip label={tx.type1} size="small" variant="outlined" color="info" sx={{ ml: 1, height: 20, fontSize: 11 }} />}
            </Typography>
          </Box>
        ))}
      </Stack>
      <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>{tx.footer}</Typography>
    </Alert>
  );
}
