import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link as RouterLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useApp } from './contexts/AppContext';
import { translations } from './utils/translations';
import { sentenceCase } from './utils/glucose';
import { formatLongToday } from './utils/format';

// MUI Components
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Stack,
  useTheme,
  alpha,
  useMediaQuery,
  CircularProgress,
  Link,
  Menu,
  MenuItem,
  Divider,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';

// MUI Icons
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import AlarmRoundedIcon from '@mui/icons-material/AlarmRounded';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import TelegramIcon from '@mui/icons-material/Telegram';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';

// Components
import { DailyJournal } from './components/DailyJournal';
import { Chat } from './components/chat/ChatComponent';
import AIAgentChat from './components/AIAgentChat';

import { Statistics } from './components/Statistics';
import { ReminderModal } from './components/ReminderModal';
import { reminderAPI, adminAPI } from './utils/api';
import { BrandMark, LanguageMenuButton, ThemeToggleButton } from './components/common';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import AdminPage from './pages/AdminPage';
import DoctorPage from './pages/DoctorPage';

import { Toaster, toast } from 'sonner';

const SIDEBAR_WIDTH = 268;
const BOTTOM_NAV_HEIGHT = 64;

function App() {
  const { user, isAuthenticated, logout, loading, isAdmin } = useAuth();
  const { language, isDarkMode } = useApp();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const t = translations[language] || translations['uz'];
  const navigate = useNavigate();

  const getT = (key: keyof typeof translations['uz']) => t[key] || (translations['uz'] as any)[key] || key;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);
  const [adminContacts, setAdminContacts] = useState({ phone: '', telegramUsername: '' });
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const triggeredReminders = React.useRef<Set<string>>(new Set());
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsReminderModalOpen(false);
  }, [location.pathname, location.search]);

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
      navigate('/complete-profile', { replace: true });
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
        const triggerKey = `${r._id}_${currentTime}`;
        if (r.isActive && r.time === currentTime && !triggeredReminders.current.has(triggerKey)) {
          triggeredReminders.current.add(triggerKey);

          const sound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          sound.play().catch(() => { });

          toast(t.reminderTriggered || 'Eslatma!', {
            description: `${r.name} - ${r.dose}`,
            duration: 10000,
            icon: r.type === 'insulin' ? '💉' : '💊',
          });

          // Cleanup old keys (keep only current minute or similar)
          if (triggeredReminders.current.size > 50) {
            triggeredReminders.current.clear();
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 15000); // Check every 15s for better accuracy
    checkReminders();
    return () => clearInterval(interval);
  }, [isAuthenticated, reminders, t.reminderTriggered]);

  const openReminders = () => {
    setIsSidebarOpen(false);
    setIsReminderModalOpen(true);
  };

  const toaster = <Toaster position="top-right" richColors closeButton theme={isDarkMode ? 'dark' : 'light'} toastOptions={{ style: { fontFamily: 'inherit', borderRadius: 12 } }} />;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100dvh', width: '100%', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <BrandMark size={48} />
        <CircularProgress size={22} thickness={5} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        {toaster}
      </Box>
    );
  }

  const activeTab = searchParams.get('tab') || 'journal';
  const roleLabel = isAdmin ? t.administrator : (user?.role === 'doctor' ? t.doctorRole : t.userRole);
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || '';
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'U';

  const patientNav = [
    { id: 'journal', label: t.dailyJournal || 'Journal', icon: <EditNoteRoundedIcon />, path: '/?tab=journal' },
    { id: 'statistics', label: t.statistics || 'Stats', icon: <InsightsRoundedIcon />, path: '/?tab=statistics' },
    { id: 'chat', label: t.chat || 'Chat', icon: <ChatBubbleOutlineRoundedIcon />, path: '/?tab=chat' },
  ];

  const pageTitle = (() => {
    if (location.pathname === '/admin') return t.adminPanel;
    if (location.pathname === '/doctor') return t.doctorPanel;
    if (location.pathname === '/complete-profile') return user?.isProfileComplete ? t.editProfile : t.profileTitle;
    return patientNav.find(n => n.id === activeTab)?.label || t.dailyJournal;
  })();

  const todayLabel = formatLongToday(language);

  const menuFromTop = userMenuAnchor ? userMenuAnchor.getBoundingClientRect().top < 200 : false;

  const showBottomNav = isMobile && !!user?.isProfileComplete && location.pathname === '/';

  const NavSectionLabel = ({ children }: { children: React.ReactNode }) => (
    <Typography variant="overline" sx={{ px: 1.5, pt: 2, pb: 0.75, display: 'block', color: 'text.disabled' }}>
      {children}
    </Typography>
  );

  const navItemSx = { mb: 0.5, py: 1, px: 1.5, color: 'text.primary' };
  const navTextProps = { primaryTypographyProps: { fontWeight: 550, fontSize: '0.875rem' } };

  const SidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ px: 2.5, py: 2.25 }}>
        <BrandMark size={36} showName name={t.appName} subtitle="diabetmed.uz" />
      </Box>
      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, pb: 2 }}>
        {(user?.isProfileComplete || isAdmin) && (
          <>
            <NavSectionLabel>{language === 'ru' ? 'Мониторинг' : language === 'en' ? 'Monitoring' : 'Monitoring'}</NavSectionLabel>
            <List disablePadding>
              {patientNav.map((item) => (
                <ListItemButton
                  key={item.id}
                  component={RouterLink}
                  to={item.path}
                  selected={!isReminderModalOpen && location.pathname === '/' && activeTab === item.id}
                  onClick={() => { setIsSidebarOpen(false); setIsReminderModalOpen(false); }}
                  sx={navItemSx}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} {...navTextProps} />
                </ListItemButton>
              ))}
              {user?.isProfileComplete && (
                <ListItemButton onClick={openReminders} selected={isReminderModalOpen} sx={navItemSx}>
                  <ListItemIcon><AlarmRoundedIcon /></ListItemIcon>
                  <ListItemText primary={getT('reminders')} {...navTextProps} />
                  {reminders.length > 0 && (
                    <Box sx={{ px: 0.9, py: 0.1, borderRadius: 1.5, fontSize: 11, fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main' }}>
                      {reminders.length}
                    </Box>
                  )}
                </ListItemButton>
              )}
            </List>
          </>
        )}

        {((user?.isProfileComplete && isAdmin) || user?.role === 'doctor' || isAdmin) && (
          <>
            <NavSectionLabel>{language === 'ru' ? 'Управление' : language === 'en' ? 'Management' : 'Boşqaruv'}</NavSectionLabel>
            <List disablePadding>
              {(user?.role === 'doctor' || isAdmin) && (
                <ListItemButton
                  component={RouterLink}
                  to="/doctor"
                  selected={!isReminderModalOpen && location.pathname === '/doctor'}
                  onClick={() => { setIsSidebarOpen(false); setIsReminderModalOpen(false); }}
                  sx={navItemSx}
                >
                  <ListItemIcon><MedicalServicesOutlinedIcon /></ListItemIcon>
                  <ListItemText primary={t.doctorPanel || 'Doctor Panel'} {...navTextProps} />
                </ListItemButton>
              )}
              {user?.isProfileComplete && isAdmin && (
                <ListItemButton
                  component={RouterLink}
                  to="/admin"
                  selected={!isReminderModalOpen && location.pathname === '/admin'}
                  onClick={() => { setIsSidebarOpen(false); setIsReminderModalOpen(false); }}
                  sx={navItemSx}
                >
                  <ListItemIcon><AdminPanelSettingsOutlinedIcon /></ListItemIcon>
                  <ListItemText primary={t.adminPanel} {...navTextProps} />
                </ListItemButton>
              )}
            </List>
          </>
        )}
      </Box>

      {/* Footer Area */}
      <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
        {(adminContacts.phone || adminContacts.telegramUsername) && (
          <Box sx={{ p: 1.5, mb: 1.5, borderRadius: 3, bgcolor: 'surfaceMuted' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}>
              {sentenceCase(t.support)}
            </Typography>
            <Stack spacing={0.75}>
              {adminContacts.phone && (
                <Link href={`tel:${adminContacts.phone}`} underline="none" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary', '&:hover': { color: 'primary.main' } }}>
                  <CallOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{adminContacts.phone}</Typography>
                </Link>
              )}
              {adminContacts.telegramUsername && (
                <Link
                  href={adminContacts.telegramUsername.startsWith('http') ? adminContacts.telegramUsername : `https://t.me/${adminContacts.telegramUsername.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="none"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary', '&:hover': { color: 'primary.main' } }}
                >
                  <TelegramIcon sx={{ fontSize: 16, color: '#229ED9' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{adminContacts.telegramUsername.startsWith('@') ? adminContacts.telegramUsername : 'Telegram'}</Typography>
                </Link>
              )}
            </Stack>
          </Box>
        )}

        <ListItemButton onClick={(e) => setUserMenuAnchor(e.currentTarget)} sx={{ py: 1, px: 1.25, gap: 1.25 }}>
          <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: alpha(theme.palette.primary.main, 0.14), color: 'primary.main' }}>{initials}</Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle2" noWrap sx={{ lineHeight: 1.3 }}>{fullName}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{roleLabel}</Typography>
          </Box>
          <UnfoldMoreRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        </ListItemButton>
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={() => setUserMenuAnchor(null)}
          anchorOrigin={menuFromTop ? { vertical: 'bottom', horizontal: 'right' } : { vertical: 'top', horizontal: 'center' }}
          transformOrigin={menuFromTop ? { vertical: 'top', horizontal: 'right' } : { vertical: 'bottom', horizontal: 'center' }}
          slotProps={{ paper: { sx: { width: 236, my: 1 } } }}
        >
          <MenuItem onClick={() => { setUserMenuAnchor(null); setIsSidebarOpen(false); navigate('/complete-profile'); }}>
            <ListItemIcon><ManageAccountsOutlinedIcon fontSize="small" /></ListItemIcon>
            {t.editProfile}
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={() => { setUserMenuAnchor(null); logout(); }} sx={{ color: 'error.main' }}>
            <ListItemIcon><LogoutRoundedIcon fontSize="small" color="error" /></ListItemIcon>
            {t.logoutUser}
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
      {/* Sidebar / Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: isMobile ? 0 : SIDEBAR_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: isMobile ? 288 : SIDEBAR_WIDTH, boxSizing: 'border-box', borderRight: `1px solid ${theme.palette.divider}`, boxShadow: isMobile ? undefined : 'none', paddingTop: 'var(--sat)' },
        }}
      >
        {SidebarContent}
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" sx={{ pt: 'var(--sat)' }}>
          <Toolbar sx={{ gap: 1.5, minHeight: { xs: 60, sm: 68 }, px: { xs: 1.5, sm: 3, lg: 4 } }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setIsSidebarOpen(true)} aria-label="Menu">
                <MenuRoundedIcon />
              </IconButton>
            )}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h6" component="div" noWrap sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                {pageTitle}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: { xs: 'none', sm: 'block' }, '&::first-letter': { textTransform: 'uppercase' } }}>
                {todayLabel}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <LanguageMenuButton variant={isMobile ? 'icon' : 'text'} />
              <ThemeToggleButton />
              {!isMobile && (
                <Avatar
                  onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                  sx={{ width: 40, height: 40, fontSize: 14, cursor: 'pointer', bgcolor: alpha(theme.palette.primary.main, 0.14), color: 'primary.main' }}
                >
                  {initials}
                </Avatar>
              )}
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, px: { xs: 1.5, sm: 3, lg: 4 }, pt: { xs: 2, sm: 3 }, pb: showBottomNav ? `${BOTTOM_NAV_HEIGHT + 24}px` : 4 }}>
          <Box sx={{ maxWidth: 1240, mx: 'auto' }}>
            <Routes>
              <Route path="/" element={
                user?.isProfileComplete ? (
                  activeTab === 'journal' ? <DailyJournal /> :
                  activeTab === 'statistics' ? <Statistics /> :
                  activeTab === 'chat' ? <Chat /> :
                    <DailyJournal />
                ) : <Navigate to="/complete-profile" replace />
              } />
              <Route path="/complete-profile" element={<CompleteProfilePage />} />
              <Route path="/admin" element={isAdmin ? <AdminPage /> : (user?.isProfileComplete ? <Navigate to="/" replace /> : <Navigate to="/complete-profile" replace />)} />
              <Route path="/doctor" element={user?.role === 'doctor' || isAdmin ? <DoctorPage /> : (user?.isProfileComplete ? <Navigate to="/" replace /> : <Navigate to="/complete-profile" replace />)} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>

        {/* Footer */}
        {!showBottomNav && (
          <Box sx={{ py: 3, px: 3, textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} {t.appName} · diabetmed.uz
            </Typography>
          </Box>
        )}
      </Box>

      {/* Mobile bottom navigation */}
      {showBottomNav && (
        <Paper
          sx={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1200,
            borderTop: `1px solid ${theme.palette.divider}`,
            pb: 'var(--sab)',
            bgcolor: alpha(theme.palette.background.paper, 0.96),
            backdropFilter: 'blur(10px)',
          }}
        >
          <BottomNavigation
            showLabels
            value={isReminderModalOpen ? 'reminders' : activeTab}
            sx={{ height: BOTTOM_NAV_HEIGHT, bgcolor: 'transparent', '& .MuiBottomNavigationAction-label': { fontSize: '0.6875rem', fontWeight: 600, mt: 0.25, '&.Mui-selected': { fontSize: '0.6875rem' } } }}
          >
            {patientNav.map(item => (
              <BottomNavigationAction
                key={item.id}
                value={item.id}
                label={item.label}
                icon={item.icon}
                component={RouterLink}
                to={item.path}
              />
            ))}
            <BottomNavigationAction value="reminders" label={getT('reminders')} icon={<AlarmRoundedIcon />} onClick={openReminders} />
          </BottomNavigation>
        </Paper>
      )}

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        language={language}
        t={t}
        reminders={reminders}
        onRefresh={loadReminders}
      />

      {/* AI Agent Floating Chat */}
      <AIAgentChat bottomOffset={showBottomNav ? BOTTOM_NAV_HEIGHT : 0} />

      {toaster}
    </Box>
  );
}

export default App;
