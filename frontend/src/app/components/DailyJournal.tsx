import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { translations } from '../utils/translations';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Plus, Loader2, Calendar, Coffee, Utensils, MessageSquare, Info, Star, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { productAPI } from '../utils/api';

const InputWrapper = ({ label, icon: Icon, children, isRequired = false }: any) => (
  <div className="space-y-2">
    <Label className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest px-1">
      <Icon className="w-4 h-4 text-muted-foreground opacity-50" /> {label} {isRequired && <span className="text-destructive">*</span>}
    </Label>
    {children}
  </div>
);

export function DailyJournal() {
  const { language, addRecord } = useApp();
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fastingLevel: '',
    postMealLevel: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadRecommended();
  }, []);

  const loadRecommended = async () => {
    try {
      const { data } = await productAPI.getAll({ category: 'all' });
      // Filter the safest foods (GI < 30)
      const safe = data.products
        .filter((p: any) => p.gi <= 30)
        .sort(() => 0.5 - Math.random()) // Shuffle
        .slice(0, 3); // Take 3 random ones
      setRecommendedProducts(safe);
    } catch (err) {
      console.error('Error loading recommendations', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fastingLevel) {
      toast.error(language === 'uz' ? 'Och qoringa qand miqdorini kiriting' : 'Введите уровень натощак');
      return;
    }

    setLoading(true);
    try {
      await addRecord({
        fastingLevel: parseFloat(formData.fastingLevel),
        postMealLevel: formData.postMealLevel ? parseFloat(formData.postMealLevel) : undefined,
        notes: formData.notes,
        date: new Date(formData.date).toISOString(),
      });
      toast.success(t.success);
      setFormData({
        fastingLevel: '',
        postMealLevel: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
      <Card className="p-8 bg-card border border-border shadow-sm rounded-3xl">
        <div className="mb-8">
           <h2 className="text-2xl font-bold flex items-center gap-3">
             <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-blue-600">
               <Plus className="w-6 h-6" />
             </div>
             {t.addRecord}
           </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputWrapper label={t.date} icon={Calendar} isRequired>
            <Input 
              type="date" 
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="h-12 rounded-xl bg-background border-border"
            />
          </InputWrapper>

          <div className="grid grid-cols-2 gap-4">
            <InputWrapper label={`${t.fasting} (mmol/l)`} icon={Coffee} isRequired>
              <Input 
                type="number" 
                step="0.1" 
                placeholder="5.5"
                value={formData.fastingLevel} 
                onChange={e => setFormData({...formData, fastingLevel: e.target.value})}
                className="h-12 rounded-xl bg-background border-border font-bold"
              />
            </InputWrapper>

            <InputWrapper label={`${t.postMeal} (mmol/l)`} icon={Utensils}>
              <Input 
                type="number" 
                step="0.1" 
                placeholder="7.2"
                value={formData.postMealLevel} 
                onChange={e => setFormData({...formData, postMealLevel: e.target.value})}
                className="h-12 rounded-xl bg-background border-border font-bold"
              />
            </InputWrapper>
          </div>

          <InputWrapper label={t.notes} icon={MessageSquare}>
            <Textarea 
              placeholder={t.notes + '...'}
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="rounded-xl bg-background border-border min-h-[100px] resize-none"
            />
          </InputWrapper>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.save}
          </Button>
        </form>
      </Card>

      <div className="space-y-6">
        <Card className="p-8 bg-blue-50 border-none rounded-3xl">
          <div className="flex items-start gap-4">
             <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                <Info className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">Qand darajasi normasi</h3>
                <div className="space-y-3 mt-4">
                   <div className="flex justify-between items-center bg-card p-3 rounded-lg shadow-sm border border-border">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t.fasting}</span>
                      <span className="font-bold text-blue-600">3.9 — 5.5 <span className="text-[10px] text-muted-foreground">mmol/l</span></span>
                   </div>
                   <div className="flex justify-between items-center bg-card p-3 rounded-lg shadow-sm border border-border">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t.postMeal}</span>
                      <span className="font-bold text-purple-600">&lt; 7.8 <span className="text-[10px] text-muted-foreground">mmol/l</span></span>
                   </div>
                </div>
             </div>
          </div>
        </Card>

        {recommendedProducts.length > 0 && (
          <Card className="p-8 bg-emerald-50 border-none rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Star className="w-16 h-16 text-emerald-600" />
            </div>
            
            <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 fill-emerald-500 text-emerald-500" /> 
              {language === 'uz' ? 'Tavsiya etilgan yeguliklar' : 'Рекомендуемые продукты'}
            </h3>
            
            <div className="space-y-3">
              {recommendedProducts.map((p) => (
                <motion.div 
                  key={p._id}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 bg-card p-3 rounded-xl shadow-sm border border-border cursor-pointer"
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground lowercase first-letter:uppercase">
                      {p.name[language] || p.name['uz']}
                    </p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">GI: {p.gi}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-200" />
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}