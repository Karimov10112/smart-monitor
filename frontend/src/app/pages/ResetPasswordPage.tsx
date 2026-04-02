import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import { authAPI } from '../utils/api';
import { useApp } from '../contexts/AppContext';
import { translations } from '../utils/translations';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const { language } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const t = translations[language];

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(language === 'uz' ? 'Parollar mos emas' : 'Пароли не совпадают');
      return;
    }
    if (!token) {
      toast.error('Token topilmadi');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword({ token, password });
      if (data.success) {
        setSuccess(true);
        toast.success(t.passwordUpdated);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full h-16 pl-14 pr-12 rounded-3xl border-none bg-secondary text-foreground focus:ring-2 focus:ring-blue-500/20 font-bold text-lg transition-all placeholder:font-medium placeholder:text-muted-foreground/30";
  const labelClass = "block text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-4 ml-2";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 text-foreground">
      <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-indigo-600/10 to-transparent pointer-events-none" />
      
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg relative z-10">
        <div className="text-center mb-10">
          <motion.div whileHover={{ scale: 1.05 }} className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl shadow-blue-500/30 text-white">
            <ShieldCheck className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-black text-foreground tracking-tight leading-none mb-3">
             {t.resetPassword}
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
             Secure Password Update
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-xl rounded-[2.5rem] shadow-3xl border border-border p-8 md:p-12">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-8">
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className={labelClass}>{t.newPassword}</label>
                     <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className={inputClass} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className={labelClass}>{t.confirmNewPassword}</label>
                     <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" className={inputClass} />
                     </div>
                  </div>
               </div>

               <button
                type="submit" disabled={loading}
                className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black uppercase tracking-widest rounded-3xl hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/30"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>{t.updatePassword} <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8 py-4">
               <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-500 mx-auto shadow-inner">
                  <CheckCircle2 className="w-12 h-12" />
               </div>
               <div>
                  <h3 className="text-3xl font-black text-foreground mb-2">{t.success}</h3>
                  <p className="text-sm font-bold text-muted-foreground px-6">
                    {t.passwordUpdated}. {language === 'uz' ? 'Endi yangi parolingiz bilan tizimga kirishingiz mumkin.' : 'Теперь вы можете войти с новым паролем.'}
                  </p>
               </div>
               <button onClick={() => navigate('/login')} className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black uppercase tracking-widest rounded-3xl hover:opacity-95 shadow-2xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  {t.signIn}
               </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
