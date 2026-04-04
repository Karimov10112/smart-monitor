import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link as RouterLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useApp } from './contexts/AppContext';
import { translations } from './utils/translations';

// MUI Components
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Divider,
  Button as MuiButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Paper,
  Stack,
  useTheme,
  alpha,
  useMediaQuery,
  CircularProgress,
  Link
} from '@mui/material';

// MUI Icons
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import LanguageIcon from '@mui/icons-material/Language';
import StorageIcon from '@mui/icons-material/Storage';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CallIcon from '@mui/icons-material/Call';
import TelegramIcon from '@mui/icons-material/Telegram';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

// Components
import { DailyJournal } from './components/DailyJournal';
import { Products } from './components/Products';
import { Statistics } from './components/Statistics';
import { ReminderModal } from './components/ReminderModal';
import { reminderAPI, adminAPI, authAPI } from './utils/api';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import AdminPage from './pages/AdminPage';
import DoctorPage from './pages/DoctorPage';

import { Toaster, toast } from 'sonner';

const SIDEBAR_WIDTH = 300;

function App() {
  const { user, isAuthenticated, logout, loading, updateUser } = useAuth();
  const { language, setLanguage, socket, isDarkMode, toggleDarkMode } = useApp();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const t = translations[language] || translations['uz'];
  const navigate = useNavigate();

  const getT = (key: keyof typeof translations['uz']) => t[key] || (translations['uz'] as any)[key] || key;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);
  const [adminContacts, setAdminContacts] = useState({ phone: '', telegramUsername: '' });
  const location = useLocation();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: contactsData } = await adminAPI.getAdminContacts();
        setAdminContacts(contactsData.contacts);
        
        const { data: remData } = await reminderAPI.getReminders();
        setReminders(remData.reminders);
      } catch (err) {}
    };
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user && !user.isProfileComplete && location.pathname !== '/complete-profile') {
      const timer = setTimeout(() => {
        navigate('/complete-profile');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  const loadReminders = async () => {
    try {
      const { data } = await reminderAPI.getAll();
      setReminders(data.reminders || []);
    } catch { }
  };

  const loadAdminStats = async () => {
    if (user?.role === 'superadmin') {
      try {
        const { data } = await adminAPI.getStats();
        setAdminUnreadCount(data.stats.unreadSupportMessages || 0);
      } catch { }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadReminders();
      adminAPI.getContacts().then(res => {
        if (res.data?.success) setAdminContacts(res.data.contacts);
      }).catch(() => {});
      if (user?.role === 'superadmin') loadAdminStats();
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    if (!isAuthenticated || reminders.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      reminders.forEach(r => {
        if (r.isActive && r.time === currentTime) {
          const sound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          sound.play().catch(() => { });

          toast(t.reminderTriggered || 'Eslatma!', {
            description: `${r.name} - ${r.dose}`,
            duration: 10000,
            icon: r.type === 'insulin' ? '💉' : '💊',
          });
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    checkReminders();
    return () => clearInterval(interval);
  }, [isAuthenticated, reminders, t.reminderTriggered]);

  const openReminders = () => {
    setIsSidebarOpen(false);
    setIsReminderModalOpen(true);
  };

  // socket is already destructured above from useApp()

  useEffect(() => {
    if (isAuthenticated && socket) {
      const handleGlobalSync = () => {
        if (user?.role === 'superadmin') loadAdminStats();
      };
      
      socket.on('support-messages-read-by-user', handleGlobalSync);
      return () => {
        socket.off('support-messages-read-by-user', handleGlobalSync);
      };
    }
  }, [isAuthenticated, socket, user?.role]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </Box>
    );
  }

  const activeTab = searchParams.get('tab') || 'journal';

  const handleSaveContacts = async () => {
    setContactSaving(true);
    try {
      await adminAPI.updateContacts(adminContacts);
      toast.success(t.success || 'Muvaffaqiyatli saqlandi');
    } catch {
      toast.error(t.error || 'Xato yuz berdi');
    } finally {
      setContactSaving(false);
    }
  };

  const SidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      {/* Brand */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, px: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            background: theme.palette.primary.main,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}
        >
          <StorageIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1 }}>{t.appName || 'Qand Nazorati'}</Typography>
          <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1.5, color: 'text.secondary', fontSize: 8 }}>Professional Monitor</Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Navigation */}
      <List sx={{ flexGrow: 1, px: 0 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            component={RouterLink}
            to="/?tab=journal"
            selected={activeTab === 'journal'}
            onClick={() => setIsSidebarOpen(false)}
            sx={{
              borderRadius: 1.5,
              py: 1,
              '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) }, '& .MuiListItemIcon-root': { color: 'primary.main' } }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}><AssignmentIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={getT('dailyJournal')} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.875rem' }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            component={RouterLink}
            to="/?tab=products"
            selected={activeTab === 'products'}
            onClick={() => setIsSidebarOpen(false)}
            sx={{
              borderRadius: 1.5,
              py: 1,
              '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) }, '& .MuiListItemIcon-root': { color: 'primary.main' } }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}><StorageIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={getT('products')} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.875rem' }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            component={RouterLink}
            to="/?tab=stats"
            selected={activeTab === 'stats'}
            onClick={() => setIsSidebarOpen(false)}
            sx={{
              borderRadius: 1.5,
              py: 1,
              '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) }, '& .MuiListItemIcon-root': { color: 'primary.main' } }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}><BarChartIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={getT('statistics')} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.875rem' }} />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 2, opacity: 0.5 }} />

        <Typography variant="overline" sx={{ px: 1.5, fontWeight: 800, color: 'text.secondary', letterSpacing: 1.5, fontSize: 10 }}>{t.systemPanel}</Typography>
        
        {user?.role === 'superadmin' && (
          <ListItem disablePadding sx={{ mt: 0.5 }}>
            <ListItemButton
              onClick={() => { navigate('/admin'); setIsSidebarOpen(false); }}
              selected={location.pathname === '/admin'}
              sx={{ borderRadius: 1.5, py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={getT('adminPanel')} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.875rem' }} />
              {adminUnreadCount > 0 && <Badge badgeContent={adminUnreadCount} color="error" sx={{ ml: 2 }} />}
            </ListItemButton>
          </ListItem>
        )}

        {user?.role === 'doctor' && (
          <ListItem disablePadding sx={{ mt: 0.5 }}>
            <ListItemButton
              component={RouterLink}
              to="/doctor"
              selected={location.pathname === '/doctor'}
              sx={{ borderRadius: 1.5, py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><MedicalServicesIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={getT('doctorPanel')} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.875rem' }} />
            </ListItemButton>
          </ListItem>
        )}

        <ListItem disablePadding sx={{ mt: 0.5 }}>
          <ListItemButton onClick={openSupport} sx={{ borderRadius: 1.5, py: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}><ForumIcon fontSize="small" /></ListItemIcon>
          <ListItemButton 
            onClick={() => {
              setIsSidebarOpen(false);
              setIsReminderModalOpen(true);
            }} 
            sx={{ borderRadius: 1.5, py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}><AccessTimeIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={getT('reminders')} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.875rem' }} />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Footer Area */}
      <Box sx={{ mt: 'auto', pt: 3 }}>
        <Stack spacing={1}>
          <MuiButton fullWidth startIcon={<ManageAccountsIcon />} onClick={() => navigate('/complete-profile')} sx={{ borderRadius: 1.5, justifyContent: 'start', py: 1, color: 'text.secondary', fontWeight: 700 }}>{t.editProfile}</MuiButton>
          <MuiButton fullWidth startIcon={<LanguageIcon />} onClick={() => setLanguage(language === 'uz' ? 'ru' : language === 'ru' ? 'en' : 'uz')} sx={{ borderRadius: 1.5, justifyContent: 'start', py: 1, color: 'text.secondary', fontWeight: 700 }}>{t.changeLanguage} ({language.toUpperCase()})</MuiButton>
          <MuiButton fullWidth startIcon={isDarkMode ? <LightModeIcon /> : <DarkModeIcon />} onClick={toggleDarkMode} sx={{ borderRadius: 1.5, justifyContent: 'start', py: 1, color: 'text.secondary', fontWeight: 700 }}>
            {isDarkMode ? (language === 'uz' ? 'Yorug\' rejim' : 'Light Mode') : (language === 'uz' ? 'Tungi rejim' : 'Dark Mode')}
          </MuiButton>
          
          {(adminContacts.phone || adminContacts.telegramUsername) && (
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.02), borderStyle: 'dashed' }}>
               <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', display: 'block', mb: 1, textTransform: 'uppercase', fontSize: 8 }}>{t.contactSupport || 'Bog\'lanish'}</Typography>
               <Stack spacing={1}>
                  {adminContacts.phone && (
                    <Link href={`tel:${adminContacts.phone}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.main' } }}>
                       <CallIcon sx={{ fontSize: 14 }} />
                       <Typography variant="caption" sx={{ fontWeight: 700 }}>{adminContacts.phone}</Typography>
                    </Link>
                  )}
                  {adminContacts.telegramUsername && (
                    <Link 
                      href={adminContacts.telegramUsername.startsWith('http') ? adminContacts.telegramUsername : `https://t.me/${adminContacts.telegramUsername.replace('@', '')}`} 
                      target="_blank"
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.main' } }}
                    >
                       <TelegramIcon sx={{ fontSize: 14 }} />
                       <Typography variant="caption" sx={{ fontWeight: 700 }}>{adminContacts.telegramUsername.startsWith('@') ? adminContacts.telegramUsername : 'Telegram'}</Typography>
                    </Link>
                  )}
               </Stack>
            </Paper>
          )}

          <MuiButton fullWidth color="error" startIcon={<LogoutIcon />} onClick={logout} sx={{ borderRadius: 1.5, justifyContent: 'start', py: 1, fontWeight: 700 }}>{t.logoutUser}</MuiButton>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar / Drawer (Flat Style) */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: SIDEBAR_WIDTH, boxSizing: 'border-box', borderRight: `1px solid ${theme.palette.divider}`, boxShadow: 'none' },
        }}
      >
        {SidebarContent}
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', width: { lg: `calc(100% - ${SIDEBAR_WIDTH}px)` } }}>
        {/* Header (Official & Simple) */}
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.divider}`, color: 'text.primary' }}>
          <Toolbar sx={{ height: 64, px: { xs: 2, sm: 3 } }}>
            {isMobile && (
              <IconButton edge="start" color="inherit" onClick={() => setIsSidebarOpen(true)} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
            )}
            
            <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 800, color: 'text.primary', textTransform: 'uppercase', letterSpacing: 2 }}>
              {activeTab === 'journal' ? getT('dailyJournal') : activeTab === 'products' ? getT('products') : getT('statistics')}
            </Typography>

            <Stack direction="row" spacing={3} alignItems="center">
               <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1 }}>{user?.firstName}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', fontSize: 9 }}>{user?.role}</Typography>
               </Box>
               <IconButton component={RouterLink} to="/complete-profile" sx={{ width: 44, height: 44, bgcolor: alpha(theme.palette.primary.main, 0.05), p: 0, borderRadius: 1.5 }}>
                  <Badge badgeContent={user?.role === 'superadmin' ? adminUnreadCount : unreadSupportCount} color="error" overlap="circular">
                    <Avatar sx={{ bgcolor: 'transparent', color: 'primary.main', width: 44, height: 44 }}><PersonIcon /></Avatar>
                  </Badge>
               </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ p: { xs: 3, md: 4 }, flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={
              activeTab === 'journal' ? <DailyJournal /> :
                activeTab === 'products' ? <Products /> :
                  <Statistics />
            } />
            <Route path="/complete-profile" element={<CompleteProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/doctor" element={<DoctorPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>

        {/* Footer (Simplified) */}
        <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5, borderTop: `1px solid ${theme.palette.divider}` }}>
           <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 2, fontSize: 10 }}>
              © {new Date().getFullYear()} QAND NAZORATI. PROFESSIONAL VERSION.
           </Typography>
        </Box>
      </Box>



      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        language={language}
        t={t}
        onRefresh={loadReminders}
      />

      <Toaster position="top-right" richColors />
    </Box>
  );
}

export default App;
