import React, { useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { translations } from '../utils/translations';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// MUI Components
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tab,
  Tabs,
  alpha,
  useTheme
} from '@mui/material';

// MUI Icons
import TimelineIcon from '@mui/icons-material/Timeline';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface StatisticsProps {
  customRecords?: any[];
  customLanguage?: string;
}

export function Statistics({ customRecords, customLanguage }: StatisticsProps = {}) {
  const { language: appLanguage, records: appRecords } = useApp();
  const language = customLanguage || appLanguage;
  const records = customRecords || appRecords;
  const theme = useTheme();
  const t = translations[language];
  const [timeRange, setTimeRange] = useState('7');

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

    const avgFasting = (recentRecords.reduce((sum, r) => sum + (r.fastingLevel ?? r.level ?? 0), 0) / recentRecords.length).toFixed(1);
    const postMealRecords = recentRecords.filter(r => r.postMealLevel != null || (r.category === 'post-meal' && r.level != null));
    const avgPostMeal = postMealRecords.length > 0
      ? (postMealRecords.reduce((sum, r) => sum + (r.postMealLevel ?? (r.category === 'post-meal' ? r.level : 0) ?? 0), 0) / postMealRecords.length).toFixed(1)
      : '0.0';

    const avgDiff = (parseFloat(avgPostMeal) - parseFloat(avgFasting)).toFixed(1);

    const chartData = recentRecords.map(record => {
      const parsedDate = new Date(record.date);
      const createdDate = record.createdAt ? new Date(record.createdAt) : parsedDate;
      const displayDate = parsedDate.toLocaleDateString(language === 'uz' ? 'uz' : 'ru', { month: 'short', day: 'numeric' });
      const displayTime = record.createdAt ? createdDate.toLocaleTimeString(language === 'uz' ? 'uz' : 'ru', { hour: '2-digit', minute: '2-digit' }) : '';
      const fullLabel = displayTime ? `${displayDate} • ${displayTime}` : displayDate;
      
      const fastingVal = record.category === 'fasting' ? (record.level ?? null) : (record.fastingLevel ?? null);
      const postMealVal = record.category === 'post-meal' ? (record.level ?? null) : (record.postMealLevel ?? null);
      
      return {
        date: fullLabel,
        fasting: fastingVal !== null && fastingVal > 0 ? fastingVal : null,
        postMeal: postMealVal !== null && postMealVal > 0 ? postMealVal : null,
      };
    });

    return { avgFasting, avgPostMeal, avgDiff, chartData };
  }, [records, language, timeRange]);

  const hba1c = useMemo(() => {
    if (records.length === 0) return null;
    // Oxirgi 90 kun uchun o'rtacha qon shakari (mmol/L) -> HbA1c (%)
    const now = new Date();
    const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const last90 = records.filter(r => new Date(r.date) >= cutoff);
    if (last90.length === 0) return null;
    const avgGlucose = last90.reduce((s, r) => s + (r.fastingLevel ?? r.level ?? 0), 0) / last90.length;
    // IFCC formula: HbA1c (%) = (avgGlucose mmol/L + 2.59) / 1.59
    const hba1cVal = ((avgGlucose + 2.59) / 1.59).toFixed(1);
    const val = parseFloat(hba1cVal);
    let label = '';
    let color = '';
    if (val < 5.7) { label = 'Normal'; color = '#10b981'; }
    else if (val < 6.5) { label = 'Prediabet'; color = '#f59e0b'; }
    else { label = 'Diabet'; color = '#ef4444'; }
    return { value: hba1cVal, label, color, records: last90.length };
  }, [records]);

  if (!stats) {
    return (
      <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
        <TimelineIcon sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 800 }}>{t.noRecords}</Typography>
      </Box>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: alpha(color, 0.08), color: color, borderRadius: 1.5 }}>
            <Icon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>{value}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: 9 }}>mmol/l</Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ spaceY: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Tabs value={timeRange} onChange={(e, v) => setTimeRange(v)} sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5, fontWeight: 800, textTransform: 'none' } }}>
          <Tab value="1" label={language === 'uz' ? 'Bugun' : 'Today'} />
          <Tab value="7" label={language === 'uz' ? 'Haftalik' : 'Weekly'} />
          <Tab value="30" label={language === 'uz' ? 'Oylik' : 'Monthly'} />
          <Tab value="365" label={language === 'uz' ? 'Yillik' : 'Yearly'} />
          <Tab value="all" label={language === 'uz' ? 'Barchasi' : 'All'} />
        </Tabs>
      </Box>
      
      {/* Overview Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard icon={SpeedIcon} label={t.averageFasting} value={stats.avgFasting} color={theme.palette.primary.main} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard icon={TimelineIcon} label={t.averagePostMeal} value={stats.avgPostMeal} color={theme.palette.secondary.main} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard icon={TrendingUpIcon} label={t.averageDifference} value={stats.avgDiff} color="#10b981" />
        </Grid>
      </Grid>

      {/* HbA1c Kalkulyator */}
      {hba1c && (
        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 3 }}>
          <Box sx={{ p: 2.5, px: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              🩸 HbA1c Kalkulyator (So'nggi 90 kun)
            </Typography>
          </Box>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, sm: 3 }}>
                {/* Doira indikator */}
                <Box sx={{
                  width: 100, height: 100, borderRadius: '50%', mx: { xs: 'auto', sm: 0 },
                  background: `conic-gradient(${hba1c.color} ${(parseFloat(hba1c.value) / 12) * 360}deg, ${alpha(hba1c.color, 0.1)} 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  <Box sx={{
                    width: 76, height: 76, borderRadius: '50%',
                    bgcolor: 'background.paper',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Typography variant="h5" fontWeight={900} sx={{ color: hba1c.color, lineHeight: 1 }}>{hba1c.value}%</Typography>
                    <Typography variant="caption" fontWeight={800} sx={{ color: hba1c.color, fontSize: 9 }}>HbA1c</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 9 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: hba1c.color }} />
                    <Typography variant="subtitle1" fontWeight={900} sx={{ color: hba1c.color }}>{hba1c.label}</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      ({hba1c.records} yozuv asosida)
                    </Typography>
                  </Stack>
                  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {[
                      { label: '< 5.7%', color: '#10b981', desc: 'Normal' },
                      { label: '5.7–6.4%', color: '#f59e0b', desc: 'Prediabet' },
                      { label: '≥ 6.5%', color: '#ef4444', desc: 'Diabet' },
                    ].map(r => (
                      <Chip
                        key={r.label}
                        label={`${r.label} — ${r.desc}`}
                        size="small"
                        sx={{
                          bgcolor: alpha(r.color, 0.1),
                          color: r.color,
                          fontWeight: 800,
                          fontSize: 10,
                          border: `1px solid ${alpha(r.color, 0.2)}`,
                        }}
                      />
                    ))}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    ⚠️ Bu taxminiy ko'rsatkich. Aniq diagnoz uchun laboratoriya tekshiruvi zarur.
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}


      {/* Chart Section */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 4 }}>
        <Box sx={{ p: 2.5, px: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
          <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            <TimelineIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} /> {language === 'uz' ? 'Grafik ko\'rsatkichlar' : 'Chart Statistics'}
          </Typography>
        </Box>
        <CardContent sx={{ p: 4, pt: 4 }}>
          <Grid container spacing={4}>
            {/* Fasting (Och qoringa) Chart */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', display: 'block', mb: 2, letterSpacing: 1.5 }}>
                 {t.fasting} ({language === 'uz' ? 'Real vaqt grafik' : 'Real-time chart'})
              </Typography>
              <Box sx={{ height: 260, w: '100%' }}>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={stats.chartData.filter(d => d.fasting != null)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: theme.palette.text.secondary }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: theme.palette.text.secondary }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: 8, border: `none`, backgroundColor: theme.palette.background.paper, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} 
                      labelStyle={{ fontWeight: 900, marginBottom: 8, fontSize: 11 }}
                    />
                    <Area type="monotone" dataKey="fasting" name={t.fasting} stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.1} strokeWidth={3} connectNulls={true} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Grid>

            {/* Post Meal (To'q qoringa) Chart */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Typography variant="overline" sx={{ fontWeight: 800, color: 'secondary.main', display: 'block', mb: 2, letterSpacing: 1.5 }}>
                 {t.postMeal} ({language === 'uz' ? 'Real vaqt grafik' : 'Real-time chart'})
              </Typography>
              <Box sx={{ height: 260, w: '100%' }}>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={stats.chartData.filter(d => d.postMeal != null)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: theme.palette.text.secondary }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: theme.palette.text.secondary }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: 8, border: `none`, backgroundColor: theme.palette.background.paper, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} 
                      labelStyle={{ fontWeight: 900, marginBottom: 8, fontSize: 11 }}
                    />
                    <Area type="monotone" dataKey="postMeal" name={t.postMeal} stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} fillOpacity={0.1} strokeWidth={3} connectNulls={true} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, px: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
          <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            <AssignmentIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} /> {t.allRecords}
          </Typography>
        </Box>
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: 10, letterSpacing: 1, color: 'text.secondary', bgcolor: 'background.paper' }}>{t.date}</TableCell>
                <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: 10, letterSpacing: 1, color: 'text.secondary', bgcolor: 'background.paper' }}>{t.fasting}</TableCell>
                <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: 10, letterSpacing: 1, color: 'text.secondary', bgcolor: 'background.paper' }}>{t.postMeal}</TableCell>
                <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: 10, letterSpacing: 1, color: 'text.secondary', bgcolor: 'background.paper' }}>{t.notes}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...records].sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                if (dateB !== dateA) return dateB - dateA;
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
              }).map((record) => (
                <TableRow key={record._id || record.id} sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.01) } }}>
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{new Date(record.date).toLocaleDateString(language === 'uz' ? 'uz' : 'ru')}</Typography>
                    {record.createdAt && (
                       <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                          {new Date(record.createdAt).toLocaleTimeString(language === 'uz' ? 'uz' : 'ru', { hour: '2-digit', minute: '2-digit' })}
                       </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900, color: 'primary.main' }}>
                    {(record.fastingLevel ?? (record.category === 'fasting' ? record.level : 0) ?? 0).toFixed(1)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900, color: 'secondary.main' }}>
                    {(record.postMealLevel ?? (record.category === 'post-meal' ? record.level : null)) != null ? (record.postMealLevel ?? record.level ?? 0).toFixed(1) : '—'}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                    {record.notes || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
