import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/translations';
import { toast } from 'sonner';
import { productAPI } from '../utils/api';
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
  IconButton
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

export function DailyJournal() {
  const { language, addRecord } = useApp();
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fastingLevel: '',
    postMealLevel: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [aiMeta, setAiMeta] = useState<any>(null);
  const [aiExpanded, setAiExpanded] = useState(true);
  const [savedRecord, setSavedRecord] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadRecommended();
  }, []);

  const loadRecommended = async () => {
    try {
      const { data } = await productAPI.getAll({ category: 'all' });
      const safe = data.products
        .filter((p: any) => p.gi <= 30)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setRecommendedProducts(safe);
    } catch (err) {
      console.error('Error loading recommendations', err);
    }
  };

  const fetchAIRecommendation = async () => {
    setAiLoading(true);
    setAiRecommendation(null);
    setAiError(null);
    try {
      const { data } = await api.post('/ai/nutrition', { language });
      if (data.success) {
        setAiRecommendation(data.recommendation);
        setAiMeta(data.meta);
        setAiExpanded(true);
        // Scroll to AI section
        setTimeout(() => {
          aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      } else {
        setAiError(data.message || 'Xato yuz berdi');
      }
    } catch (err: any) {
      console.error('AI error:', err);
      setAiError(err.response?.data?.message || 'AI xizmati bilan aloqa o\'rnatib bo\'lmadi');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fastingLevel && !formData.postMealLevel) {
      toast.error(language === 'uz' ? 'Kamida bitta (och yoki to\'q qoringa) qand miqdorini kiriting' : 'Введите хотя бы один показатель сахара');
      return;
    }

    setLoading(true);
    try {
      await addRecord({
        fastingLevel: parseFloat(formData.fastingLevel),
        postMealLevel: formData.postMealLevel ? parseFloat(formData.postMealLevel) : undefined,
        notes: formData.notes,
        date: new Date(formData.date).toISOString(),
      });
      toast.success(t.success);
      setSavedRecord(true);
      setFormData({
        fastingLevel: '',
        postMealLevel: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
      });

      // Auto-fetch AI recommendation after saving
      if (user?.height && user?.weight) {
        await fetchAIRecommendation();
      }
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

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={3}>
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
                        required
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
          {(aiLoading || aiRecommendation || savedRecord || aiError) && hasProfile && (
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
                          {language === 'uz' ? 'Gemini AI tahlil qilmoqda...' : language === 'ru' ? 'Gemini AI анализирует...' : 'Gemini AI analyzing...'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          {language === 'uz' ? "Bo'y, yosh, vazn va qand ma'lumotlaringiz asosida" : language === 'ru' ? 'На основе ваших данных о росте, возрасте, весе и сахаре' : 'Based on your height, age, weight & sugar data'}
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
                      {language === 'uz' ? 'Qayta urinish' : 'Retry'}
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
                        ✨ GEMINI AI
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>
                        {language === 'uz' ? 'Shaxsiylashtirilgan ovqatlanish tavsiyasi' : language === 'ru' ? 'Персональная рекомендация питания' : 'Personalized nutrition advice'}
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
                          label={`${aiMeta.age} yosh`}
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
                          {language === 'uz' ? 'Yangilash' : language === 'ru' ? 'Обновить' : 'Refresh'}
                        </Button>
                      </Box>
                      <Box sx={{ lineHeight: 1.8 }}>
                        {formatAIText(aiRecommendation)}
                      </Box>
                    </CardContent>
                  </Collapse>
                </Card>
              )}

              {/* Saved but no profile - nudge to get AI */}
              {savedRecord && !aiRecommendation && !aiLoading && !hasProfile && (
                <Card elevation={0} sx={{
                  border: `1px dashed ${alpha('#8b5cf6', 0.3)}`,
                  background: alpha('#8b5cf6', 0.02),
                  textAlign: 'center', p: 3
                }}>
                  <AutoAwesomeIcon sx={{ color: '#8b5cf6', mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 2 }}>
                    {language === 'uz' ? "AI tavsiya uchun profilingizga bo'y va vazn kiriting" : language === 'ru' ? 'Добавьте рост и вес в профиль для AI рекомендации' : 'Add height & weight to your profile for AI advice'}
                  </Typography>
                  <Button size="small" variant="outlined" href="/complete-profile" sx={{ borderRadius: 1.5, fontWeight: 800, fontSize: 11, borderColor: '#8b5cf6', color: '#8b5cf6' }}>
                    {language === 'uz' ? 'Profilni to\'ldirish' : language === 'ru' ? 'Заполнить профиль' : 'Complete Profile'}
                  </Button>
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
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 2 }}>Qand darajasi normasi</Typography>
                  <Stack spacing={1.5}>
                    <Paper elevation={0} sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>{t.fasting}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>3.9 — 5.5 <Typography component="span" variant="caption" sx={{ fontSize: 9 }}>mmol/l</Typography></Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>{t.postMeal}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>{'< 7.8'} <Typography component="span" variant="caption" sx={{ fontSize: 9 }}>mmol/l</Typography></Typography>
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
                {language === 'uz' ? 'AI Tavsiya olish uchun bo\'y va vazn kiritishingiz kerak' : 'Add height & weight to your profile for AI advice'}
              </Typography>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => navigate('/complete-profile')}
                sx={{ borderRadius: 1.5, fontWeight: 800, fontSize: 11 }}
              >
                {language === 'uz' ? 'Profilni to\'ldirish' : 'Complete Profile'}
              </Button>
            </Card>
          )}

          {/* Quick AI Button (if profile complete and no recommendation yet) */}
          {hasProfile && !aiRecommendation && !aiLoading && !aiError && (
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
                  {language === 'uz' ? 'AI Ovqatlanish Tavsiyasi' : language === 'ru' ? 'AI Рекомендация питания' : 'AI Nutrition Advice'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {language === 'uz' ? "Bo'y, yosh, vazn asosida kaloriya hisoblash" : language === 'ru' ? 'Расчёт калорий по росту, возрасту и весу' : 'Calorie calculation based on height, age & weight'}
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
                  {language === 'uz' ? 'Tavsiya olish' : language === 'ru' ? 'Получить совет' : 'Get Advice'}
                </Button>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
}