import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useTelegramLink } from '../utils/useTelegramLink';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { translations } from '../utils/translations';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Chat } from '../components/chat/ChatComponent';

// MUI Components
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  TextField,
  IconButton,
  Avatar,
  Stack,
  alpha,
  useTheme,
  Chip,
  Tabs,
  Tab,
  InputAdornment,
  Skeleton,
  Tooltip,
} from '@mui/material';
import { SectionCard, StatTile, GlucoseBadge, EmptyState, IconTile } from '../components/common';
import { GlucoseTrendChart } from '../components/common/GlucoseTrendChart';
import { classifyGlucose, glucoseLabel, sentenceCase } from '../utils/glucose';
import { formatShortDate, formatDate, formatTime } from '../utils/format';
import { savePdf } from '../utils/platform';

// MUI Icons
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TimelineIcon from '@mui/icons-material/Timeline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import TelegramIcon from '@mui/icons-material/Telegram';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import NotificationBell from '../components/NotificationBell';

type TabType = 'patients' | 'patient-detail' | 'chat';

export default function DoctorPage() {
  const { user, logout, isAdmin } = useAuth();
  const telegramLink = useTelegramLink();
  const { language } = useApp();
  const theme = useTheme();
  const t = translations[language];
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState<TabType>('patients');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [doctorNote, setDoctorNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [doctorCode, setDoctorCode] = useState<string>('');

  useEffect(() => {
    loadDoctorCode();
  }, []);

  const loadDoctorCode = async () => {
    try {
      const { data } = await doctorAPI.getMyCode();
      if (data?.doctorCode) {
        setDoctorCode(data.doctorCode);
      }
    } catch {}
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const { data } = await doctorAPI.getPatients({ search });
      setPatients(data.patients || []);
    } catch {}
    finally { setLoading(false); }
  };

  const openPatient = async (patient: any) => {
    try {
      const { data } = await doctorAPI.getPatientRecords(patient._id);
      const sortedRecords = (data.records || []).sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setRecords(sortedRecords);
      setSelectedPatient(patient);
      setDoctorNote(patient.doctorNotes || '');
      setCurrentTab('patient-detail');
    } catch {}
  };

  const handleSaveNote = async () => {
    try {
      await doctorAPI.addNote(selectedPatient._id, doctorNote);
      toast.success(t.success || 'Saqlandi');
      setPatients(prev => prev.map(p => p._id === selectedPatient._id ? { ...p, doctorNotes: doctorNote } : p));
    } catch {}
  };

  const handleExportPDF = async () => {
    if (!selectedPatient || records.length === 0) {
      toast.error('Eksport uçun ma\'lumot yõq');
      return;
    }
    try {
      const jspdfModule = await import('jspdf');
      const JsPdfConstructor: any = jspdfModule.jsPDF || (typeof jspdfModule.default === 'function' ? jspdfModule.default : (jspdfModule.default as any)?.jsPDF);
      const autotableModule = await import('jspdf-autotable');
      const autoTable: any = autotableModule.default || autotableModule;
      const doc = new JsPdfConstructor();

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('QAND NAZORATI - Bemor Hisoboti', 14, 20);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Bemor: ${selectedPatient.firstName} ${selectedPatient.lastName}`, 14, 32);
      doc.text(`Diabet turi: ${selectedPatient.diabetesType || 'Noma\'lum'}`, 14, 40);
      doc.text(`Mintaqa: ${selectedPatient.region || '—'}`, 14, 48);
      doc.text(`Sana: ${new Date().toLocaleDateString('uz')}`, 14, 56);

      if (doctorNote) {
        doc.setFont('helvetica', 'bold');
        doc.text('Şifokor izohi:', 14, 68);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(doctorNote, 180);
        doc.text(lines, 14, 76);
      }

      // Table
      const tableRows = records.map((r: any) => [
        new Date(r.date).toLocaleDateString('uz'),
        r.fastingLevel?.toFixed(1) ?? '—',
        r.postMealLevel?.toFixed(1) ?? '—',
        r.notes || '—',
      ]);

      autoTable(doc, {
        startY: doctorNote ? 90 : 68,
        head: [['Sana', 'Oç qoringa (mmol/l)', 'Ovqatdan keyin (mmol/l)', 'Eslatma']],
        body: tableRows,
        headStyles: { fillColor: [14, 116, 144], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [244, 247, 250] },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`DiabetMed © ${new Date().getFullYear()} | Sahifa ${i}/${pageCount}`, 14, doc.internal.pageSize.height - 10);
      }

      await savePdf(doc, `${selectedPatient.firstName}_${selectedPatient.lastName}_hisobot.pdf`);
      toast.success('PDF muvaffaqiyatli yuklab olindi!');
    } catch (err) {
      console.error('PDF error:', err);
      toast.error('PDF yaratişda xato');
    }
  };

  const DIABETES_LABELS: Record<string, Record<string, string>> = {
    type1: { uz: '1-tip diabet', ru: 'Диабет 1 типа', en: 'Type 1' },
    type2: { uz: '2-tip diabet', ru: 'Диабет 2 типа', en: 'Type 2' },
    prediabetes: { uz: 'Prediabet', ru: 'Предиабет', en: 'Prediabetes' },
    gestational: { uz: 'Homiladorlik diabeti', ru: 'Гестационный', en: 'Gestational' },
    none: { uz: 'Monitoring', ru: 'Мониторинг', en: 'Monitoring' },
  };
  const diabetesLabel = (v?: string) => (v && DIABETES_LABELS[v]?.[language]) || v || '—';

  const UI: Record<string, Record<string, string>> = {
    uz: { telegramTitle: 'Telegram şoşilinç bildiriş boti', telegramOn: 'Telegram ulangan. Bemorlarda kritik qand aniqlansa, darhol signal keladi.', telegramOff: "Bemorlarda qand xavfli kõtarilsa yoki tuşsa, sayt yopiq bõlsa ham Telegramga signal boradi.", reconnect: 'Qayta ulaş', connect: 'Botni ulaş', copy: 'Nusxalaş', tir: "Me'yorda vaqt", last: 'Sõnggi õlçov', trend: 'Glyukoza dinamikasi', age: 'Yoşi', gender: 'Jinsi', region: 'Hudud', pdf: 'PDF hisobot', noRecords: 'Yozuvlar topilmadi', searchEmpty: 'Qidiruv bõyiça bemor topilmadi' },
    ru: { telegramTitle: 'Telegram-бот экстренных уведомлений', telegramOn: 'Telegram подключён. При критическом сахаре у пациента сигнал придёт сразу.', telegramOff: 'Если сахар пациента опасно изменится, сигнал придёт в Telegram, даже если сайт закрыт.', reconnect: 'Переподключить', connect: 'Подключить бота', copy: 'Копировать', tir: 'В целевом диапазоне', last: 'Последнее измерение', trend: 'Динамика глюкозы', age: 'Возраст', gender: 'Пол', region: 'Регион', pdf: 'PDF отчёт', noRecords: 'Записей нет', searchEmpty: 'Пациенты не найдены' },
    en: { telegramTitle: 'Telegram emergency alerts bot', telegramOn: 'Telegram connected. You get an alert as soon as a patient has a critical reading.', telegramOff: 'Get a Telegram alert when a patient’s glucose is dangerously high or low, even when the site is closed.', reconnect: 'Reconnect', connect: 'Connect bot', copy: 'Copy', tir: 'Time in range', last: 'Last reading', trend: 'Glucose trend', age: 'Age', gender: 'Gender', region: 'Region', pdf: 'PDF report', noRecords: 'No records', searchEmpty: 'No patients match your search' },
  };
  const ui = UI[language] || UI.uz;

  // ---- Patient detail derived data (display only) ----
  const chartData = records.map(r => ({
    date: formatShortDate(r.date, language),
    fasting: (r.category === 'fasting' ? r.level : r.fastingLevel) ?? null,
    postMeal: (r.category === 'post-meal' ? r.level : r.postMealLevel) ?? null,
  }));
  const allValues: number[] = chartData.flatMap(d => [d.fasting, d.postMeal]).filter((v): v is number => v != null && v > 0);
  const tirPct = allValues.length ? Math.round(allValues.filter(v => v >= 3.9 && v <= 10).length / allValues.length * 100) : null;
  const avgSugar = records.length > 0
    ? (records.reduce((acc, curr) => acc + (curr.fastingLevel || curr.level || 0), 0) / records.length)
    : null;
  const lastRecord = records.length ? records[records.length - 1] : null;
  const lastValue = lastRecord ? (lastRecord.postMealLevel || lastRecord.fastingLevel || lastRecord.level) : null;

  const tabValue = currentTab === 'chat' ? 'chat' : 'patients';

  return (
    <Box>
      {/* Page header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => { if (v === 'chat') setCurrentTab('chat'); else { setCurrentTab('patients'); setSelectedPatient(null); } }}
          sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 3, px: 0.5, minHeight: 44, '& .MuiTab-root': { minHeight: 44 } }}
        >
          <Tab value="patients" icon={<PeopleAltOutlinedIcon fontSize="small" />} iconPosition="start" label={`${t.myPatients}${patients.length ? ` · ${patients.length}` : ''}`} />
          <Tab value="chat" icon={<ChatBubbleOutlineRoundedIcon fontSize="small" />} iconPosition="start" label={t.chat || 'Chat'} />
        </Tabs>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
          <NotificationBell />
        </Stack>
      </Stack>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab === 'patient-detail' ? `patient-${selectedPatient?._id}` : currentTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {/* ===== PATIENT LIST ===== */}
          {currentTab === 'patients' && (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                {/* Doctor Code Card */}
                {doctorCode && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ p: 2.5, height: '100%' }}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <IconTile><BadgeOutlinedIcon /></IconTile>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2">{t.myDoctorCodeTitle}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{t.myDoctorCodeDesc}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ px: 1.5, py: 0.75, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 700, letterSpacing: '0.06em', fontVariantNumeric: 'tabular-nums' }}>
                              {doctorCode}
                            </Box>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ContentCopyRoundedIcon sx={{ fontSize: '16px !important' }} />}
                              onClick={() => {
                                navigator.clipboard.writeText(doctorCode);
                                toast.success(t.copiedToClipboard);
                              }}
                            >
                              {ui.copy}
                            </Button>
                          </Stack>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>
                )}

                {/* Telegram Bot Integration Card for Doctor */}
                <Grid size={{ xs: 12, md: doctorCode ? 6 : 12 }}>
                  <Card sx={{ p: 2.5, height: '100%', borderColor: alpha('#229ED9', 0.3) }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <IconTile color="#229ED9"><TelegramIcon /></IconTile>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Typography variant="subtitle2">{ui.telegramTitle}</Typography>
                          {user?.telegramChatId && <CheckCircleRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} />}
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                          {user?.telegramChatId ? ui.telegramOn : ui.telegramOff}
                        </Typography>
                        <Button
                          component="a"
                          href={telegramLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="contained"
                          size="small"
                          startIcon={<TelegramIcon />}
                          sx={{ bgcolor: '#229ED9', color: '#fff', '&:hover': { bgcolor: '#1d8cc1' } }}
                        >
                          {user?.telegramChatId ? ui.reconnect : ui.connect}
                        </Button>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>

              <TextField
                placeholder={t.search}
                fullWidth
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                sx={{ maxWidth: 480 }}
              />

              {loading && patients.length === 0 ? (
                <Grid container spacing={2}>
                  {[0, 1, 2].map(i => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                      <Card sx={{ p: 2.5 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Skeleton variant="circular" width={48} height={48} />
                          <Box sx={{ flexGrow: 1 }}>
                            <Skeleton width="70%" />
                            <Skeleton width="40%" />
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : patients.length === 0 ? (
                <Card>
                  <EmptyState icon={<PeopleAltOutlinedIcon />} title={search ? ui.searchEmpty : t.noPatients} />
                </Card>
              ) : (
                <Grid container spacing={2}>
                  {patients.map((p, idx) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p._id}>
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx, 8) * 0.03 }} style={{ height: '100%' }}>
                        <Card
                          role="button"
                          tabIndex={0}
                          onClick={() => openPatient(p)}
                          onKeyDown={(e) => { if (e.key === 'Enter') openPatient(p); }}
                          sx={{
                            p: 2.5,
                            height: '100%',
                            cursor: 'pointer',
                            transition: 'border-color .15s, box-shadow .15s',
                            '&:hover, &:focus-visible': {
                              borderColor: alpha(theme.palette.primary.main, 0.5),
                              boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.12)}`,
                              outline: 'none',
                            },
                          }}
                        >
                          <Stack direction="row" spacing={1.75} alignItems="center">
                            <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main', fontSize: 17 }}>
                              {p.firstName?.[0]}{p.lastName?.[0]}
                            </Avatar>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography variant="subtitle2" noWrap>{p.firstName} {p.lastName}</Typography>
                              <Chip label={diabetesLabel(p.diabetesType)} size="small" sx={{ mt: 0.5, height: 22, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }} />
                            </Box>
                            <ChevronRightIcon sx={{ color: 'text.disabled' }} />
                          </Stack>
                          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 2, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                            <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary" noWrap>{[p.region, p.district].filter(Boolean).join(', ') || '—'}</Typography>
                          </Stack>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Stack>
          )}

          {/* ===== CHAT TAB ===== */}
          {currentTab === 'chat' && (
            <Chat />
          )}

          {/* ===== PATIENT DETAIL ===== */}
          {currentTab === 'patient-detail' && selectedPatient && (
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                <Button startIcon={<ArrowBackIcon />} color="inherit" onClick={() => setCurrentTab('patients')}>{sentenceCase(t.patientList)}</Button>
                <Button
                  startIcon={<PictureAsPdfOutlinedIcon />}
                  variant="outlined"
                  onClick={handleExportPDF}
                  disabled={records.length === 0}
                >
                  {ui.pdf}
                </Button>
              </Stack>

              {/* Patient Header Card */}
              <Card sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main', fontSize: 22 }}>
                      {selectedPatient.firstName?.[0]}{selectedPatient.lastName?.[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h5" noWrap>{selectedPatient.firstName} {selectedPatient.lastName}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap', rowGap: 0.5 }}>
                        <Chip label={diabetesLabel(selectedPatient.diabetesType)} size="small" sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }} />
                        {lastValue != null && <GlucoseBadge value={lastValue} />}
                      </Stack>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={0} divider={<Box sx={{ width: '1px', bgcolor: 'divider', mx: 2.5 }} />}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">{ui.gender}</Typography>
                      <Typography variant="subtitle2">{t[selectedPatient.gender] || selectedPatient.gender || '—'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">{ui.age}</Typography>
                      <Typography variant="subtitle2">{selectedPatient.age || '—'}</Typography>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary">{ui.region}</Typography>
                      <Typography variant="subtitle2" noWrap>{selectedPatient.region || '—'}</Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Card>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <StatTile label={t.totalRecords || 'Jami yozuvlar'} value={records.length} icon={<ListAltRoundedIcon />} color="info" />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <StatTile
                    label={t.avgSugar || "O'rtacha qand"}
                    value={avgSugar != null ? avgSugar.toFixed(1) : '—'}
                    unit={avgSugar != null ? t.mmol : undefined}
                    icon={<WaterDropOutlinedIcon />}
                    valueColor={avgSugar != null && classifyGlucose(avgSugar) ? theme.palette.glucose[classifyGlucose(avgSugar)!] : undefined}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <StatTile
                    label={ui.tir}
                    value={tirPct != null ? `${tirPct}%` : '—'}
                    icon={<TrackChangesRoundedIcon />}
                    color="success"
                    valueColor={tirPct == null ? undefined : tirPct >= 70 ? theme.palette.glucose.inRange : tirPct >= 50 ? theme.palette.glucose.high : theme.palette.glucose.low}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <StatTile
                    label={ui.last}
                    value={lastValue != null ? Number(lastValue).toFixed(1) : '—'}
                    unit={lastValue != null ? t.mmol : undefined}
                    icon={<TimelineIcon />}
                    color="secondary"
                    hint={lastRecord ? <Typography variant="caption" color="text.secondary">{formatShortDate(lastRecord.date, language)}{lastValue != null && classifyGlucose(lastValue) ? ` · ${glucoseLabel(classifyGlucose(lastValue)!, language)}` : ''}</Typography> : undefined}
                  />
                </Grid>
              </Grid>

              <SectionCard title={ui.trend} icon={<TimelineIcon />}>
                {chartData.length > 0 ? (
                  <GlucoseTrendChart data={chartData} fastingLabel={t.fasting} postMealLabel={t.postMeal} />
                ) : (
                  <EmptyState compact icon={<TimelineIcon />} title={ui.noRecords} />
                )}
              </SectionCard>

              <Grid container spacing={3}>
                {/* Medical Notes */}
                <Grid size={{ xs: 12, lg: 7 }}>
                  <SectionCard title={t.medicalConclusion || 'Tibbiy xulosa'} icon={<EditNoteRoundedIcon />} iconColor="secondary" sx={{ height: '100%' }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={6}
                      placeholder={`${t.writeNote || 'Xulosa yozing'}...`}
                      value={doctorNote}
                      onChange={e => setDoctorNote(e.target.value)}
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={handleSaveNote}>
                        {t.save || 'Saqlash'}
                      </Button>
                    </Box>
                  </SectionCard>
                </Grid>

                {/* Recent records */}
                <Grid size={{ xs: 12, lg: 5 }}>
                  <SectionCard title={sentenceCase(t.recentActivity || 'Oxirgi yozuvlar')} icon={<ListAltRoundedIcon />} noPadding sx={{ height: '100%' }}>
                    {records.length === 0 ? (
                      <EmptyState compact title={ui.noRecords} />
                    ) : (
                      <Box>
                        {records.slice(-6).reverse().map((r) => (
                          <Stack key={r._id} direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.5, borderBottom: 1, borderColor: 'divider', '&:last-of-type': { borderBottom: 0 } }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{formatDate(r.date)}</Typography>
                              <Typography variant="caption" color="text.secondary">{formatTime(r.createdAt || r.date)}</Typography>
                            </Box>
                            <Stack direction="row" spacing={0.75}>
                              <Tooltip title={t.fasting}><span><GlucoseBadge value={r.fastingLevel || r.level} showLabel={false} /></span></Tooltip>
                              {r.postMealLevel != null && <Tooltip title={t.postMeal}><span><GlucoseBadge value={r.postMealLevel} showLabel={false} /></span></Tooltip>}
                            </Stack>
                          </Stack>
                        ))}
                      </Box>
                    )}
                  </SectionCard>
                </Grid>
              </Grid>
            </Stack>
          )}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}
