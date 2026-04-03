import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import { translations } from '../utils/translations';
import { toast } from 'sonner';

// MUI Components
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Stack,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  IconButton,
  alpha,
  useTheme,
  CircularProgress,
  Container
} from '@mui/material';

// MUI Icons
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BiotechIcon from '@mui/icons-material/Biotech';
import PhoneIcon from '@mui/icons-material/Phone';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const UZ_REGIONS = [
  'Toshkent shahri', 'Toshkent viloyati', 'Samarqand viloyati', 'Buxoro viloyati',
  'Andijon viloyati', 'Farg\'ona viloyati', 'Namangan viloyati', 'Qashqadaryo viloyati',
  'Surxondaryo viloyati', 'Navoiy viloyati', 'Xorazm viloyati', 'Sirdaryo viloyati',
  'Jizzax viloyati', 'Qoraqalpog\'iston Respublikasi',
];

const UZ_DISTRICTS: Record<string, string[]> = {
  'Toshkent shahri': ['Chilonzor', 'Yunusobod', 'Mirzo Ulug‘bek', 'Yashnobod', 'Mirobod', 'Shayxontohur', 'Uchtepa', 'Jakasaroiy', 'Olmazor', 'Sergeli', 'Yangihayot', 'Bektemir'],
  'Toshkent viloyati': ['Angren sh.', 'Olmaliq sh.', 'Chirchiq sh.', 'Bekobod sh.', 'Oqqo‘rg‘on', 'Olmaliq', 'Piskent', 'Qibray', 'Zangiota', 'Yangiyo‘l', 'Chinoz', 'Bo‘stonliq', 'Parkent'],
  'Samarqand viloyati': ['Samarqand sh.', 'Kattaqo‘rg‘on sh.', 'Samarqand t.', 'Pastdarg‘om', 'Paxtachi', 'Narpay', 'Kattaqo‘rg‘on t.', 'Ishtixon', 'Oqdaryo', 'Bulung‘ur', 'Jomboy', 'Toyloq', 'Urgut', 'Nurobod', 'Qo‘shrabot'],
  'Buxoro viloyati': ['Buxoro sh.', 'Kogon sh.', 'Buxoro t.', 'Kogon t.', 'G‘ijduvon', 'Shofirkon', 'Vobkent', 'Romitan', 'Peshku', 'Jondor', 'Olot', 'Qorako‘l', 'Qorovulbozor'],
  'Andijon viloyati': ['Andijon sh.', 'Xonobod sh.', 'Andijon t.', 'Asaka', 'Shahrixon', 'Oltinko‘l', 'Baliqchi', 'Paxtaobod', 'Izboskan', 'Qo‘rg‘ontepa', 'Jalaquduq', 'Xo‘jaobod', 'Bo‘ston', 'Ulug‘nor', 'Marhamat'],
  'Farg\'ona viloyati': ['Farg‘ona sh.', 'Qo‘qon sh.', 'Marg‘ilon sh.', 'Quvasoy sh.', 'Farg‘ona t.', 'Oltiariq', 'Rishton', 'Bag‘dod', 'Uchko‘prik', 'Buvayda', 'Yozyovon', 'Toshloq', 'Quva', 'O‘zbekiston', 'Furqat', 'Dang‘ara', 'Besharik', 'Sux'],
  'Namangan viloyati': ['Namangan sh.', 'Namangan t.', 'Chust', 'Pop', 'Uychi', 'Uchqo‘rg‘on', 'Norin', 'Yangiqo‘rg‘on', 'Kosonsoy', 'To‘raqo‘rg‘on', 'Mingbuloq'],
  'Qashqadaryo viloyati': ['Qarshi sh.', 'Qarshi t.', 'Shaxrisabz sh.', 'Shaxrisabz t.', 'Kitob', 'Yakkabog‘', 'Qamashi', 'G‘uzor', 'Dehqonobod', 'Nishon', 'Kasbi', 'Ko‘kdala', 'Mirishkor', 'Muborak', 'Chiroqchi'],
  'Surxondaryo viloyati': ['Termiz sh.', 'Termiz t.', 'Denov', 'Sho‘rchi', 'Jarqo‘rg‘on', 'Qumqo‘rg‘on', 'Angor', 'Sherobod', 'Boysun', 'Sariosiyo', 'Uzun', 'Oltinsoy', 'Qiziriq', 'Muzrabot'],
  'Navoiy viloyati': ['Navoiy sh.', 'Zarafshon sh.', 'Karmana', 'Qiziltepa', 'Xatirchi', 'Nurota', 'Navbahor', 'Konimex', 'Tomdi', 'Uchkuduq'],
  'Xorazm viloyati': ['Urganch sh.', 'Xiva sh.', 'Urganch t.', 'Xiva t.', 'Xonqa', 'Gurlan', 'Shovot', 'Qo‘shko‘pir', 'Bog‘ot', 'Hazorasp', 'Yangiariq', 'Yangibozor', 'Tuproqqala'],
  'Sirdaryo viloyati': ['Guliston sh.', 'Shirin sh.', 'Yangiyer sh.', 'Guliston t.', 'Sirdaryo t.', 'Sayxunobod', 'Boyovut', 'Mirzaobod', 'Oqoltin', 'Sardoba', 'Xovos'],
  'Jizzax viloyati': ['Jizzax sh.', 'Jizzax t.', 'Sharof Rashidov', 'Do‘stlik', 'Paxtakor', 'Zafarobod', 'Mirzachul', 'Arnasoy', 'Baxmal', 'G‘allaorol', 'Forish', 'Zomin', 'Yangiobod'],
  'Qoraqalpog\'iston Respublikasi': ['Nukus sh.', 'Nukus t.', 'Amudaryo', 'Beruniy', 'To‘rtko‘l', 'Ellikqala', 'Xo‘jayli', 'Taxiatosh', 'Shumanay', 'Qonliko‘l', 'Qo‘ng‘irot', 'Mo‘ynoq', 'Chimboy', 'Kegeyli', 'Qorao‘zak', 'Taxtako‘pir', 'Bo‘zatov'],
};

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
    district: '', mfy: '', diabetesType: '', doctorName: '',
    email: '', currentPassword: '', newPassword: '',
  });
  const [loading, setLoading] = useState(false);

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
      if (key === 'region') next.district = '';
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
        setTimeout(() => navigate(user?.role === 'superadmin' ? '/admin' : '/'), 300);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = user?.isProfileComplete;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: 'primary.main', 
            borderRadius: 2, 
            mx: 'auto', 
            mb: 2,
            fontSize: 40
          }}
        >
          {user?.firstName?.[0] || <PersonIcon fontSize="large" />}
        </Avatar>
        <Typography variant="h4" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>
          {isEditing ? (t.editProfile || 'Profilni tahrirlash') : t.profileTitle}
        </Typography>
        <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>
          {isEditing ? (t.updateYourData || 'O\'z ma\'lumotlaringizni yangilang') : t.profileSubtitle}
        </Typography>
      </Box>

      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Box component="form" onSubmit={handleSubmit}>
            
            {/* Section: Personal Info */}
            <Box sx={{ mb: 6 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                <PersonIcon color="primary" fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>{t.personalInfo}</Typography>
              </Stack>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth size="small" label={t.firstName} value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth size="small" label={t.lastName} value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth size="small" label={t.phone} placeholder="+998 90 123 45 67" value={form.phone} onChange={e => handleChange('phone', e.target.value)} InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} /> }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth size="small" type="date" label={t.dob} value={form.dateOfBirth} onChange={e => handleChange('dateOfBirth', e.target.value)} InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <CalendarMonthIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} /> }} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display: 'block', textTransform: 'uppercase', color: 'text.secondary' }}>{t.gender}</Typography>
                  <Stack direction="row" spacing={2}>
                    {['male', 'female', 'other'].map(g => (
                      <Button 
                        key={g} 
                        variant={form.gender === g ? 'contained' : 'outlined'} 
                        onClick={() => handleChange('gender', g)}
                        sx={{ flex: 1, fontWeight: 800, borderRadius: 1.5 }}
                      >
                        {language === 'uz' ? (g === 'male' ? 'Erkak' : g === 'female' ? 'Ayol' : 'Boshqa') : g}
                      </Button>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ mb: 6 }} />

            {/* Section: Location */}
            <Box sx={{ mb: 6 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                <LocationOnIcon sx={{ color: '#10b981' }} fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>{t.location}</Typography>
              </Stack>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t.region} *</InputLabel>
                    <Select value={form.region} label={t.region + " *"} onChange={e => handleChange('region', e.target.value)} required>
                      {UZ_REGIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth size="small" disabled={!form.region}>
                    <InputLabel>{t.districtCity} *</InputLabel>
                    <Select value={form.district} label={t.districtCity + " *"} onChange={e => handleChange('district', e.target.value)} required>
                      {form.region && UZ_DISTRICTS[form.region]?.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth size="small" label={t.mfy + " *"} value={form.mfy} onChange={e => handleChange('mfy', e.target.value)} disabled={!form.district} required />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ mb: 6 }} />

            {/* Section: Medical */}
            <Box sx={{ mb: 6 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                <BiotechIcon sx={{ color: '#f43f5e' }} fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>{t.medicalInfo}</Typography>
              </Stack>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display: 'block', textTransform: 'uppercase', color: 'text.secondary' }}>{t.diabetesType} *</Typography>
                  <Grid container spacing={2}>
                    {DIABETES_TYPES.map(dt => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={dt.value}>
                        <Button 
                          fullWidth 
                          variant={form.diabetesType === dt.value ? 'contained' : 'outlined'} 
                          onClick={() => handleChange('diabetesType', dt.value)}
                          startIcon={form.diabetesType === dt.value && <CheckCircleIcon />}
                          sx={{ justifyContent: 'start', px: 2, fontWeight: 700, borderRadius: 1.5, py: 1.5 }}
                        >
                          {dt[language] || dt.uz}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                   <TextField fullWidth size="small" label={t.doctorName} value={form.doctorName} onChange={e => handleChange('doctorName', e.target.value)} placeholder="Dr. Azamat Karimov" />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ mb: 6 }} />

            {/* Section: Credentials */}
            <Paper elevation={0} sx={{ p: 4, bgcolor: alpha(theme.palette.primary.main, 0.02), border: `1px solid ${theme.palette.divider}`, mb: 6, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                <SaveIcon sx={{ color: '#8b5cf6' }} fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>Security Update</Typography>
              </Stack>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth size="small" type="email" label={t.email} value={form.email} onChange={e => handleChange('email', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth size="small" type="password" label={t.currentPassword} value={form.currentPassword} onChange={e => handleChange('currentPassword', e.target.value)} placeholder="••••••••" helperText="Email yoki parolni o'zgartirish uchun kerak" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth size="small" type="password" label={t.newPassword} value={form.newPassword} onChange={e => handleChange('newPassword', e.target.value)} placeholder="••••••••" />
                </Grid>
              </Grid>
            </Paper>

            <Stack spacing={2}>
              <Button 
                fullWidth 
                type="submit" 
                variant="contained" 
                size="large" 
                disabled={loading || !form.region || !form.district || !form.diabetesType}
                sx={{ height: 64, fontWeight: 900, fontSize: '1rem', borderRadius: 2, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : (isEditing ? 'Saqlash' : t.saveContinue)}
              </Button>
              
              {!isEditing && (
                <Button fullWidth onClick={() => navigate('/')} sx={{ fontWeight: 800, color: 'text.secondary' }}>{t.fillLater}</Button>
              )}
              
              <Button fullWidth color="error" startIcon={<LogoutIcon />} onClick={logout} sx={{ fontWeight: 800 }}>Logout</Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
