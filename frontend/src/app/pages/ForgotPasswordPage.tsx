import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, Loader2, SendHorizontal, CheckCircle2, Activity } from 'lucide-react';
import { authAPI } from '../utils/api';
import { useApp } from '../contexts/AppContext';
import { translations } from '../utils/translations';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const { language } = useApp();
  const navigate = useNavigate();
  const t = translations[language];

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.forgotPassword({ email });
      if (data.success) {
        setSent(true);
        toast.success(t.sent);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full h-16 pl-14 pr-4 rounded-3xl border-none bg-secondary text-foreground focus:ring-2 focus:ring-blue-500/20 font-bold text-lg transition-all placeholder:font-medium placeholder:text-muted-foreground/30";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden text-foreground">
      <div className="absolute top-0 right-0 w-full h-[50%] bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl shadow-blue-500/30 text-white">
            <Activity className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight leading-none mb-3">
            {t.forgotPassword}
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
            Password Recovery Process
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-xl rounded-[2.5rem] shadow-3xl border border-border p-8 md:p-12">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <p className="text-sm font-bold text-muted-foreground text-center px-4 leading-relaxed">
                  {t.enterEmailToReset}
                </p>
                <div className="relative group pt-4">
                  <Mail className="absolute left-5 top-[calc(50%+8px)] -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@domain.com" className={inputClass} />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black uppercase tracking-widest rounded-3xl hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/30"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>{t.sendLink} <SendHorizontal className="w-5 h-5" /></>}
              </button>

              <div className="text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2rem] text-muted-foreground hover:text-blue-600 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> {t.backToLogin}
                </Link>
              </div>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8 py-4">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-foreground mb-2">{t.sent}</h3>
                <p className="text-sm font-bold text-muted-foreground px-6">
                  {t.checkEmail}. {language === 'uz' ? 'Agar xat kelmasa, spam papkasini ham tekshirib ko\'ring.' : 'Если письмо не пришло, проверьте папку спам.'}
                </p>
              </div>
              <Link to="/login" className="w-full h-16 bg-secondary text-foreground font-black uppercase tracking-widest rounded-3xl hover:bg-accent transition-all flex items-center justify-center gap-2">
                {t.backToLogin}
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
