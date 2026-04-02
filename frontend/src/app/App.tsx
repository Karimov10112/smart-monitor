import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useApp } from './contexts/AppContext';
import { translations } from './utils/translations';
import { motion, AnimatePresence } from 'motion/react';

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

// UI
import { Button } from './components/ui/button';
import {
  LogOut,
  User,
  Menu,
  X,
  Languages,
  Database,
  ClipboardList,
  BarChart3,
  Settings,
  ShieldCheck,
  Stethoscope,
  Bell,
  MessageSquare,
  SendHorizontal,
  UserCog,
  Clock
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
// import { authAPI } from './utils/api'; // Duplicate removed

function App() {
  const { user, isAuthenticated, logout, loading, updateUser } = useAuth();
  const { language, setLanguage } = useApp();
  const t = translations[language] || translations['uz'];
  const navigate = useNavigate();

  // Safe translation helper
  const getT = (key: keyof typeof translations['uz']) => t[key] || (translations['uz'] as any)[key] || key;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [adminContacts, setAdminContacts] = useState({ phone: '', telegramUsername: '' });
  const [supportText, setSupportText] = useState('');
  const [sendingSupport, setSendingSupport] = useState(false);
  const location = useLocation();
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  const unreadSupportCount = user?.supportMessages?.filter((m: any) => m.sender === 'admin' && m.isReadByUser === false).length || 0;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isSupportModalOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isSupportModalOpen, user?.supportMessages]);

  // Redirect to complete profile if necessary
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
      if (user?.role === 'superadmin') {
        loadAdminStats();
      } else {
        // Fetch contacts for normal users
        adminAPI.getContacts().then(res => {
          if (res.data?.success) setAdminContacts(res.data.contacts);
        }).catch(() => {});
      }
    }
  }, [isAuthenticated, user?.role]);

  // Reminder Engine
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
    checkReminders(); // Initial check
    return () => clearInterval(interval);
  }, [isAuthenticated, reminders, t.reminderTriggered]);

  const openSupport = async () => {
    setIsSupportModalOpen(true);
    try {
      await authAPI.markMessagesAsRead();
      const { data } = await authAPI.getMe();
      updateUser(data.user);
      if (user?.role === 'superadmin') loadAdminStats();
    } catch (err) {
      console.error('Socket refresh error:', err);
    }
  };

  const { socket } = useApp();

  // Socket listeners for real-time updates
  useEffect(() => {
    if (isAuthenticated && socket) {
      // For Admin: Refresh stats when any user reads messages or a new message arrives
      const handleReadByUser = (data: any) => {
        if (user?.role === 'superadmin') loadAdminStats();
      };
      const handleNewMessage = async (data: any) => {
        if (user?.role === 'superadmin') loadAdminStats();

        // For User: If modal is open and message is from admin, auto-mark as read
        if (isSupportModalOpen && data.sender === 'admin') {
          try {
            await authAPI.markMessagesAsRead();
            const { data: userData } = await authAPI.getMe();
            updateUser(userData.user);
          } catch (err) { }
        }
      };

      socket.on('support-messages-read-by-user', handleReadByUser);
      socket.on('new-message', handleNewMessage);

      return () => {
        socket.off('support-messages-read-by-user', handleReadByUser);
        socket.off('new-message', handleNewMessage);
      };
    }
  }, [isAuthenticated, isSupportModalOpen, socket, user?.role, updateUser]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 transition-colors duration-500 overflow-hidden">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </div>
    );
  }

  const activeTab = new URLSearchParams(location.search).get('tab') || 'journal';

  const handleSendSupport = async () => {
    if (!supportText.trim()) return;
    setSendingSupport(true);
    try {
      // Optimistic update: xabarni darhol State'ga yozamiz
      const newMessage: any = {
        sender: 'user',
        text: supportText,
        createdAt: new Date().toISOString(),
        isReadByAdmin: false
      };
      if (user) {
        updateUser({ ...user, supportMessages: [...(user.supportMessages || []), newMessage] });
      }

      await authAPI.sendMessageToAdmin({ text: supportText });

      toast.success(language === 'uz' ? 'Xabar yuborildi!' : 'Сообщение отправлено!');
      setSupportText('');
      // We don't close modal immediately anymore for a better chat feel
      // setIsSupportModalOpen(false); 
    } catch (err) {
      toast.error('Error sending message');
    } finally {
      setSendingSupport(false);
    }
  };

  const NavLink = ({ to, icon: Icon, label, active }: any) => (
    <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}>
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${active
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
          : 'text-slate-500 hover:bg-slate-100'
          }`}
        onClick={() => setIsSidebarOpen(false)}
      >
        <Icon className="w-5 h-5" />
        <span className="font-bold tracking-tight">{label}</span>
      </Link>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-700 selection:bg-blue-100">
      {/* Mesh Background Effects (More Colorful) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1]
        }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-blue-600/15 blur-[120px] rounded-full"
        />
        <motion.div animate={{
          x: [0, -40, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1]
        }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-purple-600/15 blur-[120px] rounded-full"
        />
        <motion.div animate={{
          x: [0, 30, 0],
          y: [0, -60, 0],
          scale: [1, 1.15, 1]
        }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-[20%] right-[10%] w-[15%] h-[15%] bg-emerald-500/10 blur-[80px] rounded-full"
        />
        <motion.div animate={{
          x: [0, -30, 0],
          y: [0, 40, 0],
          scale: [1, 1.1, 1]
        }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] left-[10%] w-[20%] h-[20%] bg-rose-500/10 blur-[90px] rounded-full"
        />
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40 lg:hidden transition-all duration-300" onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-80 bg-white border-r border-border z-50 transition-all duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center gap-4 mb-12 px-2 text-slate-800">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">Qand Nazorati</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Smart Monitor</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <NavLink to="/?tab=journal" icon={ClipboardList} label={getT('dailyJournal')} active={activeTab === 'journal'} />
            <NavLink to="/?tab=products" icon={Database} label={getT('products')} active={activeTab === 'products'} />
            <NavLink to="/?tab=stats" icon={BarChart3} label={getT('statistics')} active={activeTab === 'stats'} />

            <div className="pt-6 mt-6 border-t border-slate-100">
              <label className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">System Panel</label>
              {user?.role === 'superadmin' && (
                <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} onClick={() => navigate('/admin')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${location.pathname === '/admin' ? 'bg-blue-600 text-white shadow-lg' : 'text-muted-foreground hover:bg-accent'}`}>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5" /> {getT('adminPanel')}
                  </div>
                  {adminUnreadCount > 0 && location.pathname !== '/admin' && (
                    <span className="w-5 h-5 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">{adminUnreadCount}</span>
                  )}
                </motion.button>
              )}
              {user?.role === 'doctor' && (
                <NavLink to="/doctor" icon={Stethoscope} label={getT('doctorPanel')} active={location.pathname === '/doctor'} />
              )}
              <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} onClick={openSupport} className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-muted-foreground hover:bg-accent transition-all font-bold tracking-tight">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" /> {language === 'uz' ? 'Support Chat' : 'Чат поддержки'}
                </div>
                {unreadSupportCount > 0 && (
                  <span className="w-5 h-5 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">{unreadSupportCount}</span>
                )}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} onClick={() => setIsReminderModalOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-accent transition-all font-bold tracking-tight">
                <Clock className="w-5 h-5" /> {t.reminders}
              </motion.button>
            </div>
            
            {/* Admin Contacts display for users */}
            {user?.role !== 'superadmin' && (adminContacts.phone || adminContacts.telegramUsername) && (
              <div className="pt-6 mt-6 border-t border-slate-100">
                <label className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">A'loqa uchun</label>
                <div className="px-4 space-y-3">
                  {adminContacts.phone && (
                    <a href={`tel:${adminContacts.phone}`} className="flex items-center gap-3 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">📞</div>
                      {adminContacts.phone}
                    </a>
                  )}
                  {adminContacts.telegramUsername && (
                    <a href={`https://t.me/${adminContacts.telegramUsername.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-blue-500">✈️</div>
                      {adminContacts.telegramUsername}
                    </a>
                  )}
                </div>
              </div>
            )}

          </nav>

          <div className="pt-8 border-t border-slate-100 space-y-3">
            {/* Edit Profile Link */}
            <button onClick={() => navigate('/complete-profile')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-blue-600 hover:bg-blue-50 transition-all font-black text-[10px] uppercase tracking-widest leading-none">
              <UserCog className="w-5 h-5" /> {language === 'uz' ? 'Profilni tahrirlash' : 'Редактировать профиль'}
            </button>

            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setLanguage(language === 'uz' ? 'ru' : language === 'ru' ? 'en' : 'uz')} className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl bg-secondary text-secondary-foreground hover:bg-accent transition-all text-[10px] font-black uppercase tracking-widest leading-none">
                <Languages className="w-5 h-5" /> {language === 'uz' ? "Tilni o'zgartirish" : language === 'ru' ? 'Сменить язык' : 'Change Language'} ({language.toUpperCase()})
            </motion.button>

            <motion.button whileTap={{ scale: 0.95 }} onClick={logout} className="w-full h-12 flex items-center gap-3 px-6 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all font-bold tracking-tight">
              <LogOut className="w-4 h-4" /> {language === 'uz' ? 'Chiqish' : 'Logout'}
            </motion.button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-80 flex flex-col min-h-screen relative z-10 text-slate-800">
        {/* Header */}
        <header className="h-24 bg-card/50 backdrop-blur-xl border-b border-border flex items-center justify-between px-8 sticky top-0 z-30">
          <button className="lg:hidden p-2 -ml-2 text-slate-600" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 flex justify-center lg:justify-start px-6">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">
              {activeTab === 'journal' ? getT('dailyJournal') : activeTab === 'products' ? getT('products') : getT('statistics')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-10 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-black tracking-tight">{user?.firstName}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{user?.role}</span>
              </div>
              <Link to="/complete-profile" className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-500 transition-all shadow-sm group relative">
                <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
                {((user?.role === 'superadmin' ? adminUnreadCount : unreadSupportCount) > 0) && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {user?.role === 'superadmin' ? adminUnreadCount : unreadSupportCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 md:p-12 max-w-7xl mx-auto w-full flex-1">
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
        </div>

        {/* Support Chat Modal (Enhanced UI) */}
        <AnimatePresence>
          {isSupportModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsSupportModalOpen(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-card rounded-[2.5rem] shadow-3xl overflow-hidden border border-border flex flex-col h-[500px]">
                {/* Header */}
                <div className="p-6 bg-slate-50 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight">{language === 'uz' ? 'Support Chat' : 'Поддержка'}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Super Admin is here to help</p>
                    </div>
                  </div>
                  <button onClick={() => setIsSupportModalOpen(false)} className="w-12 h-12 flex items-center justify-center hover:bg-accent rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-slate-50/30">
                  {/* Dummy messages to show structure */}
                  {user?.supportMessages?.map((msg: any, idx: number) => {
                    const isAdmin = msg.sender === 'admin';
                    return (
                      <div key={idx} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] px-5 py-4 pb-8 rounded-[2rem] shadow-sm text-sm font-bold leading-relaxed relative flex flex-col ${isAdmin ? 'bg-white text-slate-800 rounded-bl-none border border-slate-100 shadow-xl' : 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-500/20'}`}>
                          <span>{msg.text}</span>
                          <span className={`absolute bottom-3 right-5 text-[10px] font-black ${isAdmin ? 'text-slate-400' : 'text-blue-200'} flex items-center gap-1`}>
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            {!isAdmin && (
                              <span className="text-sm tracking-tighter ml-1">
                                {msg.isReadByAdmin ? '✓✓' : '✓'}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                  {(!user?.supportMessages || user?.supportMessages.length === 0) && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50 space-y-4">
                      <MessageSquare className="w-20 h-20" />
                      <p className="text-xs font-black uppercase tracking-[0.3em]">{language === 'uz' ? 'Savol bering' : 'Задайте вопрос'}</p>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-8 pb-10 bg-white">
                  <div className="relative group">
                    <textarea value={supportText} onChange={e => setSupportText(e.target.value)} placeholder={language === 'uz' ? 'Xabaringizni yozing...' : 'Напишите ваше сообщение...'} className="w-full h-24 p-6 pr-20 rounded-3xl bg-slate-50 border-none resize-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all text-sm" />
                    <button onClick={handleSendSupport} disabled={sendingSupport || !supportText.trim()} className="absolute right-4 bottom-4 w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all active:scale-90">
                      {sendingSupport ? <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <SendHorizontal className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <ReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          language={language}
          t={t}
          onRefresh={loadReminders}
        />

        {/* Footer */}
        <footer className="p-12 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
          © {new Date().getFullYear()} Qand Nazorati. Smart System.
        </footer>
      </main>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default App;
