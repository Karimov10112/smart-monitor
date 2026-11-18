import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/translations';
import { toast } from 'sonner';

import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

// MUI Components
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Chip,
  alpha,
  useTheme,
  CircularProgress,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Alert,
  AlertTitle,
  InputAdornment,
  Skeleton,
  Card,
} from '@mui/material';

// MUI Icons
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import WbTwilightRoundedIcon from '@mui/icons-material/WbTwilightRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

import { SectionCard, StatTile, GlucoseBadge, IconTile } from './common';
import { classifyGlucose, glucoseLabel, GLUCOSE_BANDS } from '../utils/glucose';
import { formatShortDate } from '../utils/format';

const UI: Record<string, Record<string, string>> = {
  uz: {
    lastReading: 'Sõnggi õlçov',
    timeInRange: "Me'yorda vaqt · 7 kun",
    avg7: 'Õrtaça · 7 kun',
    today: 'Bugungi õlçovlar',
    noData: "Ma'lumot yõq",
    readings: 'ta õlçov',
    formSubtitle: 'Qon şakari va boşqa kõrsatkiçlarni kiriting',
    targetRanges: 'Glyukoza oraliqlari',
    targetRangesSub: 'Xalqaro konsensus (mmol/l)',
    target: 'Maqsad',
    invalid: '0.5–35 mmol/l oraliğida kiriting',
    requireOne: 'Kamida bitta qand kõrsatkiçini kiriting',
  },
  ru: {
    lastReading: 'Последнее измерение',
    timeInRange: 'В целевом диапазоне · 7 дн.',
    avg7: 'Среднее · 7 дн.',
    today: 'Измерений сегодня',
    noData: 'Нет данных',
    readings: 'измер.',
    formSubtitle: 'Введите уровень сахара и другие показатели',
    targetRanges: 'Диапазоны глюкозы',
    targetRangesSub: 'Международный консенсус (ммоль/л)',
    target: 'Цель',
    invalid: 'Введите значение 0.5–35 ммоль/л',
    requireOne: 'Введите хотя бы один показатель сахара',
  },
  en: {
    lastReading: 'Last reading',
    timeInRange: 'Time in range · 7d',
    avg7: '7-day average',
    today: 'Readings today',
    noData: 'No data',
    readings: 'readings',
    formSubtitle: 'Log blood glucose and other vitals',
    targetRanges: 'Glucose ranges',
    targetRangesSub: 'International consensus (mmol/L)',
    target: 'Target',
    invalid: 'Enter a value between 0.5–35 mmol/L',
    requireOne: 'Enter at least one glucose value',
  },
};

const isInvalidGlucose = (v: string) => {
  if (!v) return false;
  const n = parseFloat(v);
  return Number.isNaN(n) || n < 0.5 || n > 35;
};

export function DailyJournal() {
  const { language, addRecord, records } = useApp();
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = translations[language];
  const ui = UI[language] || UI.uz;
  const [loading, setLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [formData, setFormData] = useState({
    fastingLevel: '',
    postMealLevel: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    systolicPressure: '',
    diastolicPressure: '',
    pulse: '',
    insulinUnits: '',
    carbsUnits: '',
    exercise: false,
    medication: false,
  });

  const [showExtraParams, setShowExtraParams] = useState(false);
  const [isXeModalOpen, setIsXeModalOpen] = useState(false);

  // XE Calculator state
  const [xeCarbs100, setXeCarbs100] = useState('50');
  const [xeWeight, setXeWeight] = useState('100');
  const [xeRatio, setXeRatio] = useState('1.0');

  const parsedXE = useMemo(() => {
    const c = parseFloat(xeCarbs100) || 0;
    const w = parseFloat(xeWeight) || 0;
    const xe = (w * c) / 100 / 12;
    return Math.max(0, parseFloat(xe.toFixed(2)));
  }, [xeCarbs100, xeWeight]);

  const estimatedInsulin = useMemo(() => {
    const r = parseFloat(xeRatio) || 1;
    return (parsedXE * r).toFixed(1);
  }, [parsedXE, xeRatio]);

  const applyXeToForm = () => {
    setFormData(prev => ({
      ...prev,
      carbsUnits: parsedXE > 0 ? String(parsedXE) : prev.carbsUnits,
      insulinUnits: parseFloat(estimatedInsulin) > 0 ? String(estimatedInsulin) : prev.insulinUnits,
      notes: prev.notes ? `${prev.notes} | ${parsedXE} XE` : `${parsedXE} XE`,
    }));
    setShowExtraParams(true);
    setIsXeModalOpen(false);
    toast.success('XE va insulin şaklga kiritildi!');
  };

  // Hypo / Hyper live detection
  const fastingVal = parseFloat(formData.fastingLevel);
  const postMealVal = parseFloat(formData.postMealLevel);
  const isHypo = (fastingVal > 0 && fastingVal < 3.9) || (postMealVal > 0 && postMealVal < 3.9);
  const isHyper = (fastingVal >= 13.0) || (postMealVal >= 13.0);

  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [aiMeta, setAiMeta] = useState<any>(null);
  const [aiExpanded, setAiExpanded] = useState(true);
  const [savedRecord, setSavedRecord] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiSectionRef = useRef<HTMLDivElement>(null);

  // ---- Overview (derived from saved records, read-only) ----
  const overview = useMemo(() => {
    const valuesOf = (r: any) => {
      const vals: number[] = [];
      const f = r.fastingLevel ?? (r.category === 'fasting' ? r.level : null);
      const p = r.postMealLevel ?? (r.category === 'post-meal' ? r.level : null);
      if (f != null && f > 0) vals.push(f);
      if (p != null && p > 0) vals.push(p);
      return vals;
    };
    const sorted = [...(records || [])].sort((a: any, b: any) => {
      const d = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (d !== 0) return d;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    const latest = sorted[0];
    const latestValue = latest ? (latest.postMealLevel || latest.fastingLevel || latest.level || null) : null;
    const latestWhen = latest ? new Date(latest.createdAt || latest.date) : null;

    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const week = sorted.filter((r: any) => new Date(r.date).getTime() >= cutoff).flatMap(valuesOf);
    const tir = week.length ? Math.round((week.filter(v => v >= 3.9 && v <= 10).length / week.length) * 100) : null;
    const avg = week.length ? (week.reduce((s, v) => s + v, 0) / week.length) : null;

    const todayStr = new Date().toDateString();
    const todayCount = sorted.filter((r: any) => new Date(r.date).toDateString() === todayStr).reduce((n, r) => n + valuesOf(r).length, 0);
    return { latestValue, latestWhen, tir, avg, todayCount };
  }, [records]);

  const fetchAIRecommendation = async (force: boolean = true) => {
    setAiLoading(true);
    setAiRecommendation(null);
    setAiError(null);
    try {
      const { data } = await api.post('/ai/nutrition', { language, forceRefresh: force });
      if (data.success) {
        setAiRecommendation(data.recommendation);
        setAiMeta(data.meta);
        setAiExpanded(true);
        // Scroll to AI section
        setTimeout(() => {
          aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      } else {
        setAiError(data.message || t.error);
      }
    } catch (err: any) {
      console.error('AI error:', err);
      setAiError(err.response?.data?.message || t.error);
    } finally {
      setAiLoading(false);
    }
  };

  const fastingInvalid = isInvalidGlucose(formData.fastingLevel);
  const postMealInvalid = isInvalidGlucose(formData.postMealLevel);
  const missingBoth = submitAttempted && !formData.fastingLevel && !formData.postMealLevel;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!formData.fastingLevel && !formData.postMealLevel) {
      toast.error("Iltimos, oç qoringa yoki ovqatdan keyingi qand miqdorining kamida birini kiriting!");
      return;
    }
    if (fastingInvalid || postMealInvalid) {
      toast.error(ui.invalid);
      return;
    }

    setLoading(true);
    try {
      await addRecord({
        fastingLevel: formData.fastingLevel ? parseFloat(formData.fastingLevel) : (undefined as any),
        postMealLevel: formData.postMealLevel ? parseFloat(formData.postMealLevel) : undefined,
        notes: formData.notes,
        date: new Date(formData.date).toISOString(),
        systolicPressure: formData.systolicPressure ? parseFloat(formData.systolicPressure) : undefined,
        diastolicPressure: formData.diastolicPressure ? parseFloat(formData.diastolicPressure) : undefined,
        pulse: formData.pulse ? parseFloat(formData.pulse) : undefined,
        insulinUnits: formData.insulinUnits ? parseFloat(formData.insulinUnits) : undefined,
        carbsUnits: formData.carbsUnits ? parseFloat(formData.carbsUnits) : undefined,
        exercise: formData.exercise,
        medication: formData.medication,
      });
      toast.success(t.success);
      setSavedRecord(true);
      setSubmitAttempted(false);
      setFormData({
        fastingLevel: '',
        postMealLevel: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        systolicPressure: '',
        diastolicPressure: '',
        pulse: '',
        insulinUnits: '',
        carbsUnits: '',
        exercise: false,
        medication: false,
      });

      // Auto-fetch AI recommendation after saving
      await fetchAIRecommendation();
    } finally {
      setLoading(false);
    }
  };

  // Format AI text into styled sections
  const formatAIText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <Box key={i} sx={{ height: 6 }} />;

      // Bold headers: **text**
      if (/^\*\*(.+)\*\*$/.test(trimmed)) {
        return (
          <Typography key={i} variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mt: 2, mb: 0.75 }}>
            {trimmed.replace(/\*\*/g, '')}
          </Typography>
        );
      }
      // Inline bold
      if (trimmed.includes('**')) {
        const parts = trimmed.split(/\*\*(.*?)\*\*/g);
        return (
          <Typography key={i} variant="body2" sx={{ color: 'text.primary', mb: 0.5 }}>
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
          </Typography>
        );
      }
      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
        return (
          <Box key={i} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', mb: 0.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'ai.main', mt: 1, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.65 }}>
              {trimmed.replace(/^[-•*]\s/, '')}
            </Typography>
          </Box>
        );
      }
      // Numbered list
      if (/^\d+\./.test(trimmed)) {
        const num = trimmed.match(/^(\d+)\./)?.[1];
        return (
          <Box key={i} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', mb: 0.75 }}>
            <Box sx={{ width: 22, height: 22, borderRadius: 1.5, fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center', bgcolor: alpha(theme.palette.ai.main, 0.12), color: 'ai.main', flexShrink: 0, mt: 0.1 }}>
              {num}
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.65 }}>
              {trimmed.replace(/^\d+\.\s*/, '')}
            </Typography>
          </Box>
        );
      }
      return (
        <Typography key={i} variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 0.5 }}>
          {trimmed}
        </Typography>
      );
    });
  };

  const hasProfile = !!(user?.height && user?.weight);
  const aiColor = theme.palette.ai.main;

  const glucoseHelper = (raw: string, invalid: boolean) => {
    if (invalid) return ui.invalid;
    if (missingBoth) return ui.requireOne;
    const level = classifyGlucose(parseFloat(raw));
    if (!level) return ' ';
    return (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: theme.palette.glucose[level], fontWeight: 600 }}>
        <Box component="span" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: theme.palette.glucose[level] }} />
        {glucoseLabel(level, language)}
      </Box>
    );
  };

  const tirColor = overview.tir == null ? undefined : overview.tir >= 70 ? theme.palette.glucose.inRange : overview.tir >= 50 ? theme.palette.glucose.high : theme.palette.glucose.low;
  const avgLevel = classifyGlucose(overview.avg ?? undefined);

  return (
    <Stack spacing={3}>
      {/* Overview */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile
            label={ui.lastReading}
            value={overview.latestValue != null ? Number(overview.latestValue).toFixed(1) : '—'}
            unit={overview.latestValue != null ? t.mmol : undefined}
            icon={<WaterDropOutlinedIcon />}
            valueColor={overview.latestValue != null ? theme.palette.glucose[classifyGlucose(overview.latestValue) || 'inRange'] : undefined}
            hint={overview.latestWhen ? (
              <Typography variant="caption" color="text.secondary">
                {formatShortDate(overview.latestWhen, language)}
                {' · '}
                {glucoseLabel(classifyGlucose(overview.latestValue) || 'inRange', language)}
              </Typography>
            ) : <Typography variant="caption" color="text.secondary">{ui.noData}</Typography>}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile
            label={ui.timeInRange}
            value={overview.tir != null ? `${overview.tir}%` : '—'}
            icon={<TrackChangesRoundedIcon />}
            color="success"
            valueColor={tirColor}
            hint={
              <Box sx={{ height: 6, borderRadius: 3, bgcolor: alpha(theme.palette.text.primary, 0.08), overflow: 'hidden', width: { xs: 90, sm: 120 } }}>
                <Box sx={{ height: '100%', width: `${overview.tir ?? 0}%`, bgcolor: tirColor || 'transparent', borderRadius: 3 }} />
              </Box>
            }
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile
            label={ui.avg7}
            value={overview.avg != null ? overview.avg.toFixed(1) : '—'}
            unit={overview.avg != null ? t.mmol : undefined}
            icon={<ShowChartRoundedIcon />}
            color="secondary"
            hint={<Typography variant="caption" color="text.secondary">{avgLevel ? glucoseLabel(avgLevel, language) : ui.noData}</Typography>}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile
            label={ui.today}
            value={overview.todayCount}
            icon={<TodayRoundedIcon />}
            color="info"
            hint={<Typography variant="caption" color="text.secondary">{overview.todayCount} {ui.readings}</Typography>}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Journal Form */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
            <SectionCard title={t.addRecord} subtitle={ui.formSubtitle} icon={<AddRoundedIcon />}>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.5}>
                  {/* SOS Hypoglycemia Alert */}
                  {isHypo && (
                    <Alert severity="error" icon={<ErrorOutlineRoundedIcon fontSize="inherit" />}>
                      <AlertTitle>{t.hypoWarningTitle}</AlertTitle>
                      {t.hypoRule15}
                    </Alert>
                  )}

                  {/* Hyperglycemia Alert */}
                  {isHyper && (
                    <Alert severity="warning" icon={<WarningAmberRoundedIcon fontSize="inherit" />}>
                      <AlertTitle>{t.hyperWarningTitle}</AlertTitle>
                      {t.hyperAdvice}
                    </Alert>
                  )}

                  <TextField
                    label={t.date}
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><CalendarMonthOutlinedIcon sx={{ fontSize: 20 }} /></InputAdornment>,
                    }}
                    InputLabelProps={{ shrink: true }}
                  />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label={t.fasting}
                        type="number"
                        inputProps={{ step: 0.1, min: 0, inputMode: 'decimal' }}
                        placeholder="5.5"
                        value={formData.fastingLevel}
                        onChange={(e) => setFormData({ ...formData, fastingLevel: e.target.value })}
                        fullWidth
                        error={fastingInvalid || missingBoth}
                        helperText={glucoseHelper(formData.fastingLevel, fastingInvalid)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><WbTwilightRoundedIcon sx={{ fontSize: 20 }} /></InputAdornment>,
                          endAdornment: <InputAdornment position="end"><Typography variant="caption" color="text.secondary">{t.mmol}</Typography></InputAdornment>,
                          sx: { fontSize: '1.125rem', fontWeight: 600 },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label={t.postMeal}
                        type="number"
                        inputProps={{ step: 0.1, min: 0, inputMode: 'decimal' }}
                        placeholder="7.2"
                        value={formData.postMealLevel}
                        onChange={(e) => setFormData({ ...formData, postMealLevel: e.target.value })}
                        fullWidth
                        error={postMealInvalid || missingBoth}
                        helperText={glucoseHelper(formData.postMealLevel, postMealInvalid)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><RestaurantRoundedIcon sx={{ fontSize: 20 }} /></InputAdornment>,
                          endAdornment: <InputAdornment position="end"><Typography variant="caption" color="text.secondary">{t.mmol}</Typography></InputAdornment>,
                          sx: { fontSize: '1.125rem', fontWeight: 600 },
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Tools Row: XE Calculator & Extra Params */}
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      startIcon={<CalculateOutlinedIcon fontSize="small" />}
                      onClick={() => setIsXeModalOpen(true)}
                      sx={{ borderColor: 'divider' }}
                    >
                      {t.xeCalculator}
                    </Button>
                    <Button
                      size="small"
                      variant={showExtraParams ? 'contained' : 'outlined'}
                      color={showExtraParams ? 'primary' : 'inherit'}
                      startIcon={<TuneRoundedIcon fontSize="small" />}
                      endIcon={showExtraParams ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      onClick={() => setShowExtraParams(!showExtraParams)}
                      sx={{ borderColor: 'divider' }}
                    >
                      {t.extraParams}
                    </Button>
                  </Stack>

                  {/* Collapsible Extra Health Metrics */}
                  <Collapse in={showExtraParams} unmountOnExit>
                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'surfaceMuted', border: 1, borderColor: 'divider' }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <TextField
                            label={t.systolicPressure}
                            type="number"
                            size="small"
                            placeholder="120"
                            value={formData.systolicPressure}
                            onChange={(e) => setFormData({ ...formData, systolicPressure: e.target.value })}
                            fullWidth
                            InputProps={{ startAdornment: <InputAdornment position="start"><SpeedRoundedIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <TextField
                            label={t.diastolicPressure}
                            type="number"
                            size="small"
                            placeholder="80"
                            value={formData.diastolicPressure}
                            onChange={(e) => setFormData({ ...formData, diastolicPressure: e.target.value })}
                            fullWidth
                            InputProps={{ startAdornment: <InputAdornment position="start"><SpeedRoundedIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            label={t.pulse}
                            type="number"
                            size="small"
                            placeholder="72"
                            value={formData.pulse}
                            onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                            fullWidth
                            InputProps={{ startAdornment: <InputAdornment position="start"><FavoriteBorderRoundedIcon sx={{ fontSize: 18, color: 'error.main' }} /></InputAdornment> }}
                          />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <TextField
                            label={t.carbsUnitsXE}
                            type="number"
                            size="small"
                            inputProps={{ step: 0.1 }}
                            placeholder="2.0"
                            value={formData.carbsUnits}
                            onChange={(e) => setFormData({ ...formData, carbsUnits: e.target.value })}
                            fullWidth
                            InputProps={{ startAdornment: <InputAdornment position="start"><RestaurantRoundedIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
                          />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <TextField
                            label={t.insulinDose}
                            type="number"
                            size="small"
                            inputProps={{ step: 0.5 }}
                            placeholder="4.0"
                            value={formData.insulinUnits}
                            onChange={(e) => setFormData({ ...formData, insulinUnits: e.target.value })}
                            fullWidth
                            InputProps={{ startAdornment: <InputAdornment position="start"><MedicationOutlinedIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.exercise}
                                onChange={(e) => setFormData({ ...formData, exercise: e.target.checked })}
                                color="primary"
                              />
                            }
                            label={<Typography variant="body2">{t.exerciseDone}</Typography>}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>

                  <TextField
                    label={t.notes}
                    placeholder={t.notes + '...'}
                    multiline
                    minRows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    fullWidth
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={!loading && <CheckRoundedIcon />}
                    sx={{ alignSelf: { sm: 'flex-end' }, minWidth: { sm: 200 } }}
                  >
                    {loading ? <CircularProgress size={20} color="inherit" /> : t.save}
                  </Button>
                </Stack>
              </Box>
            </SectionCard>

            {/* AI Recommendation Section (shown after saving or when triggered) */}
            {(aiLoading || aiRecommendation || aiError) && (
              <Box ref={aiSectionRef} sx={{ scrollMarginTop: 88 }}>
                {/* Loading state */}
                {aiLoading && (
                  <Card sx={{ p: 2.5, borderColor: alpha(aiColor, 0.3) }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <IconTile color="ai"><AutoAwesomeIcon /></IconTile>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: 'ai.main' }}>{t.aiAnalyzing}</Typography>
                        <Typography variant="caption" color="text.secondary">{t.aiBasedOnDetails}</Typography>
                      </Box>
                      <CircularProgress size={22} sx={{ color: aiColor }} />
                    </Stack>
                    <Skeleton height={16} width="90%" />
                    <Skeleton height={16} width="75%" />
                    <Skeleton height={16} width="82%" />
                  </Card>
                )}

                {/* Error state */}
                {aiError && !aiLoading && (
                  <Alert
                    severity="error"
                    action={
                      <Button color="inherit" size="small" startIcon={<RefreshRoundedIcon />} onClick={() => fetchAIRecommendation()}>
                        {t.aiRetry}
                      </Button>
                    }
                  >
                    {aiError}
                  </Alert>
                )}

                {/* AI Result */}
                {aiRecommendation && !aiLoading && (
                  <Card sx={{ borderColor: alpha(aiColor, 0.3), overflow: 'hidden' }}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ px: 2.5, py: 2, bgcolor: alpha(aiColor, theme.palette.mode === 'dark' ? 0.12 : 0.06), borderBottom: 1, borderColor: alpha(aiColor, 0.2) }}
                    >
                      <IconTile color="ai"><AutoAwesomeIcon /></IconTile>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2">{t.aiPersonalizedAdvice}</Typography>
                        <Typography variant="caption" color="text.secondary">Gemini 2.5 Flash</Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', sm: 'flex' } }}>
                        {aiMeta?.bmi && (
                          <Chip size="small" variant="outlined" label={`BMI ${aiMeta.bmi}`} icon={<LocalFireDepartmentIcon sx={{ fontSize: '15px !important' }} />} />
                        )}
                        {aiMeta?.age && (
                          <Chip size="small" variant="outlined" label={`${aiMeta.age} ${t.aiYearsOld}`} />
                        )}
                      </Stack>
                      <IconButton size="small" onClick={() => fetchAIRecommendation()} disabled={aiLoading} aria-label={t.aiRefresh}>
                        <RefreshRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setAiExpanded(!aiExpanded)}>
                        {aiExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      </IconButton>
                    </Stack>

                    <Collapse in={aiExpanded}>
                      <Box sx={{ p: 2.5 }}>
                        {formatAIText(aiRecommendation)}
                      </Box>
                    </Collapse>
                  </Card>
                )}
              </Box>
            )}
          </Stack>
        </Grid>

        {/* Info & Recommendations */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3}>
            {/* Admin Recommendation Card */}
            {user?.adminNotes && (
              <SectionCard title={t.adminRecommendation} icon={<AssignmentIndOutlinedIcon />} iconColor="secondary">
                <Typography variant="body2" sx={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {user.adminNotes}
                </Typography>
              </SectionCard>
            )}

            {/* Quick AI Button (if no recommendation yet) */}
            {!aiRecommendation && !aiLoading && !aiError && hasProfile && (
              <Card sx={{ p: 2.5, borderColor: alpha(aiColor, 0.25), background: `linear-gradient(160deg, ${alpha(aiColor, 0.08)}, ${alpha(aiColor, 0.02)})` }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <IconTile color="ai"><AutoAwesomeIcon /></IconTile>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2">{t.aiNutritionAdviceTitle}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{t.aiBasedOnDetails}</Typography>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => fetchAIRecommendation()}
                      sx={{ mt: 1.5, bgcolor: aiColor, color: theme.palette.ai.contrastText, '&:hover': { bgcolor: theme.palette.ai.dark } }}
                    >
                      {t.detailedAdvice}
                    </Button>
                  </Box>
                </Stack>
              </Card>
            )}

            {/* Nudge to complete profile (if missing height/weight) */}
            {!hasProfile && (
              <Card sx={{ p: 2.5, borderStyle: 'dashed', boxShadow: 'none' }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <IconTile color="ai"><AutoAwesomeIcon /></IconTile>
                  <Box>
                    <Typography variant="subtitle2">{t.aiNutritionAdviceTitle}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, mb: 1.5 }}>{t.aiBasedOnDetails}</Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                      <Button size="small" variant="outlined" onClick={() => navigate('/complete-profile')}>
                        {t.editProfile}
                      </Button>
                      {!aiRecommendation && !aiLoading && (
                        <Button size="small" color="inherit" onClick={() => fetchAIRecommendation()}>
                          {t.detailedAdvice}
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Card>
            )}

            {/* Target ranges */}
            <SectionCard title={ui.targetRanges} subtitle={ui.targetRangesSub} icon={<TrackChangesRoundedIcon />} iconColor="success">
              <Stack spacing={1}>
                {[...GLUCOSE_BANDS].reverse().map(b => (
                  <Stack
                    key={b.level}
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{
                      px: 1.5, py: 1, borderRadius: 2,
                      bgcolor: b.level === 'inRange' ? alpha(theme.palette.glucose.inRange, 0.08) : 'transparent',
                      border: 1,
                      borderColor: b.level === 'inRange' ? alpha(theme.palette.glucose.inRange, 0.3) : 'divider',
                    }}
                  >
                    <Box sx={{ width: 4, alignSelf: 'stretch', borderRadius: 2, bgcolor: theme.palette.glucose[b.level] }} />
                    <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: b.level === 'inRange' ? 600 : 500 }}>
                      {glucoseLabel(b.level, language)}
                      {b.level === 'inRange' && <Typography component="span" variant="caption" sx={{ ml: 1, color: 'glucose.inRange', fontWeight: 600 }}>{ui.target}</Typography>}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: theme.palette.glucose[b.level] }}>
                      {b.range}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap', rowGap: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>{t.sugarNorms}</Typography>
                <Chip size="small" variant="outlined" label={`${t.fasting}: 3.9–5.5`} />
                <Chip size="small" variant="outlined" label={`${t.postMeal}: < 7.8`} />
              </Stack>
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>

      {/* XE Calculator Dialog */}
      <Dialog
        open={isXeModalOpen}
        onClose={() => setIsXeModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconTile size={36}><CalculateOutlinedIcon /></IconTile>
          {t.xeCalculator}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {/* Quick Presets */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 1, display: 'block' }}>
                Tezkor tanlov:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {[
                  { name: 'Oq non', carbs: 50 },
                  { name: 'Javdar non', carbs: 40 },
                  { name: 'Guruch', carbs: 28 },
                  { name: 'Kartoshka', carbs: 16 },
                  { name: 'Makaron', carbs: 30 },
                  { name: 'Olma', carbs: 14 },
                ].map((preset) => (
                  <Chip
                    key={preset.name}
                    label={`${preset.name} · ${preset.carbs}%`}
                    size="small"
                    onClick={() => setXeCarbs100(String(preset.carbs))}
                    clickable
                    variant={xeCarbs100 === String(preset.carbs) ? 'filled' : 'outlined'}
                    color={xeCarbs100 === String(preset.carbs) ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </Box>

            <TextField label={t.foodCarbs100g} type="number" size="small" value={xeCarbs100} onChange={(e) => setXeCarbs100(e.target.value)} fullWidth />
            <TextField label={t.foodWeightGram} type="number" size="small" value={xeWeight} onChange={(e) => setXeWeight(e.target.value)} fullWidth />
            <TextField
              label="Insulin koeffitsienti (1 XE ga doza)"
              type="number"
              size="small"
              inputProps={{ step: 0.1 }}
              value={xeRatio}
              onChange={(e) => setXeRatio(e.target.value)}
              fullWidth
            />

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.08), textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Non birligi (XE)</Typography>
                  <Typography variant="h5" sx={{ color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}>{parsedXE} XE</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.secondary.main, 0.08), textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Tavsiya insulin</Typography>
                  <Typography variant="h5" sx={{ color: 'secondary.main', fontVariantNumeric: 'tabular-nums' }}>~{estimatedInsulin} birlik</Typography>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsXeModalOpen(false)} color="inherit">
            {t.cancel}
          </Button>
          <Button onClick={applyXeToForm} variant="contained">
            {t.applyToForm}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
