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

    return { avgFasting, avgPostMeal, avgDiff, chartData };
  }, [records, language]);

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
