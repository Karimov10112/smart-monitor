import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { translations } from '../utils/translations';
import { toast, Toaster } from 'sonner';
import { format } from 'date-fns';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// MUI Components
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Paper,
  IconButton,
  Avatar,
  Stack,
  Divider,
  alpha,
  useTheme,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Chip
} from '@mui/material';

// MUI Icons
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SearchIcon from '@mui/icons-material/Search';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TimelineIcon from '@mui/icons-material/Timeline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BiotechIcon from '@mui/icons-material/Biotech';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import NotificationsIcon from '@mui/icons-material/Notifications';

type TabType = 'patients' | 'patient-detail';

export default function DoctorPage() {
  const { user, logout, isAdmin } = useAuth();
  const { language } = useApp();
  const theme = useTheme();
  const t = translations[language];
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [currentTab, setCurrentTab] = useState<TabType>('patients');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [doctorNote, setDoctorNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMini, setIsMini] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const { data } = await doctorAPI.getPatients({ search });
      setPatients(data.patients || []);
    } catch {}
    finally { setLoading(false); }
  };

  const openPatient = async (patient: any) => {
    try {
      const { data } = await doctorAPI.getPatientRecords(patient._id);
      const sortedRecords = (data.records || []).sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setRecords(sortedRecords);
      setSelectedPatient(patient);
      setDoctorNote(patient.doctorNotes || '');
      setCurrentTab('patient-detail');
    } catch {}
  };

  const handleSaveNote = async () => {
    try {
      await doctorAPI.addNote(selectedPatient._id, doctorNote);
      toast.success(t.success || 'Saqlandi');
      setPatients(prev => prev.map(p => p._id === selectedPatient._id ? { ...p, doctorNotes: doctorNote } : p));
    } catch {}
  };

  const fastingRecords = records
    .filter(r => (r.fastingLevel != null) || (r.category === 'fasting' && r.level != null))
    .map(r => ({
      date: format(new Date(r.date), 'dd/MM'),
      level: r.category === 'fasting' ? r.level : r.fastingLevel,
    }));

  const postMealRecords = records
    .filter(r => (r.postMealLevel != null) || (r.category === 'post-meal' && r.level != null))
    .map(r => ({
      date: format(new Date(r.date), 'dd/MM'),
      level: r.category === 'post-meal' ? r.level : r.postMealLevel,
    }));

  if (loading && patients.length === 0) return (
    <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <CircularProgress />
    </Box>
  );

  const sidebarWidth = 280;
  const miniWidth = 88;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar - FIXED */}
      <Box
        component="nav"
        sx={{
          width: { md: isMini ? miniWidth : sidebarWidth },
          transition: theme.transitions.create('width', { duration: 300 }),
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: isMini ? miniWidth : sidebarWidth,
            height: '100vh',
            position: 'sticky',
            top: 0,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            transition: theme.transitions.create('width', { duration: 300 }),
            zIndex: theme.zIndex.drawer + 2,
          }}
        >
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: isMini ? 'center' : 'space-between' }}>
            {!isMini && (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ p: 1, bgcolor: 'secondary.main', borderRadius: 1.5, display: 'flex', color: 'white' }}>
                  <BiotechIcon />
                </Box>
                <Typography variant="overline" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: 2 }}>{t.doctorRole.toUpperCase()}</Typography>
              </Stack>
            )}
            <IconButton onClick={() => setIsMini(!isMini)} size="small" sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
              {isMini ? <MenuIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Box>
          <Divider sx={{ mx: 2, mb: 2, opacity: 0.5 }} />
          <List sx={{ px: 2, flexGrow: 1 }}>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => { setCurrentTab('patients'); setSelectedPatient(null); }}
                selected={currentTab === 'patients' || currentTab === 'patient-detail'}
                sx={{
                  borderRadius: 8,
                  py: 1.5,
                  boxShadow: theme.palette.mode === 'dark' ? '4px 4px 10px rgba(0,0,0,0.4)' : '4px 4px 12px rgba(0,0,0,0.05), -4px -4px 12px rgba(255,255,255,0.8)',
                  px: isMini ? 1.5 : 2,
                  justifyContent: isMini ? 'center' : 'flex-start',
                  color: (currentTab === 'patients' || currentTab === 'patient-detail') ? 'secondary.main' : 'text.secondary',
                  bgcolor: (currentTab === 'patients' || currentTab === 'patient-detail') ? alpha(theme.palette.secondary.main, 0.1) : theme.palette.background.paper,
                }}
              >
                <Box sx={{ minWidth: isMini ? 0 : 40 }}><PeopleAltIcon /></Box>
                {!isMini && <Typography sx={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase' }}>{t.patients}</Typography>}
              </ListItemButton>
            </ListItem>

            {isAdmin && (
              <ListItem disablePadding sx={{ mt: 2 }}>
                <ListItemButton
                  onClick={() => navigate('/admin')}
                  sx={{ borderRadius: 8, py: 1.5, bgcolor: theme.palette.background.paper, boxShadow: theme.palette.mode === 'dark' ? '4px 4px 10px rgba(0,0,0,0.4)' : '4px 4px 12px rgba(0,0,0,0.05), -4px -4px 12px rgba(255,255,255,0.8)', px: isMini ? 1.5 : 2, justifyContent: isMini ? 'center' : 'flex-start' }}
                >
                  <Box sx={{ minWidth: isMini ? 0 : 40, color: 'text.secondary' }}><AdminPanelSettingsIcon /></Box>
                  {!isMini && <Typography sx={{ fontWeight: 700, fontSize: 13, color: 'text.secondary' }}>Admin Panel</Typography>}
                </ListItemButton>
              </ListItem>
            )}
          </List>
          {/* Back to Home Button */}
          <Box sx={{ px: 2, pb: 3, mt: 'auto' }}>
            <Divider sx={{ mb: 2, opacity: 0.5 }} />
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => navigate('/')}
                sx={{
                  borderRadius: 8,
                  py: 1.5,
                  boxShadow: theme.palette.mode === 'dark' ? '4px 4px 10px rgba(0,0,0,0.4)' : '4px 4px 12px rgba(0,0,0,0.05), -4px -4px 12px rgba(255,255,255,0.8)',
                  bgcolor: theme.palette.background.paper,
                  px: isMini ? 1.5 : 2,
                  justifyContent: isMini ? 'center' : 'flex-start',
                  color: 'text.secondary',
                  '&:hover': { color: 'secondary.main', bgcolor: alpha(theme.palette.secondary.main, 0.06) },
                }}
              >
                <Box sx={{ minWidth: isMini ? 0 : 40, display: 'flex' }}>
                  <ArrowBackIcon fontSize="small" />
                </Box>
                {!isMini && <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{t.mainPage}</Typography>}
              </ListItemButton>
            </ListItem>
          </Box>
        </Paper>
      </Box>

      {/* Main Content - NO OVERLAP */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 5 },
          overflow: 'auto',
          minWidth: 0,
        }}
      >
        {/* MOBILE NAVIGATION BAR (Hidden on Desktop) */}
        <Box 
          sx={{ 
            display: { xs: 'flex', md: 'none' }, 
            overflowX: 'auto', 
            mb: 3, pb: 1, mx: -2, px: 2, 
            '&::-webkit-scrollbar': { display: 'none' },
            gap: 1
          }}
        >
           <Button
               onClick={() => { setCurrentTab('patients'); setSelectedPatient(null); }}
               variant={currentTab === 'patients' || currentTab === 'patient-detail' ? 'contained' : 'outlined'}
               startIcon={<PeopleAltIcon />}
               sx={{ 
                 borderRadius: 8, 
                 flexShrink: 0, 
                 textTransform: 'none',
                 boxShadow: currentTab === 'patients' || currentTab === 'patient-detail' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                 bgcolor: currentTab === 'patients' || currentTab === 'patient-detail' ? 'secondary.main' : alpha(theme.palette.background.paper, 0.5),
                 color: currentTab === 'patients' || currentTab === 'patient-detail' ? '#fff' : 'text.secondary',
                 fontWeight: 800,
                 px: 2,
                 border: '1px solid',
                 borderColor: currentTab === 'patients' || currentTab === 'patient-detail' ? 'transparent' : 'divider'
               }}
           >
               {t.patients}
           </Button>

           {isAdmin && (
             <Button
                 onClick={() => navigate('/admin')}
                 variant="contained"
                 startIcon={<AdminPanelSettingsIcon />}
                 sx={{ 
                   borderRadius: 8, flexShrink: 0, textTransform: 'none', 
                   bgcolor: alpha(theme.palette.background.paper, 0.5),
                   color: 'text.secondary', fontWeight: 800, px: 2,
                   border: '1px solid', borderColor: 'divider', boxShadow: 'none'
                 }}
             >
                 Admin Panel
             </Button>
           )}

           <Button
               onClick={() => navigate('/')}
               variant="contained"
               startIcon={<ArrowBackIcon />}
               sx={{ 
                 borderRadius: 8, flexShrink: 0, textTransform: 'none', 
                 bgcolor: alpha(theme.palette.background.paper, 0.5),
                 color: 'text.secondary', fontWeight: 800, px: 2,
                 border: '1px solid', borderColor: 'divider', boxShadow: 'none'
               }}
           >
               {t.mainPage}
           </Button>
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>
              {currentTab === 'patient-detail' ? t.userDetail : t.myPatients}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
              Doctor / {currentTab === 'patient-detail' ? 'Detail' : 'Patients'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton sx={{ bgcolor: alpha(theme.palette.divider, 0.4) }}><NotificationsIcon fontSize="small" /></IconButton>
            <Avatar src={user?.avatar} sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'secondary.main', fontWeight: 900 }}>{user?.firstName?.[0]}</Avatar>
          </Stack>
        </Stack>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab === 'patient-detail' ? `patient-${selectedPatient?._id}` : 'patients-list'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* ===== PATIENT LIST ===== */}
            {currentTab === 'patients' && (
              <Box>
                <Paper elevation={0} sx={{ p: 2.5, mb: 4, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.4), backdropFilter: 'blur(20px)', border: `1px solid ${theme.palette.divider}` }}>
                  <TextField
                    placeholder={t.search}
                    fullWidth
                    size="small"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: alpha(theme.palette.background.default, 0.5) } }}
                  />
                </Paper>

                <Grid container spacing={3}>
                  {patients.map((p, idx) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p._id}>
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                        <Card
                          elevation={0}
                          onClick={() => openPatient(p)}
                          sx={{
                            cursor: 'pointer',
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.background.paper, 0.6),
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${theme.palette.divider}`,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: `0 12px 24px -10px ${alpha(theme.palette.secondary.main, 0.2)}`,
                              border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                            }
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 3 }}>
                              <Avatar sx={{ borderRadius: 1.5, width: 56, height: 56, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main', fontWeight: 900, fontSize: 20 }}>{p.firstName?.[0]}</Avatar>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{p.firstName} {p.lastName}</Typography>
                                <Chip label={p.diabetesType || 'Unknown'} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 900, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main', border: 'none', mt: 0.5 }} />
                              </Box>
                            </Stack>
                            <Divider sx={{ my: 2, opacity: 0.5 }} />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Box display="flex" alignItems="center" gap={1}>
                                <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{p.region || '—'}</Typography>
                              </Box>
                              <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}><ChevronRightIcon /></IconButton>
                            </Stack>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>

                {patients.length === 0 && (
                  <Box sx={{ py: 15, textAlign: 'center', opacity: 0.2 }}>
                    <PeopleAltIcon sx={{ fontSize: 80, mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{t.noPatients}</Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* ===== PATIENT DETAIL ===== */}
            {currentTab === 'patient-detail' && selectedPatient && (
              <Box>
                <Button startIcon={<ArrowBackIcon />} onClick={() => setCurrentTab('patients')} sx={{ mb: 4, fontWeight: 900, borderRadius: 2, px: 3 }}>{t.patientList}</Button>

                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, lg: 8 }}>
                    {/* Patient Header Card */}
                    <Card elevation={0} sx={{ mb: 4, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.6), backdropFilter: 'blur(20px)', border: `2px solid ${alpha(theme.palette.secondary.main, 0.1)}`, p: 4 }}>
                      <Stack direction={isMobile ? 'column' : 'row'} spacing={4} alignItems="center">
                        <Avatar sx={{ width: 88, height: 88, borderRadius: 2, bgcolor: 'secondary.main', fontWeight: 900, fontSize: 32, boxShadow: `0 8px 16px ${alpha(theme.palette.secondary.main, 0.2)}` }}>{selectedPatient.firstName?.[0]}</Avatar>
                        <Box sx={{ flexGrow: 1, textAlign: isMobile ? 'center' : 'left' }}>
                          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>{selectedPatient.firstName} {selectedPatient.lastName}</Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'secondary.main', textTransform: 'uppercase', letterSpacing: 1.5 }}>{selectedPatient.diabetesType}</Typography>
                        </Box>
                        <Stack direction="row" spacing={3}>
                          <Box textAlign="center" px={2}>
                            <Typography variant="caption" display="block" sx={{ fontWeight: 900, color: 'text.secondary' }}>GENDER</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 900 }}>{t[selectedPatient.gender] || selectedPatient.gender}</Typography>
                          </Box>
                          <Divider orientation="vertical" flexItem />
                          <Box textAlign="center" px={2}>
                            <Typography variant="caption" display="block" sx={{ fontWeight: 900, color: 'text.secondary' }}>AGE</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 900 }}>{selectedPatient.age || '—'}</Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </Card>

                    {/* Fasting Chart */}
                    <Card elevation={0} sx={{ mb: 4, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.paper, 0.4), backdropFilter: 'blur(10px)' }}>
                      <Box sx={{ p: 2.5, px: 4, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, color: 'primary.main' }}>Och Qoringa (Fasting)</Typography>
                      </Box>
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ height: 260 }}>
                          {fastingRecords.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={fastingRecords}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700 }} />
                                <YAxis tick={{ fontSize: 10, fontWeight: 700 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="level" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.1} strokeWidth={3} />
                              </AreaChart>
                            </ResponsiveContainer>
                          ) : (
                            <Box sx={{ py: 4, textAlign: 'center', opacity: 0.4 }}>
                              <TimelineIcon sx={{ fontSize: 40, mb: 1 }} />
                              <Typography variant="caption" display="block">Yozuvlar topilmadi</Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Post-Meal Chart */}
                    <Card elevation={0} sx={{ mb: 4, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.paper, 0.4), backdropFilter: 'blur(10px)' }}>
                      <Box sx={{ p: 2.5, px: 4, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, color: 'secondary.main' }}>To'q Qoringa (Post-meal)</Typography>
                      </Box>
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ height: 260 }}>
                          {postMealRecords.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={postMealRecords}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700 }} />
                                <YAxis tick={{ fontSize: 10, fontWeight: 700 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="level" stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} fillOpacity={0.1} strokeWidth={3} />
                              </AreaChart>
                            </ResponsiveContainer>
                          ) : (
                            <Box sx={{ py: 4, textAlign: 'center', opacity: 0.4 }}>
                              <TimelineIcon sx={{ fontSize: 40, mb: 1 }} />
                              <Typography variant="caption" display="block">Yozuvlar topilmadi</Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Medical Notes */}
                    <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.paper, 0.4), backdropFilter: 'blur(10px)' }}>
                      <Box sx={{ p: 2.5, px: 4, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>{t.medicalConclusion || 'Tibbiy Xulosa'}</Typography>
                      </Box>
                      <CardContent sx={{ p: 4 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={6}
                          placeholder={`${t.writeNote || 'Xulosa yozing'}...`}
                          value={doctorNote}
                          onChange={e => setDoctorNote(e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.4) } }}
                        />
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button variant="contained" color="secondary" startIcon={<SaveIcon />} onClick={handleSaveNote} sx={{ fontWeight: 900, borderRadius: 2, px: 5, py: 1.2, boxShadow: `0 8px 16px ${alpha(theme.palette.secondary.main, 0.2)}` }}>{t.save || 'Saqlash'}</Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Stats Sidebar */}
                  <Grid size={{ xs: 12, lg: 4 }}>
                    <Card elevation={0} sx={{ mb: 4, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.08), border: `1px solid ${alpha(theme.palette.secondary.main, 0.15)}`, p: 4 }}>
                      <Stack spacing={4}>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: 'secondary.main', textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', mb: 1 }}>{t.totalRecords || 'Jami Yozuvlar'}</Typography>
                          <Typography variant="h2" sx={{ fontWeight: 900 }}>{records.length}</Typography>
                        </Box>
                        <Divider />
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: 'secondary.main', textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', mb: 1 }}>{t.avgSugar || "O'rtacha Qand"}</Typography>
                          <Typography variant="h3" sx={{ fontWeight: 900 }}>
                            {records.length > 0
                              ? (records.reduce((acc, curr) => acc + (curr.fastingLevel || curr.level || 0), 0) / records.length).toFixed(1)
                              : '—'}
                            <Typography component="span" variant="h6" sx={{ ml: 1, color: 'text.secondary' }}>mmol/l</Typography>
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>

                    <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.paper, 0.4), backdropFilter: 'blur(10px)' }}>
                      <Box sx={{ p: 2.5, px: 4, borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>{t.recentActivity || 'Oxirgi Yozuvlar'}</Typography>
                      </Box>
                      <TableContainer>
                        <Table size="medium">
                          <TableBody>
                            {records.slice(-5).reverse().map((r) => (
                              <TableRow key={r._id} sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell sx={{ py: 2.5 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{format(new Date(r.date), 'dd MMMM')}</Typography>
                                  <Typography variant="caption" color="text.secondary">{format(new Date(r.date), 'HH:mm')}</Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ py: 2.5 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: (r.fastingLevel || r.level) > 7 ? 'error.main' : 'success.main' }}>
                                    {r.fastingLevel || r.level || 0}
                                    <Typography component="span" variant="caption" sx={{ fontSize: 9, ml: 0.5 }}>mmol/l</Typography>
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                            {records.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={2} align="center" sx={{ py: 4, opacity: 0.4 }}>
                                  <Typography variant="caption">Yozuvlar mavjud emas</Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </motion.div>
        </AnimatePresence>
      </Box>
      <Toaster position="top-right" richColors />
    </Box>
  );
}
