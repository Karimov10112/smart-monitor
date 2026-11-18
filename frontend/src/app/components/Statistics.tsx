import React, { useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/translations';
import { toast } from 'sonner';

// MUI Components
import {
  Box,
  Typography,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  CircularProgress,
  Tooltip as MuiTooltip,
  alpha,
  useTheme
} from '@mui/material';

// MUI Icons
import TimelineIcon from '@mui/icons-material/Timeline';
import WbTwilightRoundedIcon from '@mui/icons-material/WbTwilightRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import BloodtypeOutlinedIcon from '@mui/icons-material/BloodtypeOutlined';
import { SectionCard, StatTile, GlucoseBadge, EmptyState } from './common';
import { GlucoseTrendChart } from './common/GlucoseTrendChart';
import { classifyGlucose, glucoseLabel, GLUCOSE_BANDS } from '../utils/glucose';
import { formatShortDate, formatDate, formatTime } from '../utils/format';
import type { GlucoseLevel } from '../../theme';

const UI: Record<string, Record<string, string>> = {
  uz: { today: 'Bugun', week: '7 kun', month: '30 kun', year: '1 yil', all: 'Barçasi', tir: "Me'yor oraliğidagi vaqt (TIR)", tirSub: 'Barça õlçovlar bõyiça taqsimot', target: 'Maqsad: >70% · 3.9–10.0 mmol/l', trend: 'Glyukoza dinamikasi', trendSub: 'Yashil zona — maqsadli oraliq (3.9–10.0)', readings: 'õlçov', noPeriod: 'Bu davrda õlçovlar yõq', noPeriodDesc: 'Boşqa davrni tanlang yoki yangi yozuv qõşing.', estimate: "Bu taxminiy kõrsatkiç. Aniq diagnoz uçun laboratoriya tekşiruvi zarur.", hba1cTitle: 'Taxminiy HbA1c', hba1cSub: "Sõnggi 30 kun", basedOn: "õrtaça {avg} mmol/l, {n} ta õlçov asosida", noRecordsDesc: "Kunlik daftarga birinçi õlçovingizni kiriting — statistika avtomatik hisoblanadi." },
  ru: { today: 'Сегодня', week: '7 дней', month: '30 дней', year: '1 год', all: 'Все', tir: 'Время в целевом диапазоне (TIR)', tirSub: 'Распределение всех измерений', target: 'Цель: >70% · 3.9–10.0 ммоль/л', trend: 'Динамика глюкозы', trendSub: 'Зелёная зона — целевой диапазон (3.9–10.0)', readings: 'измер.', noPeriod: 'Нет измерений за период', noPeriodDesc: 'Выберите другой период или добавьте запись.', estimate: 'Это расчётный показатель. Для точного диагноза нужен лабораторный анализ.', hba1cTitle: 'Расчётный HbA1c', hba1cSub: 'Последние 30 дней', basedOn: 'среднее {avg} ммоль/л, по {n} измерениям', noRecordsDesc: 'Добавьте первое измерение в дневник — статистика посчитается автоматически.' },
  en: { today: 'Today', week: '7 days', month: '30 days', year: '1 year', all: 'All', tir: 'Time in range (TIR)', tirSub: 'Distribution of all readings', target: 'Target: >70% · 3.9–10.0 mmol/L', trend: 'Glucose trend', trendSub: 'Green band — target range (3.9–10.0)', readings: 'readings', noPeriod: 'No readings in this period', noPeriodDesc: 'Pick another period or add a new entry.', estimate: 'This is an estimate. A lab test is required for diagnosis.', hba1cTitle: 'Estimated HbA1c', hba1cSub: 'Last 30 days', basedOn: 'average {avg} mmol/L from {n} readings', noRecordsDesc: 'Log your first reading in the journal — statistics are calculated automatically.' },
};

interface StatisticsProps {
  customRecords?: any[];
  customLanguage?: string;
}

export function Statistics({ customRecords, customLanguage }: StatisticsProps = {}) {
  const { language: appLanguage, records: appRecords } = useApp();
  const { user } = useAuth();
  const language = customLanguage || appLanguage;
  const records = customRecords || appRecords;
  const theme = useTheme();
  const t = translations[language];
  const ui = UI[language] || UI.uz;
  const [timeRange, setTimeRange] = useState('7');
  const [exportingPDF, setExportingPDF] = useState(false);

  const stats = useMemo(() => {
    if (records.length === 0) return null;
    
    const now = new Date();
    let filteredRecords = [...records];
    if (timeRange !== 'all') {
      const days = parseInt(timeRange);
      const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      filteredRecords = filteredRecords.filter(r => new Date(r.date) >= cutoffDate);
    }

    const recentRecords = filteredRecords.sort((a, b) => {
      const timeDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (timeDiff !== 0) return timeDiff;
      const createA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return createA - createB;
    });

    // Values for time-in-range (both fasting and post-meal)
    const allValues: number[] = [];
    recentRecords.forEach(r => {
      const f = r.fastingLevel ?? (r.category === 'fasting' ? r.level : null);
      const p = r.postMealLevel ?? (r.category === 'post-meal' ? r.level : null);
      if (f != null && f > 0) allValues.push(f);
      if (p != null && p > 0) allValues.push(p);
    });
    const tirCounts: Record<GlucoseLevel, number> = { veryLow: 0, low: 0, inRange: 0, high: 0, veryHigh: 0 };
    allValues.forEach(v => { const l = classifyGlucose(v); if (l) tirCounts[l]++; });

    const avgFasting = recentRecords.length === 0 ? '0.0' : (recentRecords.reduce((sum, r) => sum + (r.fastingLevel ?? r.level ?? 0), 0) / recentRecords.length).toFixed(1);
    const postMealRecords = recentRecords.filter(r => r.postMealLevel != null || (r.category === 'post-meal' && r.level != null));
    const avgPostMeal = postMealRecords.length > 0
      ? (postMealRecords.reduce((sum, r) => sum + (r.postMealLevel ?? (r.category === 'post-meal' ? r.level : 0) ?? 0), 0) / postMealRecords.length).toFixed(1)
      : '0.0';

    const avgDiff = (parseFloat(avgPostMeal) - parseFloat(avgFasting)).toFixed(1);

    const chartData = recentRecords.map(record => {
      const parsedDate = new Date(record.date);
      const createdDate = record.createdAt ? new Date(record.createdAt) : parsedDate;
      const displayDate = formatShortDate(parsedDate, language);
      const displayTime = record.createdAt ? formatTime(createdDate) : '';
      const fullLabel = displayTime ? `${displayDate} • ${displayTime}` : displayDate;
      
      const fastingVal = record.category === 'fasting' ? (record.level ?? null) : (record.fastingLevel ?? null);
      const postMealVal = record.category === 'post-meal' ? (record.level ?? null) : (record.postMealLevel ?? null);
      
      return {
        date: fullLabel,
        fasting: fastingVal !== null && fastingVal > 0 ? fastingVal : null,
        postMeal: postMealVal !== null && postMealVal > 0 ? postMealVal : null,
      };
    });

    return { avgFasting, avgPostMeal, avgDiff, chartData, tirCounts, totalValues: allValues.length, periodCount: recentRecords.length };
  }, [records, language, timeRange]);

  const hba1c = useMemo(() => {
    if (records.length === 0) return null;
    // Oxirgi 30 kun uchun BARCHA o'lchovlar (och va to'q qorin) o'rtachasi -> HbA1c
    // HbA1c 24 soatlik umumiy glukozani aks ettiradi, shuning uchun har ikkisini qo'shamiz
    const now = new Date();
    const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last30 = records.filter(r => new Date(r.date) >= cutoff);
    if (last30.length === 0) return null;

    // Har bir yozuvdan mavjud barcha o'lchovlarni yig'amiz
    const allValues: number[] = [];
    last30.forEach(r => {
      const fasting = r.fastingLevel ?? (r.category === 'fasting' ? r.level : null);
      const postMeal = r.postMealLevel ?? (r.category === 'post-meal' ? r.level : null);
      if (fasting != null && fasting > 0) allValues.push(fasting);
      if (postMeal != null && postMeal > 0) allValues.push(postMeal);
    });

    if (allValues.length === 0) return null;

    const avgGlucose = allValues.reduce((s, v) => s + v, 0) / allValues.length;
    // IFCC formula: HbA1c (%) = (avgGlucose mmol/L + 2.59) / 1.59
    const hba1cVal = ((avgGlucose + 2.59) / 1.59).toFixed(1);
    const val = parseFloat(hba1cVal);
    let label = '';
    let color = '';
    if (val < 5.7) { label = 'Normal'; color = theme.palette.glucose.inRange; }
    else if (val < 6.5) { label = 'Prediabet'; color = theme.palette.glucose.high; }
    else { label = 'Diabet'; color = theme.palette.glucose.low; }
    return { value: hba1cVal, label, color, records: allValues.length, avgGlucose: avgGlucose.toFixed(1) };
  }, [records, theme]);

  const handleExportPDF = async () => {
    if (!records || records.length === 0) {
      toast.error('Eksport uçun ma\'lumot mavjud emas');
      return;
    }
    setExportingPDF(true);
    try {
      const jspdfModule = await import('jspdf');
      const JsPdfConstructor: any = jspdfModule.jsPDF || (typeof jspdfModule.default === 'function' ? jspdfModule.default : (jspdfModule.default as any)?.jsPDF);
      const autotableModule = await import('jspdf-autotable');
      const autoTable: any = autotableModule.default || autotableModule;
      const doc = new JsPdfConstructor();

      // Brand Header
      doc.setFillColor(14, 116, 144);
      doc.rect(0, 0, 210, 24, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('QAND NAZORATI - QON ŞAKARI VA SALOMATLIK HISOBOTI', 14, 15);

      // Patient metadata
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const patientName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Bemor';
      const dType = user?.diabetesType ? user.diabetesType.toUpperCase() : 'Diabet turi ko\'rsatilmagan';
      const periodLabel = timeRange === 'all' ? 'Barcha davr' : `Oxirgi ${timeRange} kun`;

      doc.text(`Bemor: ${patientName}`, 14, 34);
      doc.text(`Tashxis / Holat: ${dType}`, 14, 40);
      doc.text(`Hisobot davri: ${periodLabel}`, 14, 46);
      doc.text(`Sana: ${new Date().toLocaleDateString('uz')}`, 140, 34);

      // Summary KPI Box
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(14, 52, 182, 22, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Õrtaça Oç Qoringa:', 18, 62);
      doc.text(`${stats?.avgFasting || '—'} mmol/l`, 18, 69);

      doc.text('Õrtaça Ovqatdan Keyin:', 68, 62);
      doc.text(`${stats?.avgPostMeal || '—'} mmol/l`, 68, 69);

      doc.text('Hisoblangan HbA1c:', 120, 62);
      doc.text(`${hba1c?.value || '—'}%`, 120, 69);

      doc.text('Jami Õlçovlar:', 164, 62);
      doc.text(`${records.length} ta`, 164, 69);

      // Table of Records
      const tableRows = records.slice(0, 100).map((r: any) => {
        const d = new Date(r.date).toLocaleDateString('uz');
        const f = r.fastingLevel != null ? Number(r.fastingLevel).toFixed(1) : (r.level != null ? Number(r.level).toFixed(1) : '—');
        const p = r.postMealLevel != null ? Number(r.postMealLevel).toFixed(1) : '—';
        const bp = (r.systolicPressure && r.diastolicPressure) ? `${r.systolicPressure}/${r.diastolicPressure}` : (r.pulse ? `${r.pulse} bpm` : '—');
        const extra = [
          r.carbsUnits ? `${r.carbsUnits} XE` : null,
          r.insulinUnits ? `${r.insulinUnits} birlik` : null,
          r.notes || null
        ].filter(Boolean).join(' | ') || '—';

        return [d, f, p, bp, extra];
      });

      autoTable(doc, {
        startY: 80,
        head: [['Sana', 'Oç qoringa (mmol/l)', 'Ovqatdan keyin (mmol/l)', 'Bosim / Puls', 'XE / Insulin / Izoh']],
        body: tableRows,
        headStyles: { fillColor: [14, 116, 144], fontStyle: 'bold', fontSize: 9 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        styles: { fontSize: 8.5, cellPadding: 2.5 },
      });

      // Doctor signature line
      const finalY = (doc as any).lastAutoTable?.finalY || 150;
      if (finalY < 260) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text('Davolovçi şifokor imzosi: ________________________', 14, Math.min(270, finalY + 20));
      }

      // Page numbers footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Qand Nazorati © ${new Date().getFullYear()} | Sahifa ${i}/${pageCount}`, 14, doc.internal.pageSize.height - 8);
      }

      doc.save(`qand_nazorati_hisobot_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF hisobot muvaffaqiyatli yuklab olindi!');
    } catch (err) {
      console.error('PDF error:', err);
      toast.error('PDF hisobot yaratişda xato yuz berdi');
    } finally {
      setExportingPDF(false);
    }
  };

  if (!stats) {
    return (
      <SectionCard>
        <EmptyState icon={<TimelineIcon />} title={t.noRecords} description={ui.noRecordsDesc} />
      </SectionCard>
    );
  }

  const g = theme.palette.glucose;
  const tirOrder: GlucoseLevel[] = ['veryHigh', 'high', 'inRange', 'low', 'veryLow'];
  const pct = (n: number) => (stats.totalValues ? Math.round((n / stats.totalValues) * 100) : 0);
  const inRangePct = pct(stats.tirCounts.inRange);
  const fastingData = stats.chartData;

  const sortedRecords = [...records].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateB !== dateA) return dateB - dateA;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between">
        <ToggleButtonGroup
          exclusive
          size="small"
          value={timeRange}
          onChange={(_, v) => v && setTimeRange(v)}
          sx={{
            bgcolor: 'background.paper',
            overflowX: 'auto',
            '& .MuiToggleButton-root': { px: { xs: 1.25, sm: 2 }, textTransform: 'none', fontWeight: 600, border: 1, borderColor: 'divider', color: 'text.secondary', whiteSpace: 'nowrap', flex: { xs: 1, sm: 'initial' } },
            '& .MuiToggleButton-root.Mui-selected': { color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.1), borderColor: alpha(theme.palette.primary.main, 0.3) },
          }}
        >
          <ToggleButton value="1">{ui.today}</ToggleButton>
          <ToggleButton value="7">{ui.week}</ToggleButton>
          <ToggleButton value="30">{ui.month}</ToggleButton>
          <ToggleButton value="365">{ui.year}</ToggleButton>
          <ToggleButton value="all">{ui.all}</ToggleButton>
        </ToggleButtonGroup>

        <Button
          variant="outlined"
          color="inherit"
          startIcon={exportingPDF ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfOutlinedIcon fontSize="small" />}
          disabled={exportingPDF || records.length === 0}
          onClick={handleExportPDF}
          sx={{ borderColor: 'divider', bgcolor: 'background.paper' }}
        >
          {t.exportPDF || 'PDF Hisobot'}
        </Button>
      </Stack>

      {/* Overview Stats */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile icon={<WbTwilightRoundedIcon />} label={t.averageFasting} value={stats.periodCount ? stats.avgFasting : '—'} unit={stats.periodCount ? t.mmol : undefined} valueColor={classifyGlucose(parseFloat(stats.avgFasting)) ? g[classifyGlucose(parseFloat(stats.avgFasting))!] : undefined} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile icon={<RestaurantRoundedIcon />} color="secondary" label={t.averagePostMeal} value={parseFloat(stats.avgPostMeal) > 0 ? stats.avgPostMeal : '—'} unit={parseFloat(stats.avgPostMeal) > 0 ? t.mmol : undefined} valueColor={classifyGlucose(parseFloat(stats.avgPostMeal)) ? g[classifyGlucose(parseFloat(stats.avgPostMeal))!] : undefined} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile icon={<TrendingUpIcon />} color="info" label={t.averageDifference} value={stats.periodCount && parseFloat(stats.avgPostMeal) > 0 ? stats.avgDiff : '—'} unit={stats.periodCount && parseFloat(stats.avgPostMeal) > 0 ? t.mmol : undefined} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile
            icon={<TrackChangesRoundedIcon />}
            color="success"
            label="TIR"
            value={stats.totalValues ? `${inRangePct}%` : '—'}
            valueColor={stats.totalValues ? (inRangePct >= 70 ? g.inRange : inRangePct >= 50 ? g.high : g.low) : undefined}
            hint={<Typography variant="caption" color="text.secondary">{stats.totalValues} {ui.readings}</Typography>}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Time in range */}
        <Grid size={{ xs: 12, md: hba1c ? 7 : 12 }}>
          <SectionCard title={ui.tir} subtitle={ui.tirSub} icon={<TrackChangesRoundedIcon />} iconColor="success" sx={{ height: '100%' }}>
            {stats.totalValues === 0 ? (
              <EmptyState compact title={ui.noPeriod} description={ui.noPeriodDesc} />
            ) : (
              <Stack direction="row" spacing={3} alignItems="stretch">
                {/* Stacked bar */}
                <Box sx={{ width: 36, borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: 200, bgcolor: alpha(theme.palette.text.primary, 0.06) }}>
                  {tirOrder.map(l => {
                    const p = pct(stats.tirCounts[l]);
                    return p > 0 ? <MuiTooltip key={l} title={`${glucoseLabel(l, language)}: ${p}%`} placement="right"><Box sx={{ flexGrow: p, flexBasis: 0, bgcolor: g[l], minHeight: 4 }} /></MuiTooltip> : null;
                  })}
                </Box>
                <Stack spacing={1} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                  {tirOrder.map(l => {
                    const band = GLUCOSE_BANDS.find(b => b.level === l)!;
                    const p = pct(stats.tirCounts[l]);
                    return (
                      <Stack key={l} direction="row" alignItems="center" spacing={1.5} sx={{ py: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: g[l], flexShrink: 0 }} />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: l === 'inRange' ? 600 : 500 }}>{glucoseLabel(l, language)}</Typography>
                          <Typography variant="caption" color="text.secondary">{band.range} {t.mmol}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: p > 0 ? g[l] : 'text.disabled', minWidth: 44, textAlign: 'right' }}>
                          {p}%
                        </Typography>
                      </Stack>
                    );
                  })}
                  <Typography variant="caption" color="text.secondary" sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>{ui.target}</Typography>
                </Stack>
              </Stack>
            )}
          </SectionCard>
        </Grid>

        {/* HbA1c */}
        {hba1c && (
          <Grid size={{ xs: 12, md: 5 }}>
            <SectionCard title={ui.hba1cTitle} subtitle={ui.hba1cSub} icon={<BloodtypeOutlinedIcon />} iconColor="error" sx={{ height: '100%' }}>
              <Stack direction="row" spacing={2.5} alignItems="center">
                <Box sx={{
                  width: 112, height: 112, borderRadius: '50%', flexShrink: 0,
                  background: `conic-gradient(${hba1c.color} ${Math.min(1, parseFloat(hba1c.value) / 12) * 360}deg, ${alpha(hba1c.color, 0.12)} 0deg)`,
                  display: 'grid', placeItems: 'center',
                }}>
                  <Box sx={{ width: 90, height: 90, borderRadius: '50%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: hba1c.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{hba1c.value}%</Typography>
                    <Typography variant="caption" color="text.secondary">HbA1c</Typography>
                  </Box>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ color: hba1c.color, fontWeight: 700 }}>{hba1c.label}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {ui.basedOn.replace('{avg}', hba1c.avgGlucose).replace('{n}', String(hba1c.records))}
                  </Typography>
                  <Stack spacing={0.5}>
                    {[
                      { label: '< 5.7%', color: g.inRange, desc: 'Normal' },
                      { label: '5.7–6.4%', color: g.high, desc: 'Prediabet' },
                      { label: '≥ 6.5%', color: g.low, desc: 'Diabet' },
                    ].map(r => (
                      <Stack key={r.label} direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: r.color }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 64, fontVariantNumeric: 'tabular-nums' }}>{r.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{r.desc}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 2, p: 1.25, borderRadius: 2, bgcolor: 'surfaceMuted' }}>
                <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2 }} />
                <Typography variant="caption" color="text.secondary">{ui.estimate}</Typography>
              </Stack>
            </SectionCard>
          </Grid>
        )}
      </Grid>

      {/* Chart Section */}
      <SectionCard title={ui.trend} subtitle={ui.trendSub} icon={<TimelineIcon />}>
        {fastingData.length === 0 ? (
          <EmptyState compact title={ui.noPeriod} description={ui.noPeriodDesc} />
        ) : (
          <GlucoseTrendChart data={fastingData} fastingLabel={t.fasting} postMealLabel={t.postMeal} />
        )}
      </SectionCard>

      {/* Records Table */}
      <SectionCard
        title={t.allRecords}
        subtitle={`${records.length} ${ui.readings}`}
        icon={<ListAltRoundedIcon />}
        noPadding
      >
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t.date}</TableCell>
                <TableCell>{t.fasting}</TableCell>
                <TableCell>{t.postMeal}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t.notes}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRecords.map((record) => {
                const fasting = record.fastingLevel ?? (record.category === 'fasting' ? record.level : null);
                const postMeal = record.postMealLevel ?? (record.category === 'post-meal' ? record.level : null);
                return (
                  <TableRow key={record._id || record.id} hover>
                    <TableCell sx={{ py: 1.25, whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{formatDate(record.date)}</Typography>
                      {record.createdAt && (
                        <Typography variant="caption" color="text.secondary">{formatTime(record.createdAt)}</Typography>
                      )}
                    </TableCell>
                    <TableCell><GlucoseBadge value={fasting} showLabel={false} /></TableCell>
                    <TableCell><GlucoseBadge value={postMeal} showLabel={false} /></TableCell>
                    <TableCell sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'table-cell' }, maxWidth: 320 }}>
                      <Typography variant="body2" color="text.secondary" noWrap title={record.notes || ''}>{record.notes || '—'}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>
    </Stack>
  );
}
