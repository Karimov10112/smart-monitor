import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import { useApp } from '../contexts/AppContext';
import { translations } from '../utils/translations';
import { toast } from 'sonner';

// MUI Components
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Link,
  CircularProgress,
  Stack,
  Alert,
  IconButton,
} from '@mui/material';
import { AuthLayout } from '../components/common';

// MUI Icons
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { language } = useApp();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();

      if (!trimmedEmail) {
        toast.error('Login ni kiriting');
        setLoading(false);
        return;
      }

      const { data } = await authAPI.login({ email: trimmedEmail, password, language });
      if (data.success) {
        login(data.token, data.refreshToken, data.user);
        toast.success(t.success);
        if (['superadmin', 'admin'].includes(data.user.role)) navigate('/admin');
        else if (data.user.role === 'doctor') navigate('/doctor');
        else navigate('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const COPY: Record<string, { title: string; subtitle: string; notice: string; loginLabel: string; loginPlaceholder: string; clinic: string; required: string }> = {
    uz: { title: 'Xuş kelibsiz', subtitle: 'Hisobingizga kiring va kõrsatkiçlaringizni kuzatib boring', notice: 'Tizimga kiriş uçun login va parolni şifokoringizdan oling.', loginLabel: 'Login (telefon yoki email)', loginPlaceholder: '+998901234567 yoki email', clinic: "Tizimda rõyxatdan õtiş uçun klinikaga murojaat qiling", required: 'Majburiy maydon' },
    ru: { title: 'Добро пожаловать', subtitle: 'Войдите, чтобы следить за своими показателями', notice: 'Логин и пароль для входа выдаёт ваш врач.', loginLabel: 'Логин (телефон или email)', loginPlaceholder: '+998901234567 или email', clinic: 'Для регистрации обратитесь в клинику', required: 'Обязательное поле' },
    en: { title: 'Welcome back', subtitle: 'Sign in to keep track of your health data', notice: 'Your login and password are provided by your doctor.', loginLabel: 'Login (phone or email)', loginPlaceholder: '+998901234567 or email', clinic: 'Contact your clinic to register', required: 'Required field' },
  };
  const c = COPY[language] || COPY.uz;

  return (
    <AuthLayout title={c.title} subtitle={c.subtitle}>
      <Alert severity="info" icon={<LocalHospitalOutlinedIcon fontSize="inherit" />} sx={{ mb: 3 }}>
        {c.notice}
      </Alert>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2.5}>
          <TextField
            label={c.loginLabel}
            placeholder={c.loginPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            autoFocus
            error={submitted && !email.trim()}
            helperText={submitted && !email.trim() ? c.required : undefined}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label={t.passwordLabel}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            error={submitted && !password}
            helperText={submitted && !password ? c.required : undefined}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword(v => !v)} edge="end" aria-label="toggle password">
                    {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: '-4px !important' }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover" sx={{ fontWeight: 600 }}>
              {t.forgotPassword}
            </Link>
          </Box>

          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
            {loading ? <CircularProgress size={22} color="inherit" /> : t.login}
          </Button>

          <Typography variant="body2" align="center" color="text.secondary">
            {c.clinic}
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
