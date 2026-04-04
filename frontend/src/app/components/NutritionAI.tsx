import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Scale, Ruler, Flame, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../utils/api';

interface NutritionAIProps {
  user: any;
  t: any;
  language: 'uz' | 'ru' | 'en';
}

export const NutritionAI: React.FC<NutritionAIProps> = ({ user, t, language }) => {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const hasData = !!(user?.height && user?.weight);

  const fetchRecommendation = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/ai/nutrition', { language });
      if (data.success) {
        setRecommendation(data.recommendation);
        setMeta(data.meta);
      } else {
        setError(data.message || 'Xato yuz berdi');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'AI bilan aloqa qilishda xato');
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    uz: {
      title: 'AI Ovqatlanish Tavsiyasi',
      subtitle: 'Sizning sog\'liq ma\'lumotlaringiz asosida shaxsiylashtirilgan',
      getAdvice: 'Tavsiya olish',
      refresh: 'Yangilash',
      noData: 'Tavsiya olish uchun profilingizda bo\'y va vazn ma\'lumotlarini kiriting',
      goToProfile: 'Profilni to\'ldirish',
      bmi: 'BMI',
      age: 'Yosh',
      calories: 'Kaloriya',
    },
    ru: {
      title: 'AI Рекомендации по питанию',
      subtitle: 'Персонализированные на основе ваших данных',
      getAdvice: 'Получить рекомендацию',
      refresh: 'Обновить',
      noData: 'Для получения рекомендаций заполните рост и вес в профиле',
      goToProfile: 'Заполнить профиль',
      bmi: 'ИМТ',
      age: 'Возраст',
      calories: 'Калории',
    },
    en: {
      title: 'AI Nutrition Advice',
      subtitle: 'Personalized based on your health data',
      getAdvice: 'Get Advice',
      refresh: 'Refresh',
      noData: 'Add your height and weight in profile to get recommendations',
      goToProfile: 'Complete Profile',
      bmi: 'BMI',
      age: 'Age',
      calories: 'Calories',
    },
  };
  const l = labels[language] || labels.uz;

  // Format the recommendation text into sections with markdown-like parsing
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-2" />;
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return <h4 key={i} className="font-black text-sm mt-4 mb-1 text-slate-800 dark:text-slate-100 uppercase tracking-wide">{trimmed.replace(/\*\*/g, '')}</h4>;
      }
      if (trimmed.startsWith('**')) {
        const cleaned = trimmed.replace(/\*\*/g, '');
        return <p key={i} className="font-bold text-sm text-slate-700 dark:text-slate-200 mt-2">{cleaned}</p>;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        return <li key={i} className="text-sm text-slate-600 dark:text-slate-300 ml-4 list-disc font-medium">{trimmed.substring(2)}</li>;
      }
      if (/^\d+\./.test(trimmed)) {
        return <li key={i} className="text-sm text-slate-600 dark:text-slate-300 ml-4 list-decimal font-medium">{trimmed.replace(/^\d+\.\s*/, '')}</li>;
      }
      return <p key={i} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{trimmed}</p>;
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-widest">{l.title}</h3>
              <p className="text-[10px] font-bold opacity-75 mt-0.5">{l.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* User stats row */}
        {(user?.height || user?.weight || meta?.age) && (
          <div className="flex gap-3 mt-4">
            {user?.height && (
              <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
                <Ruler className="w-3.5 h-3.5" />
                <span className="text-xs font-black">{user.height} sm</span>
              </div>
            )}
            {user?.weight && (
              <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span className="text-xs font-black">{user.weight} kg</span>
              </div>
            )}
            {meta?.bmi && (
              <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-xs font-black">BMI: {meta.bmi}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-5">
              {!hasData ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center mx-auto mb-3">
                    <Ruler className="w-8 h-8 text-violet-500" />
                  </div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4">{l.noData}</p>
                  <a
                    href="/complete-profile"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-violet-700 transition-all"
                  >
                    {l.goToProfile}
                  </a>
                </div>
              ) : (
                <>
                  {!recommendation && !loading && (
                    <div className="text-center py-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-4 uppercase tracking-widest">
                        {language === 'uz' ? 'Gemini AI yordamida shaxsiylashtirilgan ovqatlanish rejasini oling' : 'Get your personalized nutrition plan powered by Gemini AI'}
                      </p>
                      <button
                        onClick={fetchRecommendation}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-violet-500/25"
                      >
                        <Sparkles className="w-4 h-4" />
                        {l.getAdvice}
                      </button>
                    </div>
                  )}

                  {loading && (
                    <div className="flex items-center justify-center gap-3 py-8">
                      <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        {language === 'uz' ? 'AI tahlil qilmoqda...' : 'AI is analyzing...'}
                      </span>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/40">
                      <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
                      <button onClick={fetchRecommendation} className="mt-2 text-xs font-black text-red-500 underline">{l.refresh}</button>
                    </div>
                  )}

                  {recommendation && !loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">
                          {language === 'uz' ? '✨ Gemini AI tavsiyasi' : '✨ Gemini AI Recommendation'}
                        </span>
                        <button
                          onClick={fetchRecommendation}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-500 transition-all"
                        >
                          <RefreshCw className="w-3 h-3" />
                          {l.refresh}
                        </button>
                      </div>
                      <div className="prose prose-sm max-w-none space-y-1">
                        {formatText(recommendation)}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
