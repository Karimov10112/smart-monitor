import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, MapPin, User, Calendar, HeartPulse, ChevronRight, Phone, CheckCircle2, Save, LogOut } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import { translations } from '../utils/translations';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';

const UZ_REGIONS = [
  'Toshkent shahri', 'Toshkent viloyati', 'Samarqand viloyati', 'Buxoro viloyati',
  'Andijon viloyati', 'Farg\'ona viloyati', 'Namangan viloyati', 'Qashqadaryo viloyati',
  'Surxondaryo viloyati', 'Navoiy viloyati', 'Xorazm viloyati', 'Sirdaryo viloyati',
  'Jizzax viloyati', 'Qoraqalpog\'iston Respublikasi',
];

const UZ_DISTRICTS: Record<string, string[]> = {
  'Toshkent shahri': ['Chilonzor', 'Yunusobod', 'Mirzo Ulug‘bek', 'Yashnobod', 'Mirobod', 'Shayxontohur', 'Uchtepa', 'Jakasaroiy', 'Olmazor', 'Sergeli', 'Yangihayot', 'Bektemir'],
  'Toshkent viloyati': ['Angren sh.', 'Olmaliq sh.', 'Chirchiq sh.', 'Bekobod sh.', 'Oqqo‘rg‘on', 'Olmaliq', 'Piskent', 'Qibray', 'Zangiota', 'Yangiyo‘l', 'Chinoz', 'Bo‘stonliq', 'Parkent'],
  'Samarqand viloyati': ['Samarqand sh.', 'Kattaqo‘rg‘on sh.', 'Samarqand t.', 'Pastdarg‘om', 'Paxtachi', 'Narpay', 'Kattaqo‘rg‘on t.', 'Ishtixon', 'Oqdaryo', 'Bulung‘ur', 'Jomboy', 'Toyloq', 'Urgut', 'Nurobod', 'Qo‘shrabot'],
  'Buxoro viloyati': ['Buxoro sh.', 'Kogon sh.', 'Buxoro t.', 'Kogon t.', 'G‘ijduvon', 'Shofirkon', 'Vobkent', 'Romitan', 'Peshku', 'Jondor', 'Olot', 'Qorako‘l', 'Qorovulbozor'],
  'Andijon viloyati': ['Andijon sh.', 'Xonobod sh.', 'Andijon t.', 'Asaka', 'Shahrixon', 'Oltinko‘l', 'Baliqchi', 'Paxtaobod', 'Izboskan', 'Qo‘rg‘ontepa', 'Jalaquduq', 'Xo‘jaobod', 'Bo‘ston', 'Ulug‘nor', 'Marhamat'],
  'Farg\'ona viloyati': ['Farg‘ona sh.', 'Qo‘qon sh.', 'Marg‘ilon sh.', 'Quvasoy sh.', 'Farg‘ona t.', 'Oltiariq', 'Rishton', 'Bag‘dod', 'Uchko‘prik', 'Buvayda', 'Yozyovon', 'Toshloq', 'Quva', 'O‘zbekiston', 'Furqat', 'Dang‘ara', 'Besharik', 'Sux'],
  'Namangan viloyati': ['Namangan sh.', 'Namangan t.', 'Chust', 'Pop', 'Uychi', 'Uchqo‘rg‘on', 'Norin', 'Yangiqo‘rg‘on', 'Kosonsoy', 'To‘raqo‘rg‘on', 'Mingbuloq'],
  'Qashqadaryo viloyati': ['Qarshi sh.', 'Qarshi t.', 'Shaxrisabz sh.', 'Shaxrisabz t.', 'Kitob', 'Yakkabog‘', 'Qamashi', 'G‘uzor', 'Dehqonobod', 'Nishon', 'Kasbi', 'Ko‘kdala', 'Mirishkor', 'Muborak', 'Chiroqchi'],
  'Surxondaryo viloyati': ['Termiz sh.', 'Termiz t.', 'Denov', 'Sho‘rchi', 'Jarqo‘rg‘on', 'Qumqo‘rg‘on', 'Angor', 'Sherobod', 'Boysun', 'Sariosiyo', 'Uzun', 'Oltinsoy', 'Qiziriq', 'Muzrabot'],
  'Navoiy viloyati': ['Navoiy sh.', 'Zarafshon sh.', 'Karmana', 'Qiziltepa', 'Xatirchi', 'Nurota', 'Navbahor', 'Konimex', 'Tomdi', 'Uchkuduq'],
  'Xorazm viloyati': ['Urganch sh.', 'Xiva sh.', 'Urganch t.', 'Xiva t.', 'Xonqa', 'Gurlan', 'Shovot', 'Qo‘shko‘pir', 'Bog‘ot', 'Hazorasp', 'Yangiariq', 'Yangibozor', 'Tuproqqala'],
  'Sirdaryo viloyati': ['Guliston sh.', 'Shirin sh.', 'Yangiyer sh.', 'Guliston t.', 'Sirdaryo t.', 'Sayxunobod', 'Boyovut', 'Mirzaobod', 'Oqoltin', 'Sardoba', 'Xovos'],
  'Jizzax viloyati': ['Jizzax sh.', 'Jizzax t.', 'Sharof Rashidov', 'Do‘stlik', 'Paxtakor', 'Zafarobod', 'Mirzachul', 'Arnasoy', 'Baxmal', 'G‘allaorol', 'Forish', 'Zomin', 'Yangiobod'],
  'Qoraqalpog\'iston Respublikasi': ['Nukus sh.', 'Nukus t.', 'Amudaryo', 'Beruniy', 'To‘rtko‘l', 'Ellikqala', 'Xo‘jayli', 'Taxiatosh', 'Shumanay', 'Qonliko‘l', 'Qo‘ng‘irot', 'Mo‘ynoq', 'Chimboy', 'Kegeyli', 'Qorao‘zak', 'Taxtako‘pir', 'Bo‘zatov'],
};

const DIABETES_TYPES = [
  { value: 'type1', uz: '1-tip diabet', ru: 'Диабет 1 типа', en: 'Type 1 Diabetes' },
  { value: 'type2', uz: '2-tip diabet', ru: 'Диабет 2 типа', en: 'Type 2 Diabetes' },
  { value: 'prediabetes', uz: 'Prediabet', ru: 'Предиабет', en: 'Prediabetes' },
  { value: 'gestational', uz: 'Homiladorlik diabeti', ru: 'Гестационный диабет', en: 'Gestational Diabetes' },
  { value: 'none', uz: 'Yo\'q (monitoring)', ru: 'Нет (мониторинг)', en: 'None (monitoring)' },
];

export default function CompleteProfilePage() {
  const { language } = useApp();
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', telegramUsername: '',
    dateOfBirth: '', gender: '', region: '',
    district: '', mfy: '', diabetesType: '', doctorName: '',
    email: '', currentPassword: '', newPassword: '',
  });
  const [loading, setLoading] = useState(false);

  // Pre-fill form if user data exists (Editing Mode)
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        telegramUsername: user.telegramUsername || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        region: user.region || '',
        district: user.district || '',
        mfy: user.mfy || '',
        diabetesType: user.diabetesType || '',
        doctorName: user.doctorName || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
      });
    }
  }, [user]);

  const set = (key: string, value: string) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      // Clear district if region changes
      if (key === 'region') next.district = '';
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.completeProfile(form);
      if (data.success) {
        // If password was updated, we need to handle that specifically if needed
        // but the backend just returns success.
        
        // Update profile credentials if changed
        if (user && (form.newPassword || (form.email && form.email !== user.email))) {
           if (form.email && form.email !== user.email) {
              await authAPI.updateProfile({ email: form.email });
           }
           if (form.newPassword) {
              await authAPI.updatePassword({ 
                currentPassword: form.currentPassword, 
                newPassword: form.newPassword 
              });
           }
        }

        toast.success(t.success);
        updateUser(data.user);
        
        // Small delay to let context update
        setTimeout(() => {
          navigate(user?.role === 'superadmin' ? '/admin' : '/');
        }, 300);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = user?.isProfileComplete;
  const inputClass = "w-full px-4 h-14 rounded-2xl border-none bg-secondary text-foreground focus:ring-4 focus:ring-blue-500/10 font-bold text-sm transition-all placeholder:font-medium placeholder:text-muted-foreground/30";
  const labelClass = "block text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-2 ml-2";
  const sectionTitle = "flex items-center gap-3 mb-6 p-1 pr-4 bg-secondary w-fit rounded-2xl";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 transition-colors duration-500 overflow-x-hidden text-foreground">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl relative z-10 py-10">
        <div className="text-center mb-10">
           <motion.div 
             initial={{ scale: 0.8 }} animate={{ scale: 1 }}
             className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl shadow-blue-500/30 text-white"
           >
             <User className="w-12 h-12" />
           </motion.div>
           <h1 className="text-4xl font-black text-foreground tracking-tight leading-none mb-3">
             {isEditing ? (t.editProfile || 'Profilni tahrirlash') : t.profileTitle}
           </h1>
           <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">
             {isEditing ? (t.updateYourData || 'O\'z ma\'lumotlaringizni yangilang') : t.profileSubtitle}
           </p>
        </div>

        <Card className="p-1 border border-border bg-card/80 backdrop-blur-xl shadow-3xl rounded-[3rem] overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
            
            {/* Personal Info */}
            <div className="space-y-8">
              <div className={sectionTitle}>
                 <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                    <User className="w-5 h-5" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-widest text-foreground/80">{t.personalInfo}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={labelClass}>{t.firstName}</label>
                  <input type="text" value={form.firstName} onChange={e => set('firstName', e.target.value)} className={inputClass} placeholder="Azamat" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>{t.lastName}</label>
                  <input type="text" value={form.lastName} onChange={e => set('lastName', e.target.value)} className={inputClass} placeholder="Karimov" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={labelClass}>{t.phone}</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+998 90 123 45 67" className={inputClass + " pl-10"} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={labelClass}>{t.dob}</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className={inputClass + " pl-10"} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className={labelClass}>{t.gender}</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { v: 'male', uz: 'Erkak', ru: 'Мужской', en: 'Male' },
                    { v: 'female', uz: 'Ayol', ru: 'Женский', en: 'Female' },
                    { v: 'other', uz: 'Boshqa', ru: 'Другой', en: 'Other' },
                  ].map(g => (
                    <button key={g.v} type="button" onClick={() => set('gender', g.v)}
                      className={`h-16 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${form.gender === g.v ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-secondary text-muted-foreground hover:bg-accent'}`}>
                      {g[language] || g.uz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-8">
              <div className={sectionTitle}>
                 <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                    <MapPin className="w-5 h-5" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-widest text-foreground/80">{t.location}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className={labelClass}>{t.region} *</label>
                <select value={form.region} onChange={e => set('region', e.target.value)} className={inputClass}>
                  <option value="">{t.select}</option>
                  {UZ_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className={labelClass}>{t.districtCity} *</label>
                {form.region && UZ_DISTRICTS[form.region] ? (
                  <select value={form.district} onChange={e => set('district', e.target.value)} className={inputClass} disabled={!form.region}>
                    <option value="">{t.select}</option>
                    {UZ_DISTRICTS[form.region].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : (
                  <input type="text" value={form.district} onChange={e => set('district', e.target.value)} className={inputClass} placeholder="Chilonzor t." disabled={!form.region} />
                )}
              </div>
              <div className="space-y-3">
                <label className={labelClass}>{t.mfy} *</label>
                <input type="text" value={form.mfy} onChange={e => set('mfy', e.target.value)} className={inputClass} placeholder={"O'rikzor" + (language === 'uz' ? ' MFY' : ' МСГ')} disabled={!form.district} />
              </div>
            </div>
            </div>

            {/* Medical Info */}
            <div className="space-y-8">
              <div className={sectionTitle}>
                 <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
                    <HeartPulse className="w-5 h-5" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-widest text-foreground/80">{t.medicalInfo}</span>
              </div>
              <div className="space-y-4">
                <label className={labelClass}>{t.diabetesType} *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {DIABETES_TYPES.map(dt => (
                    <button key={dt.value} type="button" onClick={() => set('diabetesType', dt.value)}
                      className={`px-6 h-16 rounded-[1.5rem] flex items-center gap-4 text-sm font-bold transition-all border-2 ${form.diabetesType === dt.value ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-transparent bg-secondary text-muted-foreground hover:border-border/50'}`}>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${form.diabetesType === dt.value ? 'border-blue-600 bg-blue-600' : 'border-border'}`}>
                         {form.diabetesType === dt.value && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      {dt[language] || dt.uz}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <label className={labelClass}>{t.doctorName}</label>
                <input type="text" value={form.doctorName} onChange={e => set('doctorName', e.target.value)} className={inputClass} placeholder={"Dr. " + (language === 'uz' ? 'Azamat Karimov' : 'Азамат Каримов')} />
              </div>
            </div>

            {/* Credentials Update */}
            <div className="space-y-8 pt-4">
              <div className={sectionTitle}>
                 <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <Save className="w-5 h-5" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-widest text-foreground/80">
                    {t.changeCredentials}
                 </span>
              </div>
              
              <div className="space-y-6 bg-secondary/50 p-6 rounded-3xl border border-border">
                <div className="space-y-2">
                  <label className={labelClass}>{t.email}</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>{t.currentPassword}</label>
                    <input 
                      type="password" 
                      value={form.currentPassword} 
                      onChange={e => set('currentPassword', e.target.value)} 
                      className={inputClass} 
                      placeholder="••••••••" 
                      autoComplete="new-password"
                    />
                    <p className="text-[9px] text-muted-foreground ml-2 italic">* {t.passwordRequiredForChange || 'Email yoki parolni o\'zgartirish uchun kerak'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>{t.newPassword}</label>
                    <input 
                      type="password" 
                      value={form.newPassword} 
                      onChange={e => set('newPassword', e.target.value)} 
                      className={inputClass} 
                      placeholder="••••••••" 
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10 space-y-6">
              <button type="submit" disabled={loading || !form.region || !form.district || !form.diabetesType}
                className="w-full h-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-black uppercase tracking-widest rounded-[2rem] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/40 active:scale-[0.97] transition-all text-lg">
                {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : 
                  <>{isEditing ? (t.saveBtn || 'Saqlash') : t.saveContinue} 
                    {isEditing ? <Save className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                  </>
                }
              </button>

              <button type="button" onClick={() => navigate(user?.role === 'superadmin' ? '/admin' : '/')} className="w-full text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground hover:text-blue-600 transition-all">
                {isEditing ? (t.backBtn || 'Orqaga') : t.fillLater}
              </button>

              <button type="button" onClick={logout} className="w-full text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 hover:text-rose-700 transition-all flex justify-center items-center gap-2 mt-4">
                <LogOut className="w-4 h-4" /> {t.logoutUser || 'Chiqish'}
              </button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
