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
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  Divider,
  Paper,
  alpha,
  useTheme,
  CircularProgress,
  Link,
  Container
} from '@mui/material';

// MUI Icons
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ActivityIcon from '@mui/icons-material/HistoryEdu'; // Represents monitoring/health
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LanguageIcon from '@mui/icons-material/Language';

export default function RegisterPage() {
  const { login } = useAuth();
  const { language, setLanguage, isDarkMode, toggleDarkMode } = useApp();
  const theme = useTheme();
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
      toast.error(language === 'uz' ? 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' : 'Min 6 characters');
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

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Top Controls */}
      <Box sx={{ position: 'absolute', top: 24, right: 24, display: 'flex', gap: 2, zIndex: 10 }}>
        <IconButton
          onClick={() => setLanguage(language === 'uz' ? 'ru' : language === 'ru' ? 'en' : 'uz')}
          sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}
        >
          <LanguageIcon />
        </IconButton>
        <IconButton
          onClick={toggleDarkMode}
          sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}
        >
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>

      <Container maxWidth="xs" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{ width: 64, height: 64, bgcolor: 'primary.main', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, color: 'white' }}>
          <ActivityIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>Qand Nazorati</Typography>
        <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1.5 }}>
          {t.signUp} • Join the Community
        </Typography>
      </Box>

      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 4 }}>
          {step === 'form' ? (
            <Box component="form" onSubmit={handleRegister}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, textTransform: 'uppercase' }}>{language === 'uz' ? 'Ro\'yxatdan o\'tish' : t.signUp}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 4 }}>Yangi hisob yaratish</Typography>
              
              <Stack spacing={3}>
                <Stack direction="row" spacing={2}>
                   <TextField
                    fullWidth
                    label={t.firstName}
                    size="small"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    label={t.lastName}
                    size="small"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                  />
                </Stack>

                <TextField
                  fullWidth
                  label={t.email}
                  type="text"
                  size="small"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: <MailOutlineIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                  }}
                />

                <TextField
                  fullWidth
                  label={t.password}
                  type={showPassword ? 'text' : 'password'}
                  size="small"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: <LockOutlinedIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />,
                    endAdornment: (
                      <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  label={language === 'uz' ? 'Tasdiqlang' : 'Confirm'}
                  type="password"
                  size="small"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  endIcon={!loading && <ArrowForwardIcon fontSize="small" />}
                  sx={{ height: 48, fontWeight: 800, mt: 2 }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : t.signUp}
                </Button>
              </Stack>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  {t.haveAccount} {' '}
                  <Link component={RouterLink} to="/login" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, textDecoration: 'none' }}>
                    {t.loginNow}
                  </Link>
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleVerifyOTP}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>{t.enterCode}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block' }}>{t.codeSent}: <Typography component="span" variant="caption" sx={{ color: 'primary.main', fontWeight: 900 }}>{email}</Typography></Typography>
              </Box>

              <Stack spacing={4}>
                <TextField
                  fullWidth
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputProps={{ style: { textAlign: 'center', fontSize: '2rem', letterSpacing: '0.5rem', fontWeight: 900 } }}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.02) } }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading || otp.length !== 6}
                  endIcon={!loading && <CheckCircleOutlineIcon fontSize="small" />}
                  sx={{ height: 48, fontWeight: 800 }}
                >
                   {loading ? <CircularProgress size={20} color="inherit" /> : t.verify}
                </Button>

                <Button fullWidth startIcon={<ArrowBackIcon fontSize="small" />} onClick={() => setStep('form')} sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 10 }}>{t.back}</Button>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
      </Container>
    </Box>
  );
}
