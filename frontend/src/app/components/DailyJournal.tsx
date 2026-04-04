import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/translations';
import { toast } from 'sonner';
import { productAPI } from '../utils/api';

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
  CircularProgress
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

export function DailyJournal() {
  const { language, addRecord } = useApp();
  const { user } = useAuth();
  const theme = useTheme();
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fastingLevel: '',
    postMealLevel: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fastingLevel) {
      toast.error(language === 'uz' ? 'Och qoringa qand miqdorini kiriting' : 'Введите уровень натощак');
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
      setFormData({
        fastingLevel: '',
        postMealLevel: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={3} sx={{ maxWidth: 1000, mx: 'auto' }}>
      {/* Journal Form */}
      <Grid size={{ xs: 12, md: 7 }}>
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
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>&lt; 7.8 <Typography component="span" variant="caption" sx={{ fontSize: 9 }}>mmol/l</Typography></Typography>
                    </Paper>
                  </Stack>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Recommendations Card */}
          {recommendedProducts.length > 0 && (
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <StarIcon sx={{ color: '#fbbf24', fontSize: 18 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {language === 'uz' ? 'Tavsiya etilganlar' : 'Рекомендуемые'}
                  </Typography>
                </Box>
                
                <Stack spacing={1}>
                  {recommendedProducts.map((p) => (
                    <Paper
                      key={p._id}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        cursor: 'default',
                        bgcolor: alpha(theme.palette.success.main, 0.02)
                      }}
                    >
                      <Typography variant="h6" sx={{ fontSize: 20 }}>{p.emoji}</Typography>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, lineHeight: 1.2, display: 'block', textTransform: 'lowercase', '&:first-letter': { textTransform: 'uppercase' } }}>
                          {p.name[language] || p.name['uz']}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: 8, fontWeight: 800, color: 'success.main', textTransform: 'uppercase' }}>GI: {p.gi}</Typography>
                      </Box>
                      <ChevronRightIcon sx={{ color: 'divider', fontSize: 14 }} />
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
}