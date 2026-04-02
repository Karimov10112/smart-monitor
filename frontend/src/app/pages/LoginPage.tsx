import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import { useApp } from '../contexts/AppContext';
import { translations } from '../utils/translations';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Mail, Lock, LogIn, Database, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { language } = useApp();
  const navigate = useNavigate();
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password, language });
      if (data.success) {
        login(data.token, data.refreshToken, data.user);
        toast.success(t.success);
        navigate(data.user.role === 'superadmin' ? '/admin' : '/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" as any } }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-700">
      
      {/* Background Blobs (Colorful) */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ x: [-20, 20, -20], y: [-20, 20, -20], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ x: [20, -20, 20], y: [20, -20, 20], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-emerald-500/10 blur-[100px] rounded-full" 
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-10">
           <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-8 shadow-3xl shadow-blue-500/40 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <Database className="w-10 h-10" />
           </div>
           <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none mb-3">
              Qand <span className="text-blue-600 underline decoration-blue-500/20 underline-offset-8">Nazorati</span>
           </h1>
           <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] mt-4 flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-blue-500" /> Smart Monitoring System
           </p>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-card/80 backdrop-blur-2xl p-1 rounded-[3.5rem] shadow-3xl border border-border"
        >
          {/* New User Banner */}
          <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 p-8 rounded-t-[3.5rem] border-b border-border text-center">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">{t.noAccount}</p>
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/30"
            >
              {t.signUp} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-10 pt-6">
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-4 ml-4">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="text" 
                      required 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin yoki email@mail.com"
                      className="w-full h-16 pl-14 pr-6 rounded-[1.5rem] bg-secondary border-none text-foreground font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-4 ml-4">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="password" 
                      required 
                      value={password} 
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-16 pl-14 pr-6 rounded-[1.5rem] bg-secondary border-none text-foreground font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    />
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-end px-2">
               <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-all">{t.forgotPassword}</Link>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              type="submit"
              disabled={loading}
              className="w-full h-18 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-blue-500/30 transition-all flex items-center justify-center gap-3 text-sm"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>{t.login} <ChevronRight className="w-5 h-5" /></>}
            </motion.button>
            
            <div className="text-center pt-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t.noAccount} <Link to="/register" className="text-blue-600 hover:underline underline-offset-4 ml-2">{t.register}</Link>
               </p>
            </div>
          </form>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-12 text-center">
           <p className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground opacity-50">
              © {new Date().getFullYear()} QAND NAZORATI. ALL RIGHTS RESERVED.
           </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
