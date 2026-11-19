import React, { useEffect, useState } from 'react';
import { Alert, Box, Chip, CircularProgress, Grid, LinearProgress, Skeleton, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import DirectionsWalkRoundedIcon from '@mui/icons-material/DirectionsWalkRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';
import api from '../utils/api';
import { SectionCard } from './common';

/**
 * Complication risk + trend, computed on the server by the @karimov_dev/diabets library.
 * patientId given → doctor view (/doctor/patients/:id/analytics); otherwise the signed-in patient.
 */
type Level = 'LOW' | 'MODERATE' | 'HIGH';
type Lang = 'uz' | 'ru' | 'en';

const UI: Record<Lang, Record<string, string>> = {
  uz: {
    title: 'Asoratlar xavfi va dinamika', sub: 'Hisob-kitob: @karimov_dev/diabets', overall: 'Umumiy xavf indeksi',
    LOW: 'Past', MODERATE: "Õrtaça", HIGH: 'Yuqori', retinopathy: 'Kõz (retinopatiya)', nephropathy: 'Buyrak (nefropatiya)',
    cardiovascular: 'Yurak-qon tomir', neuropathy: 'Oyoq (neyropatiya)', gmi: 'GMI', ea1c: 'Taxminiy HbA1c', cv: 'Õzgaruvçanlik (CV)',
    noData: "Xavfni baholaş uçun kamida bir necha kunlik yozuv kerak.", error: "Tahlilni yuklab bõlmadi.",
    note: "Bu baholaş taşxis emas — natijani şifokoringiz bilan muhokama qiling.", readings: 'õlçov'
  },
  ru: {
    title: 'Риск осложнений и динамика', sub: 'Расчёт: @karimov_dev/diabets', overall: 'Общий индекс риска',
    LOW: 'Низкий', MODERATE: 'Средний', HIGH: 'Высокий', retinopathy: 'Глаза (ретинопатия)', nephropathy: 'Почки (нефропатия)',
    cardiovascular: 'Сердце и сосуды', neuropathy: 'Стопы (нейропатия)', gmi: 'GMI', ea1c: 'Расчётный HbA1c', cv: 'Вариабельность (CV)',
    noData: 'Для оценки риска нужны записи за несколько дней.', error: 'Не удалось загрузить анализ.',
    note: 'Это не диагноз — обсудите результат с врачом.', readings: 'замеров'
  },
  en: {
    title: 'Complication risk & trend', sub: 'Computed by @karimov_dev/diabets', overall: 'Overall risk index',
    LOW: 'Low', MODERATE: 'Moderate', HIGH: 'High', retinopathy: 'Eyes (retinopathy)', nephropathy: 'Kidneys (nephropathy)',
    cardiovascular: 'Heart & vessels', neuropathy: 'Feet (neuropathy)', gmi: 'GMI', ea1c: 'Estimated HbA1c', cv: 'Variability (CV)',
    noData: 'A few days of readings are needed to assess risk.', error: 'Could not load the analysis.',
    note: 'This is not a diagnosis — discuss the result with your doctor.', readings: 'readings'
  }
};

const ICONS: Record<string, React.ReactNode> = {
  retinopathy: <VisibilityOutlinedIcon fontSize="small" />,
  nephropathy: <WaterDropOutlinedIcon fontSize="small" />,
  cardiovascular: <FavoriteBorderRoundedIcon fontSize="small" />,
  neuropathy: <DirectionsWalkRoundedIcon fontSize="small" />
};

export function RiskAnalysisCard({ language, patientId, refreshKey }: { language: string; patientId?: string; refreshKey?: unknown }) {
  const theme = useTheme();
  const lang: Lang = (['uz', 'ru', 'en'].includes(language) ? language : 'uz') as Lang;
  const ui = UI[lang];
  const [data, setData] = useState<any>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    setState('loading');
    const url = patientId ? `/doctor/patients/${patientId}/analytics` : '/blood-sugar/analytics';
    api.get(url, { params: { lang } })
      .then(({ data: res }) => { if (alive) { setData(res.data); setState('ok'); } })
      .catch(() => { if (alive) setState('error'); });
    return () => { alive = false; };
  }, [patientId, lang, refreshKey]);

  const tone = (l: Level) => (l === 'HIGH' ? theme.palette.error.main : l === 'MODERATE' ? theme.palette.warning.main : theme.palette.success.main);

  let body: React.ReactNode;
  if (state === 'loading') {
    body = <Stack spacing={1.5}><Skeleton variant="rounded" height={88} /><Skeleton variant="rounded" height={120} /></Stack>;
  } else if (state === 'error') {
    body = <Alert severity="warning">{ui.error}</Alert>;
  } else if (!data || !data.metrics || data.metrics.totalReadings < 3) {
    body = <Typography variant="body2" color="text.secondary">{ui.noData}</Typography>;
  } else {
    const { risk, metrics, trend } = data;
    const overall = risk.overallAssessment as { score: number; level: Level };
    const TrendIcon = trend?.direction === 'IMPROVING' ? TrendingDownRoundedIcon : trend?.direction === 'WORSENING' ? TrendingUpRoundedIcon : TrendingFlatRoundedIcon;
    const trendColor = trend?.direction === 'IMPROVING' ? 'success' : trend?.direction === 'WORSENING' ? 'error' : 'default';

    body = (
      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flexShrink: 0 }}>
            <Box sx={{ position: 'relative', width: 84, height: 84 }}>
              <CircularProgress variant="determinate" value={100} size={84} thickness={5} sx={{ color: alpha(tone(overall.level), 0.15), position: 'absolute' }} />
              <CircularProgress variant="determinate" value={overall.score} size={84} thickness={5} sx={{ color: tone(overall.level), position: 'absolute' }} aria-label={`${ui.overall}: ${overall.score}`} />
              <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 750 }}>{overall.score}</Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">{ui.overall}</Typography>
              <Box><Chip size="small" label={ui[overall.level]} sx={{ mt: 0.5, fontWeight: 700, bgcolor: alpha(tone(overall.level), 0.14), color: tone(overall.level) }} /></Box>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ flex: 1 }}>
            {[
              [ui.ea1c, metrics.estimatedA1C != null ? `${metrics.estimatedA1C}%` : '—'],
              [ui.gmi, metrics.glucoseManagementIndicator != null ? `${metrics.glucoseManagementIndicator}%` : '—'],
              [ui.cv, `${metrics.coefficientOfVariation}%`]
            ].map(([k, v]) => (
              <Box key={k} sx={{ px: 1.5, py: 1, borderRadius: 2, bgcolor: 'action.hover', minWidth: 96 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{k}</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{v}</Typography>
              </Box>
            ))}
          </Stack>
        </Stack>

        {trend && trend.direction !== 'INSUFFICIENT_DATA' && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip icon={<TrendIcon />} color={trendColor as any} variant="outlined" size="small" label={trend.slopePerWeek > 0 ? `+${trend.slopePerWeek}` : `${trend.slopePerWeek}`} />
            <Typography variant="body2">{trend.message}</Typography>
          </Stack>
        )}

        <Grid container spacing={1.5}>
          {(['retinopathy', 'nephropathy', 'cardiovascular', 'neuropathy'] as const).map((k) => {
            const c = risk.complications?.[k];
            if (!c) return null;
            return (
              <Grid key={k} size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 1.75, borderRadius: 2, border: 1, borderColor: 'divider', height: '100%' }}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: tone(c.level) }}>
                      {ICONS[k]}
                      <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>{ui[k]}</Typography>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ color: tone(c.level), fontWeight: 700 }}>{c.riskPercent}%</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={c.riskPercent} sx={{ my: 1, height: 6, borderRadius: 3, bgcolor: alpha(tone(c.level), 0.15), '& .MuiLinearProgress-bar': { bgcolor: tone(c.level) } }} />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.45 }}>{c.description}</Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {(risk.alerts || []).map((a: any) => <Alert key={a.code} severity="warning">{a.message}</Alert>)}

        <Typography variant="caption" color="text.secondary">
          {ui.note} · {metrics.totalReadings} {ui.readings} · {data.library?.name} v{data.library?.version}
        </Typography>
      </Stack>
    );
  }

  return (
    <SectionCard title={ui.title} subtitle={ui.sub} icon={<HealthAndSafetyOutlinedIcon />} iconColor="secondary">
      {body}
    </SectionCard>
  );
}
