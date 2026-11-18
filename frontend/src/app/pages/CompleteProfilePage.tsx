import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, doctorAPI } from '../utils/api';
import { translations } from '../utils/translations';
import { toast } from 'sonner';

// MUI Components
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Avatar,
  alpha,
  useTheme,
  CircularProgress,
  Autocomplete,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
} from '@mui/material';
import { SectionCard } from '../components/common';
import { UZ_REGIONS, UZ_DISTRICTS, UZ_MAHALLAS } from '../data/administrative';

// MUI Icons
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BiotechOutlinedIcon from '@mui/icons-material/BiotechOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import TelegramIcon from '@mui/icons-material/Telegram';


const DIABETES_TYPES = [
  { value: 'type1', uz: '1-tip diabet', ru: 'Диабет 1 типа', en: 'Type 1 Diabetes' },
  { value: 'type2', uz: '2-tip diabet', ru: 'Диабет 2 типа', en: 'Type 2 Diabetes' },
  { value: 'prediabetes', uz: 'Prediabet', ru: 'Предиабет', en: 'Prediabetes' },
  { value: 'gestational', uz: 'Homiladorlik diabeti', ru: 'Гестационный диабет', en: 'Gestational Diabetes' },
  { value: 'none', uz: 'Yo\'q (monitoring)', ru: 'Нет (мониторинг)', en: 'None (monitoring)' },
];

export default function CompleteProfilePage() {
  const { language } = useApp();
  const { user, updateUser, logout } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = translations[language];

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', telegramUsername: '',
    dateOfBirth: '', gender: '', region: '',
    district: '', mfy: '', diabetesType: '',
    height: '', weight: '',
    doctorName: '',
    email: '', currentPassword: '', newPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [doctorCodeInput, setDoctorCodeInput] = useState('');
  const [connectingDoctor, setConnectingDoctor] = useState(false);

  const handleConnectDoctor = async () => {
    if (!doctorCodeInput.trim()) {
      toast.error('Şifokor kodini kiriting');
      return;
    }
    setConnectingDoctor(true);
    try {
      const { data } = await doctorAPI.connectByCode(doctorCodeInput.trim());
      if (data.success) {
        toast.success(data.message || t.doctorConnectedSuccess);
        if (data.user) {
          updateUser(data.user);
          setForm(prev => ({ ...prev, doctorName: data.user.doctorName || prev.doctorName }));
        }
        setDoctorCodeInput('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xato yuz berdi');
    } finally {
      setConnectingDoctor(false);
    }
  };

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        telegramUsername: user.telegramUsername || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        region: user.region || '',
        district: user.district || '',
        mfy: user.mfy || '',
        diabetesType: user.diabetesType || '',
        height: user.height ? String(user.height) : '',
        weight: user.weight ? String(user.weight) : '',
        doctorName: user.doctorName || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
      });
    }
  }, [user]);

  const handleChange = (key: string, value: string) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'region') {
        next.district = '';
        next.mfy = '';
      }
      if (key === 'district') {
        next.mfy = '';
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.completeProfile(form);
      if (data.success) {
        if (user && (form.newPassword || (form.email && form.email !== user.email))) {
          if (form.email && form.email !== user.email) await authAPI.updateProfile({ email: form.email });
          if (form.newPassword) await authAPI.updatePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
        }
        toast.success(t.success);
        updateUser(data.user);
        const targetPath = ['superadmin', 'admin'].includes(data.user.role) ? '/admin' : (data.user.role === 'doctor' ? '/doctor' : '/');
        setTimeout(() => navigate(targetPath), 300);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = user?.isProfileComplete;

  const requiredFields = [form.firstName, form.lastName, form.phone, form.dateOfBirth, form.gender, form.region, form.district, form.mfy, form.diabetesType, form.height, form.weight];
  const filledCount = requiredFields.filter(Boolean).length;
  const completion = Math.round((filledCount / requiredFields.length) * 100);
  const canSubmit = filledCount === requiredFields.length;
  const bmi = form.height && form.weight ? (parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)) : null;
  const sectionLabel = { fontWeight: 500, mb: 1, display: 'block', color: 'text.secondary' } as const;

  return (
    <Box sx={{ maxWidth: 880, mx: 'auto' }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 3 }}>
        <Avatar sx={{ width: 64, height: 64, fontSize: 24, bgcolor: alpha(theme.palette.primary.main, 0.14), color: 'primary.main' }}>
          {user?.firstName?.[0] || <PersonOutlineRoundedIcon fontSize="large" />}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h5" component="h1">
            {isEditing ? (t.editProfile || 'Profilni tahrirlaş') : t.profileTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEditing ? (t.updateYourData || 'O\'z ma\'lumotlaringizni yangilang') : t.profileSubtitle}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 180, width: { xs: '100%', sm: 'auto' } }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
            <Typography variant="caption" color="text.secondary">{filledCount}/{requiredFields.length}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: completion === 100 ? 'success.main' : 'primary.main' }}>{completion}%</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={completion} color={completion === 100 ? 'success' : 'primary'} />
        </Box>
      </Stack>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Section: Personal Info */}
          <SectionCard title={t.personalInfo} icon={<PersonOutlineRoundedIcon />}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label={t.firstName} value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} required autoComplete="given-name" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label={t.lastName} value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} required autoComplete="family-name" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth required label={t.phone} placeholder="+998 90 123 45 67" value={form.phone} onChange={e => handleChange('phone', e.target.value)} autoComplete="tel" InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon fontSize="small" /></InputAdornment> }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth required type="date" label={t.dob} value={form.dateOfBirth} onChange={e => handleChange('dateOfBirth', e.target.value)} InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthOutlinedIcon fontSize="small" /></InputAdornment> }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label={t.telegramLabel || 'Telegram'} placeholder="@username" value={form.telegramUsername} onChange={e => handleChange('telegramUsername', e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><TelegramIcon fontSize="small" /></InputAdornment> }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={sectionLabel}>{t.gender} *</Typography>
                <ToggleButtonGroup
                  exclusive
                  fullWidth
                  value={form.gender || null}
                  onChange={(_, v) => v && handleChange('gender', v)}
                  sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, py: 1 }, '& .MuiToggleButton-root.Mui-selected': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
                >
                  {['male', 'female', 'other'].map(g => (
                    <ToggleButton key={g} value={g}>{t[g] || g}</ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </SectionCard>

          {/* Section: Location */}
          <SectionCard title={t.location} icon={<LocationOnOutlinedIcon />} iconColor="success">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  options={UZ_REGIONS}
                  value={form.region}
                  onChange={(_, val) => handleChange('region', val || '')}
                  renderInput={(params) => <TextField {...params} label={t.region} required />}
                  openOnFocus
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  options={form.region ? UZ_DISTRICTS[form.region] || [] : []}
                  value={form.district}
                  onChange={(_, val) => handleChange('district', val || '')}
                  disabled={!form.region}
                  renderInput={(params) => <TextField {...params} label={t.districtCity} required />}
                  openOnFocus
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  freeSolo
                  options={form.district ? UZ_MAHALLAS[form.district] || [] : []}
                  value={form.mfy}
                  onChange={(_, val) => handleChange('mfy', val || '')}
                  onInputChange={(_, val) => handleChange('mfy', val)}
                  disabled={!form.district}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t.mfy}
                      required
                      placeholder={form.district && !UZ_MAHALLAS[form.district] ? (language === 'uz' ? "Mahalla nomini yozing..." : "Введите название махалли...") : (language === 'uz' ? "Tanlang yoki yozing..." : "Выберите или напишите...")}
                    />
                  )}
                  openOnFocus
                />
              </Grid>
            </Grid>
          </SectionCard>

          {/* Section: Medical */}
          <SectionCard title={t.medicalInfo} icon={<BiotechOutlinedIcon />} iconColor="error">
            <Typography variant="caption" sx={sectionLabel}>{t.diabetesType} *</Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              {DIABETES_TYPES.map(dt => {
                const selected = form.diabetesType === dt.value;
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={dt.value}>
                    <Box
                      role="radio"
                      aria-checked={selected}
                      tabIndex={0}
                      onClick={() => handleChange('diabetesType', dt.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleChange('diabetesType', dt.value); } }}
                      sx={{
                        px: 2, py: 1.5, borderRadius: 3, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1,
                        border: 1.5,
                        borderColor: selected ? 'primary.main' : 'divider',
                        bgcolor: selected ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
                        transition: 'all .15s',
                        '&:hover': { borderColor: selected ? 'primary.main' : 'text.disabled' },
                        '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: selected ? 600 : 500, color: selected ? 'primary.main' : 'text.primary' }}>
                        {dt[language] || dt.uz}
                      </Typography>
                      {selected && <CheckCircleRoundedIcon sx={{ fontSize: 20, color: 'primary.main' }} />}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  fullWidth type="number"
                  label={t.heightLabel}
                  value={form.height}
                  onChange={e => handleChange('height', e.target.value)}
                  inputProps={{ min: 100, max: 250, step: 1 }}
                  placeholder="170"
                  required
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  fullWidth type="number"
                  label={t.weightLabel}
                  value={form.weight}
                  onChange={e => handleChange('weight', e.target.value)}
                  inputProps={{ min: 20, max: 300, step: 0.5 }}
                  placeholder="70"
                  required
                  helperText={bmi && Number.isFinite(bmi) ? `BMI ${bmi.toFixed(1)}` : ' '}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label={t.doctorName} value={form.doctorName} onChange={e => handleChange('doctorName', e.target.value)} placeholder="Dr. Falonchiyev" />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'surfaceMuted', border: 1, borderColor: 'divider' }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <LinkRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2">{t.connectDoctor}</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {t.connectDoctorDesc}
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <TextField
                      size="small"
                      placeholder="DOC-1234"
                      value={doctorCodeInput}
                      onChange={e => setDoctorCodeInput(e.target.value.toUpperCase())}
                      sx={{ maxWidth: { sm: 220 } }}
                      inputProps={{ style: { fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' } }}
                    />
                    <Button
                      variant="contained"
                      disabled={connectingDoctor || !doctorCodeInput.trim()}
                      onClick={handleConnectDoctor}
                    >
                      {connectingDoctor ? <CircularProgress size={18} color="inherit" /> : t.connectDoctor}
                    </Button>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </SectionCard>

          {/* Section: Credentials */}
          <SectionCard title={t.securityUpdate} icon={<LockOutlinedIcon />} iconColor="secondary">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth type="text" label={t.email} value={form.email} onChange={e => handleChange('email', e.target.value)} autoComplete="email" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth type="password" label={t.currentPassword} value={form.currentPassword} onChange={e => handleChange('currentPassword', e.target.value)} placeholder="••••••••" helperText={t.passwordRequiredForChange} autoComplete="current-password" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth type="password" label={t.newPassword} value={form.newPassword} onChange={e => handleChange('newPassword', e.target.value)} placeholder="••••••••" autoComplete="new-password" />
              </Grid>
            </Grid>
          </SectionCard>

          {/* Actions */}
          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ pb: 2 }}>
            <Button color="error" startIcon={<LogoutRoundedIcon />} onClick={logout}>{t.logoutUser}</Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!canSubmit || loading}
              sx={{ minWidth: { sm: 240 } }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : (isEditing ? t.saveBtn : t.saveContinue)}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
