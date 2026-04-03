import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { translations } from '../utils/translations';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

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
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

// MUI Icons
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SearchIcon from '@mui/icons-material/Search';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TimelineIcon from '@mui/icons-material/Timeline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LogoutIcon from '@mui/icons-material/Logout';
import DescriptionIcon from '@mui/icons-material/Description';
import BiotechIcon from '@mui/icons-material/Biotech';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

const SIDEBAR_WIDTH = 280;

type TabType = 'patients' | 'patient-detail';

export default function DoctorPage() {
  const { user, logout } = useAuth();
  const { language } = useApp();
  const theme = useTheme();
  const t = translations[language];
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState<TabType>('patients');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [doctorNote, setDoctorNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, [search]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const { data } = await doctorAPI.getPatients({ search });
      setPatients(data.patients || []);
    } catch { }
    finally { setLoading(false); }
  };

  const openPatient = async (patient: any) => {
    try {
      const { data } = await doctorAPI.getPatientRecords(patient._id);
      const sortedRecords = data.records.sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setRecords(sortedRecords);
      setSelectedPatient(patient);
      setDoctorNote(patient.doctorNotes || '');
      setCurrentTab('patient-detail');
    } catch { }
  };

  const handleSaveNote = async () => {
    try {
      await doctorAPI.addNote(selectedPatient._id, doctorNote);
      toast.success(t.success || 'Saqlandi');
      setPatients(prev => prev.map(p => p._id === selectedPatient._id ? { ...p, doctorNotes: doctorNote } : p));
    } catch { }
  };

  const chartData = records.map(r => ({
    date: format(new Date(r.date), 'dd/MM'),
    fasting: r.fastingLevel,
    postMeal: r.postMealLevel || 0,
  }));

  if (loading && patients.length === 0) return (
    <Box sx={{ display: 'flex', h: '80vh', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar (Formal) */}
      <Box sx={{ width: SIDEBAR_WIDTH, borderRight: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', p: 3, position: 'fixed', h: '100vh' }}>
        <Box sx={{ mb: 4, px: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', borderRadius: 1.5, width: 40, height: 40 }}>🩺</Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, fontSize: '0.875rem' }}>Qand Nazorati</Typography>
              <Typography variant="overline" sx={{ fontWeight: 900, color: 'primary.main', fontSize: 9 }}>{t.doctorPanel}</Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <List sx={{ flexGrow: 1 }}>
          <ListItem disablePadding>
            <ListItemButton 
              selected={currentTab === 'patients' || currentTab === 'patient-detail'} 
              onClick={() => setCurrentTab('patients')}
              sx={{ borderRadius: 1.5, py: 1, '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><PeopleAltIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={t.patients} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.875rem' }} />
            </ListItemButton>
          </ListItem>
        </List>

        <Box sx={{ mt: 'auto' }}>
           <Divider sx={{ mb: 2 }} />
           <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, px: 1 }}>
              <Avatar sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', fontWeight: 900, fontSize: 14 }}>{user?.firstName?.[0]}</Avatar>
              <Box sx={{ overflow: 'hidden' }}>
                 <Typography variant="caption" sx={{ fontWeight: 900, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.firstName} {user?.lastName}</Typography>
                 <Typography variant="caption" sx={{ fontSize: 8, color: 'text.secondary', display: 'block' }}>Professional Doctor</Typography>
              </Box>
           </Stack>
           <Button fullWidth color="error" startIcon={<LogoutIcon fontSize="small" />} onClick={logout} sx={{ borderRadius: 1.5, justifyContent: 'start', py: 1, fontSize: '0.75rem', fontWeight: 700 }}>
             {t.back || 'Logout'}
           </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, ml: `${SIDEBAR_WIDTH}px`, p: { xs: 3, lg: 5 } }}>
         {currentTab === 'patients' && (
           <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                 <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>{t.myPatients || 'My Patients'}</Typography>
                 <TextField 
                  size="small" 
                  placeholder={t.search} 
                  value={search} 
                  onChange={e => setSearch(e.target.value)}
                  sx={{ width: 300 }}
                  InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
                 />
              </Stack>

              <Grid container spacing={3}>
                 {patients.map(p => (
                   <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={p._id}>
                      <Card elevation={0} onClick={() => openPatient(p)} sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { border: `1px solid ${theme.palette.primary.main}`, bgcolor: alpha(theme.palette.primary.main, 0.01) } }}>
                         <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                               <Avatar sx={{ borderRadius: 2, width: 48, height: 48, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 900 }}>{p.firstName?.[0]}</Avatar>
                               <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{p.firstName} {p.lastName}</Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 10 }}>{p.diabetesType || '—'}</Typography>
                               </Box>
                            </Stack>
                            <Divider sx={{ my: 1.5, opacity: 0.5 }} />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                               <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <LocationOnIcon sx={{ fontSize: 14 }} /> {p.region || '—'}
                               </Typography>
                               <ChevronRightIcon sx={{ color: 'divider' }} />
                            </Stack>
                         </CardContent>
                      </Card>
                   </Grid>
                 ))}
                 {patients.length === 0 && (
                   <Box sx={{ width: '100%', py: 10, textAlign: 'center', opacity: 0.3 }}>
                      <PeopleAltIcon sx={{ fontSize: 60, mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>{t.noPatients || 'Bemorlar topilmadi'}</Typography>
                   </Box>
                 )}
              </Grid>
           </Box>
         )}

         {currentTab === 'patient-detail' && selectedPatient && (
           <Box>
              <Button startIcon={<ArrowBackIcon />} onClick={() => setCurrentTab('patients')} sx={{ mb: 4, fontWeight: 800 }}>{t.back || 'Bemorlar ro\'yxati'}</Button>
              
              <Grid container spacing={3}>
                 <Grid size={{ xs: 12, lg: 8 }}>
                    {/* Patient Profile */}
                    <Card elevation={0} sx={{ mb: 3 }}>
                       <CardContent sx={{ p: 4 }}>
                          <Stack direction="row" spacing={3} alignItems="center">
                             <Avatar sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: 'primary.main', fontWeight: 900, fontSize: 24 }}>{selectedPatient.firstName?.[0]}</Avatar>
                             <Box>
                                <Typography variant="h5" sx={{ fontWeight: 900 }}>{selectedPatient.firstName} {selectedPatient.lastName}</Typography>
                                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{selectedPatient.diabetesType}</Typography>
                             </Box>
                          </Stack>
                          <Grid container spacing={2} sx={{ mt: 3 }}>
                             {[
                               { label: 'Region', val: selectedPatient.region, icon: LocationOnIcon },
                               { label: 'Gender', val: selectedPatient.gender, icon: TimelineIcon },
                               { label: 'Age', val: `${selectedPatient.age || '—'} y.o`, icon: BiotechIcon },
                             ].map((item, idx) => (
                               <Grid size={{ xs: 4 }} key={idx}>
                                  <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
                                     <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                                        <item.icon fontSize="inherit" /> {item.label}
                                     </Typography>
                                     <Typography variant="body2" sx={{ fontWeight: 800 }}>{item.val}</Typography>
                                  </Paper>
                               </Grid>
                             ))}
                          </Grid>
                       </CardContent>
                    </Card>

                    {/* Chart Card */}
                    <Card elevation={0} sx={{ mb: 3 }}>
                       <Box sx={{ p: 2, px: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>GLUCOSE MONITORING TRENDS</Typography>
                       </Box>
                       <CardContent sx={{ p: 4 }}>
                          <Box sx={{ h: 300 }}>
                             {records.length > 0 ? (
                               <ResponsiveContainer width="100%" height={300}>
                                  <AreaChart data={chartData}>
                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                     <Tooltip contentStyle={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}` }} />
                                     <Area type="monotone" dataKey="fasting" stroke={theme.palette.primary.main} strokeWidth={2.5} fill={alpha(theme.palette.primary.main, 0.05)} />
                                     <Area type="monotone" dataKey="postMeal" stroke={theme.palette.secondary.main} strokeWidth={2.5} fill={alpha(theme.palette.secondary.main, 0.05)} />
                                  </AreaChart>
                               </ResponsiveContainer>
                             ) : (
                               <Box sx={{ py: 10, textAlign: 'center', opacity: 0.3 }}>
                                  <TimelineIcon sx={{ fontSize:40, mb: 1 }} />
                                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 800 }}>{t.noRecords}</Typography>
                               </Box>
                             )}
                          </Box>
                       </CardContent>
                    </Card>

                    {/* Note Card */}
                    <Card elevation={0}>
                       <Box sx={{ p: 2, px: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>MEDICAL CONCLUSION</Typography>
                       </Box>
                       <CardContent sx={{ p: 3 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={6}
                            placeholder={t.writeNote + '...'}
                            value={doctorNote}
                            onChange={e => setDoctorNote(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                             <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveNote} sx={{ fontWeight: 800, borderRadius: 1.5 }}>{t.save}</Button>
                          </Box>
                       </CardContent>
                    </Card>
                 </Grid>

                 {/* Side Summary */}
                 <Grid size={{ xs: 12, lg: 4 }}>
                    <Card elevation={0} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02), mb: 3 }}>
                       <CardContent sx={{ p: 4 }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: 'text.secondary', display: 'block', mb: 1 }}>{t.totalRecords}</Typography>
                          <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main' }}>{records.length}</Typography>
                          <Divider sx={{ my: 3, opacity: 0.5 }} />
                          <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: 'text.secondary', display: 'block', mb: 1 }}>{t.avgSugar}</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 900 }}>
                            {(records.reduce((acc, curr) => acc + curr.fastingLevel, 0) / (records.length || 1)).toFixed(1)} <Typography component="span" variant="caption">mmol/l</Typography>
                          </Typography>
                       </CardContent>
                    </Card>

                    <Card elevation={0}>
                       <Box sx={{ p: 2, px: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>RECENT ACTIVITY</Typography>
                       </Box>
                       <TableContainer>
                          <Table size="small">
                             <TableBody>
                                {records.slice(-5).reverse().map(r => (
                                  <TableRow key={r._id}>
                                     <TableCell sx={{ fontSize: 10, fontWeight: 700, color: 'text.secondary' }}>{format(new Date(r.date), 'dd MMM')}</TableCell>
                                     <TableCell align="right" sx={{ fontWeight: 900 }}>{r.fastingLevel} <Typography component="span" variant="caption" sx={{ fontSize: 8 }}>mmol/l</Typography></TableCell>
                                  </TableRow>
                                ))}
                             </TableBody>
                          </Table>
                       </TableContainer>
                    </Card>
                 </Grid>
              </Grid>
           </Box>
         )}
      </Box>
    </Box>
  );
}
