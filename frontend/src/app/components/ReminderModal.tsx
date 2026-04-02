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
      toast.success(language === 'uz' ? 'Eslatma saqlandi' : 'Напоминание сохранено');
      onRefresh();
      onClose();
      setForm({ type: 'medication', name: '', dose: '', time: '', repeatDaily: true, notes: '' });
    } catch (err) {
      toast.error('Error saving reminder');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full h-14 px-6 bg-secondary border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 font-bold transition-all text-sm text-foreground";
  const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block ml-2";

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
            className="relative w-full max-w-lg bg-card rounded-[3rem] shadow-3xl border border-border overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 pb-4 flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tight text-foreground uppercase">{t.addReminder}</h3>
              <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-secondary transition-all text-muted-foreground"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
              {/* Type Selection */}
              <div className="space-y-4">
                 <label className={labelClass}>{t.reminderType}</label>
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'medication', icon: Pill, label: t.medication },
                      { id: 'insulin', icon: Syringe, label: t.insulin }
                    ].map(item => (
                      <button 
                        key={item.id} type="button" 
                        onClick={() => setForm({...form, type: item.id})}
                        className={`h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all ${form.type === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-secondary text-muted-foreground hover:bg-accent'}`}
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
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="masalan, Metformin" required className={inputClass} />
                 </div>
                 <div className="space-y-2">
                    <label className={labelClass}>{t.dose}</label>
                    <input value={form.dose} onChange={e => setForm({...form, dose: e.target.value})} placeholder="masalan, 500mg" required className={inputClass} />
                 </div>
              </div>

              {/* Time & Repeat */}
              <div className="grid grid-cols-1 gap-6">
                 <div className="space-y-2">
                     <label className={labelClass}>{t.time}</label>
                     <div className="relative">
                        <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                       <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required className={inputClass + " pl-16 uppercase"} />
                    </div>
                 </div>
                 <div className="bg-secondary p-6 rounded-3xl flex items-center justify-between border border-border">
                     <div>
                        <p className="font-black text-sm tracking-tight text-foreground">{t.dailyRepeat}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Every single day at the same time</p>
                     </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={form.repeatDaily} onChange={e => setForm({...form, repeatDaily: e.target.checked})} className="sr-only peer" />
                      <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 rounded-full"></div>
                    </label>
                 </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                 <label className={labelClass}>{t.reminderNotes}</label>
                 <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Qo'shimcha izohlar..." className="w-full h-24 p-6 bg-secondary border-none rounded-3xl font-bold resize-none focus:ring-4 focus:ring-blue-500/10 text-sm text-foreground" />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                 <button type="button" onClick={onClose} className="flex-1 h-16 rounded-[1.25rem] border-2 border-border text-muted-foreground font-black uppercase tracking-widest text-[10px] hover:bg-secondary transition-all">{t.reminderCancel}</button>
                 <button type="submit" disabled={loading} className="flex-1 h-16 rounded-[1.25rem] bg-foreground text-background font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all active:scale-95 disabled:opacity-50">
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
