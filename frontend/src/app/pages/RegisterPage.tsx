import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../utils/api';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/translations';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { login } = useAuth();
  const { language } = useApp();
  const navigate = useNavigate();
  const t = translations[language];

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError(language === 'uz' ? 'Parollar mos emas' : language === 'ru' ? 'Пароли не совпадают' : 'Passwords do not match');
    if (password.length < 6) return setError(language === 'uz' ? 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' : 'Min 6 characters');
    setLoading(true);
    try {
      const { data } = await authAPI.register({ email, password, firstName, lastName, language });
      if (data.success) {
        setUserId(data.userId);
        setStep('otp');
        toast.success(t.codeSent);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.verifyOTP({ userId, otp });
      if (data.success) {
        login(data.token, data.refreshToken, data.user);
        toast.success(t.success);
        navigate('/complete-profile');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full h-14 pl-12 pr-4 rounded-2xl border-none bg-secondary text-foreground focus:ring-2 focus:ring-blue-500/20 font-bold text-sm transition-all placeholder:font-medium placeholder:text-muted-foreground/30";
  const labelClass = "block text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-2 ml-2";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 text-foreground">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl relative z-10">
        <div className="text-center mb-10">
          <motion.div whileHover={{ scale: 1.05 }} className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl shadow-blue-500/30 text-white">
            <Activity className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Qand Nazorati</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[11px]">
            {t.signUp} • Join the Community
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-xl rounded-[2.5rem] shadow-3xl border border-border overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 md:p-12">
                <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter mb-2">
                   {language === 'uz' ? 'Ro\'yxatdan o\'tish' : t.signUp}
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-8 italic">Yangi foydalanuvchi hisobini yaratish</p>

                {error && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6 flex items-center gap-3 text-rose-600 text-xs font-bold">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className={labelClass}>{t.firstName}</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                         <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="Azamat" className={inputClass} />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className={labelClass}>{t.lastName}</label>
                       <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required placeholder="Karimov" className={inputClass} />
                    </div>
                  </div>

                   <div className="space-y-2">
                     <label className={labelClass}>{t.email}</label>
                     <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@domain.com" className={inputClass} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className={labelClass}>{t.password}</label>
                       <div className="relative group">
                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                         <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className={inputClass} />
                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                           {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                         </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className={labelClass}>{language === 'uz' ? 'Tasdiqlang' : 'Confirm'}</label>
                       <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                         <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" className={inputClass} />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.01 }}
                    type="submit" disabled={loading}
                    className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest rounded-3xl hover:opacity-95 transition-all disabled:opacity-60 flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/30"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>{t.signUp} <ArrowRight className="w-5 h-5" /></>}
                  </motion.button>
                </form>

                 <div className="mt-12 text-center">
                   <p className="text-muted-foreground text-sm font-bold">
                     {t.haveAccount}
                    <Link to="/login" className="ml-2 text-blue-600 font-black hover:text-blue-700 transition-colors uppercase tracking-widest text-xs underline decoration-2 underline-offset-4">
                      {t.loginNow}
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="p-8 md:p-12">
                 <div className="text-center mb-10">
                   <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner transition-colors">📧</div>
                   <h2 className="text-3xl font-black text-foreground tracking-tight mb-3">{t.enterCode}</h2>
                   <p className="text-sm font-bold text-muted-foreground">{t.codeSent}: <span className="text-blue-500">{email}</span></p>
                 </div>

                 <form onSubmit={handleVerifyOTP} className="space-y-8">
                   <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} className="w-full text-center text-5xl font-black tracking-[0.4em] h-24 rounded-[2rem] border-none bg-secondary text-foreground focus:ring-4 focus:ring-blue-500/10 placeholder:text-muted-foreground/20 transition-all outline-none" />
                   <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={loading || otp.length !== 6} className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest rounded-3xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/30">
                     {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>{t.verify} <CheckCircle2 className="w-5 h-5 text-white" /></>}
                   </motion.button>
                   <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={() => setStep('form')} className="w-full text-[10px] font-black uppercase tracking-[0.2rem] text-muted-foreground hover:text-foreground transition-colors">← {t.back}</motion.button>
                 </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
