import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Pill, Syringe, Trash2 } from 'lucide-react';
import { reminderAPI } from '../utils/api';
import { toast } from 'sonner';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'uz' | 'ru' | 'en';
  t: any;
  reminders: any[];
  onRefresh: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, language, t, reminders, onRefresh }) => {
  const [form, setForm] = useState({
    type: 'medication',
    name: '',
    dose: '',
    time: '',
    repeatDaily: true,
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reminderAPI.create(form);
      toast.success(t.reminderSaved || 'Reminder saved');
      onRefresh();
      setForm({ type: 'medication', name: '', dose: '', time: '', repeatDaily: true, notes: '' });
    } catch (err) {
      toast.error('Error saving reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await reminderAPI.delete(id);
      toast.success(t.reminderDeleted || 'Deleted');
      onRefresh();
    } catch {
       toast.error('Error deleting reminder');
    }
  };

  const sortedReminders = [...reminders].sort((a, b) => a.time.localeCompare(b.time));

  const inputClass = "w-full h-12 px-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 font-bold transition-all text-sm text-slate-800 dark:text-slate-200";
  const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2 block ml-2";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-3xl border border-border overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-6 pb-2 flex items-center justify-between">
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">{t.addReminder}</h3>
              <button 
                type="button"
                onClick={onClose} 
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-400 shadow-sm border border-slate-200 dark:border-slate-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-2 h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Type Selection */}
                  <div className="space-y-3">
                    <label className={labelClass}>{t.reminderType}</label>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: 'medication', icon: Pill, label: t.medication },
                          { id: 'insulin', icon: Syringe, label: t.insulin }
                        ].map(item => (
                          <button 
                            key={item.id} type="button" 
                            onClick={() => setForm({...form, type: item.id})}
                            className={`h-12 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all border ${form.type === item.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'}`}
                          >
                             <item.icon className="w-5 h-5" /> {item.label}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Name & Dose */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                        <label className={labelClass}>{t.reminderName}</label>
                        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder={t.reminderNamePlaceholder} required className={inputClass} />
                    </div>
                    <div className="space-y-2">
                        <label className={labelClass}>{t.dose}</label>
                        <input value={form.dose} onChange={e => setForm({...form, dose: e.target.value})} placeholder={t.dosePlaceholder} required className={inputClass} />
                    </div>
                  </div>

                  {/* Time & Repeat */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                        <label className={labelClass}>{t.time}</label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required className={inputClass + " pl-12 uppercase"} />
                        </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-6">
                    <button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50">
                      {loading ? '...' : t.reminderSave}
                    </button>
                  </div>
                </form>

                {/* List Section */}
                <div className="space-y-4 flex flex-col h-full border-l border-slate-100 dark:border-slate-800 pl-4">
                   <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{language === 'uz' ? 'Faol eslatmalar' : 'Активные напоминания'}</h4>
                      <div className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-widest">
                         {reminders.length}
                      </div>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-smooth">
                      {reminders.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-40 py-10">
                           <Clock className="w-10 h-10 mb-3" />
                           <p className="text-[10px] font-black uppercase tracking-widest">{t.noReminders || 'No reminders'}</p>
                        </div>
                      ) : (
                        sortedReminders.map(r => (
                          <motion.div 
                            key={r._id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between group"
                          >
                             <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 font-black text-xs">
                                   {r.time}
                                </div>
                                <div>
                                   <p className="font-black text-sm text-slate-800 dark:text-slate-200">{r.name}</p>
                                   <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">{r.dose}</p>
                                </div>
                             </div>
                             <button 
                               onClick={() => handleDelete(r._id)}
                               className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 transition-all hover:bg-red-500 hover:text-white border border-red-100 dark:border-red-900/20"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </motion.div>
                        ))
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
