import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  BarChart3, 
  Search, 
  Shield, 
  Ban, 
  Trash2, 
  ChevronRight, 
  Activity, 
  MapPin, 
  LogOut, 
  UserCheck, 
  Bell, 
  X, 
  CheckCircle2, 
  MessageSquare,
  Clock,
  SendHorizontal,
  Package,
  Plus,
  Pencil,
  Settings,
  ShieldAlert,
  Save,
  Loader2,
  Check,
  CheckCheck
} from 'lucide-react';
import { productAPI, adminAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { translations } from '../utils/translations';
import { categories } from '../data/products';
import { toast, Toaster } from 'sonner';
import { format } from 'date-fns';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from '../components/ui/card';


type Tab = 'dashboard' | 'users' | 'user-detail' | 'products';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const { language } = useApp();
  const t = translations[language];
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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
    advice: { uz: '', ru: '', en: '' }
  });

  // Support Notifications
  const [supportUsers, setSupportUsers] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { socket } = useApp();
  useEffect(() => {
    if (socket) {
      socket.on('new-message', () => {
        loadStats();
        if (selectedUser) handleOpenUser(selectedUser._id);
      });

      socket.on('support-messages-read-by-user', (data: any) => {
        if (selectedUser && selectedUser._id === data.userId) {
          handleOpenUser(selectedUser._id);
        }
      });

      return () => {
        socket.off('new-message');
        socket.off('support-messages-read-by-user');
      };
    }
  }, [socket, selectedUser]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadSupportNotifications(),
        loadProducts()
      ]);
    } catch (err) {
      toast.error('Ma\'lumotlarni yuklashda xato');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const { data } = await adminAPI.getStats();
    setStats(data.stats);
  };

  const loadUsers = async () => {
    const { data } = await adminAPI.getUsers({ search, limit: 20 });
    setUsers(data.users);
  };

  const loadProducts = async () => {
    const { data } = await productAPI.getAll();
    setProducts(data.products);
  };

  const loadSupportNotifications = async () => {
    const { data } = await adminAPI.getUsers({ limit: 100 });
    const withUnread = data.users.filter((u: any) => u.supportMessages?.some((m: any) => !m.isReadByAdmin));
    setSupportUsers(withUnread);
  };

  const handleOpenUser = async (userId: string) => {
    // Xat chatini ochish bilan darhol xabarlar o'qildi signalini backendga jo'natamiz
    await adminAPI.markMessagesAsRead(userId).catch(() => {});

    // Keyin foydalanuvchini yangilangan ma'lumotlari bian yuklab olamiz
    const { data } = await adminAPI.getUser(userId);
    setSelectedUser(data.user);
    setTab('user-detail');
    setIsNotificationsOpen(false);
    
    // Qong'iroqchani tozalab qo'yamiz
    loadSupportNotifications();
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      const { data } = await adminAPI.replyToUser(selectedUser._id, replyText);
      if (data.success) {
        setSelectedUser(data.user);
        setReplyText('');
        toast.success(t.replySent || 'Javob yuborildi');
      } else {
        toast.error(data.message || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Xatolik yuz berdi';
      toast.error(msg);
    } finally {
      setSendingReply(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productAPI.update(editingProduct._id, productForm);
        toast.success(t.productUpdated || 'Mahsulot yangilandi');
      } else {
        await productAPI.create(productForm);
        toast.success(t.productAdded || 'Mahsulot qo\'shildi');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch {
      toast.error('Mahsulotni saqlashda xato');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Rostdan ham o\'chirmoqchimisiz?')) return;
    try {
      await productAPI.delete(id);
      toast.success('O\'chirildi');
      loadProducts();
    } catch {
      toast.error('O\'chirishda xato');
    }
  };

  const sectionHeader = (title: string, subtitle: string) => (
    <div className="mb-10">
      <h2 className="text-4xl font-black text-foreground tracking-tighter leading-none uppercase mb-3">{title}</h2>
      <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">{subtitle}</p>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-700 selection:bg-blue-100 w-full overflow-x-hidden">
      
      {/* Main Content (Merged with tabs header) */}
      <main className="flex-1 p-8 lg:p-12 relative z-10 w-full overflow-y-auto">
         {/* Background Blobs */}
         <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 blur-[120px] rounded-full animate-pulse" />
         </div>

         <div className="max-w-7xl mx-auto flex items-center gap-4 mb-20 p-2 bg-card/50 backdrop-blur-xl rounded-[2rem] border border-border shadow-xl overflow-x-auto no-scrollbar">
            {[
              { id: 'dashboard', icon: BarChart3, label: t.dashboard },
              { id: 'users', icon: Users, label: t.users },
              { id: 'products', icon: Package, label: t.products }
            ].map(item => (
              <motion.button key={item.id} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} onClick={() => setTab(item.id as Tab)} className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all whitespace-nowrap ${tab === item.id || (tab === 'user-detail' && item.id === 'users') ? 'bg-blue-600 text-white shadow-lg' : 'text-muted-foreground hover:bg-accent'}`}>
                 <item.icon className="w-4 h-4" /> {item.label}
              </motion.button>
            ))}
         </div>

         <header className="flex items-center justify-between mb-20 relative z-20">
            <div />

            <div className="flex items-center gap-6">
               <div className="relative">
                  <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={`w-16 h-16 rounded-[1.5rem] bg-card shadow-2xl border border-border flex items-center justify-center transition-all ${supportUsers.length > 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                     <Bell className="w-7 h-7" />
                     {supportUsers.length > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">{supportUsers.length}</span>}
                  </button>

                  <AnimatePresence>
                     {isNotificationsOpen && (
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="absolute right-0 mt-6 w-96 bg-card rounded-[2.5rem] shadow-3xl border border-border overflow-hidden z-[60]">
                           <div className="p-8 bg-muted/50 flex items-center justify-between border-b border-border">
                             <h4 className="text-xs font-black uppercase tracking-widest leading-none">Yang xabarlar</h4>
                             <button onClick={() => setIsNotificationsOpen(false)} className="p-2"><X className="w-5 h-5" /></button>
                           </div>
                           <div className="max-h-[400px] overflow-y-auto p-6 space-y-4">
                              {supportUsers.map(u => (
                                <div key={u._id} onClick={() => handleOpenUser(u._id)} className="p-6 bg-secondary rounded-3xl cursor-pointer hover:bg-accent transition-all">
                                   <div className="flex items-center gap-4 mb-3">
                                      <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center font-black text-blue-600 shadow-sm">{u.firstName?.[0]}</div>
                                      <p className="font-black text-sm">{u.firstName} {u.lastName}</p>
                                   </div>
                                   <p className="text-xs font-bold text-muted-foreground truncate opacity-70 italic">"{u.supportMessages?.find((m: any) => !m.isReadByAdmin)?.text}"</p>
                                </div>
                              ))}
                              {supportUsers.length === 0 && <div className="py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Xabarlar yo'q</div>}
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>

               <div className="flex items-center gap-4 px-6 py-3 bg-card rounded-2xl border border-border shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black">{user?.firstName?.[0]}</div>
                  <div className="text-right">
                     <p className="text-xs font-black tracking-tight">{user?.firstName}</p>
                     <p className="text-[10px] font-bold text-muted-foreground capitalize opacity-60">Super Admin</p>
                  </div>
               </div>
            </div>
         </header>

         <div className="max-w-7xl mx-auto">
            {tab === 'dashboard' && stats && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                 {sectionHeader(t.dashboard, 'Overall System Health and Analytics Metrics')}

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
                    {[
                      { icon: Users, label: t.totalUsers, val: stats.totalUsers, color: 'text-blue-500 bg-blue-500/10' },
                      { icon: Activity, label: t.activeToday, val: stats.activeToday, color: 'text-emerald-500 bg-emerald-500/10' },
                      { icon: Shield, label: 'Unread Support', val: supportUsers.length, color: 'text-amber-500 bg-amber-500/10' },
                      { icon: Package, label: 'Total Products', val: products.length, color: 'text-purple-500 bg-purple-500/10' },
                    ].map((s, idx) => (
                      <div key={idx} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm hover:shadow-2xl transition-all group">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${s.color}`}>
                            <s.icon className="w-7 h-7" />
                         </div>
                         <p className="text-3xl font-black tracking-tighter mb-1 leading-none">{s.val}</p>
                         <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">{s.label}</p>
                      </div>
                    ))}
                 </div>

                 <div className="bg-card rounded-[3.5rem] border border-border p-12 shadow-3xl mb-16">
                    <div className="flex items-center justify-between mb-12">
                       <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4 leading-none">
                          <div className="w-3 h-10 bg-blue-500 rounded-full" /> User Activity Trends
                       </h3>
                       <div className="flex gap-2">
                          {['7 days', '30 days', '1 year'].map(v => <button key={v} className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors">{v}</button>)}
                       </div>
                    </div>
                    <div className="h-[400px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[{n:'Mon',v:20},{n:'Tue',v:45},{n:'Wed',v:35},{n:'Thu',v:70},{n:'Fri',v:55},{n:'Sat',v:90},{n:'Sun',v:85}]}>
                             <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                             <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{fontSize:10, fontWeight:900, fill:'var(--muted-foreground)'}} dy={10} />
                             <Tooltip contentStyle={{borderRadius: '24px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                             <Area type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </motion.div>
            )}

            {tab === 'users' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {sectionHeader(t.users, 'Advanced User Management and Access Control')}
                
                <div className="flex flex-col md:flex-row gap-6 mb-12">
                   <div className="flex-1 relative group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
                      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Username or email search..." className="w-full h-16 pl-16 pr-8 bg-card border border-border rounded-3xl font-bold tracking-tight focus:ring-4 focus:ring-blue-600/10 transition-all outline-none" />
                   </div>
                   <motion.button whileTap={{ scale: 0.95 }} onClick={loadUsers} className="px-10 h-16 bg-foreground text-background font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl transition-all">Apply Filter</motion.button>
                </div>

                <div className="bg-card rounded-[3.5rem] border border-border overflow-hidden shadow-3xl">
                   <div className="overflow-x-auto">
                      <table className="w-full">
                         <thead className="bg-muted/50 uppercase text-[10px] font-black tracking-widest text-muted-foreground">
                            <tr>
                               <th className="px-10 py-8 text-left">User Profile</th>
                               <th className="px-10 py-8 text-left">Location</th>
                               <th className="px-10 py-8 text-left">Role</th>
                               <th className="px-10 py-8"></th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-border">
                            {users.map(u => (
                              <tr key={u._id} onClick={() => handleOpenUser(u._id)} className="hover:bg-accent cursor-pointer transition-all group">
                                 <td className="px-10 py-8">
                                    <div className="flex items-center gap-6">
                                       <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-muted-foreground font-black text-sm group-hover:scale-110 transition-transform">{u.firstName?.[0] || 'U'}</div>
                                        <div>
                                           <div className="flex items-center gap-3">
                                              <p className="text-base font-black tracking-tighter group-hover:text-blue-600 transition-colors uppercase">{u.firstName} {u.lastName}</p>
                                              {(() => {
                                                const counts = u.supportMessages?.filter((m: any) => !m.isReadByAdmin).length || 0;
                                                return counts > 0 && (
                                                  <span className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded-lg animate-bounce">{counts}</span>
                                                );
                                              })()}
                                           </div>
                                           <p className="text-[10px] font-bold text-muted-foreground mt-1">{u.email}</p>
                                        </div>
                                    </div>
                                 </td>
                                 <td className="px-10 py-8">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">{u.region || 'Unknown'}</p>
                                 </td>
                                 <td className="px-10 py-8">
                                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${u.role === 'superadmin' ? 'bg-rose-500 text-white' : 'bg-secondary text-muted-foreground'}`}>{u.role}</span>
                                 </td>
                                 <td className="px-10 py-8 text-right">
                                    <ChevronRight className="w-6 h-6 text-border group-hover:text-blue-600 transform group-hover:translate-x-3 transition-all" />
                                 </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              </motion.div>
            )}

            {tab === 'products' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-10">
                   {sectionHeader(t.products, 'Manage diabetes product database and advisory system')}
                   <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} onClick={() => { setEditingProduct(null); setProductForm({name:{uz:'',ru:'',en:''}, category:'vegetables', emoji:'🥗', gi:0, gl:0, advice:{uz:'',ru:'',en:''}}); setIsProductModalOpen(true); }} className="px-8 h-16 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-3xl shadow-2xl shadow-blue-500/40 flex items-center gap-3 transition-all">
                      <Plus className="w-5 h-5" /> {t.addNew || 'Yangi qo\'shish'}
                   </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                   {products.map(p => (
                      <Card key={p._id} className="p-8 bg-card rounded-[2.5rem] border border-border shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                         <div className="flex items-start justify-between mb-8">
                            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-4xl group-hover:rotate-12 transition-transform shadow-inner">{p.emoji}</div>
                            <div className="flex gap-2">
                               <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setEditingProduct(p); setProductForm(p); setIsProductModalOpen(true); }} className="w-10 h-10 bg-secondary text-muted-foreground hover:text-blue-600 rounded-xl flex items-center justify-center transition-all"><Pencil className="w-4 h-4" /></motion.button>
                               <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDeleteProduct(p._id)} className="w-10 h-10 bg-secondary text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm"><Trash2 className="w-4 h-4" /></motion.button>
                            </div>
                         </div>
                         <h4 className="text-xl font-black tracking-tight mb-2 leading-none uppercase">{p.name[language] || p.name['uz']}</h4>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">{p.category}</p>
                         <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                            <div>
                               <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">GI Index</p>
                               <p className="text-xl font-black text-blue-600">{p.gi}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">GL Load</p>
                               <p className="text-xl font-black text-purple-600">{p.gl}</p>
                            </div>
                         </div>
                      </Card>
                   ))}
                </div>
              </motion.div>
            )}

            {tab === 'user-detail' && selectedUser && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="flex items-center gap-8 mb-16">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTab('users')} className="w-16 h-16 bg-card rounded-2xl shadow-xl border border-border flex items-center justify-center group"><ChevronRight className="w-7 h-7 rotate-180 group-hover:-translate-x-2 transition-transform" /></motion.button>
                  {sectionHeader(t.userDetail, `Managing profile and communication for ${selectedUser.firstName}`)}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                   <div className="xl:col-span-2 space-y-12">
                      <div className="bg-card rounded-[4rem] border border-border p-12 shadow-3xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full -mr-40 -mt-40" />
                         <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                            <div className="w-40 h-40 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3.5rem] flex items-center justify-center text-white text-6xl font-black shadow-3xl shadow-blue-500/40 ring-12 ring-background">
                               {selectedUser.firstName?.[0]}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                               <h3 className="text-5xl font-black tracking-tighter leading-none uppercase mb-2">{selectedUser.firstName} {selectedUser.lastName}</h3>
                               <p className="text-xl font-bold text-muted-foreground mb-8 tracking-tight">{selectedUser.email}</p>
                               <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                  <div className="px-6 py-3 bg-secondary rounded-3xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground"><MapPin className="w-4 h-4 text-blue-500" /> {selectedUser.region}</div>
                                  <div className="px-6 py-3 bg-secondary rounded-3xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-600"><CheckCircle2 className="w-4 h-4" /> {selectedUser.diabetesType}</div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="bg-card rounded-[4rem] border border-border p-12 shadow-3xl h-[700px] flex flex-col">
                         <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-5 leading-none">
                               <div className="w-3 h-10 bg-indigo-500 rounded-full" /> Live Support Session
                            </h3>
                            {selectedUser.supportMessages?.some((m: any) => !m.isReadByAdmin) && (
                               <motion.button whileTap={{ scale: 0.95 }} onClick={() => adminAPI.markMessagesAsRead(selectedUser._id).then(() => loadStats())} className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/30">Read All</motion.button>
                            )}
                         </div>

                         <div className="flex-1 overflow-y-auto px-4 space-y-6 bg-secondary/30 rounded-[2.5rem] p-8 shadow-inner mb-8">
                            {selectedUser.supportMessages?.map((msg: any, idx: number) => {
                               const isAdmin = msg.sender === 'admin';
                               return (
                                  <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                     <div className={`max-w-[80%] p-6 rounded-[2rem] text-sm font-bold leading-relaxed shadow-sm ${isAdmin ? 'bg-foreground text-background rounded-br-none' : 'bg-card text-foreground rounded-bl-none shadow-xl border border-border'}`}>
                                        {msg.text}
                                        <div className={`mt-2 text-[9px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                          <Clock className="w-3 h-3" /> {format(new Date(msg.createdAt), 'HH:mm')}
                                          {isAdmin && (
                                            msg.isReadByUser ? <CheckCheck className="w-3 h-3 text-blue-400" /> : <Check className="w-3 h-3" />
                                          )}
                                        </div>
                                     </div>
                                  </div>
                               );
                            })}
                            <div ref={chatEndRef} />
                         </div>

                         <div className="relative group">
                            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type a professional response..." className="w-full h-24 p-6 pr-20 bg-secondary border-none rounded-3xl font-black tracking-tight resize-none focus:ring-4 focus:ring-blue-600/10 transition-all text-sm" />
                            <motion.button whileTap={{ scale: 0.9 }} onClick={handleReply} disabled={sendingReply || !replyText.trim()} className="absolute right-4 bottom-4 w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all">
                               {sendingReply ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizontal className="w-5 h-5" />}
                            </motion.button>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-12">
                      <div className="bg-card rounded-[3.5rem] border border-border p-10 shadow-3xl sticky top-32">
                         <h4 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-4 underline decoration-blue-500/20 underline-offset-8">
                            <Shield className="w-6 h-6 text-blue-500" /> Account Security
                         </h4>
                         <div className="space-y-4 mb-4 mb-10">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground block mb-4">Privilege Level</label>
                            {['user', 'doctor', 'superadmin'].map(r => (
                               <button key={r} onClick={() => adminAPI.updateRole(selectedUser._id, r).then(() => handleOpenUser(selectedUser._id))} className={`w-full py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedUser.role === r ? 'bg-foreground text-background border-foreground shadow-xl' : 'bg-secondary border-transparent text-muted-foreground hover:border-border'}`}>{r}</button>
                            ))}
                         </div>
                         <button onClick={() => adminAPI.toggleBan(selectedUser._id).then(() => handleOpenUser(selectedUser._id))} className={`w-full h-16 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 ${selectedUser.isBanned ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white shadow-rose-500/40'}`}>
                            {selectedUser.isBanned ? 'Unban Account' : 'Restrict Access'}
                         </button>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[3.5rem] p-10 text-white shadow-3xl shadow-blue-500/30 group overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000" />
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-4">Quick Health Status</p>
                         <p className="text-4xl font-black tracking-tighter mb-8 italic">Healthy Profile</p>
                         <div className="h-64 w-full bg-white/5 rounded-3xl backdrop-blur-xl border border-white/10 flex items-center justify-center p-6">
                            <p className="text-center text-[10px] font-black uppercase tracking-widest leading-loose text-white/40">Real-time metrics monitoring active...</p>
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

         </div>
      </main>

      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setIsProductModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-4xl bg-card rounded-[4rem] shadow-3xl border border-border overflow-hidden flex flex-col h-[90svh]">
               <div className="p-10 bg-muted/50 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/30">
                        {editingProduct ? <Pencil className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
                     </div>
                     <h3 className="text-3xl font-black tracking-tighter leading-none uppercase">{editingProduct ? 'Tahrirlash' : 'Yangi Mahsulot'}</h3>
                  </div>
                  <button onClick={() => setIsProductModalOpen(false)} className="w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-accent transition-all"><X className="w-7 h-7" /></button>
               </div>
               
               <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-10 space-y-10 text-foreground">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <label className="px-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Product Name (UZ / RU / EN)</label>
                       <input value={productForm.name.uz} onChange={e => setProductForm({...productForm, name: {...productForm.name, uz: e.target.value}})} placeholder="Ismi (O'zbekcha)" className="w-full h-14 px-6 bg-background rounded-2xl font-bold border-none" required />
                       <input value={productForm.name.ru} onChange={e => setProductForm({...productForm, name: {...productForm.name, ru: e.target.value}})} placeholder="Имя (Русский)" className="w-full h-14 px-6 bg-background rounded-2xl font-bold border-none" required />
                       <input value={productForm.name.en} onChange={e => setProductForm({...productForm, name: {...productForm.name, en: e.target.value}})} placeholder="Name (English)" className="w-full h-14 px-6 bg-background rounded-2xl font-bold border-none" required />
                    </div>
                    <div className="space-y-6">
                       <label className="px-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Categorization</label>
                       <div className="flex gap-4">
                          <input value={productForm.emoji} onChange={e => setProductForm({...productForm, emoji: e.target.value})} placeholder="Emoji" className="w-20 h-14 text-center bg-background rounded-2xl text-2xl" />
                          <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="flex-1 h-14 px-6 bg-background rounded-2xl font-black uppercase tracking-widest text-[10px]">
                             {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.id}</option>)}
                          </select>
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 ml-2">GI Index</p>
                             <input type="number" value={productForm.gi} onChange={e => setProductForm({...productForm, gi: Number(e.target.value)})} className="w-full h-14 px-6 bg-blue-50 rounded-2xl font-black text-xl text-blue-600 shadow-inner" />
                          </div>
                          <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-purple-500 ml-2">GL Load</p>
                             <input type="number" value={productForm.gl} onChange={e => setProductForm({...productForm, gl: Number(e.target.value)})} className="w-full h-14 px-6 bg-purple-50 rounded-2xl font-black text-xl text-purple-600 shadow-inner" />
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-10 border-t border-border">
                     <label className="px-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Health Advisory (UZ / RU / EN)</label>
                     <textarea value={productForm.advice.uz} onChange={e => setProductForm({...productForm, advice: {...productForm.advice, uz: e.target.value}})} placeholder="Maslahatlar (O'zbekcha)" className="w-full h-24 p-6 bg-background rounded-3xl font-bold border-none resize-none" />
                     <textarea value={productForm.advice.ru} onChange={e => setProductForm({...productForm, advice: {...productForm.advice, ru: e.target.value}})} placeholder="Советы (Русский)" className="w-full h-24 p-6 bg-background rounded-3xl font-bold border-none resize-none" />
                     <textarea value={productForm.advice.en} onChange={e => setProductForm({...productForm, advice: {...productForm.advice, en: e.target.value}})} placeholder="Advice (English)" className="w-full h-24 p-6 bg-background rounded-3xl font-bold border-none resize-none" />
                  </div>

                  <div className="pt-10 flex gap-4">
                     <motion.button whileTap={{ scale: 0.95 }} type="submit" className="flex-1 h-20 bg-blue-600 text-white font-black uppercase tracking-widest rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-4 transition-all leading-none">
                        Save Changes <Save className="w-7 h-7" />
                     </motion.button>
                     <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={() => setIsProductModalOpen(false)} className="px-10 h-20 bg-secondary text-muted-foreground font-black uppercase tracking-widest text-[10px] rounded-full hover:text-rose-500 transition-colors">Cancel</motion.button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
