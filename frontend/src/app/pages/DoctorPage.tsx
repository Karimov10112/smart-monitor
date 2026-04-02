import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Search, ChevronRight, Activity, MapPin, LogOut, FileText, HeartPulse } from 'lucide-react';
import { doctorAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { translations } from '../utils/translations';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

type Tab = 'patients' | 'patient-detail';

export default function DoctorPage() {
  const { user, logout } = useAuth();
  const { language } = useApp();
  const t = translations[language];
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('patients');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [doctorNote, setDoctorNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, [search]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const { data } = await doctorAPI.getPatients({ search });
      setPatients(data.patients);
    } catch { toast.error(t.error); }
    finally { setLoading(false); }
  };

  const openPatient = async (patient: any) => {
    try {
      const { data } = await doctorAPI.getPatientRecords(patient._id);
      const sortedRecords = data.records.sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setRecords(sortedRecords);
      setSelectedPatient(patient);
      setDoctorNote(patient.doctorNotes || '');
      setTab('patient-detail');
    } catch { toast.error(t.error); }
  };

  const handleSaveNote = async () => {
    try {
      await doctorAPI.addNote(selectedPatient._id, doctorNote);
      toast.success(t.success);
      // Update local patient data
      setPatients(prev => prev.map(p => p._id === selectedPatient._id ? { ...p, doctorNotes: doctorNote } : p));
    } catch { toast.error(t.error); }
  };

  const chartData = records.map(r => ({
    date: format(new Date(r.date), 'dd/MM'),
    fasting: r.fastingLevel,
    postMeal: r.postMealLevel || 0,
  }));

  return (
    <div className="min-h-screen bg-background flex font-sans text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">👨‍⚕️</div>
            <div>
              <h1 className="font-bold text-foreground text-sm leading-tight">Qand Nazorati</h1>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{t.doctorPanel}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} onClick={() => setTab('patients')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'patients' || tab === 'patient-detail' ? 'bg-secondary text-emerald-600' : 'text-muted-foreground hover:bg-accent'}`}>
            <Users className="w-4 h-4" /> {t.patients}
          </motion.button>
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-background">
              {user?.firstName?.[0] || 'D'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={async () => { await logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" /> {t.back}
          </motion.button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-6 lg:p-10">
        {tab === 'patients' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-3xl font-bold text-foreground">{t.myPatients}</h2>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={t.search} 
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patients.length > 0 ? patients.map(p => (
                <motion.div key={p._id} whileHover={{ y: -5 }} onClick={() => openPatient(p)}
                  className="bg-card rounded-3xl border border-border p-6 shadow-sm cursor-pointer group transition-all hover:shadow-xl hover:shadow-emerald-500/5">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-emerald-600 text-xl font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      {p.firstName?.[0] || 'P'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground group-hover:text-emerald-600 transition-colors">{p.firstName} {p.lastName}</h3>
                      <p className="text-xs text-muted-foreground">{p.diabetesType || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-bold uppercase tracking-wider pt-4 border-t border-border">
                    <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.region || '—'}</div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:text-emerald-500 transition-all" />
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full py-20 text-center">
                   <Users className="w-16 h-16 text-muted-foreground opacity-20 mx-auto mb-4" />
                   <p className="text-muted-foreground font-medium">{t.noPatients}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === 'patient-detail' && selectedPatient && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto pb-10">
            <div className="flex items-center gap-4 mb-8">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTab('patients')} className="p-2 bg-secondary hover:bg-accent rounded-xl transition-all shadow-sm border border-transparent hover:border-border">
                <ChevronRight className="w-6 h-6 rotate-180 text-muted-foreground" />
              </motion.button>
              <h2 className="text-2xl font-black text-foreground">{t.patientDetail}</h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
               <div className="xl:col-span-2 space-y-8">
                {/* Profile */}
                <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-emerald-500/20">
                        {selectedPatient.firstName?.[0]}
                       </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-foreground">{selectedPatient.firstName} {selectedPatient.lastName}</h3>
                        <p className="text-emerald-600 font-bold text-sm">{selectedPatient.diabetesType}</p>
                        <div className="flex gap-4 mt-3 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedPatient.region}</span>
                          <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {selectedPatient.gender}</span>
                          <span className="flex items-center gap-1"><HeartPulse className="w-3 h-3" /> {selectedPatient.age || '—'} y.o</span>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Trend Chart */}
                <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                      <h4 className="font-black text-foreground flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-500" /> {t.monitoring} {t.trends}
                      </h4>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold text-muted-foreground uppercase">{t.fasting}</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-[10px] font-bold text-muted-foreground uppercase">{t.postMeal}</span></div>
                      </div>
                   </div>
                   <div className="h-72 w-full">
                      {records.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                             <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} domain={[0, 'dataMax + 2']} />
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '12px', 
                                border: '1px solid var(--border)', 
                                backgroundColor: 'var(--card)',
                                color: 'var(--foreground)',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                              }} 
                            />
                            <Area type="monotone" dataKey="fasting" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEmerald)" />
                            <Area type="monotone" dataKey="postMeal" stroke="#3b82f6" strokeWidth={3} fillOpacity={0} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-muted-foreground/30">
                          <Activity className="w-12 h-12 opacity-20" />
                          <p className="text-sm font-bold uppercase tracking-widest opacity-50">{t.noRecords}</p>
                        </div>
                      )}
                   </div>
                </div>

                {/* Doctor Note */}
                <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                  <h4 className="text-lg font-black text-foreground mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-500" /> {t.medicalConclusion}
                  </h4>
                  <textarea value={doctorNote} onChange={e => setDoctorNote(e.target.value)} rows={5} 
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-secondary text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none" 
                    placeholder={t.writeNote + '...'} />
                  <div className="flex justify-end mt-4">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleSaveNote} className="px-8 py-3 bg-emerald-600 text-white text-sm font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
                      {t.save}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Side Stats */}
              <div className="space-y-6">
                 <div className="bg-gradient-to-br from-emerald-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-2">{t.totalRecords}</p>
                    <p className="text-4xl font-black">{records.length}</p>
                    <div className="mt-8 pt-8 border-t border-white/10">
                       <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-2">{t.avgSugar}</p>
                       <p className="text-2xl font-black">
                         {(records.reduce((acc, curr) => acc + curr.fastingLevel, 0) / (records.length || 1)).toFixed(1)} mmol/l
                       </p>
                    </div>
                 </div>

                  <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">{t.lastActivity}</h5>
                    <div className="space-y-4">
                       {records.slice(-3).reverse().map(r => (
                         <div key={r._id} className="flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground">{format(new Date(r.date), 'dd MMM')}</span>
                            <span className="text-sm font-black text-foreground">{r.fastingLevel} mmol/l</span>
                         </div>
                       ))}
                    </div>
                  </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
