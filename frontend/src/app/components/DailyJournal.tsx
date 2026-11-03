import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/translations';
import { toast } from 'sonner';

import api from '../utils/api';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

// MUI Components
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Avatar,
  Chip,
  Paper,
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
  AlertTitle
} from '@mui/material';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CoffeeIcon from '@mui/icons-material/Coffee';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import NotesIcon from '@mui/icons-material/Notes';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CalculateIcon from '@mui/icons-material/Calculate';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import MedicationIcon from '@mui/icons-material/Medication';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SpeedIcon from '@mui/icons-material/Speed';
import TuneIcon from '@mui/icons-material/Tune';

export function DailyJournal() {
  const { language, addRecord } = useApp();
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [recommendedProducts] = useState<any[]>([]);
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
    toast.success('XE va insulin shaklga kiritildi!');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fastingLevel && !formData.postMealLevel) {
      toast.error("Iltimos, och qoringa yoki ovqatdan keyingi qand miqdorining kamida birini kiriting!");
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
          <Typography key={i} variant="caption" sx={{
            fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5,
            color: 'primary.main', display: 'block', mt: 2, mb: 0.5
          }}>
            {trimmed.replace(/\*\*/g, '')}
          </Typography>
        );
      }
      // Inline bold
      if (trimmed.includes('**')) {
        const parts = trimmed.split(/\*\*(.*?)\*\*/g);
        return (
          <Typography key={i} variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
          </Typography>
        );
      }
      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
        return (
          <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 0.5 }}>
            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'primary.main', mt: 0.8, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.6 }}>
              {trimmed.replace(/^[-•*]\s/, '')}
            </Typography>
          </Box>
        );
      }
      // Numbered list
      if (/^\d+\./.test(trimmed)) {
        const num = trimmed.match(/^(\d+)\./)?.[1];
        return (
          <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 0.5 }}>
            <Avatar sx={{ width: 20, height: 20, fontSize: 10, fontWeight: 900, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', flexShrink: 0, mt: 0.3 }}>
              {num}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.6 }}>
              {trimmed.replace(/^\d+\.\s*/, '')}
            </Typography>
          </Box>
        );
      }
      return (
        <Typography key={i} variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.8, mb: 0.5 }}>
          {trimmed}
        </Typography>
      );
    });
  };

  const hasProfile = !!(user?.height && user?.weight);

  return (
    <Grid container spacing={3} sx={{ maxWidth: 1000, mx: 'auto' }}>
      {/* Journal Form */}
      <Grid size={{ xs: 12, md: 7 }}>
        <Stack spacing={3}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    color: 'primary.main',
                    width: 44,
                    height: 44,
                    borderRadius: 1.5
                  }}
                >
                  <AddIcon fontSize="small" />
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{t.addRecord}</Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={3}>
                  {/* SOS Hypoglycemia Alert */}
                  {isHypo && (
                    <Alert 
                      severity="error" 
                      icon={<WarningAmberIcon fontSize="inherit" />}
                      sx={{ 
                        borderRadius: 2, 
                        border: '1px solid #ef4444', 
                        bgcolor: alpha('#ef4444', 0.1)
                      }}
                    >
                      <AlertTitle sx={{ fontWeight: 800 }}>{t.hypoWarningTitle}</AlertTitle>
                      {t.hypoRule15}
                    </Alert>
                  )}

                  {/* Hyperglycemia Alert */}
                  {isHyper && (
                    <Alert 
                      severity="warning" 
                      icon={<WarningAmberIcon fontSize="inherit" />}
                      sx={{ 
                        borderRadius: 2, 
                        border: '1px solid #f59e0b',
                        bgcolor: alpha('#f59e0b', 0.1)
                      }}
                    >
                      <AlertTitle sx={{ fontWeight: 800 }}>{t.hyperWarningTitle}</AlertTitle>
                      {t.hyperAdvice}
                    </Alert>
                  )}

                  <TextField
                    label={t.date}
                    type="date"
                    size="small"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: <CalendarMonthIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />,
                    }}
                    InputLabelProps={{ shrink: true }}
                  />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        label={`${t.fasting} (mmol/l)`}
                        type="number"
                        size="small"
                        inputProps={{ step: 0.1 }}
                        placeholder="5.5"
                        value={formData.fastingLevel}
                        onChange={(e) => setFormData({ ...formData, fastingLevel: e.target.value })}
                        fullWidth
                        InputProps={{
                          startAdornment: <CoffeeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        label={`${t.postMeal} (mmol/l)`}
                        type="number"
                        size="small"
                        inputProps={{ step: 0.1 }}
                        placeholder="7.2"
                        value={formData.postMealLevel}
                        onChange={(e) => setFormData({ ...formData, postMealLevel: e.target.value })}
                        fullWidth
                        InputProps={{
                          startAdornment: <RestaurantIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />,
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Tools Row: XE Calculator & Extra Params */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      startIcon={<CalculateIcon fontSize="small" />}
                      onClick={() => setIsXeModalOpen(true)}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                      {t.xeCalculator}
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      color="primary"
                      startIcon={<TuneIcon fontSize="small" />}
                      endIcon={showExtraParams ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      onClick={() => setShowExtraParams(!showExtraParams)}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                      {t.extraParams}
                    </Button>
                  </Box>

                  {/* Collapsible Extra Health Metrics */}
                  <Collapse in={showExtraParams}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                      <Stack spacing={2}>
                        <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary' }}>
                          {t.extraParams}
                        </Typography>

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
                              InputProps={{
                                startAdornment: <SpeedIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                              }}
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
                              InputProps={{
                                startAdornment: <SpeedIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                              }}
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
                              InputProps={{
                                startAdornment: <FavoriteIcon sx={{ mr: 1, color: 'error.main', fontSize: 18 }} />
                              }}
                            />
                          </Grid>
                        </Grid>

                        <Grid container spacing={2}>
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
                              InputProps={{
                                startAdornment: <RestaurantIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                              }}
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
                              InputProps={{
                                startAdornment: <MedicationIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                              }}
                            />
                          </Grid>
                        </Grid>

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.exercise}
                              onChange={(e) => setFormData({ ...formData, exercise: e.target.checked })}
                              color="primary"
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              🏃‍♂️ {t.exerciseDone}
                            </Typography>
                          }
                        />
                      </Stack>
                    </Paper>
                  </Collapse>

                  <TextField
                    label={t.notes}
                    placeholder={t.notes + '...'}
                    size="small"
                    multiline
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    fullWidth
                    InputProps={{
                      startAdornment: <NotesIcon sx={{ mr: 1, mt: 0.5, color: 'text.secondary', alignSelf: 'flex-start', fontSize: 18 }} />,
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      height: 48,
                      borderRadius: 1.5,
                      fontWeight: 800,
                      boxShadow: 'none',
                      '&:hover': { boxShadow: 'none' }
                    }}
                  >
                    {loading ? <CircularProgress size={20} color="inherit" /> : t.save}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* AI Recommendation Section (shown after saving or when triggered) */}
          {(aiLoading || aiRecommendation || savedRecord || aiError) && (
            <Box ref={aiSectionRef} sx={{ mb: 3 }}>
              {/* Loading state */}
              {aiLoading && (
                <Card elevation={0} sx={{
                  border: `1px solid ${alpha('#8b5cf6', 0.3)}`,
                  background: `linear-gradient(135deg, ${alpha('#8b5cf6', 0.03)}, ${alpha('#6366f1', 0.05)})`
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: '#8b5cf6', width: 40, height: 40, borderRadius: 1.5 }}>
                        <AutoAwesomeIcon fontSize="small" />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: '#8b5cf6', display: 'block' }}>
                          {t.aiAnalyzing}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          {t.aiBasedOnDetails}
                        </Typography>
                      </Box>
                      <CircularProgress size={24} sx={{ color: '#8b5cf6' }} />
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Error state */}
              {aiError && !aiLoading && (
                <Card elevation={0} sx={{
                  p: 3,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  bgcolor: alpha(theme.palette.error.main, 0.02),
                  borderRadius: 1.5,
                  mb: 2
                }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 700 }}>
                        {aiError}
                      </Typography>
                    </Box>
                    <Button 
                      size="small" 
                      startIcon={<RefreshIcon sx={{ fontSize: '14px !important' }} />}
                      onClick={fetchAIRecommendation}
                      sx={{ color: 'error.main', fontWeight: 800, fontSize: 10 }}
                    >
                      {t.aiRetry}
                    </Button>
                  </Stack>
                </Card>
              )}

              {/* AI Result */}
              {aiRecommendation && !aiLoading && (
                <Card elevation={0} sx={{
                  border: `1px solid ${alpha('#8b5cf6', 0.25)}`,
                  background: `linear-gradient(135deg, ${alpha('#8b5cf6', 0.02)}, ${alpha('#6366f1', 0.04)})`,
                  overflow: 'hidden'
                }}>
                  {/* Header */}
                  <Box sx={{
                    p: 2.5,
                    background: `linear-gradient(135deg, #7c3aed, #6366f1)`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40, borderRadius: 1.5 }}>
                      <AutoAwesomeIcon fontSize="small" sx={{ color: 'white' }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" sx={{
                        fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2,
                        color: 'rgba(255,255,255,0.9)', display: 'block', fontSize: 9
                      }}>
                        ✨ GEMINI 2.5 FLASH AI
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>
                        {t.aiPersonalizedAdvice}
                      </Typography>
                    </Box>

                    {/* Meta chips */}
                    <Stack direction="row" spacing={0.5}>
                      {aiMeta?.bmi && (
                        <Chip
                          size="small"
                          label={`BMI ${aiMeta.bmi}`}
                          icon={<LocalFireDepartmentIcon sx={{ fontSize: '14px !important', color: 'white !important' }} />}
                          sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 800, fontSize: 9, height: 22, '& .MuiChip-icon': { color: 'white' } }}
                        />
                      )}
                      {aiMeta?.age && (
                        <Chip
                          size="small"
                          label={`${aiMeta.age} ${t.aiYearsOld}`}
                          sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 800, fontSize: 9, height: 22 }}
                        />
                      )}
                    </Stack>

                    <IconButton
                      size="small"
                      onClick={() => setAiExpanded(!aiExpanded)}
                      sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                      {aiExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                  </Box>

                  {/* Content */}
                  <Collapse in={aiExpanded}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          startIcon={<RefreshIcon sx={{ fontSize: '14px !important' }} />}
                          onClick={fetchAIRecommendation}
                          disabled={aiLoading}
                          sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#8b5cf6' }}
                        >
                          {t.aiRefresh}
                        </Button>
                      </Box>
                      <Box sx={{ lineHeight: 1.8 }}>
                        {formatAIText(aiRecommendation)}
                      </Box>
                    </CardContent>
                  </Collapse>
                </Card>
              )}
            </Box>
          )}

          {/* Saved but no profile - nudge to complete profile (OUTSIDE hasProfile gate) */}
          {savedRecord && !aiRecommendation && !aiLoading && !hasProfile && (
            <Card elevation={0} sx={{
              border: `1px dashed ${alpha('#8b5cf6', 0.3)}`,
              background: alpha('#8b5cf6', 0.02),
              textAlign: 'center', p: 3, mb: 3
            }}>
              <AutoAwesomeIcon sx={{ color: '#8b5cf6', mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 2 }}>
                {t.aiBasedOnDetails}
              </Typography>
              <Button size="small" variant="outlined" onClick={() => navigate('/complete-profile')} sx={{ borderRadius: 1.5, fontWeight: 800, fontSize: 11, borderColor: '#8b5cf6', color: '#8b5cf6' }}>
                {t.editProfile}
              </Button>
            </Card>
          )}
        </Stack>
      </Grid>

      {/* Info & Recommendations */}
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack spacing={3}>
           {/* Admin Recommendation Card */}
           {user?.adminNotes && (
             <Card 
               elevation={0} 
               sx={{ 
                 bgcolor: alpha('#6366f1', 0.05), 
                 border: `1px solid ${alpha('#6366f1', 0.2)}`,
                 position: 'relative',
                 overflow: 'hidden'
               }}
             >
               <Box 
                 sx={{ 
                   position: 'absolute', 
                   top: -10, 
                   right: -10, 
                   opacity: 0.1, 
                   transform: 'rotate(15deg)' 
                 }}
               >
                 <AssignmentIndIcon sx={{ fontSize: 80, color: '#6366f1' }} />
               </Box>
               <CardContent sx={{ p: 3 }}>
                 <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: '#6366f1', 
                        color: 'white',
                        fontSize: 16
                      }}
                    >
                      <AssignmentIndIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: '#6366f1' }}>
                      {t.adminRecommendation}
                    </Typography>
                 </Stack>
                 <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.6, color: 'text.primary', position: 'relative', zIndex: 1 }}>
                    {user.adminNotes}
                 </Typography>
               </CardContent>
             </Card>
           )}

          {/* Norm Info Card */}
          <Card elevation={0} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02), border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <InfoIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Box sx={{ width: '100%' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 2 }}>{t.sugarNorms}</Typography>
                  <Stack spacing={1.5}>
                    <Paper elevation={0} sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>{t.fasting}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>3.9 — 5.5 <Typography component="span" variant="caption" sx={{ fontSize: 9 }}>{t.mmol}</Typography></Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>{t.postMeal}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>{'< 7.8'} <Typography component="span" variant="caption" sx={{ fontSize: 9 }}>{t.mmol}</Typography></Typography>
                    </Paper>
                  </Stack>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Nudge to complete profile (if missing height/weight) */}
          {!hasProfile && (
            <Card elevation={0} sx={{
              border: `1px dashed ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.primary.main, 0.01),
              textAlign: 'center', p: 3
            }}>
              <Box sx={{ mb: 1.5, opacity: 0.5 }}>
                <AssignmentIndIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 2 }}>
                {t.aiBasedOnDetails}
              </Typography>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => navigate('/complete-profile')}
                sx={{ borderRadius: 1.5, fontWeight: 800, fontSize: 11 }}
              >
                {t.editProfile}
              </Button>
            </Card>
          )}

          {/* Quick AI Button (if no recommendation yet) */}
          {!aiRecommendation && !aiLoading && !aiError && (
            <Card elevation={0} sx={{
              border: `1px solid ${alpha('#8b5cf6', 0.2)}`,
              background: `linear-gradient(135deg, ${alpha('#8b5cf6', 0.03)}, ${alpha('#6366f1', 0.05)})`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha('#8b5cf6', 0.15)}` }
            }}
              onClick={fetchAIRecommendation}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: alpha('#8b5cf6', 0.1), borderRadius: 2, mx: 'auto', mb: 1.5 }}>
                  <AutoAwesomeIcon sx={{ color: '#8b5cf6' }} />
                </Avatar>
                <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: '#8b5cf6', display: 'block', mb: 0.5 }}>
                  {t.aiNutritionAdviceTitle}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {t.aiBasedOnDetails}
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  disabled={aiLoading}
                  sx={{
                    mt: 2, borderRadius: 1.5, fontWeight: 800, fontSize: 11,
                    bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' }, boxShadow: 'none'
                  }}
                >
                  {t.detailedAdvice}
                </Button>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Grid>

      {/* XE Calculator Dialog */}
      <Dialog 
        open={isXeModalOpen} 
        onClose={() => setIsXeModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalculateIcon color="primary" /> {t.xeCalculator}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {/* Quick Presets */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' }}>
                Tezkor tanlov:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
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
                    label={`${preset.name} (${preset.carbs}%)`}
                    size="small"
                    onClick={() => setXeCarbs100(String(preset.carbs))}
                    clickable
                    variant={xeCarbs100 === String(preset.carbs) ? 'filled' : 'outlined'}
                    color="primary"
                  />
                ))}
              </Box>
            </Box>

            <TextField
              label={t.foodCarbs100g}
              type="number"
              size="small"
              value={xeCarbs100}
              onChange={(e) => setXeCarbs100(e.target.value)}
              fullWidth
            />
            <TextField
              label={t.foodWeightGram}
              type="number"
              size="small"
              value={xeWeight}
              onChange={(e) => setXeWeight(e.target.value)}
              fullWidth
            />
            <TextField
              label="Insulin koeffitsienti (1 XE ga doza)"
              type="number"
              size="small"
              inputProps={{ step: 0.1 }}
              value={xeRatio}
              onChange={(e) => setXeRatio(e.target.value)}
              fullWidth
            />

            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.08), borderRadius: 2 }}>
              <Grid container spacing={2} textAlign="center">
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    Non birligi (XE)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                    {parsedXE} XE
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    Tavsiya insulin
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: 'secondary.main' }}>
                    ~{estimatedInsulin} birlik
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsXeModalOpen(false)} sx={{ fontWeight: 700 }}>
            {t.cancel}
          </Button>
          <Button onClick={applyXeToForm} variant="contained" sx={{ fontWeight: 800 }}>
            {t.applyToForm}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}