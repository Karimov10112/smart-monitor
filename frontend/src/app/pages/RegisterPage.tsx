import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
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
  Link,
} from '@mui/material';
import { AuthLayout } from '../components/common';

// MUI Icons
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';

export default function RegisterPage() {
  const { login } = useAuth();
  const { language } = useApp();
  const navigate = useNavigate();
  const t = translations[language];

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(language === 'uz' ? 'Parollar mos emas' : 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error(language === 'uz' ? 'Parol kamida 6 ta belgidan iborat bõlişi kerak' : 'Min 6 characters');
      return;
    }
    setLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const isGmailRegex = /^[a-zA-Z0-9._%+-]+@gmail(\.com)?$/;
      const isValidFormat = trimmedEmail === 'admin' || isGmailRegex.test(trimmedEmail);

      if (!isValidFormat) {
        toast.error(t.invalidEmailFormat || 'Notogri login formati');
        setLoading(false);
        return;
      }

      const { data } = await authAPI.register({ email: trimmedEmail, password, firstName, lastName, language });
      if (data.success && data.userId) {
        if (data.autoVerified) {
          toast.success(data.message || t.success);
          navigate('/login');
        } else {
          setUserId(data.userId);
          setEmail(trimmedEmail);
          setStep('otp');
          toast.success(t?.codeSent || 'Kodi yuborildi');
        }
      } else {
        toast.error(data.message || (language === 'uz' ? 'Xatolik' : 'Error'));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.verifyOTP({ userId, otp });
      if (data.success) {
        login(data.token, data.refreshToken, data.user);
        toast.success(t.success);
        navigate('/complete-profile');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const tooShort = password.length > 0 && password.length < 6;
  const hint = {
    short: language === 'ru' ? 'Минимум 6 символов' : language === 'en' ? 'At least 6 characters' : 'Kamida 6 ta belgi',
    mismatch: language === 'ru' ? 'Пароли не совпадают' : language === 'en' ? 'Passwords do not match' : 'Parollar mos emas',
  };

  return (
    <AuthLayout
      title={step === 'form' ? t.signUp : t.enterCode}
      subtitle={step === 'form' ? t.newAccountSubtitle : <>{t.codeSent}: <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>{email}</Box></>}
      icon={step === 'otp' ? <MarkEmailReadOutlinedIcon /> : undefined}
    >
      {step === 'form' ? (
        <Box component="form" onSubmit={handleRegister}>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label={t.firstName} value={firstName} onChange={e => setFirstName(e.target.value)} required autoComplete="given-name" />
              <TextField fullWidth label={t.lastName} value={lastName} onChange={e => setLastName(e.target.value)} required autoComplete="family-name" />
            </Stack>

            <TextField
              fullWidth
              label={t.email}
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="name@gmail.com"
              InputProps={{ startAdornment: <InputAdornment position="start"><MailOutlineIcon fontSize="small" /></InputAdornment> }}
            />

            <TextField
              fullWidth
              label={t.password}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              error={tooShort}
              helperText={tooShort ? hint.short : ' '}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockOutlinedIcon fontSize="small" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end" onClick={() => setShowPassword(!showPassword)} aria-label="toggle password">
                      {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label={language === 'uz' ? 'Parolni tasdiqlang' : language === 'ru' ? 'Подтвердите пароль' : 'Confirm password'}
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              error={mismatch}
              helperText={mismatch ? hint.mismatch : ' '}
              sx={{ mt: '8px !important' }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              endIcon={!loading && <ArrowForwardIcon fontSize="small" />}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : t.signUp}
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
            {t.haveAccount}{' '}
            <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
              {t.loginNow}
            </Link>
          </Typography>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleVerifyOTP}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputProps={{ inputMode: 'numeric', autoComplete: 'one-time-code', style: { textAlign: 'center', fontSize: '1.75rem', letterSpacing: '0.6em', fontWeight: 600, fontVariantNumeric: 'tabular-nums' } }}
              autoFocus
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || otp.length !== 6}
              endIcon={!loading && <CheckCircleOutlineIcon fontSize="small" />}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : t.verify}
            </Button>

            <Button fullWidth color="inherit" startIcon={<ArrowBackIcon fontSize="small" />} onClick={() => setStep('form')}>{t.back}</Button>
          </Stack>
        </Box>
      )}
    </AuthLayout>
  );
}
