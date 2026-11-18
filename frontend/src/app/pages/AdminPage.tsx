import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { translations } from '../utils/translations';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Statistics } from '../components/Statistics';

// MUI Components
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Avatar,
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
  Chip,
  alpha,
  useTheme,
  CircularProgress,
  InputAdornment,
  Skeleton,
  Tooltip,
} from '@mui/material';
import { SectionCard, StatTile, EmptyState, IconTile } from '../components/common';
import { formatDate, formatTime } from '../utils/format';

// MUI Icons
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TimelineIcon from '@mui/icons-material/Timeline';
import HistoryIcon from '@mui/icons-material/History';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import NotificationBell from '../components/NotificationBell';

type TabType = 'dashboard' | 'users' | 'audit';

export default function AdminPage() {
  const { user } = useAuth();
  const { language } = useApp();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = translations[language];

  const [currentTab, setCurrentTab] = useState<TabType>(searchParams.get('tab') as TabType || 'dashboard');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
      toast.error('Parol kamida 6 ta belgi bõlişi kerak');
      return;
    }
    try {
      setIsResettingPassword(true);
      const { data } = await adminAPI.resetPassword(selectedUserId, newPassword);
      if (data.success) {
        toast.success(data.message || t.passwordUpdated || 'Parol muvaffaqiyatli yangilandi');
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
        toast.success(t.patientAdded || "Bemor muvaffaqiyatli qõşildi");
      setIsAddPatientModalOpen(false);
      setPatientForm({ email: '', password: '', firstName: '', lastName: '', phone: '', region: '', district: '', height: '', weight: '', diabetesType: '2-toifa', dateOfBirth: '' });
      loadUsers(search, role);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xato yuz berdi');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: <SpaceDashboardOutlinedIcon fontSize="small" /> },
    { id: 'users', label: t.users, icon: <PeopleAltOutlinedIcon fontSize="small" /> },
    { id: 'audit', label: t.auditLogs, icon: <HistoryIcon fontSize="small" />, hidden: user?.role !== 'superadmin' },
  ];

  const roleColor = (r: string) => (r === 'superadmin' || r === 'admin') ? 'secondary' : r === 'doctor' ? 'success' : 'primary';
  const roleLabel = (r: string) => r === 'doctor' ? (t.doctor || 'Doctor') : r === 'user' ? (t.user || 'User') : r === 'superadmin' ? 'Superadmin' : (t.admin || 'Admin');
  const fieldLabelSx = { fontWeight: 500, color: 'text.secondary', display: 'block', mb: 0.5 } as const;

  return (
    <Box>
      {/* Page header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          variant="scrollable"
          scrollButtons={false}
          onChange={(_, v) => {
            setCurrentTab(v as TabType);
            setSelectedUserId(null);
            if (v === 'audit') loadAuditLogs();
          }}
          sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 3, px: 0.5, minHeight: 44, '& .MuiTab-root': { minHeight: 44 } }}
        >
          {menuItems.filter(m => !m.hidden).map(item => (
            <Tab key={item.id} value={item.id} icon={item.icon} iconPosition="start" label={item.label} />
          ))}
        </Tabs>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
          <NotificationBell />
        </Stack>
      </Stack>

      {loading ? (
        <Grid container spacing={2}>
          {[0, 1].map(i => (
            <Grid size={{ xs: 12, sm: 6 }} key={i}>
              <Card sx={{ p: 2.5 }}><Skeleton width="40%" /><Skeleton height={48} width="30%" /></Card>
            </Grid>
          ))}
        </Grid>
      ) : (
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedUserId ? `user-${selectedUserId}` : currentTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {currentTab === 'dashboard' && !selectedUserId && (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StatTile icon={<PeopleAltOutlinedIcon />} label={t.totalUsers} value={stats?.totalUsers ?? 0} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StatTile icon={<TimelineIcon />} color="success" label={t.activeToday} value={stats?.activeToday ?? 0} />
                </Grid>
              </Grid>

              {/* Purge incomplete users button */}
              {user?.role === 'superadmin' && (
                <Card sx={{ p: 2.5, borderColor: alpha(theme.palette.error.main, 0.3) }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <IconTile color="error"><CleaningServicesOutlinedIcon /></IconTile>
                      <Box>
                        <Typography variant="subtitle2">
                          {language === 'uz' ? "Çala rõyxatdan õtganlarni õçiriş" : 'Purge incomplete accounts'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                          {language === 'uz'
                            ? "Email tasdiqlanmagan yoki profili tõliq tõldirilmagan foydalanuvçilar õçiriladi."
                            : 'Deletes users who have not verified their email or completed their profile.'}
                        </Typography>
                      </Box>
                    </Stack>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteOutlineIcon />}
                      sx={{ flexShrink: 0 }}
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
              )}
            </Stack>
          )}

          {currentTab === 'users' && !selectedUserId && (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                <TextField
                  placeholder={t.searchUsers}
                  fullWidth
                  size="small"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                    endAdornment: userLoading ? <CircularProgress size={16} /> : undefined,
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <InputLabel>{t.role}</InputLabel>
                  <Select value={role} label={t.role} onChange={e => setRole(e.target.value)}>
                    <MenuItem value="">{t.allStatuses || 'All'}</MenuItem>
                    <MenuItem value="user">{t.user}</MenuItem>
                    <MenuItem value="doctor">{t.doctor}</MenuItem>
                    <MenuItem value="admin">{t.admin}</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={() => setIsAddPatientModalOpen(true)} startIcon={<PersonAddAlt1OutlinedIcon />} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {t.addPatient || "Bemor qo'shish"}
                </Button>
              </Stack>

              <Card sx={{ overflow: 'hidden' }}>
                {users.length === 0 ? (
                  <EmptyState icon={<PeopleAltOutlinedIcon />} title={language === 'ru' ? 'Пользователи не найдены' : language === 'en' ? 'No users found' : 'Foydalanuvçilar topilmadi'} />
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t.user}</TableCell>
                          <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{t.regionLabel}</TableCell>
                          <TableCell>{t.role}</TableCell>
                          <TableCell align="right" />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map(u => (
                          <TableRow key={u._id} hover onClick={() => { if (u.role === 'superadmin' && user?.role !== 'superadmin') return; setSelectedUserId(u._id); loadSpecificUser(u._id); setUserTab('info'); }} sx={{ cursor: 'pointer' }}>
                            <TableCell>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar src={u.avatar} sx={{ width: 38, height: 38, fontSize: 14, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main' }}>{u.firstName?.[0]}{u.lastName?.[0]}</Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                  <Stack direction="row" spacing={0.75} alignItems="center">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{u.firstName} {u.lastName}</Typography>
                                    {u.isBanned && <Tooltip title="Banned"><BlockRoundedIcon sx={{ fontSize: 15, color: 'error.main' }} /></Tooltip>}
                                  </Stack>
                                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{u.email}</Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                              <Typography variant="body2" color="text.secondary">{u.region || '—'}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={roleLabel(u.role)} size="small" color={roleColor(u.role) as any} variant="outlined" sx={{ height: 24 }} />
                            </TableCell>
                            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                              <Tooltip title={language === 'uz' ? "Õçiriş" : 'Delete'}>
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); if (confirm("Delete?")) adminAPI.deleteUser(u._id).then(() => loadUsers(search, role)); }} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <ChevronRightIcon sx={{ color: 'text.disabled', verticalAlign: 'middle', ml: 0.5 }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Card>
            </Stack>
          )}

          {selectedUserId && selectedUser && (
            <Stack spacing={3}>
              <Box>
                <Button startIcon={<ArrowBackIcon />} color="inherit" onClick={() => setSelectedUserId(null)}>{t.backToList}</Button>
              </Box>

              {/* User header */}
              <Card sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                    <Avatar src={selectedUser.avatar} sx={{ width: 64, height: 64, fontSize: 22, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main' }}>{selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}</Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h5" noWrap>{selectedUser.firstName} {selectedUser.lastName}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>{selectedUser.email}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip label={roleLabel(selectedUser.role)} size="small" color={roleColor(selectedUser.role) as any} variant="outlined" />
                        <Chip
                          icon={selectedUser.isBanned ? <BlockRoundedIcon /> : <CheckCircleOutlineRoundedIcon />}
                          label={selectedUser.isBanned ? 'Banned' : 'Active'}
                          size="small"
                          color={selectedUser.isBanned ? 'error' : 'success'}
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                  </Stack>
                  <Button
                    variant="outlined"
                    color={selectedUser.isBanned ? 'success' : 'error'}
                    startIcon={selectedUser.isBanned ? <CheckCircleOutlineRoundedIcon /> : <BlockRoundedIcon />}
                    onClick={() => adminAPI.toggleBan(selectedUser._id).then(() => loadSpecificUser(selectedUser._id))}
                  >
                    {selectedUser.isBanned ? 'Unban' : 'Ban'}
                  </Button>
                </Stack>
              </Card>

              <Tabs value={userTab} onChange={(_, v) => setUserTab(v)} variant="scrollable" scrollButtons={false} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tab value="info" label="Ma'lumotlar" />
                <Tab value="manage" label="Boshqaruv" />
                <Tab value="analytics" label="Tahlillar" />
              </Tabs>

              {/* === 1. SHAXSIY MA'LUMOTLAR === */}
              {userTab === 'info' && (
                <Card sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="caption" sx={fieldLabelSx}>{t.diabetesTypeLabel}</Typography>
                      <Typography variant="subtitle2">{selectedUser.diabetesType || '—'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="caption" sx={fieldLabelSx}>{t.genderAndAge}</Typography>
                      <Typography variant="subtitle2">{t[selectedUser.gender] || selectedUser.gender || '—'} · {selectedUser.dateOfBirth ? `${new Date().getFullYear() - new Date(selectedUser.dateOfBirth).getFullYear()} yosh` : '—'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="caption" sx={fieldLabelSx}>{t.phoneNumberLabel || 'Telefon'}</Typography>
                      <Typography variant="subtitle2">{selectedUser.phone || '—'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="caption" sx={fieldLabelSx}>{t.regionLabel || 'Viloyat'}</Typography>
                      <Typography variant="subtitle2">{[selectedUser.region, selectedUser.district].filter(Boolean).join(', ') || '—'}</Typography>
                    </Grid>
                    {selectedUser.createdBy && (
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant="caption" sx={fieldLabelSx}>Qo'shgan admin</Typography>
                        <Typography variant="subtitle2">{selectedUser.createdBy.firstName} {selectedUser.createdBy.lastName}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Card>
              )}

              {/* === 2. BOSHQARUV AMALLARI === */}
              {userTab === 'manage' && (
                <SectionCard title={t.managementActions || 'Boshqaruv'} icon={<ManageAccountsOutlinedIcon />} iconColor="secondary">
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" sx={fieldLabelSx}>{t.assignDoctor}</Typography>
                      <FormControl fullWidth size="small">
                        <Select displayEmpty value={selectedUser.assignedDoctor?._id || selectedUser.assignedDoctor || ''} onChange={e => adminAPI.assignDoctor(selectedUser._id, e.target.value || null).then(() => { toast.success(t.doctorAssigned); loadSpecificUser(selectedUser._id); })}>
                          <MenuItem value=""><em>{t.assignDoctor}</em></MenuItem>
                          {availableDoctors.map(doc => <MenuItem key={doc._id} value={doc._id}>{doc.firstName} {doc.lastName}</MenuItem>)}
                        </Select>
                      </FormControl>
                      {selectedUser.assignedDoctor && (
                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 600, mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CheckCircleOutlineRoundedIcon sx={{ fontSize: 15 }} />
                          {typeof selectedUser.assignedDoctor === 'object' ? `${selectedUser.assignedDoctor.firstName} ${selectedUser.assignedDoctor.lastName}` : t.doctorAssigned}
                        </Typography>
                      )}
                    </Grid>
                    {user?.role === 'superadmin' && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" sx={fieldLabelSx}>{t.updateRoleLabel || 'Rol'}</Typography>
                        <FormControl fullWidth size="small">
                          <Select value={selectedUser.role} onChange={e => adminAPI.updateRole(selectedUser._id, e.target.value).then(() => { toast.success('Rol o\'zgartirildi'); loadSpecificUser(selectedUser._id); })}>
                            <MenuItem value="user">{t.user || 'Foydalanuvchi'}</MenuItem>
                            <MenuItem value="doctor">{t.doctor || 'Shifokor'}</MenuItem>
                            <MenuItem value="admin">{t.admin || 'Admin'}</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    {user?.role === 'superadmin' && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" sx={{ ...fieldLabelSx, color: 'error.main' }}>{t.resetPassword || 'Parolni tiklash'}</Typography>
                        <Stack direction="row" spacing={1}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Yangi parol (kamida 6 ta belgi)"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            type="text"
                            error={newPassword.length > 0 && newPassword.length < 6}
                          />
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={handleResetPassword}
                            disabled={isResettingPassword || newPassword.length < 6}
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            {isResettingPassword ? <CircularProgress size={18} color="inherit" /> : 'Yangilash'}
                          </Button>
                        </Stack>
                      </Grid>
                    )}
                  </Grid>
                </SectionCard>
              )}

              {/* === 3. GLYUKOZA VA IZOHLAR === */}
              {userTab === 'analytics' && (
                <Stack spacing={3}>
                  <Statistics customRecords={selectedUserRecords} customLanguage={language} />
                  <SectionCard title={t.administrativeNotes || 'Admin izohi'} icon={<EditNoteRoundedIcon />} iconColor="warning">
                    <TextField fullWidth multiline minRows={4} placeholder={t.notesPlaceholder} value={selectedUser.adminNotes || ''} onChange={e => setSelectedUser({ ...selectedUser, adminNotes: e.target.value })} sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button variant="contained" onClick={() => handleSaveAdminNotes(selectedUserId!, selectedUser.adminNotes)}>{t.saveNotes || 'Izohni saqlash'}</Button>
                    </Box>
                  </SectionCard>
                </Stack>
              )}
            </Stack>
          )}

          {selectedUserId && !selectedUser && (
            <Card sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Skeleton variant="circular" width={64} height={64} />
                <Box sx={{ flexGrow: 1 }}><Skeleton width="40%" /><Skeleton width="25%" /></Box>
              </Stack>
            </Card>
          )}

          {currentTab === 'audit' && user?.role === 'superadmin' && (
            <SectionCard
              title={t.auditLogs || 'Audit logs'}
              subtitle={auditTotal ? `${auditTotal}` : undefined}
              icon={<HistoryIcon />}
              noPadding
              action={<Button size="small" variant="outlined" onClick={loadAuditLogs} startIcon={auditLoading ? <CircularProgress size={14} /> : <RefreshRoundedIcon />}>Refresh</Button>}
            >
              {auditLogs.length === 0 && !auditLoading ? (
                <EmptyState compact icon={<HistoryIcon />} title={language === 'ru' ? 'Записей нет' : language === 'en' ? 'No entries' : 'Yozuvlar yõq'} />
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Admin</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Details</TableCell>
                        <TableCell align="right">Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {auditLogs.map(log => (
                        <TableRow key={log._id} hover>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}><Typography variant="body2" fontWeight={600}>{log.adminId?.firstName} {log.adminId?.lastName}</Typography></TableCell>
                          <TableCell><Chip label={log.action} size="small" variant="outlined" sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 11 }} /></TableCell>
                          <TableCell sx={{ maxWidth: 420 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', wordBreak: 'break-word' }}>
                              {log.action === 'DELETE_USER' && (
                                <>O'chirildi: <b>{log.details?.userEmail}</b> (Rol: {log.details?.userRole || 'user'}) <br /> O'chiruvchi: {log.details?.deletedByEmail} ({log.details?.deletedByRole})</>
                              )}
                              {log.action === 'PURGE_INCOMPLETE_USERS' && (
                                <>{log.details?.deleted} ta chala akkaunt o'chirildi.</>
                              )}
                              {log.action !== 'DELETE_USER' && log.action !== 'PURGE_INCOMPLETE_USERS' && (
                                JSON.stringify(log.details)
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                            <Typography variant="caption" color="text.secondary">{formatDate(log.createdAt).slice(0, 5)} {formatTime(log.createdAt)}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </SectionCard>
          )}
        </motion.div>
      </AnimatePresence>
      )}

      {/* Add Patient Modal */}
      <Dialog open={isAddPatientModalOpen} onClose={() => setIsAddPatientModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconTile size={36}><PersonAddAlt1OutlinedIcon /></IconTile>
          {t.addPatient || "Bemor qo'shish"}
        </DialogTitle>
        <form onSubmit={handleSavePatient}>
          <DialogContent>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              {/* 1. Ism va Familiya */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label={t.firstName || "Ism"} required size="small" value={patientForm.firstName} onChange={e => setPatientForm({ ...patientForm, firstName: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label={t.lastName || "Familiya"} required size="small" value={patientForm.lastName} onChange={e => setPatientForm({ ...patientForm, lastName: e.target.value })} />
              </Grid>
              {/* 2. Telefon va Tug'ilgan sana */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Telefon" required size="small" value={patientForm.phone} onChange={e => setPatientForm({ ...patientForm, phone: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t.dob || "Tug'ilgan sana"}
                  required
                  size="small"
                  type="date"
                  value={patientForm.dateOfBirth}
                  onChange={e => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: new Date().toISOString().split('T')[0] }}
                />
              </Grid>
              {/* 3. Diabet turi va Bo'y */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Diabet turi</InputLabel>
                  <Select value={patientForm.diabetesType} label="Diabet turi" onChange={e => setPatientForm({ ...patientForm, diabetesType: e.target.value })}>
                    <MenuItem value="1-toifa">1-toifa</MenuItem>
                    <MenuItem value="2-toifa">2-toifa</MenuItem>
                    <MenuItem value="Homiladorlik">Homiladorlik</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Bo'y (sm)" required size="small" type="number" value={patientForm.height} onChange={e => setPatientForm({ ...patientForm, height: e.target.value })} />
              </Grid>
              {/* 4. Vazn va Viloyat */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Vazn (kg)" required size="small" type="number" value={patientForm.weight} onChange={e => setPatientForm({ ...patientForm, weight: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label={t.region || "Viloyat"} required size="small" value={patientForm.region} onChange={e => setPatientForm({ ...patientForm, region: e.target.value })} />
              </Grid>
              {/* 5. Tuman */}
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Tuman / Shahar" required size="small" value={patientForm.district} onChange={e => setPatientForm({ ...patientForm, district: e.target.value })} />
              </Grid>
              {/* 6. Login va Parol — OXIRIDA */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ pt: 1, borderTop: 1, borderColor: 'divider', mt: 1 }}>
                  Kirish ma'lumotlari
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Login (tel raqam / email)" required size="small" value={patientForm.email} onChange={e => setPatientForm({ ...patientForm, email: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label={t.password || "Parol"} required size="small" type="password" value={patientForm.password} onChange={e => setPatientForm({ ...patientForm, password: e.target.value })} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button color="inherit" onClick={() => setIsAddPatientModalOpen(false)}>Bekor qilish</Button>
            <Button type="submit" variant="contained">{t.save || 'Saqlash'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
