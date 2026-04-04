import React, { useState, useEffect } from 'react';
import { productAPI, adminAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import ForumIcon from '@mui/icons-material/Forum';
import SendIcon from '@mui/icons-material/Send';
import BlockIcon from '@mui/icons-material/Block';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import TimelineIcon from '@mui/icons-material/Timeline';
import SaveIcon from '@mui/icons-material/Save';

type TabType = 'dashboard' | 'users' | 'products' | 'settings';

export default function AdminPage() {
  const { user } = useAuth();
  const { language, socket } = useApp();
  const t = translations[language];
  const theme = useTheme();
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserRecords, setSelectedUserRecords] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedUser?.supportMessages]);


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

  // Support Notifications
  const [supportUsers, setSupportUsers] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (socket) {
      const handleAdminMessage = (data: any) => {
        loadStats();
        loadSupportNotifications();
        
        // If we are currently looking at THIS user, inject message instantly
        const targetUserId = data?.userId || data?.message?.userId;
        if (selectedUser && targetUserId === selectedUser._id) {
          const newMsg = data.message || (data.sender ? data : null);
          if (newMsg) {
            setSelectedUser((prev: any) => {
              if (!prev || prev._id !== targetUserId) return prev;
              const msgs = prev.supportMessages || [];
              if (msgs.some((m: any) => m.text === newMsg.text && Math.abs(new Date(m.createdAt).getTime() - new Date(newMsg.createdAt).getTime()) < 2000)) {
                return prev;
              }
              return { ...prev, supportMessages: [...msgs, newMsg] };
            });
          }
        }
      };
      
      socket.on('new-message', handleAdminMessage);
      socket.on('admin-new-message', handleAdminMessage);
      socket.on('admin-message-all', handleAdminMessage);
      
      return () => { 
        socket.off('new-message', handleAdminMessage); 
        socket.off('admin-new-message', handleAdminMessage);
        socket.off('admin-message-all', handleAdminMessage);
      };
    }
  }, [socket, selectedUser?._id]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([loadStats(), loadUsers(), loadSupportNotifications(), loadProducts(), loadContacts()]);
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

  const loadSupportNotifications = async () => {
    try {
      const { data } = await adminAPI.getUsers({ limit: 100 });
      const withUnread = data.users.filter((u: any) => u.supportMessages?.some((m: any) => !m.isReadByAdmin));
      setSupportUsers(withUnread);
    } catch { }
  };

  const loadSpecificUser = async (userId: string) => {
    try {
      await adminAPI.markMessagesAsRead(userId).catch(() => {});
      const { data } = await adminAPI.getUser(userId);
      setSelectedUser(data.user);
      setSelectedUserRecords(data.records ? [...data.records].reverse() : []);
      loadSupportNotifications();
      loadStats();
    } catch { }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      const { data } = await adminAPI.replyToUser(selectedUser._id, replyText);
      if (data.success) {
        setSelectedUser(data.user);
        setReplyText('');
        toast.success('Javob yuborildi');
      }
    } catch { }
    finally { setSendingReply(false); }
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>Admin Panel</Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>System Management</Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton
            onClick={() => setIsNotificationsOpen(true)}
            sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, p: 1.5, color: supportUsers.length > 0 ? 'primary.main' : 'inherit' }}
          >
            <Badge badgeContent={supportUsers.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Avatar src={user?.avatar} sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: 'primary.main' }}>{user?.firstName?.[0]}</Avatar>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderBottom: `1px solid ${theme.palette.divider}`, mb: 4, borderRadius: 0, bgcolor: 'transparent' }}>
        <Tabs
          value={selectedUserId ? 'user-detail' : currentTab}
          onChange={(_, val) => {
            if (val === 'user-detail') return;
            setCurrentTab(val);
            setSelectedUserId(null);
            setSelectedUser(null);
          }}
          textColor="primary"
          indicatorColor="primary"
          sx={{ '& .MuiTab-root': { fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.5, minHeight: 64 } }}
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
              { icon: ForumIcon, label: 'Unread Support', val: supportUsers.length, color: '#f59e0b' },
              { icon: InventoryIcon, label: 'Total Products', val: products.length, color: '#8b5cf6' },
            ].map((s, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
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

            <Grid size={{ xs: 12 }}>
              <Card elevation={0}>
                <Box sx={{ p: 2.5, px: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>User Activity (Last 7 Days)</Typography>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={[{n:'Mon',v:20},{n:'Tue',v:45},{n:'Wed',v:35},{n:'Thu',v:70},{n:'Fri',v:55},{n:'Sat',v:90},{n:'Sun',v:85}]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                      <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: theme.palette.text.secondary }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: theme.palette.text.secondary }} />
                      <Tooltip contentStyle={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }} />
                      <Area type="monotone" dataKey="v" stroke={theme.palette.primary.main} strokeWidth={2.5} fill={alpha(theme.palette.primary.main, 0.05)} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Users Tab */}
        {currentTab === 'users' && !selectedUserId && (
          <Box>
            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
              <TextField
                placeholder="Search users..."
                size="small"
                value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ flexGrow: 1 }}
                InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Role</InputLabel>
                <Select value={role} label="Role" onChange={e => { setRole(e.target.value); loadUsers(search, e.target.value); }}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="superadmin">SuperAdmin</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" onClick={() => loadUsers(search, role)} sx={{ fontWeight: 800 }}>Apply</Button>
              <Button variant="outlined" onClick={() => { setSearch(''); setRole(''); loadUsers('', ''); }} sx={{ fontWeight: 800 }}>Refresh</Button>
            </Stack>

            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, maxHeight: 600, overflowY: 'auto' }}>
              <Table size="medium" stickyHeader>
                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: 10, letterSpacing: 1 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: 10, letterSpacing: 1 }}>Region</TableCell>
                    <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: 10, letterSpacing: 1 }}>Role</TableCell>
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
                      <TableCell><Typography variant="caption" sx={{ fontWeight: 800 }}>{u.region || '—'}</Typography></TableCell>
                      <TableCell>
                        <Chip
                          label={u.role}
                          size="small"
                          color={u.role === 'superadmin' ? 'error' : 'default'}
                          sx={{ fontWeight: 900, fontSize: 9, borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell align="right">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Products Tab */}
        {currentTab === 'products' && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>Product Catalog ({products.length})</Typography>
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
                Add Product
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
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card elevation={0} sx={{ mb: 4 }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 4 }}>
                    <Avatar sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: 'primary.main', fontSize: 24, fontWeight: 900 }}>
                      {selectedUser.firstName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>{selectedUser.firstName} {selectedUser.lastName}</Typography>
                      <Typography variant="body2" color="text.secondary">{selectedUser.email}</Typography>
                    </Box>
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 8, color: 'text.secondary' }}>Region</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{selectedUser.region || '—'}</Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 8, color: 'text.secondary' }}>Type</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{selectedUser.diabetesType || '—'}</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Support Chat */}
              <Card elevation={0}>
                <Box sx={{ p: 2, px: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 900 }}>SUPPORT CHAT</Typography>
                  {selectedUser.supportMessages?.some((m: any) => !m.isReadByAdmin) && (
                    <Button size="small" onClick={() => adminAPI.markMessagesAsRead(selectedUser._id).then(() => loadStats())}>
                      Mark as Read
                    </Button>
                  )}
                </Box>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ height: 400, overflowY: 'auto', p: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                    {selectedUser.supportMessages?.map((msg: any, idx: number) => {
                      const isAdmin = msg.sender === 'admin';
                      return (
                        <Box key={idx} sx={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start', mb: 2 }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.5, px: 2, borderRadius: 1.5, maxWidth: '80%',
                              bgcolor: isAdmin ? 'text.primary' : 'background.paper',
                              color: isAdmin ? 'background.paper' : 'text.primary',
                              border: isAdmin ? 'none' : `1px solid ${theme.palette.divider}`
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{msg.text}</Typography>
                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7, textAlign: 'right', fontSize: 10, fontWeight: 700 }}>
                              {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : ''}
                            </Typography>
                          </Paper>
                        </Box>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </Box>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <Stack direction="row" spacing={1}>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        maxRows={3}
                        placeholder="Type a response..."
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                      />
                      <Button variant="contained" disabled={sendingReply || !replyText.trim()} onClick={handleReply} sx={{ px: 3 }}>
                        <SendIcon fontSize="small" />
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Card elevation={0} sx={{ mb: 4 }}>
                <Box sx={{ p: 2, px: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="caption" sx={{ fontWeight: 900 }}>USER ACTIONS</Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <FormControl fullWidth size="small" sx={{ mb: 4 }}>
                    <InputLabel>Update Role</InputLabel>
                    <Select
                      value={selectedUser.role}
                      label="Update Role"
                      onChange={e => adminAPI.updateRole(selectedUser._id, e.target.value).then(() => loadSpecificUser(selectedUser._id))}
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="doctor">Doctor</MenuItem>
                      <MenuItem value="superadmin">SuperAdmin</MenuItem>
                    </Select>
                  </FormControl>
                  <Stack direction="row" spacing={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color={selectedUser.isBanned ? 'success' : 'warning'}
                      startIcon={<BlockIcon />}
                      onClick={() => adminAPI.toggleBan(selectedUser._id).then(() => loadSpecificUser(selectedUser._id))}
                    >
                      {selectedUser.isBanned ? 'Unban' : 'Ban User'}
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        if (confirm("Butkul o'chirilsinmi?"))
                          adminAPI.deleteUser(selectedUser._id).then(() => {
                            setCurrentTab('users');
                            setSelectedUserId(null);
                            setSelectedUser(null);
                            loadUsers();
                          });
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Full-width Glucose Analytics */}
            <Grid size={{ xs: 12 }}>
              <Card elevation={0}>
                <Box sx={{ p: 2, px: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="caption" sx={{ fontWeight: 900 }}>GLUCOSE ANALYTICS</Typography>
                </Box>
                <CardContent sx={{ p: 4, pt: 4 }}>
                  {selectedUserRecords.length > 0 ? (
                    <Grid container spacing={4}>
                      {/* Fasting Chart */}
                      <Grid size={{ xs: 12, lg: 6 }}>
                        <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', display: 'block', mb: 2, letterSpacing: 1.5 }}>
                          Och qoringa (Real vaqt grafik)
                        </Typography>
                        <Box sx={{ height: 260, width: '100%' }}>
                          <ResponsiveContainer width="100%" height={260}>
                            <AreaChart 
                              data={selectedUserRecords.map(r => {
                                const parsed = new Date(r.date);
                                const t = r.createdAt ? new Date(r.createdAt) : parsed;
                                return {
                                  date: `${parsed.toLocaleDateString('uz', { month: 'short', day: 'numeric' })} • ${t.toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}`,
                                  fasting: r.fastingLevel ?? (r.category === 'fasting' ? r.level : 0) ?? 0
                                };
                              }).reverse()}
                              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: theme.palette.text.secondary }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: theme.palette.text.secondary }} />
                              <Tooltip contentStyle={{ borderRadius: 8, border: `none`, backgroundColor: theme.palette.background.paper, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} labelStyle={{ fontWeight: 900, marginBottom: 8, fontSize: 11 }} />
                              <Area type="monotone" dataKey="fasting" name="Och qoringa" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.1} strokeWidth={3} connectNulls={true} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </Box>
                      </Grid>

                      {/* Post Meal Chart */}
                      <Grid size={{ xs: 12, lg: 6 }}>
                        <Typography variant="overline" sx={{ fontWeight: 800, color: 'secondary.main', display: 'block', mb: 2, letterSpacing: 1.5 }}>
                          Ovqatdan keyin (Real vaqt grafik)
                        </Typography>
                        <Box sx={{ height: 260, width: '100%' }}>
                          <ResponsiveContainer width="100%" height={260}>
                            <AreaChart 
                              data={selectedUserRecords
                                .filter(r => r.postMealLevel != null || (r.category === 'post-meal' && r.level != null))
                                .map(r => {
                                  const parsed = new Date(r.date);
                                  const t = r.createdAt ? new Date(r.createdAt) : parsed;
                                  return {
                                    date: `${parsed.toLocaleDateString('uz', { month: 'short', day: 'numeric' })} • ${t.toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}`,
                                    postMeal: r.postMealLevel ?? (r.category === 'post-meal' ? r.level : null) ?? null
                                  };
                                }).reverse()}
                              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: theme.palette.text.secondary }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: theme.palette.text.secondary }} />
                              <Tooltip contentStyle={{ borderRadius: 8, border: `none`, backgroundColor: theme.palette.background.paper, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} labelStyle={{ fontWeight: 900, marginBottom: 8, fontSize: 11 }} />
                              <Area type="monotone" dataKey="postMeal" name="Ovqatdan keyin" stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} fillOpacity={0.1} strokeWidth={3} connectNulls={true} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <Box sx={{ py: 6, textAlign: 'center', opacity: 0.3 }}>
                      <TimelineIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 800 }}>No record data</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
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
                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', mb: 1, display: 'block' }}>DEEPSEEK AI API KEY</Typography>
                    <TextField
                      fullWidth
                      type="password"
                      placeholder="sk-..."
                      value={adminContacts.deepseekApiKey}
                      onChange={e => setAdminContacts({ ...adminContacts, deepseekApiKey: e.target.value })}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Get your key from <a href="https://api.deepseek.com" target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>api.deepseek.com</a>
                    </Typography>
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

      {/* Notifications Dialog */}
      <Dialog
        open={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 2, position: 'fixed', right: 20, top: 80, m: 0, height: 500 } }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>MESSAGES</Typography>
          <IconButton size="small" onClick={() => setIsNotificationsOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List>
            {supportUsers.map(u => (
              <ListItem disablePadding key={u._id}>
                <ListItemButton
                  onClick={() => {
                    setSelectedUserId(u._id);
                    loadSpecificUser(u._id);
                    setCurrentTab('users');
                    setIsNotificationsOpen(false);
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                    <Avatar sx={{ borderRadius: 1.5, bgcolor: 'primary.main' }}>{u.firstName?.[0]}</Avatar>
                    <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{u.firstName}</Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontStyle: 'italic' }}
                      >
                        {u.supportMessages?.find((m: any) => !m.isReadByAdmin)?.text}
                      </Typography>
                    </Box>
                  </Stack>
                </ListItemButton>
              </ListItem>
            ))}
            {supportUsers.length === 0 && (
              <Box sx={{ py: 10, textAlign: 'center', opacity: 0.3 }}>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>NO MESSAGES</Typography>
              </Box>
            )}
          </List>
        </DialogContent>
      </Dialog>

      {/* Product Add/Edit Modal */}
      <Dialog
        open={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 2 } }}
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
                  <TextField size="small" label="Name (UZ)" value={productForm.name.uz} onChange={e => setProductForm({ ...productForm, name: { ...productForm.name, uz: e.target.value } })} required />
                  <TextField size="small" label="Name (RU)" value={productForm.name.ru} onChange={e => setProductForm({ ...productForm, name: { ...productForm.name, ru: e.target.value } })} required />
                  <TextField size="small" label="Name (EN)" value={productForm.name.en} onChange={e => setProductForm({ ...productForm, name: { ...productForm.name, en: e.target.value } })} />
                  <TextField size="small" label="Emoji" value={productForm.emoji} onChange={e => setProductForm({ ...productForm, emoji: e.target.value })} sx={{ width: 100 }} />
                  <FormControl size="small" fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select value={productForm.category} label="Category" onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                      {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.emoji} {c.id}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField size="small" multiline rows={3} label="Advice (UZ)" value={productForm.advice.uz} onChange={e => setProductForm({ ...productForm, advice: { ...productForm.advice, uz: e.target.value } })} />
                  <TextField size="small" multiline rows={3} label="Advice (RU)" value={productForm.advice.ru} onChange={e => setProductForm({ ...productForm, advice: { ...productForm.advice, ru: e.target.value } })} />
                </Stack>
              </Grid>

              {/* Right Column - Nutrition */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2}>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase' }}>Nutritional Data</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label="GI Index" value={productForm.gi} onChange={e => setProductForm({ ...productForm, gi: Number(e.target.value) })} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label="GL Load" value={productForm.gl} onChange={e => setProductForm({ ...productForm, gl: Number(e.target.value) })} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label="Calories (kcal)" value={productForm.calories} onChange={e => setProductForm({ ...productForm, calories: Number(e.target.value) })} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label="Carbs (g)" value={productForm.carbs} onChange={e => setProductForm({ ...productForm, carbs: Number(e.target.value) })} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label="Protein (g)" value={productForm.protein} onChange={e => setProductForm({ ...productForm, protein: Number(e.target.value) })} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label="Fats (g)" value={productForm.fats} onChange={e => setProductForm({ ...productForm, fats: Number(e.target.value) })} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label="Sugar (g)" value={productForm.sugar} onChange={e => setProductForm({ ...productForm, sugar: Number(e.target.value) })} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label="Fiber (g)" value={productForm.fiber} onChange={e => setProductForm({ ...productForm, fiber: Number(e.target.value) })} />
                    </Grid>
                  </Grid>
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save Product</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Toaster position="top-right" richColors />
    </Box>
  );
}
