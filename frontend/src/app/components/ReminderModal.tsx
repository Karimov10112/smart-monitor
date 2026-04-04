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
  onRefresh: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, language, t, onRefresh }) => {
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
      onClose();
      setForm({ type: 'medication', name: '', dose: '', time: '', repeatDaily: true, notes: '' });
    } catch (err) {
      toast.error('Error saving reminder');
    } finally {
      setLoading(false);
    }
  };

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
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-3xl border border-border overflow-hidden flex flex-col"
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

            <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
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
              <div className="grid grid-cols-1 gap-6">
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
              <div className="grid grid-cols-1 gap-6">
                 <div className="space-y-2">
                     <label className={labelClass}>{t.time}</label>
                     <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                       <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required className={inputClass + " pl-12 uppercase"} />
                     </div>
                 </div>
                 <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-slate-800 shadow-sm">
                     <div>
                        <p className="font-black text-sm tracking-tight text-slate-800 dark:text-slate-200">{t.dailyRepeat}</p>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{t.dailyRepeatHint}</p>
                     </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={form.repeatDaily} onChange={e => setForm({...form, repeatDaily: e.target.checked})} className="sr-only peer" />
                      <div className="w-14 h-8 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 rounded-full"></div>
                    </label>
                 </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                 <label className={labelClass}>{t.reminderNotes}</label>
                 <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder={t.reminderNotesHint} className="w-full h-20 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold resize-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 text-sm text-slate-800 dark:text-slate-200" />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                 <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all">{t.reminderCancel}</button>
                 <button type="submit" disabled={loading} className="flex-1 h-12 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50">
                   {loading ? '...' : t.reminderSave}
                 </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
