import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
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
  IconButton,
  InputAdornment,
  Stack,
  CircularProgress,
  Link
} from '@mui/material';
import { AuthLayout, IconTile } from '../components/common';

// MUI Icons
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ResetPasswordPage() {
  const { language } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const t = translations[language];

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(language === 'uz' ? 'Parollar mos emas' : language === 'ru' ? 'Пароли не совпадают' : 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error(language === 'uz' ? 'Parol kamida 6 ta belgi bõlişi kerak' : language === 'ru' ? 'Пароль минимум 6 символов' : 'Password must be at least 6 characters');
      return;
    }
    if (!token) {
      toast.error('Token topilmadi');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword({ token: token.trim(), password });
      if (data.success) {
        setSuccess(true);
        toast.success(t.passwordUpdated);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || t.error;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const tooShort = password.length > 0 && password.length < 6;
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // Token yo'q bo'lsa — xato sahifa
  if (!token) {
    return (
      <AuthLayout
        icon={<ErrorOutlineIcon />}
        title={language === 'uz' ? 'Token topilmadi' : language === 'ru' ? 'Токен не найден' : 'Token not found'}
        subtitle={language === 'uz'
          ? 'Emailga yuborilgan havoladan tõğri kiring. Havola eskirgan bõlişi mumkin.'
          : language === 'ru'
          ? 'Перейдите по ссылке из письма. Ссылка могла устареть.'
          : 'Please use the link from your email. The link may have expired.'}
      >
        <Stack spacing={2}>
          <Button fullWidth variant="contained" size="large" component={RouterLink} to="/forgot-password">
            {language === 'uz' ? 'Qaytadan sõrov yuboriş' : language === 'ru' ? 'Отправить снова' : 'Request again'}
          </Button>
          <Link component={RouterLink} to="/login" underline="hover" variant="body2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, fontWeight: 600 }}>
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            {t.backToLogin}
          </Link>
        </Stack>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={success ? t.success : t.resetPassword}
      subtitle={success ? undefined : (language === 'uz' ? 'Yangi parolni kiriting' : language === 'ru' ? 'Введите новый пароль' : 'Choose a new password')}
      icon={success ? undefined : <ShieldOutlinedIcon />}
    >
      {!success ? (
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label={t.newPassword}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
              autoComplete="new-password"
              inputProps={{ minLength: 6 }}
              error={tooShort}
              helperText={tooShort ? (language === 'ru' ? 'Минимум 6 символов' : language === 'en' ? 'At least 6 characters' : 'Kamida 6 ta belgi') : ' '}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockOutlinedIcon fontSize="small" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end" onClick={() => setShowPassword(!showPassword)} aria-label="toggle password">
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label={t.confirmNewPassword}
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              inputProps={{ minLength: 6 }}
              error={mismatch}
              helperText={mismatch ? (language === 'ru' ? 'Пароли не совпадают' : language === 'en' ? 'Passwords do not match' : 'Parollar mos emas') : ' '}
            />

            <Button fullWidth type="submit" variant="contained" size="large" disabled={loading} endIcon={!loading && <ArrowForwardIcon fontSize="small" />}>
              {loading ? <CircularProgress size={22} color="inherit" /> : t.updatePassword}
            </Button>

            <Link component={RouterLink} to="/forgot-password" underline="hover" variant="body2" sx={{ textAlign: 'center', fontWeight: 600 }}>
              {language === 'uz' ? 'Yangi havola sõraş' : language === 'ru' ? 'Запросить новую ссылку' : 'Request new link'}
            </Link>
          </Stack>
        </Box>
      ) : (
        <Box>
          <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ p: 2, mb: 3, borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <IconTile color="success"><CheckCircleOutlineIcon /></IconTile>
            <Typography variant="body2" color="text.secondary">
              {t.passwordUpdated}. {language === 'uz' ? 'Endi yangi parolingiz bilan tizimga kirişingiz mumkin.' : language === 'ru' ? 'Теперь вы можете войти с новым паролем.' : 'You can now log in with your new password.'}
            </Typography>
          </Stack>
          <Button fullWidth variant="contained" size="large" onClick={() => navigate('/login')}>
            {t.signIn}
          </Button>
        </Box>
      )}
    </AuthLayout>
  );
}
