import React, { useState, useEffect } from 'react';
import { productAPI, adminAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { translations } from '../utils/translations';
import { categories } from '../data/products';
import { toast, Toaster } from 'sonner';
import { format } from 'date-fns';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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
import InventoryIcon from '@mui/icons-material/Inventory';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import TimelineIcon from '@mui/icons-material/Timeline';
import SaveIcon from '@mui/icons-material/Save';

type TabType = 'dashboard' | 'users' | 'products' | 'settings';

export default function AdminPage() {
  const { user } = useAuth();
  const { language, socket } = useApp();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const t = translations[language];

  const [currentTab, setCurrentTab] = useState<TabType>(searchParams.get('tab') as TabType || 'dashboard');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserRecords, setSelectedUserRecords] = useState<any[]>([]);

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: { uz: '', ru: '', en: '' },
    category: 'vegetables',
    emoji: '🥗',
    gi: 0,
    gl: 0,
    carbs: 0,
    calories: 0,
    protein: 0,
    fats: 0,
    sugar: 0,
    fiber: 0,
    advice: { uz: '', ru: '', en: '' }
  });

  const [adminContacts, setAdminContacts] = useState({ phone: '', telegramUsername: '', deepseekApiKey: '' });
  const [savingContacts, setSavingContacts] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([loadStats(), loadUsers(), loadProducts(), loadContacts()]);
    } catch (err) { }
    finally { setLoading(false); }
  };

  const loadContacts = async () => {
    try {
      const { data } = await adminAPI.getContacts();
      if (data.success) setAdminContacts(data.contacts);
    } catch { }
  };

  const handleSaveContacts = async () => {
    setSavingContacts(true);
    try {
      const { data } = await adminAPI.updateContacts(adminContacts);
      if (data.success) {
        toast.success(t.success || 'Saqlandi');
      }
    } catch {
      toast.error(t.error || 'Xato yuz berdi');
    } finally {
      setSavingContacts(false);
    }
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

  const loadProducts = async () => {
    try {
      const { data } = await productAPI.getAll();
      setProducts(data.products || []);
    } catch { }
  };

  const loadSpecificUser = async (userId: string) => {
    try {
      const { data } = await adminAPI.getUser(userId);
      setSelectedUser(data.user);
      setSelectedUserRecords(data.records ? [...data.records].reverse() : []);
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

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) await productAPI.update(editingProduct._id, productForm);
      else await productAPI.create(productForm);
      setIsProductModalOpen(false);
      loadProducts();
      toast.success('Saqlandi');
    } catch { }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ width: '100%', mb: 10 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: isMobile ? 2 : 4 }}>
        <Box>
          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: isMobile ? 1 : 2 }}>Admin Panel</Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: isMobile ? 8 : 10 }}>System Management</Typography>
        </Box>
        <Avatar src={user?.avatar} sx={{ width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: 1.5, bgcolor: 'primary.main' }}>{user?.firstName?.[0]}</Avatar>
      </Stack>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderBottom: `1px solid ${theme.palette.divider}`, mb: 4, borderRadius: 0, bgcolor: 'transparent' }}>
        <Tabs
          value={selectedUserId ? 'user-detail' : currentTab}
          onChange={(_, val) => {
            if (val === 'user-detail') return;
            setCurrentTab(val as TabType);
            setSelectedUserId(null);
            setSelectedUser(null);
          }}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          textColor="primary"
          indicatorColor="primary"
          sx={{ '& .MuiTab-root': { fontWeight: 800, textTransform: 'uppercase', fontSize: isMobile ? 9 : 11, letterSpacing: 1.5, minHeight: isMobile ? 48 : 64 } }}
        >
          <Tab value="dashboard" label={t.dashboard || 'Dashboard'} icon={<DashboardIcon fontSize="small" />} iconPosition="start" />
          <Tab value="users" label={t.users || 'Users'} icon={<PeopleIcon fontSize="small" />} iconPosition="start" />
          <Tab value="products" label={t.products || 'Products'} icon={<InventoryIcon fontSize="small" />} iconPosition="start" />
          <Tab value="settings" label={t.settings || 'Settings'} icon={<SettingsIcon fontSize="small" />} iconPosition="start" />
          {selectedUserId && (
            <Tab
              value="user-detail"
              label={selectedUser?.firstName || 'User'}
              icon={<ArrowBackIcon fontSize="small" />}
              iconPosition="start"
              onClick={() => { setSelectedUserId(null); setSelectedUser(null); }}
            />
          )}
        </Tabs>
      </Paper>

      <Box>
        {/* Dashboard Tab */}
        {currentTab === 'dashboard' && !selectedUserId && (
          <Grid container spacing={3}>
            {[
              { icon: PeopleIcon, label: t.totalUsers || 'Total Users', val: stats?.totalUsers ?? 0, color: theme.palette.primary.main },
              { icon: TimelineIcon, label: t.activeToday || 'Active Today', val: stats?.activeToday ?? 0, color: '#10b981' },
              { icon: InventoryIcon, label: 'Total Products', val: products.length, color: '#8b5cf6' },
            ].map((s, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                <Card elevation={0}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha(s.color, 0.08), color: s.color, borderRadius: 1.5 }}>
                        <s.icon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>{s.val}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>{s.label}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}


        {/* Users Tab */}
        {currentTab === 'users' && !selectedUserId && (
          <Box sx={{ mt: isMobile ? -1 : 0 }}>
            <Stack direction={isMobile ? 'column' : 'row'} spacing={isMobile ? 1.5 : 2} sx={{ mb: isMobile ? 2 : 4 }}>
              <TextField
                placeholder={t.searchUsers}
                fullWidth={isMobile}
                size="small"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                sx={{ flexGrow: 1 }}
                InputProps={{ 
                  startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: userLoading && <CircularProgress size={16} />
                }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ flexGrow: 1, minWidth: isMobile ? 0 : 150 }}>
                  <InputLabel>{t.role}</InputLabel>
                  <Select value={role} label={t.role} onChange={e => setRole(e.target.value)}>
                    <MenuItem value="">{t.allStatuses || 'All'}</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="superadmin">SuperAdmin</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="outlined" onClick={() => { setSearch(''); setRole(''); }} sx={{ fontWeight: 800 }}>{t.refresh}</Button>
              </Box>
            </Stack>

            {!isMobile ? (
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, maxHeight: 600, overflowY: 'auto' }}>
                <Table size="medium" stickyHeader>
                  <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: 10, letterSpacing: 1 }}>{t.user || 'User'}</TableCell>
                      <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: 10, letterSpacing: 1 }}>{t.regionLabel || 'Region'}</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map(u => (
                      <TableRow
                        key={u._id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => { setSelectedUserId(u._id); loadSpecificUser(u._id); }}
                      >
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 800 }}>
                              {u.firstName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{u.firstName} {u.lastName}</Typography>
                              <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Box>
                             <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>{u.region || '—'}</Typography>
                             <Chip 
                              label={u.role.toUpperCase()} 
                              size="small" 
                              sx={{ height: 16, fontSize: 8, fontWeight: 900, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }} 
                             />
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Chip
                              label={u.isBanned ? 'BANNED' : 'ACTIVE'}
                              size="small"
                              color={u.isBanned ? 'error' : 'success'}
                              sx={{ fontWeight: 900, fontSize: 9, borderRadius: 1 }}
                            />
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("O'chirilsinmi?")) adminAPI.deleteUser(u._id).then(() => loadUsers());
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Stack spacing={2}>
                {users.map(u => (
                  <Card 
                    key={u._id} 
                    elevation={0} 
                    sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}
                    onClick={() => { setSelectedUserId(u._id); loadSpecificUser(u._id); }}
                  >
                    <CardContent sx={{ p: 2 }}>
                       <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                          <Avatar sx={{ borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 800 }}>
                            {u.firstName?.[0]}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{u.firstName} {u.lastName}</Typography>
                            <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                          </Box>
                          <Chip 
                            label={u.isBanned ? 'BANNED' : 'ACTIVE'} 
                            size="small" 
                            color={u.isBanned ? 'error' : 'success'}
                            sx={{ fontWeight: 900, fontSize: 8, borderRadius: 1 }}
                          />
                       </Stack>
                       <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                             <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: 8 }}>{t.regionLabel} • {t.role}</Typography>
                             <Typography variant="body2" sx={{ fontWeight: 800 }}>{u.region || '—'} • {u.role.toUpperCase()}</Typography>
                          </Box>
                          <IconButton
                              size="small" color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("O'chirilsinmi?")) adminAPI.deleteUser(u._id).then(() => loadUsers());
                              }}
                              sx={{ border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`, borderRadius: 1 }}
                            >
                              <DeleteIcon fontSize="small" />
                          </IconButton>
                       </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        )}

        {/* Products Tab */}
        {currentTab === 'products' && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>{t.productCatalog} ({products.length})</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ name: { uz: '', ru: '', en: '' }, category: 'vegetables', emoji: '🥗', gi: 0, gl: 0, carbs: 0, calories: 0, protein: 0, fats: 0, sugar: 0, fiber: 0, advice: { uz: '', ru: '', en: '' } });
                  setIsProductModalOpen(true);
                }}
                sx={{ fontWeight: 800 }}
              >
                {t.addProduct}
              </Button>
            </Stack>
            <Grid container spacing={2}>
              {products.map(p => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p._id}>
                  <Card elevation={0}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="start" sx={{ mb: 2 }}>
                        <Box sx={{ width: 44, height: 44, border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                          {p.emoji}
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => { setEditingProduct(p); setProductForm(p); setIsProductModalOpen(true); }}
                            sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => { if (confirm("O'chirilsinmi?")) productAPI.delete(p._id).then(() => loadProducts()); }}
                            sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{p.name?.[language] || p.name?.uz || p.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: 8, fontWeight: 800 }}>{p.category}</Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Stack direction="row" spacing={3}>
                        <Box>
                          <Typography variant="caption" sx={{ display: 'block', fontSize: 8, fontWeight: 800, color: 'text.secondary' }}>GI</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>{p.gi}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ display: 'block', fontSize: 8, fontWeight: 800, color: 'text.secondary' }}>GL</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.secondary' }}>{p.gl}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ display: 'block', fontSize: 8, fontWeight: 800, color: 'text.secondary' }}>Kcal</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 900 }}>{p.calories}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* User Detail View */}
        {selectedUserId && selectedUser && (
          <Box>
            {/* Top Profile Header Card */}
            <Card elevation={0} sx={{ mb: 2, border: `1px solid ${theme.palette.divider}` }}>
              <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Stack direction={isMobile ? 'column' : 'row'} spacing={3} alignItems={isMobile ? 'start' : 'center'}>
                  <Avatar sx={{ width: 80, height: 80, borderRadius: 3, bgcolor: 'primary.main', fontSize: 32, fontWeight: 900, boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}` }}>
                    {selectedUser.firstName?.[0]}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>{selectedUser.firstName} {selectedUser.lastName}</Typography>
                      {selectedUser.isBanned && <Chip label="BANNED" size="small" color="error" sx={{ height: 20, fontSize: 9, fontWeight: 900 }} />}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, mb: 1.5 }}>{selectedUser.email}</Typography>
                    <Stack direction="row" spacing={1}>
                       <Chip label={selectedUser.role} size="small" variant="outlined" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 10 }} />
                       <Chip label={`Joined ${format(new Date(selectedUser.createdAt), 'MMM yyyy')}`} size="small" sx={{ fontWeight: 800, fontSize: 10, bgcolor: alpha(theme.palette.divider, 0.5) }} />
                    </Stack>
                  </Box>
                  <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ width: isMobile ? '100%' : 'auto' }}>
                     <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Update Role</InputLabel>
                        <Select
                          value={selectedUser.role} label="Update Role"
                          onChange={e => adminAPI.updateRole(selectedUser._id, e.target.value as string).then(() => loadSpecificUser(selectedUser._id))}
                          sx={{ fontWeight: 800, fontSize: 13 }}
                        >
                          <MenuItem value="user">User</MenuItem>
                          <MenuItem value="doctor">Doctor</MenuItem>
                          <MenuItem value="superadmin">SuperAdmin</MenuItem>
                        </Select>
                     </FormControl>
                     <Button 
                       variant="outlined" 
                       color={selectedUser.isBanned ? 'success' : 'warning'} 
                       onClick={() => adminAPI.toggleBan(selectedUser._id).then(() => loadSpecificUser(selectedUser._id))}
                       sx={{ fontWeight: 800, minWidth: 100 }}
                     >
                       {selectedUser.isBanned ? 'Unban' : 'Ban'}
                     </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Grid container spacing={3}>
              {/* Detailed Personal & Medical Info */}
              <Grid size={{ xs: 12, lg: 8 }}>
                 <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 3 }}>
                    <Box sx={{ p: 2, px: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>Full User Profile</Typography>
                    </Box>
                    <CardContent sx={{ p: 4 }}>
                       <Grid container spacing={4}>
                          {/* Medical Section */}
                          <Grid size={{ xs: 12, md: 4 }}>
                             <Typography variant="overline" sx={{ fontWeight: 900, color: 'primary.main', display: 'block', mb: 2, letterSpacing: 1 }}>{t.medicalStatus}</Typography>
                             <Stack spacing={2.5}>
                                <Box>
                                   <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>{t.diabetesTypeLabel}</Typography>
                                   <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>{selectedUser.diabetesType?.toUpperCase() || '—'}</Typography>
                                </Box>
                                <Box>
                                   <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>{t.genderAndAge}</Typography>
                                   <Typography variant="body2" sx={{ fontWeight: 900 }}>
                                      {selectedUser.gender === 'male' ? (language === 'uz' ? 'Erkak' : language === 'ru' ? 'Мужчина' : 'Male') : selectedUser.gender === 'female' ? (language === 'uz' ? 'Ayol' : language === 'ru' ? 'Женщина' : 'Female') : '—'}
                                      {selectedUser.dateOfBirth && ` • ${new Date().getFullYear() - new Date(selectedUser.dateOfBirth).getFullYear()} ${language === 'uz' ? 'yosh' : language === 'ru' ? 'лет' : 'years'}`}
                                   </Typography>
                                </Box>
                                <Box>
                                   <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>{t.doctorNameLabel}</Typography>
                                   <Typography variant="body2" sx={{ fontWeight: 900 }}>{selectedUser.doctorName || '—'}</Typography>
                                </Box>
                             </Stack>
                          </Grid>

                          {/* Location Section */}
                          <Grid size={{ xs: 12, md: 4 }}>
                             <Typography variant="overline" sx={{ fontWeight: 900, color: 'primary.main', display: 'block', mb: 2, letterSpacing: 1 }}>{t.locationDetails}</Typography>
                             <Stack spacing={2.5}>
                                <Box>
                                   <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>{t.regionLabel}</Typography>
                                   <Typography variant="body2" sx={{ fontWeight: 900 }}>{selectedUser.region || '—'}</Typography>
                                </Box>
                                <Box>
                                   <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>{t.districtLabel}</Typography>
                                   <Typography variant="body2" sx={{ fontWeight: 900 }}>{selectedUser.district || '—'}</Typography>
                                </Box>
                                <Box>
                                   <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>{t.mfyLabel}</Typography>
                                   <Typography variant="body2" sx={{ fontWeight: 900 }}>{selectedUser.mfy || '—'}</Typography>
                                </Box>
                             </Stack>
                          </Grid>

                          {/* Contact Section */}
                          <Grid size={{ xs: 12, md: 4 }}>
                             <Typography variant="overline" sx={{ fontWeight: 900, color: 'primary.main', display: 'block', mb: 2, letterSpacing: 1 }}>{t.contactInfo}</Typography>
                             <Stack spacing={2.5}>
                                <Box>
                                   <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>{t.phoneNumberLabel}</Typography>
                                   <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>{selectedUser.phone || '—'}</Typography>
                                </Box>
                                <Box>
                                   <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>{t.telegramLabel}</Typography>
                                   <Typography variant="body2" sx={{ fontWeight: 900, color: 'info.main' }}>
                                      {selectedUser.telegramUsername ? (
                                        <a href={selectedUser.telegramUsername.startsWith('@') ? `https://t.me/${selectedUser.telegramUsername.substring(1)}` : selectedUser.telegramUsername} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                          {selectedUser.telegramUsername}
                                        </a>
                                      ) : '—'}
                                   </Typography>
                                </Box>
                             </Stack>
                          </Grid>
                       </Grid>
                    </CardContent>
                 </Card>

                 {/* Glucose Analytics Section */}
                 <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ p: 2, px: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>{t.glucoseAnalytics}</Typography>
                    </Box>
                    <CardContent sx={{ p: 4 }}>
                      {selectedUserRecords.length > 0 ? (
                        <Grid container spacing={4}>
                          <Grid size={{ xs: 12, lg: 6 }}>
                             <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', display: 'block', mb: 2 }}>{t.fastingChart}</Typography>
                             <Box sx={{ height: 260, width: '100%' }}>
                                <ResponsiveContainer width="100%" height={260}>
                                  <AreaChart data={selectedUserRecords.map(r => ({ date: format(new Date(r.date), 'dd/MM HH:mm'), fasting: r.fastingLevel ?? (r.category === 'fasting' ? r.level : 0) ?? 0 })).reverse()}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: theme.palette.text.secondary }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: theme.palette.text.secondary }} />
                                    <Tooltip contentStyle={{ borderRadius: 8, border: `none`, backgroundColor: theme.palette.background.paper, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                    <Area type="monotone" dataKey="fasting" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.1} strokeWidth={3} connectNulls={true} />
                                  </AreaChart>
                                </ResponsiveContainer>
                             </Box>
                          </Grid>
                          <Grid size={{ xs: 12, lg: 6 }}>
                             <Typography variant="overline" sx={{ fontWeight: 800, color: 'secondary.main', display: 'block', mb: 2 }}>{t.postMealChart}</Typography>
                             <Box sx={{ height: 260, width: '100%' }}>
                                <ResponsiveContainer width="100%" height={260}>
                                  <AreaChart data={selectedUserRecords.filter(r => r.postMealLevel != null || (r.category === 'post-meal' && r.level != null)).map(r => ({ date: format(new Date(r.date), 'dd/MM HH:mm'), postMeal: r.postMealLevel ?? (r.category === 'post-meal' ? r.level : null) ?? null })).reverse()}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: theme.palette.text.secondary }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: theme.palette.text.secondary }} />
                                    <Tooltip contentStyle={{ borderRadius: 8, border: `none`, backgroundColor: theme.palette.background.paper, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                    <Area type="monotone" dataKey="postMeal" stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} fillOpacity={0.1} strokeWidth={3} connectNulls={true} />
                                  </AreaChart>
                                </ResponsiveContainer>
                             </Box>
                          </Grid>
                        </Grid>
                      ) : (
                        <Box sx={{ py: 6, textAlign: 'center', opacity: 0.3 }}>
                          <TimelineIcon sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="caption" sx={{ display: 'block', fontWeight: 800 }}>{t.noRecords}</Typography>
                        </Box>
                      )}
                    </CardContent>
                 </Card>
              </Grid>

              {/* Administrative Section */}
              <Grid size={{ xs: 12, lg: 4 }}>
                 <Stack spacing={3}>
                    {/* Admin Notes */}
                    <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                       <Box sx={{ p: 2, px: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.warning.main, 0.02) }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>{t.administrativeNotes}</Typography>
                       </Box>
                       <CardContent sx={{ p: 3 }}>
                          <TextField 
                            fullWidth multiline rows={6} 
                            placeholder={t.notesPlaceholder} 
                            value={selectedUser.adminNotes || ''} 
                            onChange={e => setSelectedUser({...selectedUser, adminNotes: e.target.value})}
                            sx={{ mb: 2, '& .MuiOutlinedInput-root': { fontWeight: 600, fontSize: 13 } }}
                          />
                          <Button 
                            fullWidth variant="contained" 
                            color="primary" startIcon={<SaveIcon />}
                            onClick={() => handleSaveAdminNotes(selectedUser._id, selectedUser.adminNotes)}
                            sx={{ fontWeight: 900 }}
                          >
                            {t.saveNotes}
                          </Button>
                       </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`, bgcolor: alpha(theme.palette.error.main, 0.01) }}>
                       <Box sx={{ p: 2, px: 3, borderBottom: `1px solid ${alpha(theme.palette.error.main, 0.1)}` }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: 'error.main', textTransform: 'uppercase', letterSpacing: 1.5 }}>{t.dangerZone}</Typography>
                       </Box>
                       <CardContent sx={{ p: 3 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 2 }}>{t.deleteWarning}</Typography>
                          <Button 
                            fullWidth variant="outlined" color="error" startIcon={<DeleteIcon />}
                            onClick={() => { if (confirm(t.deleteWarning)) adminAPI.deleteUser(selectedUser._id).then(() => { setCurrentTab('users'); setSelectedUserId(null); loadUsers(); }); }}
                            sx={{ fontWeight: 900 }}
                          >
                            {t.deleteAccountLabel}
                          </Button>
                       </CardContent>
                    </Card>
                 </Stack>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Settings Tab */}
        {currentTab === 'settings' && (
          <Box maxWidth="sm">
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, textTransform: 'uppercase' }}>System Settings</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 4 }}>
              Super Admin aloqa ma'lumotlarini boshqaring
            </Typography>

            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={4}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', mb: 1, display: 'block' }}>PHONE NUMBER</Typography>
                    <TextField
                      fullWidth
                      placeholder="+998 90 123 45 67"
                      value={adminContacts.phone}
                      onChange={e => setAdminContacts({ ...adminContacts, phone: e.target.value })}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', mb: 1, display: 'block' }}>TELEGRAM USERNAME / LINK</Typography>
                    <TextField
                      fullWidth
                      placeholder="@username yoki t.me/link"
                      value={adminContacts.telegramUsername}
                      onChange={e => setAdminContacts({ ...adminContacts, telegramUsername: e.target.value })}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    disabled={savingContacts}
                    onClick={handleSaveContacts}
                    startIcon={savingContacts ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    sx={{ fontWeight: 900, height: 54, borderRadius: 1.5, mt: 2 }}
                  >
                    {savingContacts ? 'SAVING...' : 'SAVE CHANGES'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      {/* Product Add/Edit Modal */}
      <Dialog
        open={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        fullWidth
        maxWidth="md"
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 2 } }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <form onSubmit={handleSaveProduct}>
          <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              {/* Left Column - Basic Info */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2}>
                  <TextField size="small" label={`${t.firstName} (UZ)`} value={productForm.name.uz} onChange={e => setProductForm({ ...productForm, name: { ...productForm.name, uz: e.target.value } })} required />
                  <TextField size="small" label={`${t.firstName} (RU)`} value={productForm.name.ru} onChange={e => setProductForm({ ...productForm, name: { ...productForm.name, ru: e.target.value } })} required />
                  <TextField size="small" label={`${t.firstName} (EN)`} value={productForm.name.en} onChange={e => setProductForm({ ...productForm, name: { ...productForm.name, en: e.target.value } })} />
                  <TextField size="small" label="Emoji" value={productForm.emoji} onChange={e => setProductForm({ ...productForm, emoji: e.target.value })} sx={{ width: 100 }} />
                  <FormControl size="small" fullWidth>
                    <InputLabel>{t.category}</InputLabel>
                    <Select value={productForm.category} label={t.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                      {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.emoji} {t[c.id] || c.id}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField size="small" multiline rows={3} label={`${t.advice} (UZ)`} value={productForm.advice.uz} onChange={e => setProductForm({ ...productForm, advice: { ...productForm.advice, uz: e.target.value } })} />
                  <TextField size="small" multiline rows={3} label={`${t.advice} (RU)`} value={productForm.advice.ru} onChange={e => setProductForm({ ...productForm, advice: { ...productForm.advice, ru: e.target.value } })} />
                </Stack>
              </Grid>

              {/* Right Column - Nutrition */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2}>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase' }}>{t.nutritionalData}</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label={t.giIndex} value={productForm.gi} onChange={e => setProductForm({ ...productForm, gi: Number(e.target.value) })} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label={t.glLoad} value={productForm.gl} onChange={e => setProductForm({ ...productForm, gl: Number(e.target.value) })} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label={t.caloriesLabel} value={productForm.calories} onChange={e => setProductForm({ ...productForm, calories: Number(e.target.value) })} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label={t.carbsLabel} value={productForm.carbs} onChange={e => setProductForm({ ...productForm, carbs: Number(e.target.value) })} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label={t.proteinLabel} value={productForm.protein} onChange={e => setProductForm({ ...productForm, protein: Number(e.target.value) })} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label={t.fatsLabel} value={productForm.fats} onChange={e => setProductForm({ ...productForm, fats: Number(e.target.value) })} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label={t.sugarLabel} value={productForm.sugar} onChange={e => setProductForm({ ...productForm, sugar: Number(e.target.value) })} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label={t.fiberLabel} value={productForm.fiber} onChange={e => setProductForm({ ...productForm, fiber: Number(e.target.value) })} />
                    </Grid>
                  </Grid>
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={() => setIsProductModalOpen(false)} sx={{ fontWeight: 800 }}>{t.reminderCancel}</Button>
            <Button type="submit" variant="contained" sx={{ fontWeight: 800, px: 4 }}>{t.save}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Toaster position="top-right" richColors />
    </Box>
  );
}
