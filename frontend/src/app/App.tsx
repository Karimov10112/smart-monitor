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
        const { data: contactsData } = await adminAPI.getContacts();
        setAdminContacts(contactsData.contacts);
        
        const { data: remData } = await reminderAPI.getAll();
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

  const SidebarContent = (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Avatar 
          sx={{ 
            width: 50, height: 50, 
            bgcolor: 'primary.main',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
            borderRadius: 2
          }}
        >
          {user?.firstName?.[0]}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
            {user?.firstName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {user?.role === 'superadmin' ? 'Administrator' : t.user}
          </Typography>
        </Box>
      </Stack>

      <List sx={{ flexGrow: 1 }}>
        {[
          { id: 'journal', label: t.dailyJournal || 'Journal', icon: <AssignmentIcon fontSize="small" />, path: '/?tab=journal' },
          { id: 'statistics', label: t.statistics || 'Stats', icon: <BarChartIcon fontSize="small" />, path: '/?tab=statistics' },
          { id: 'products', label: t.products || 'Products', icon: <StorageIcon fontSize="small" />, path: '/?tab=products' },
        ].map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={activeTab === item.id}
              onClick={() => setIsSidebarOpen(false)}
              sx={{
                borderRadius: 1.5,
                py: 1,
                '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.875rem' }} />
            </ListItemButton>
          </ListItem>
        ))}

        {user?.role === 'superadmin' && (
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton component={RouterLink} to="/admin" onClick={() => setIsSidebarOpen(false)} sx={{ borderRadius: 1.5, py: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Admin Panel" primaryTypographyProps={{ fontWeight: 700, fontSize: '0.875rem' }} />
            </ListItemButton>
          </ListItem>
        )}

        <ListItem disablePadding sx={{ mt: 0.5 }}>
          <ListItemButton 
            onClick={openReminders} 
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
               <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', display: 'block', mb: 1, textTransform: 'uppercase', fontSize: 8 }}>{t.contactSupport || 'Support'}</Typography>
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
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, lg: 4 }, width: { lg: `calc(100% - ${SIDEBAR_WIDTH}px)` } }}>
        <AppBar 
          position="sticky" 
          color="inherit" 
          elevation={0} 
          sx={{ 
            bgcolor: 'background.default', 
            borderBottom: `1px solid ${theme.palette.divider}`,
            mb: 4,
            display: { lg: 'none' } 
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <IconButton edge="start" color="inherit" onClick={() => setIsSidebarOpen(true)}><MenuIcon /></IconButton>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 900, letterSpacing: -1 }}>QAND NAZORATI</Typography>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>{user?.firstName?.[0]}</Avatar>
          </Toolbar>
        </AppBar>

        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
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
