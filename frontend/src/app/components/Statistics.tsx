import React, { useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { translations } from '../utils/translations';
import { Card } from './ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Calendar, Zap, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';

export function Statistics() {
  const { language, records } = useApp();
  const t = translations[language];
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Kunlik indeks, bugungi sanaga qarab har kuni o'zgaradi (0 dan 6 gacha)
  const dayIndex = new Date().getDate() % 7;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (records.length === 0) return null;
    const recentRecords = [...records].sort((a, b) => {
      const timeDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (timeDiff !== 0) return timeDiff;
      // Agar sana bir xil bo'lsa, yaratilgan vaqtiga qarab o'ngga qo'shadi
      const createA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return createA - createB;
    }).slice(-14);

    const avgFasting = (recentRecords.reduce((sum, r) => sum + r.fastingLevel, 0) / recentRecords.length).toFixed(1);
    const postMealRecords = recentRecords.filter(r => r.postMealLevel != null);
    const avgPostMeal = postMealRecords.length > 0
      ? (postMealRecords.reduce((sum, r) => sum + (r.postMealLevel ?? 0), 0) / postMealRecords.length).toFixed(1)
      : '0.0';

    const avgDiff = (parseFloat(avgPostMeal) - parseFloat(avgFasting)).toFixed(1);

    const chartData = recentRecords.map(record => ({
      date: new Date(record.date).toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', { month: 'short', day: 'numeric' }),
      fasting: record.fastingLevel,
      postMeal: record.postMealLevel || null,
    }));

    // Smart Insights Logic (Senior Feature) - BUGUNGI MA'LUMOTGA ASOSLANADI
    const todayStr = new Date().toDateString();
    const todaysRecords = records.filter(r => new Date(r.date).toDateString() === todayStr);

    let insight = '';
    let insightColor = 'bg-muted-foreground/40';
    let healthScore = 0;

    if (todaysRecords.length === 0) {
      insight = language === 'uz' ? 'Bugun ma\'lumot kiritmadingiz. Tavsiya shakllanishi uchun qon shakaringizni o\'lchab kiriting.' : 'Сегодня нет данных. Введите уровень сахара, чтобы получить рекомендации.';
      insightColor = 'bg-muted-foreground/60';
      healthScore = 0; // Nullable status
    } else {
      const todayAvgFasting = (todaysRecords.reduce((sum, r) => sum + r.fastingLevel, 0) / todaysRecords.length);
      if (todayAvgFasting > 7.0) {
        insight = language === 'uz' ? 'Bugungi qand miqdori yuqori. Ratsiondagi uglevodlarni jiddiy kamaytirish tavsiya etiladi.' : 'Сегодня сахар повышен. Рекомендуется резко снизить углеводы в рационе.';
        insightColor = 'bg-rose-500';
        healthScore = 65;
      } else if (todayAvgFasting < 4.0) {
        insight = language === 'uz' ? 'Bugun gipoglikemiya xavfi bor. Shoshilinch uglevodlar (shirinlik) qabul qiling.' : 'Сегодня риск гипогликемии. Примите быстрые углеводы (сладкое).';
        insightColor = 'bg-amber-500';
        healthScore = 70;
      } else {
        insight = language === 'uz' ? 'Ajoyib! Bugungi ko\'rsatkichlaringiz barqaror holatda. Shunday davom eting!' : 'Отлично! Ваши показатели сегодня в стабильном состоянии. Продолжайте в том же духе!';
        insightColor = 'bg-emerald-500';
        healthScore = 95;
      }
    }

    return { avgFasting, avgPostMeal, avgDiff, chartData, insight, insightColor, healthScore };
  }, [records, language]);

  const handleAIAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      const { aiAPI } = await import('../utils/api');
      const response = await aiAPI.analyze({ language });
      if (response.data.success) {
        setAiResult(response.data.analysis);
      }
    } catch (error) {
      console.error('AI Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-border rounded-3xl">
        <Activity className="w-12 h-12 text-muted-foreground opacity-30 mb-4" />
        <p className="text-lg font-bold text-foreground opacity-80">{t.noRecords}</p>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card className="p-6 bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-10 text-xl`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-xs text-muted-foreground font-medium">mmol/l</span>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Zap} label={t.averageFasting} value={stats.avgFasting} color="bg-blue-500" />
        <StatCard icon={Activity} label={t.averagePostMeal} value={stats.avgPostMeal} color="bg-purple-500" />
        <StatCard icon={TrendingUp} label={t.averageDifference} value={stats.avgDiff} color="bg-emerald-500" />
      </div>

      {/* Smart Insight Card (Senior UI) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col md:flex-row items-center gap-8 ${stats.insightColor} relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl mb-2">⚡</div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Score</p>
          <p className="text-3xl font-black">{stats.healthScore}%</p>
        </div>
        <div className="relative z-10 flex-1">
          <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">Smart Insight:</h3>
          <p className="text-sm font-bold leading-relaxed opacity-90">{stats.insight}</p>
        </div>
        <button
          onClick={() => setShowRecommendations(true)}
          className="relative z-10 px-8 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all active:scale-95"
        >
          {language === 'uz' ? 'Tavsiyalarni ko\'rish' : 'Посмотреть советы'}
        </button>
        <button
          onClick={handleAIAnalyze}
          disabled={isAnalyzing}
          className="relative z-10 px-6 py-3 bg-black/20 backdrop-blur-md border border-white/30 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t.processing}
            </>
          ) : `🤖 ${t.aiAnalysis}`}
        </button>
      </motion.div>

      {/* Recommendations Modal */}
      {showRecommendations && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowRecommendations(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-[2rem] shadow-2xl p-8 max-w-lg w-full relative border border-border"
          >
            <button
              onClick={() => setShowRecommendations(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>

            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 ${stats.insightColor} shadow-lg shadow-${stats.insightColor.split('-')[1]}-500/30`}>
              ⚡
            </div>

            <h2 className="text-2xl font-black mb-2 text-foreground">
              {language === 'uz' ? 'Siz uchun shaxsiy tavsiyalar' : 'Персональные рекомендации для вас'}
            </h2>
            <p className="text-sm font-medium text-muted-foreground mb-6">
              {language === 'uz' ? 'Bugungi ko\'rsatkichlaringiz tahlili asosida' : 'На основе анализа ваших сегодняшних показателей'}
            </p>

            <div className="space-y-4 mb-8 text-foreground">
              {stats.healthScore === 95 && (
                <ul className="space-y-4">
                  <li className="flex items-start gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="text-2xl">✔</span>
                    <span className="text-sm font-bold leading-relaxed">{language === 'uz' ? [
                        "Zo'r! Ratsioningiz juda muvozanatli. Hozirgi ovqatlanish tartibingizni o'zgartirmang.",
                        "Diqqat! Bugun kamroq tuzli ovqatlar iste'mol qilish tavsiya etiladi.",
                        "Ajoyib natija! Tizimingiz to'g'ri ishlamoqda. Suv ichishni unutmang.",
                        "Stressdan qoching va har kuni tunda 7-8 soat uxlashga harakat qiling.",
                        "Kechqurun toza havoda 15-20 daqiqa sayr qilish qon aylanishiga yordam beradi.",
                        "Meva va sabzavotlarni ko'proq iste'mol qiling, ayniqsa ko'katlarni.",
                        "Dam olish kuningizni unumli hamda sog'lom o'tkazing, ko'proq harakat qiling."
                      ][dayIndex] : [
                        'Отлично! Ваш рацион очень сбалансирован. Не меняйте текущий режим питания.',
                        'Внимание! Сегодня рекомендуется употреблять меньше соленой пищи.',
                        'Идеальный результат! Ваша система работает правильно. Не забывайте пить воду.',
                        'Избегайте стресса и старайтесь спать по 7-8 часов каждую ночь.',
                        'Прогулка на свежем воздухе 15-20 минут вечером улучшит кровообращение.',
                        'Ешьте больше фруктов и овощей, особенно зелени.',
                        'Проведите выходной продуктивно и здорово, больше двигайтесь.'
                      ][dayIndex]}</span>
                  </li>
                </ul>
              )}

              {stats.healthScore === 65 && (
                <ul className="space-y-4">
                  <li className="flex items-start gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                    <span className="text-2xl">⚠️</span>
                    <span className="text-sm font-bold leading-relaxed">{language === 'uz' ? [
                        'Ertalabki qand miqdori normadan baland. Nonushtada uglevodlarni keskin kamaytiring.',
                        'Bugun shirinlik va xamir ovqatlardan to\'liq voz kechishni jiddiy maslahat beramiz.',
                        'Oddiy guruch, kartoshka va oq nonni grechka va kepakli nonga almashtiring.',
                        'Suv ichishni ko\'paytiring, bu ortiqcha shakarni chiqarishga yordam beradi.',
                        'Ovqatdan so\'ng darhol yotmang - kamida 15 daqiqa yengil harakat qiling.',
                        'Kechki ovqatni uxlashdan kamida 3-4 soat oldin juda yengil qilib tanovul qiling.',
                        'Stress qon shakarini oshirishi mumkin, tinchlanishga harakat qiling.'
                      ][dayIndex] : [
                        'Утренний сахар выше нормы. Резко сократите углеводы на завтрак.',
                        'Настоятельно рекомендуем сегодня полностью отказаться от сладостей и выпечки.',
                        'Замените рис, картофель и белый хлеб на гречку и отрубной хлеб.',
                        'Увеличьте потребление воды, это поможет вывести лишний сахар.',
                        'Не ложитесь сразу после еды - хотя бы 15 минут легкой активности.',
                        'Сделайте ужин очень легким и за 3-4 часа до сна.',
                        'Стресс может повысить сахар, постарайтесь успокоиться.'
                      ][dayIndex]}</span>
                  </li>
                </ul>
              )}

              {stats.healthScore === 70 && (
                <ul className="space-y-4">
                  <li className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <span className="text-2xl">🚨</span>
                    <span className="text-sm font-bold leading-relaxed">{language === 'uz' ? [
                        'Diqqat! Gipoglikemiya ehtimoli bor. Yoningizda shirinlik olib yuring.',
                        'Bugun jismoniy zo\'riqishlardan aslo saqlaning.',
                        'Qand miqdorini har 2 soatda o\'lchab turishni unutmang.',
                        'Och qoringa kofeinli ichimliklar ichmang.',
                        'Ovqatlanish oraliqlarini 3 soatdan oshirib yubormang.',
                        'Holsizlik sezilsa, darhol yarim stakan shirin sharbat iching.',
                        'Kechasi uxlashdan oldin yengil gazak (qatiq) iste\'mol qiling.'
                      ][dayIndex] : [
                        'Внимание! Возможна гипогликемия. Носите с собой сладкое.',
                        'Сегодня строго избегайте физических нагрузок.',
                        'Не забудьте сегодня измерять и контролировать уровень сахара каждые 2 часа.',
                        'Избегайте кофеиносодержащих напитков натощак.',
                        'Не делайте перерывы между приемами пищи больше 3 часов.',
                        'При holsizlik (слабости) немедленно выпейте полстакана сладкого чая.',
                        'Перед сном будет очень полезно съесть легкий перекус (кефир).'
                      ][dayIndex]}</span>
                  </li>
                </ul>
              )}

              {stats.healthScore === 0 && (
                <div className="flex flex-col items-center justify-center p-6 bg-secondary rounded-2xl text-center">
                  <span className="text-4xl mb-4">🩺</span>
                  <p className="font-bold mb-2">{language === 'uz' ? 'Hozircha tavsiyalar yo\'q' : 'Пока нет рекомендаций'}</p>
                  <p className="text-sm text-muted-foreground">{language === 'uz' ? 'Sizga aniq va to\'g\'ri maslahat berishimiz uchun, iltimos bugungi qand miqdorini o\'lchab, kundalikka kiriting.' : 'Чтобы мы могли дать вам точный совет, пожалуйста, измерьте и введите сегодняшний уровень сахара в дневник.'}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowRecommendations(false)}
              className={`w-full py-4 rounded-xl font-bold text-white ${stats.insightColor} hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
            >
              {language === 'uz' ? 'Maslahatlarni qabul qildim' : 'Я принял(а) советы'}
            </button>

            <AnimatePresence>
              {aiResult && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 p-6 bg-secondary rounded-2xl border-2 border-dashed border-blue-200 overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-3 text-blue-600">
                    <span className="text-xl">🤖</span>
                    <h4 className="font-black text-xs uppercase tracking-widest">{t.aiAnalysisResult}</h4>
                    <button onClick={() => setAiResult(null)} className="ml-auto text-muted-foreground hover:text-foreground">✕</button>
                  </div>
                  <p className="text-sm font-bold leading-relaxed text-foreground opacity-90">
                    {aiResult}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      <Card className="p-6 bg-card border border-border shadow-sm">
        <h3 className="text-lg font-bold mb-6">{t.last14Days}</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: '1px solid var(--border)', 
                  backgroundColor: 'var(--card)',
                  color: 'var(--foreground)',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                }} 
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="fasting" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={3} connectNulls={true} />
              <Area type="monotone" dataKey="postMeal" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={3} connectNulls={true} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="bg-card border border-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border bg-muted/30">
          <h3 className="text-lg font-bold">{t.allRecords}</h3>
        </div>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader className="bg-secondary sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-32">{t.date}</TableHead>
                <TableHead>{t.fasting}</TableHead>
                <TableHead>{t.postMeal}</TableHead>
                <TableHead>{t.notes}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...records].reverse().map((record) => (
                <TableRow key={record._id || record.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {new Date(record.date).toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU')}
                  </TableCell>
                  <TableCell className="font-bold text-blue-600">{record.fastingLevel.toFixed(1)}</TableCell>
                  <TableCell className="font-bold text-purple-600">
                    {record.postMealLevel != null ? record.postMealLevel.toFixed(1) : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm italic">{record.notes || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}
