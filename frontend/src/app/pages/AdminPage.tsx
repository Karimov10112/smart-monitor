import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { translations } from '../utils/translations';
import { toast, Toaster } from 'sonner';
import { format } from 'date-fns';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Chip,
  alpha,
  useTheme,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  useMediaQuery,
} from '@mui/material';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';

import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TimelineIcon from '@mui/icons-material/Timeline';
import HistoryIcon from '@mui/icons-material/History';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import NotificationsIcon from '@mui/icons-material/Notifications';

type TabType = 'dashboard' | 'users' | 'audit';

export default function AdminPage() {
  const { user } = useAuth();
  const { language } = useApp();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const t = translations[language];

  const [currentTab, setCurrentTab] = useState<TabType>(searchParams.get('tab') as TabType || 'dashboard');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMini, setIsMini] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserRecords, setSelectedUserRecords] = useState<any[]>([]);
  const [userTab, setUserTab] = useState<'info' | 'manage' | 'analytics'>('info');



  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);

  // Add Patient State
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [patientForm, setPatientForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    region: '',
    district: '',
    height: '',
    weight: '',
    diabetesType: '2-toifa',
    dateOfBirth: ''
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditTotal, setAuditTotal] = useState(0);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([loadStats(), loadUsers(), loadDoctors()]);
    } catch (err) { }
    finally { setLoading(false); }
  };

  const loadStats = async () => {
    try {
      const { data } = await adminAPI.getStats();
      setStats(data.stats);
    } catch { }
  };

  const loadUsers = async (s = '', r = '') => {
    try {
      const { data } = await adminAPI.getUsers({ search: s, role: r, limit: 100 });
      setUsers(data.users || []);
    } catch { }
  };



  const loadDoctors = async () => {
    try {
      const { data } = await adminAPI.getDoctors();
      if (data.success) setAvailableDoctors(data.doctors || []);
    } catch { }
  };

  const loadAuditLogs = async () => {
    if (user?.role !== 'superadmin') return;
    setAuditLoading(true);
    try {
      const { data } = await adminAPI.getAuditLogs({ limit: 50 });
      setAuditLogs(data.logs || []);
      setAuditTotal(data.total || 0);
    } catch { }
    finally { setAuditLoading(false); }
  };

  const loadSpecificUser = async (userId: string) => {
    try {
      const { data } = await adminAPI.getUser(userId);
      setSelectedUser(data.user);
      setSelectedUserRecords(data.records || []);
      loadStats();
    } catch { }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentTab === 'users' && !selectedUserId) {
         setUserLoading(true);
         loadUsers(search, role).finally(() => setUserLoading(false));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, role, currentTab, selectedUserId]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setUserLoading(true);
      loadUsers(search, role).finally(() => setUserLoading(false));
    }
  };

  const handleSaveAdminNotes = async (userId: string, notes: string) => {
    try {
      const { data } = await adminAPI.addNote(userId, notes);
      if (data.success) {
        toast.success(t.success || 'Saqlandi');
        loadSpecificUser(userId);
      }
    } catch {
      toast.error(t.error || 'Xato yuz berdi');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUserId || !newPassword || newPassword.length < 6) {
      toast.error('Parol kamida 6 ta belgi bo\'lishi kerak');
      return;
    }
    try {
      setIsResettingPassword(true);
      const { data } = await adminAPI.resetPassword(selectedUserId, newPassword);
      if (data.success) {
        toast.success(data.message || 'Parol muvaffaqiyatli yangilandi');
        setNewPassword('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xato yuz berdi');
    } finally {
      setIsResettingPassword(false);
    }
  };



  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createPatient(patientForm);
        toast.success("Bemor muvaffaqiyatli qo'shildi");
      setIsAddPatientModalOpen(false);
      setPatientForm({ email: '', password: '', firstName: '', lastName: '', phone: '', region: '', district: '', height: '', weight: '', diabetesType: '2-toifa', dateOfBirth: '' });
      loadUsers(search, role);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xato yuz berdi');
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <CircularProgress />
    </Box>
  );

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: <DashboardIcon /> },
    { id: 'users', label: t.users, icon: <PeopleIcon /> },
    { id: 'audit', label: t.auditLogs, icon: <HistoryIcon />, hidden: user?.role !== 'superadmin' },
  ];

  const sidebarWidth = 280;
  const miniWidth = 88;

  const fastingRecords = selectedUserRecords
    .filter(r => (r.fastingLevel != null) || (r.category === 'fasting' && r.level != null))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(r => ({
      date: format(new Date(r.date), 'dd/MM'),
      level: r.category === 'fasting' ? r.level : r.fastingLevel
    }));

  const postMealRecords = selectedUserRecords
    .filter(r => (r.postMealLevel != null) || (r.category === 'post-meal' && r.level != null))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(r => ({
      date: format(new Date(r.date), 'dd/MM'),
      level: r.category === 'post-meal' ? r.level : r.postMealLevel
    }));

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
                <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 1.5, display: 'flex', color: 'white' }}>
                  <AdminPanelSettingsIcon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900, fontSize: 16 }}>{t.admin.toUpperCase()}</Typography>
              </Stack>
            )}
            <IconButton onClick={() => setIsMini(!isMini)} size="small" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              {isMini ? <MenuIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Box>
          <Divider sx={{ mx: 2, mb: 2, opacity: 0.5 }} />
          <List sx={{ px: 2, flexGrow: 1 }}>
            {menuItems.filter(m => !m.hidden).map((item) => (
              <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => {
                    setCurrentTab(item.id as TabType);
                    setSelectedUserId(null);
                    if (item.id === 'audit') loadAuditLogs();
                  }}
                  selected={currentTab === item.id && !selectedUserId}
                  sx={{
                    borderRadius: 8,
                    mb: 1,
                    py: 1.5,
                    boxShadow: theme.palette.mode === 'dark' ? '4px 4px 10px rgba(0,0,0,0.4)' : '4px 4px 12px rgba(0,0,0,0.05), -4px -4px 12px rgba(255,255,255,0.8)',
                    px: isMini ? 1.5 : 2,
                    justifyContent: isMini ? 'center' : 'flex-start',
                    color: (currentTab === item.id && !selectedUserId) ? 'primary.main' : 'text.secondary',
                    bgcolor: (currentTab === item.id && !selectedUserId) ? alpha(theme.palette.primary.main, 0.1) : theme.palette.background.paper,
                  }}
                >
                  <Box sx={{ minWidth: isMini ? 0 : 40 }}>{item.icon}</Box>
                  {!isMini && <Typography sx={{ fontWeight: (currentTab === item.id && !selectedUserId) ? 800 : 700, fontSize: 13 }}>{item.label}</Typography>}
                </ListItemButton>
              </ListItem>
            ))}
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
                  '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.06) },
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

      {/* Main Content Area - FIXED OVERLAP */}
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
           {menuItems.filter(m => !m.hidden).map((item) => (
             <Button
               key={item.id}
               onClick={() => {
                 setCurrentTab(item.id as TabType);
                 setSelectedUserId(null);
                 if (item.id === 'audit') loadAuditLogs();
               }}
               variant={currentTab === item.id && !selectedUserId ? 'contained' : 'outlined'}
               startIcon={item.icon}
               sx={{ 
                 borderRadius: 8, 
                 flexShrink: 0, 
                 textTransform: 'none',
                 boxShadow: currentTab === item.id && !selectedUserId ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                 bgcolor: currentTab === item.id && !selectedUserId ? 'primary.main' : alpha(theme.palette.background.paper, 0.5),
                 color: currentTab === item.id && !selectedUserId ? '#fff' : 'text.secondary',
                 fontWeight: 800,
                 px: 2,
                 border: '1px solid',
                 borderColor: currentTab === item.id && !selectedUserId ? 'transparent' : 'divider',
                 '&:hover': { bgcolor: currentTab === item.id && !selectedUserId ? 'primary.dark' : 'background.paper' }
               }}
             >
               {item.label}
             </Button>
           ))}
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
             <Typography variant="h5" sx={{ fontWeight: 900 }}>
               {selectedUserId ? t.userDetail : t[currentTab] || currentTab}
             </Typography>
             <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{t.admin} / {t[currentTab] || currentTab}</Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton sx={{ bgcolor: alpha(theme.palette.divider, 0.4) }}><NotificationsIcon fontSize="small" /></IconButton>
            <Avatar src={user?.avatar} sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'primary.main', fontWeight: 900 }}>{user?.firstName?.[0]}</Avatar>
          </Stack>
        </Stack>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedUserId ? `user-${selectedUserId}` : currentTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {currentTab === 'dashboard' && !selectedUserId && (
              <>
                <Grid container spacing={3}>
                {[
                  { icon: PeopleIcon, label: t.totalUsers, val: stats?.totalUsers ?? 0, color: theme.palette.primary.main },
                  { icon: TimelineIcon, label: t.activeToday, val: stats?.activeToday ?? 0, color: theme.palette.success.main },
                ].map((s, idx) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                    <Card elevation={0} sx={{ p: 3.5, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.6), backdropFilter: 'blur(10px)', border: `1px solid ${theme.palette.divider}` }}>
                      <Stack direction="column" spacing={2}>
                        <Avatar sx={{ bgcolor: alpha(s.color, 0.12), color: s.color, borderRadius: 1.5, width: 52, height: 52 }}><s.icon /></Avatar>
                        <Box>
                          <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1 }}>{s.val}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', mt: 0.5, whiteSpace: 'normal', wordBreak: 'break-word' }}>{s.label}</Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Purge incomplete users button */}
              {user?.role === 'superadmin' && (
                <Box sx={{ mt: 4 }}>
                  <Card elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.04), border: `1px solid ${alpha(theme.palette.error.main, 0.15)}` }}>
                    <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems={isMobile ? 'flex-start' : 'center'} justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'error.main' }}>
                          🧹 {language === 'uz' ? "Chala ro'yxatdan o'tganlarni o'chirish" : 'Purge incomplete accounts'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          {language === 'uz'
                            ? "Email tasdiqlanmagan yoki profili to'liq to'ldirilmagan foydalanuvchilar o'chiriladi."
                            : 'Deletes users who have not verified their email or completed their profile.'}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        color="error"
                        sx={{ borderRadius: 2, fontWeight: 800, px: 3, flexShrink: 0, textTransform: 'none' }}
                        onClick={async () => {
                          if (!window.confirm(language === 'uz' ? "Ishonchingiz komilmi? Bu amalni ortga qaytarib bo'lmaydi." : 'Are you sure? This cannot be undone.')) return;
                          try {
                            const { data } = await adminAPI.purgeIncomplete();
                            toast.success(data.message || "O'chirildi");
                            loadStats();
                            loadUsers();
                          } catch {
                            toast.error(language === 'uz' ? 'Xato yuz berdi' : 'Error occurred');
                          }
                        }}
                      >
                        {language === 'uz' ? "O'chirish" : 'Delete'}
                      </Button>
                    </Stack>
                  </Card>
                </Box>
              )}
              </>
            )}

            {currentTab === 'users' && !selectedUserId && (
              <Box>
                <Paper elevation={0} sx={{ p: 2.5, mb: 4, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.4), backdropFilter: 'blur(10px)', border: `1px solid ${theme.palette.divider}` }}>
                  <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="center">
                    <TextField
                      placeholder={t.searchUsers}
                      fullWidth
                      size="small"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>{t.role}</InputLabel>
                      <Select value={role} label={t.role} onChange={e => setRole(e.target.value)}>
                        <MenuItem value="">{t.allStatuses || 'All'}</MenuItem>
                        <MenuItem value="user">{t.user}</MenuItem>
                        <MenuItem value="doctor">{t.doctor}</MenuItem>
                        <MenuItem value="admin">{t.admin}</MenuItem>
                      </Select>
                    </FormControl>
                    <Button variant="contained" onClick={() => setIsAddPatientModalOpen(true)} startIcon={<AddIcon />} sx={{ borderRadius: 2, fontWeight: 900, whiteSpace: 'nowrap', py: 1 }}>Bemor qo'shish</Button>
                  </Stack>
                </Paper>

                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.paper, 0.4), backdropFilter: 'blur(10px)' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 900 }}>{t.user}</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>{t.regionLabel}</TableCell>
                        <TableCell align="right"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map(u => (
                        <TableRow key={u._id} hover onClick={() => { if (u.role === 'superadmin' && user?.role !== 'superadmin') return; setSelectedUserId(u._id); loadSpecificUser(u._id); setUserTab('info'); }} sx={{ cursor: 'pointer' }}>
                          <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar src={u.avatar} sx={{ borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 900 }}>{u.firstName?.[0]}</Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>{u.firstName} {u.lastName}</Typography>
                                <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{u.region || '—'}</Typography>
                            <Chip label={u.role.toUpperCase()} size="small" sx={{ height: 16, fontSize: 8, fontWeight: 900 }} />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); if (confirm("Delete?")) adminAPI.deleteUser(u._id).then(() => loadUsers(search, role)); }}><DeleteIcon fontSize="small" /></IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}



            {selectedUserId && selectedUser && (
              <Box>
                 {/* TAB BO'LIMLARI */}
                 <Stack direction="row" spacing={2} sx={{ mb: 3 }} overflow="auto">
                    <Button variant={userTab === 'info' ? 'contained' : 'outlined'} onClick={() => setUserTab('info')} sx={{ borderRadius: 1.5, fontWeight: 900, px: 3 }}>Ma'lumotlar</Button>
                    <Button variant={userTab === 'manage' ? 'contained' : 'outlined'} onClick={() => setUserTab('manage')} sx={{ borderRadius: 1.5, fontWeight: 900, px: 3 }}>Boshqaruv</Button>
                    <Button variant={userTab === 'analytics' ? 'contained' : 'outlined'} onClick={() => setUserTab('analytics')} sx={{ borderRadius: 1.5, fontWeight: 900, px: 3 }}>Tahlillar</Button>
                 </Stack>

                 {/* === 1. SHAXSIY MA'LUMOTLAR === */}
                 {userTab === 'info' && (
                <Card elevation={0} sx={{ mb: 3, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.6), backdropFilter: 'blur(20px)', border: `1px solid ${theme.palette.divider}` }}>
                   <Box sx={{ p: 4 }}>
                      <Stack direction={isMobile ? 'column' : 'row'} spacing={4} alignItems={isMobile ? 'flex-start' : 'center'} justifyContent="space-between">
                         <Stack direction="row" spacing={3} alignItems="center">
                            <Avatar src={selectedUser.avatar} sx={{ width: 80, height: 80, borderRadius: 2, bgcolor: 'primary.main', fontSize: 32, fontWeight: 900 }}>{selectedUser.firstName?.[0]}</Avatar>
                            <Box>
                               <Typography variant="h5" sx={{ fontWeight: 900 }}>{selectedUser.firstName} {selectedUser.lastName}</Typography>
                               <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>{selectedUser.email}</Typography>
                               <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                  <Chip label={selectedUser.role.toUpperCase()} size="small" color="primary" sx={{ fontWeight: 900 }} />
                                  <Chip label={selectedUser.isBanned ? 'BANNED' : 'ACTIVE'} size="small" color={selectedUser.isBanned ? 'error' : 'success'} sx={{ fontWeight: 900 }} />
                               </Stack>
                            </Box>
                         </Stack>
                         <Stack direction={isMobile ? 'row' : 'column'} spacing={1.5}>
                            <Button variant="contained" color={selectedUser.isBanned ? 'success' : 'error'} onClick={() => adminAPI.toggleBan(selectedUser._id).then(() => loadSpecificUser(selectedUser._id))} sx={{ borderRadius: 2, fontWeight: 900 }}>{selectedUser.isBanned ? 'Unban' : 'Ban'}</Button>
                            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setSelectedUserId(null)} sx={{ borderRadius: 2, fontWeight: 900 }}>{t.backToList}</Button>
                         </Stack>
                      </Stack>

                      <Divider sx={{ my: 3 }} />

                      <Grid container spacing={4}>
                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>{t.diabetesTypeLabel}</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 900 }}>{selectedUser.diabetesType || '—'}</Typography>
                         </Grid>
                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>{t.genderAndAge}</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 900 }}>{t[selectedUser.gender] || selectedUser.gender} • {selectedUser.dateOfBirth ? `${new Date().getFullYear() - new Date(selectedUser.dateOfBirth).getFullYear()} yosh` : '—'}</Typography>
                         </Grid>
                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>{t.phoneNumberLabel || 'Telefon'}</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 900 }}>{selectedUser.phone || '—'}</Typography>
                         </Grid>
                         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>{t.regionLabel || 'Viloyat'}</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 900 }}>{[selectedUser.region, selectedUser.district].filter(Boolean).join(', ') || '—'}</Typography>
                         </Grid>
                         {selectedUser.createdBy && (
                           <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>Qo'shgan Admin</Typography>
                              <Typography variant="body1" sx={{ fontWeight: 900 }}>{selectedUser.createdBy.firstName} {selectedUser.createdBy.lastName}</Typography>
                           </Grid>
                         )}
                      </Grid>
                   </Box>
                </Card>
                 )}

                {/* === 2. BOSHQARUV AMALLARI === */}
                 {userTab === 'manage' && (
                <Card elevation={0} sx={{ mb: 3, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.4), backdropFilter: 'blur(20px)', border: `1px solid ${theme.palette.divider}` }}>
                   <Box sx={{ p: 3, px: 4, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.secondary.main, 0.03) }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: 'secondary.main' }}>{t.managementActions || 'Boshqaruv'}</Typography>
                   </Box>
                   <Box sx={{ p: 4 }}>
                      <Grid container spacing={4}>
                         <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display: 'block', textTransform: 'uppercase' }}>{t.assignDoctor}</Typography>
                            <FormControl fullWidth size="small">
                               <Select value={selectedUser.assignedDoctor?._id || selectedUser.assignedDoctor || ''} onChange={e => adminAPI.assignDoctor(selectedUser._id, e.target.value || null).then(() => { toast.success(t.doctorAssigned); loadSpecificUser(selectedUser._id); })} sx={{ borderRadius: 2 }}>
                                  <MenuItem value=""><em>{t.assignDoctor}</em></MenuItem>
                                  {availableDoctors.map(doc => <MenuItem key={doc._id} value={doc._id}>{doc.firstName} {doc.lastName}</MenuItem>)}
                               </Select>
                            </FormControl>
                            {selectedUser.assignedDoctor && (
                               <Typography variant="caption" color="success.main" sx={{ fontWeight: 800, mt: 1, display: 'block' }}>
                                  ✓ {typeof selectedUser.assignedDoctor === 'object' ? `${selectedUser.assignedDoctor.firstName} ${selectedUser.assignedDoctor.lastName}` : t.doctorAssigned}
                               </Typography>
                            )}
                         </Grid>
                         {user?.role === 'superadmin' && (
                           <Grid size={{ xs: 12, md: 6 }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display: 'block', textTransform: 'uppercase' }}>{t.updateRoleLabel || 'Rol'}</Typography>
                              <FormControl fullWidth size="small">
                                 <Select value={selectedUser.role} onChange={e => adminAPI.updateRole(selectedUser._id, e.target.value).then(() => { toast.success('Rol o\'zgartirildi'); loadSpecificUser(selectedUser._id); })} sx={{ borderRadius: 2 }}>
                                    <MenuItem value="user">{t.user || 'Foydalanuvchi'}</MenuItem>
                                    <MenuItem value="doctor">{t.doctor || 'Shifokor'}</MenuItem>
                                    <MenuItem value="admin">{t.admin || 'Admin'}</MenuItem>
                                 </Select>
                              </FormControl>
                           </Grid>
                         )}
                         {user?.role === 'superadmin' && (
                           <Grid size={{ xs: 12, md: 6 }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display: 'block', textTransform: 'uppercase', color: 'error.main' }}>Parolni tiklash</Typography>
                              <Stack direction="row" spacing={1}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  placeholder="Yangi parol (kamida 6 ta belgi)"
                                  value={newPassword}
                                  onChange={e => setNewPassword(e.target.value)}
                                  type="text"
                                />
                                <Button 
                                  variant="contained" 
                                  color="error" 
                                  onClick={handleResetPassword}
                                  disabled={isResettingPassword || newPassword.length < 6}
                                  sx={{ fontWeight: 900, whiteSpace: 'nowrap' }}
                                >
                                  {isResettingPassword ? <CircularProgress size={20} color="inherit" /> : 'Yangilash'}
                                </Button>
                              </Stack>
                           </Grid>
                         )}
                      </Grid>
                   </Box>
                </Card>
                 )}

                {/* === 3. GLYUKOZA VA IZOHLAR === */}
                 {userTab === 'analytics' && (
                <Grid container spacing={3}>
                   <Grid size={{ xs: 12, md: 8 }}>
                      <Card elevation={0} sx={{ p: 4, mb: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.paper, 0.4), backdropFilter: 'blur(10px)' }}>
                         <Typography variant="h6" color="primary" sx={{ fontWeight: 900, mb: 3, borderLeft: `4px solid ${theme.palette.primary.main}`, pl: 1.5 }}>{t.fastingChartTitle}</Typography>
                         <Box sx={{ height: 240 }}>
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
                           ) : <Box sx={{ py: 6, textAlign: 'center', opacity: 0.4 }}><TimelineIcon sx={{ fontSize: 40, mb: 1 }} /><Typography variant="caption" display="block">{t.noRecords}</Typography></Box>}
                         </Box>
                      </Card>

                      <Card elevation={0} sx={{ p: 4, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.paper, 0.4), backdropFilter: 'blur(10px)' }}>
                         <Typography variant="h6" color="secondary" sx={{ fontWeight: 900, mb: 3, borderLeft: `4px solid ${theme.palette.secondary.main}`, pl: 1.5 }}>{t.postMealChartTitle}</Typography>
                         <Box sx={{ height: 240 }}>
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
                           ) : <Box sx={{ py: 6, textAlign: 'center', opacity: 0.4 }}><TimelineIcon sx={{ fontSize: 40, mb: 1 }} /><Typography variant="caption" display="block">{t.noRecords}</Typography></Box>}
                         </Box>
                      </Card>
                   </Grid>
                   
                   <Grid size={{ xs: 12, md: 4 }}>
                      <Card elevation={0} sx={{ p: 4, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.paper, 0.4), backdropFilter: 'blur(10px)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                         <Typography variant="caption" sx={{ fontWeight: 900, color: 'warning.main', textTransform: 'uppercase', mb: 2, display: 'block' }}>{t.administrativeNotes || 'Admin Izohi'}</Typography>
                         <TextField fullWidth multiline rows={7} variant="outlined" placeholder={t.notesPlaceholder} value={selectedUser.adminNotes || ''} onChange={e => setSelectedUser({...selectedUser, adminNotes: e.target.value})} sx={{ mb: 3, flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) } }} />
                         <Button fullWidth variant="contained" onClick={() => handleSaveAdminNotes(selectedUserId!, selectedUser.adminNotes)} sx={{ borderRadius: 1.5, fontWeight: 900, py: 1.5 }}>{t.saveNotes || 'Izohni saqlash'}</Button>
                      </Card>
                   </Grid>
                </Grid>
                 )}
              </Box>
            )}

            {currentTab === 'audit' && user?.role === 'superadmin' && (
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
                   <Typography variant="h6" sx={{ fontWeight: 900 }}>Audit Logs</Typography>
                   <Button variant="outlined" onClick={loadAuditLogs} startIcon={<HistoryIcon />} sx={{ borderRadius: 2 }}>Refresh</Button>
                </Stack>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.paper, 0.4), backdropFilter: 'blur(10px)' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 900 }}>Admin</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Action</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Details</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900 }}>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {auditLogs.map(log => (
                        <TableRow key={log._id}>
                          <TableCell><Typography variant="body2" fontWeight={800}>{log.adminId?.firstName} {log.adminId?.lastName}</Typography></TableCell>
                          <TableCell><Chip label={log.action} size="small" /></TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              {log.action === 'DELETE_USER' && (
                                <>O'chirildi: <b>{log.details?.userEmail}</b> (Rol: {log.details?.userRole || 'user'}) <br/> O'chiruvchi: {log.details?.deletedByEmail} ({log.details?.deletedByRole})</>
                              )}
                              {log.action === 'PURGE_INCOMPLETE_USERS' && (
                                <>{log.details?.deleted} ta chala akkaunt o'chirildi.</>
                              )}
                              {log.action !== 'DELETE_USER' && log.action !== 'PURGE_INCOMPLETE_USERS' && (
                                JSON.stringify(log.details)
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell align="right"><Typography variant="caption">{format(new Date(log.createdAt), 'dd.MM HH:mm')}</Typography></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </motion.div>
        </AnimatePresence>


        {/* Add Patient Modal */}
        <Dialog open={isAddPatientModalOpen} onClose={() => setIsAddPatientModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ fontWeight: 900 }}>Bemor Qo'shish</DialogTitle>
          <form onSubmit={handleSavePatient}>
            <DialogContent>
              <Grid container spacing={2}>
                {/* 1. Ism va Familiya */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Ism" required size="small" value={patientForm.firstName} onChange={e => setPatientForm({...patientForm, firstName: e.target.value})} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Familiya" required size="small" value={patientForm.lastName} onChange={e => setPatientForm({...patientForm, lastName: e.target.value})} />
                </Grid>
                {/* 2. Telefon va Tug'ilgan sana */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Telefon" required size="small" value={patientForm.phone} onChange={e => setPatientForm({...patientForm, phone: e.target.value})} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Tug'ilgan sana (YYYY-MM-DD)" required size="small" value={patientForm.dateOfBirth} onChange={e => setPatientForm({...patientForm, dateOfBirth: e.target.value})} />
                </Grid>
                {/* 3. Diabet turi va Bo'y */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Diabet Turi *</InputLabel>
                    <Select value={patientForm.diabetesType} label="Diabet Turi *" onChange={e => setPatientForm({...patientForm, diabetesType: e.target.value})}>
                      <MenuItem value="1-toifa">1-toifa</MenuItem>
                      <MenuItem value="2-toifa">2-toifa</MenuItem>
                      <MenuItem value="Homiladorlik">Homiladorlik</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Bo'y (sm)" required size="small" type="number" value={patientForm.height} onChange={e => setPatientForm({...patientForm, height: e.target.value})} />
                </Grid>
                {/* 4. Vazn va Viloyat */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Vazn (kg)" required size="small" type="number" value={patientForm.weight} onChange={e => setPatientForm({...patientForm, weight: e.target.value})} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Viloyat" required size="small" value={patientForm.region} onChange={e => setPatientForm({...patientForm, region: e.target.value})} />
                </Grid>
                {/* 5. Tuman */}
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Tuman / Shahar" required size="small" value={patientForm.district} onChange={e => setPatientForm({...patientForm, district: e.target.value})} />
                </Grid>
                {/* 6. Login va Parol — OXIRIDA */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Kirish ma'lumotlari
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Login (Tel raqam / Email)" required size="small" value={patientForm.email} onChange={e => setPatientForm({...patientForm, email: e.target.value})} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Parol" required size="small" type="password" value={patientForm.password} onChange={e => setPatientForm({...patientForm, password: e.target.value})} />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setIsAddPatientModalOpen(false)}>Bekor qilish</Button>
              <Button type="submit" variant="contained" sx={{ fontWeight: 800 }}>Saqlash</Button>
            </DialogActions>
          </form>
        </Dialog>

        <Toaster position="top-right" richColors />
      </Box>
    </Box>
  );
}
