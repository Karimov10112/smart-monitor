import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Pill, Syringe, Trash2, Send, Loader2, BellRing, CheckCircle2, AlarmClock } from 'lucide-react';
import { reminderAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useTelegramLink } from '../utils/useTelegramLink';
import { toast } from 'sonner';
import { nativeRemindersAvailable, exactAlarmsAllowed, openExactAlarmSettings } from '../utils/nativeReminders';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'uz' | 'ru' | 'en';
  t: any;
  reminders: any[];
  onRefresh: () => void;
}

const COPY = {
  uz: {
    tgTitle: 'Telegram orqali eslatmalar',
    tgConnected: 'Telegram ulangan — xabarlar yuboriladi',
    tgHint: 'Sayt yopiq bõlsa ham Telegramingizga xabar boradi',
    reconnect: 'Qayta ulaş',
    connect: 'Botni ulaş',
    active: 'Faol eslatmalar',
    subtitle: 'Dori va insulin qabul qiliş vaqtlarini belgilang',
    emptyHint: 'Çap tomondagi şakl orqali birinçi eslatmani qõşing',
    daily: 'Har kuni',
    required: 'Majburiy maydon',
    exactTitle: 'Eslatmalar aniq vaqtda kelsin',
    exactDesc: 'Telefon sozlamalarida "Signal va eslatmalar" ruxsatini yoqing, aks holda eslatma bir necha daqiqa kech kelişi mumkin.',
    exactBtn: 'Ruxsat beriş',
  },
  ru: {
    tgTitle: 'Напоминания в Telegram',
    tgConnected: 'Telegram подключен — уведомления придут',
    tgHint: 'Уведомления придут в Telegram, даже если сайт закрыт',
    reconnect: 'Переподключить',
    connect: 'Подключить',
    active: 'Активные напоминания',
    subtitle: 'Укажите время приёма лекарств и инсулина',
    emptyHint: 'Добавьте первое напоминание с помощью формы',
    daily: 'Ежедневно',
    required: 'Обязательное поле',
    exactTitle: 'Напоминания точно по времени',
    exactDesc: 'Включите разрешение «Будильники и напоминания» в настройках телефона, иначе напоминание может прийти на несколько минут позже.',
    exactBtn: 'Разрешить',
  },
  en: {
    tgTitle: 'Reminders in Telegram',
    tgConnected: 'Telegram connected — messages will be sent',
    tgHint: 'You will get messages in Telegram even when the site is closed',
    reconnect: 'Reconnect',
    connect: 'Connect bot',
    active: 'Active reminders',
    subtitle: 'Set times for medication and insulin',
    emptyHint: 'Add your first reminder using the form',
    daily: 'Daily',
    required: 'Required field',
    exactTitle: 'Get reminders on time',
    exactDesc: 'Turn on "Alarms & reminders" for this app in phone settings, otherwise a reminder may arrive a few minutes late.',
    exactBtn: 'Allow',
  },
};

export const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, language, t, reminders, onRefresh }) => {
  const { user } = useAuth();
  const telegramLink = useTelegramLink(isOpen);
  const c = COPY[language] || COPY.uz;
  const [form, setForm] = useState({
    type: 'medication',
    name: '',
    dose: '',
    time: '',
    repeatDaily: true,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [exactOk, setExactOk] = useState(true);

  // Android app: check the "Alarms & reminders" permission each time the dialog opens
  useEffect(() => {
    if (!isOpen || !nativeRemindersAvailable) return;
    exactAlarmsAllowed().then(setExactOk);
    const onVisible = () => { if (document.visibilityState === 'visible') exactAlarmsAllowed().then(setExactOk); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!form.name.trim() || !form.dose.trim() || !form.time) return;
    setLoading(true);
    try {
      await reminderAPI.create(form);
      toast.success(t.reminderSaved || 'Reminder saved');
      onRefresh();
      setForm({ type: 'medication', name: '', dose: '', time: '', repeatDaily: true, notes: '' });
      setTouched(false);
    } catch (err) {
      toast.error('Error saving reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await reminderAPI.delete(id);
      toast.success(t.reminderDeleted || 'Deleted');
      onRefresh();
    } catch {
      toast.error('Error deleting reminder');
    } finally {
      setDeletingId(null);
    }
  };

  const sortedReminders = [...reminders].sort((a, b) => a.time.localeCompare(b.time));

  const fieldError = (v: string) => touched && !v.trim();
  const inputClass = (invalid: boolean) =>
    `w-full h-11 px-3.5 rounded-[10px] border bg-input-background text-[15px] text-foreground placeholder:text-muted-foreground/70 outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-[3px] focus:ring-primary/20 ${invalid ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-input hover:border-muted-foreground/40'}`;
  const labelClass = 'text-sm font-medium text-foreground mb-1.5 block';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-6" style={{ zIndex: 1500 }}>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reminder-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full sm:max-w-3xl bg-card text-card-foreground rounded-t-3xl sm:rounded-3xl shadow-pop border border-border overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[85vh]"
          >
            {/* Header */}
            <div className="px-5 sm:px-6 pt-5 pb-4 flex items-start justify-between gap-4 border-b border-border">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground grid place-items-center shrink-0">
                  <BellRing className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 id="reminder-title" className="text-lg font-semibold leading-tight text-foreground">{t.reminders || t.addReminder}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{c.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-[10px] grid place-items-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Telegram Bot Integration Banner */}
              <div className="mx-5 sm:mx-6 mt-5 p-3.5 rounded-2xl border border-[#229ED9]/25 bg-[#229ED9]/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#229ED9] grid place-items-center text-white shrink-0">
                    <Send className="w-4 h-4 -ml-0.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{c.tgTitle}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {user?.telegramChatId && <CheckCircle2 className="w-3.5 h-3.5 text-glucose-in-range shrink-0" />}
                      {user?.telegramChatId ? c.tgConnected : c.tgHint}
                    </p>
                  </div>
                </div>
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-[#229ED9] hover:bg-[#1d8cc1] text-white text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  {user?.telegramChatId ? c.reconnect : c.connect}
                </a>
              </div>

              {nativeRemindersAvailable && !exactOk && reminders.length > 0 && (
                <div className="mx-5 sm:mx-6 mt-3 p-3.5 rounded-2xl border border-glucose-high/30 bg-glucose-high/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <AlarmClock className="w-5 h-5 text-glucose-high shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{c.exactTitle}</p>
                      <p className="text-xs text-muted-foreground">{c.exactDesc}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openExactAlarmSettings()}
                    className="h-9 px-3.5 rounded-[10px] bg-primary text-primary-foreground text-sm font-semibold whitespace-nowrap hover:bg-primary/90 transition-colors"
                  >
                    {c.exactBtn}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0 p-5 sm:p-6">
                {/* Form Section */}
                <form onSubmit={handleSubmit} noValidate className="space-y-4 md:pr-6">
                  <h4 className="text-sm font-semibold text-foreground">{t.addReminder}</h4>
                  {/* Type Selection */}
                  <div>
                    <span className={labelClass}>{t.reminderType}</span>
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted">
                      {[
                        { id: 'medication', icon: Pill, label: t.medication },
                        { id: 'insulin', icon: Syringe, label: t.insulin }
                      ].map(item => (
                        <button
                          key={item.id} type="button"
                          onClick={() => setForm({ ...form, type: item.id })}
                          aria-pressed={form.type === item.id}
                          className={`h-10 rounded-[10px] flex items-center justify-center gap-2 text-sm font-semibold transition-all ${form.type === item.id ? 'bg-card text-primary shadow-card ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          <item.icon className="w-4 h-4" /> {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="rem-name" className={labelClass}>{t.reminderName}</label>
                    <input id="rem-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t.reminderNamePlaceholder} className={inputClass(fieldError(form.name))} aria-invalid={fieldError(form.name)} />
                    {fieldError(form.name) && <p className="text-xs text-destructive mt-1">{c.required}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="rem-dose" className={labelClass}>{t.dose}</label>
                      <input id="rem-dose" value={form.dose} onChange={e => setForm({ ...form, dose: e.target.value })} placeholder={t.dosePlaceholder} className={inputClass(fieldError(form.dose))} aria-invalid={fieldError(form.dose)} />
                      {fieldError(form.dose) && <p className="text-xs text-destructive mt-1">{c.required}</p>}
                    </div>
                    <div>
                      <label htmlFor="rem-time" className={labelClass}>{t.time}</label>
                      <input id="rem-time" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className={inputClass(fieldError(form.time)) + ' tabular-nums'} aria-invalid={fieldError(form.time)} />
                      {fieldError(form.time) && <p className="text-xs text-destructive mt-1">{c.required}</p>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-[10px] bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors hover:bg-primary/90 disabled:opacity-60"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t.reminderSave}
                  </button>
                </form>

                {/* List Section */}
                <div className="flex flex-col md:border-l border-t md:border-t-0 border-border pt-6 md:pt-0 md:pl-6 min-h-[220px]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-foreground">{c.active}</h4>
                    <span className="min-w-6 h-6 px-2 inline-grid place-items-center rounded-lg bg-accent text-accent-foreground text-xs font-semibold">
                      {reminders.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2">
                    {reminders.length === 0 ? (
                      <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-border px-6 py-8">
                        <div className="w-11 h-11 rounded-full bg-muted grid place-items-center mb-3">
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground">{t.noReminders || 'No reminders'}</p>
                        <p className="text-xs text-muted-foreground mt-1">{c.emptyHint}</p>
                      </div>
                    ) : (
                      sortedReminders.map(r => {
                        const Icon = r.type === 'insulin' ? Syringe : Pill;
                        return (
                          <motion.div
                            key={r._id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 rounded-2xl border border-border bg-background/60 flex items-center gap-3"
                          >
                            <div className="w-14 shrink-0 text-center">
                              <p className="text-base font-semibold tabular-nums text-foreground leading-none">{r.time}</p>
                              <p className="text-[11px] text-muted-foreground mt-1">{c.daily}</p>
                            </div>
                            <div className="w-px self-stretch bg-border" />
                            <div className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${r.type === 'insulin' ? 'bg-ai/10 text-ai' : 'bg-accent text-accent-foreground'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{r.dose}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDelete(r._id)}
                              disabled={deletingId === r._id}
                              aria-label="Delete"
                              className="w-9 h-9 grid place-items-center rounded-[10px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 shrink-0"
                            >
                              {deletingId === r._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
