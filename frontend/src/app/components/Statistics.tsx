import React, { useMemo } from 'react';
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

export function Statistics() {
  const { language, records } = useApp();
  const theme = useTheme();
  const t = translations[language];

  const stats = useMemo(() => {
    if (records.length === 0) return null;
    const recentRecords = [...records].sort((a, b) => {
      const timeDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (timeDiff !== 0) return timeDiff;
      const createA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return createA - createB;
    }).slice(-14);

    const avgFasting = (recentRecords.reduce((sum, r) => sum + r.fastingLevel, 0) / recentRecords.length).toFixed(1);
    const postMealRecords = recentRecords.filter(r => r.postMealLevel != null);
    const avgPostMeal = postMealRecords.length > 0
      ? (postMealRecords.reduce((sum, r) => sum + (r.postMealLevel ?? 0), 0) / postMealRecords.length).toFixed(1)
      : '0.0';

    const avgDiff = (parseFloat(avgPostMeal) - parseFloat(avgFasting)).toFixed(1);

    const chartData = recentRecords.map(record => ({
      date: new Date(record.date).toLocaleDateString(language === 'uz' ? 'uz' : 'ru', { month: 'short', day: 'numeric' }),
      fasting: record.fastingLevel,
      postMeal: record.postMealLevel || null,
    }));

    return { avgFasting, avgPostMeal, avgDiff, chartData };
  }, [records, language]);

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
      {/* Overview Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
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

      {/* Chart Section */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 4 }}>
        <Box sx={{ p: 2.5, px: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
          <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            <TimelineIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} /> {t.last14Days}
          </Typography>
        </Box>
        <CardContent sx={{ p: 4, pt: 6 }}>
          <Box sx={{ h: 300, w: '100%' }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: theme.palette.text.secondary }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: theme.palette.text.secondary }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 4, 
                    border: `1px solid ${theme.palette.divider}`, 
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
                  }} 
                  labelStyle={{ fontWeight: 900, marginBottom: 8, fontSize: 11 }}
                />
                <Area type="monotone" dataKey="fasting" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.05} strokeWidth={2.5} connectNulls={true} />
                <Area type="monotone" dataKey="postMeal" stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} fillOpacity={0.05} strokeWidth={2.5} connectNulls={true} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
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
              {[...records].reverse().map((record) => (
                <TableRow key={record._id || record.id} sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.01) } }}>
                  <TableCell sx={{ fontWeight: 700, py: 1.5 }}>
                    {new Date(record.date).toLocaleDateString(language === 'uz' ? 'uz' : 'ru')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900, color: 'primary.main' }}>
                    {record.fastingLevel.toFixed(1)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900, color: 'secondary.main' }}>
                    {record.postMealLevel != null ? record.postMealLevel.toFixed(1) : '—'}
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
