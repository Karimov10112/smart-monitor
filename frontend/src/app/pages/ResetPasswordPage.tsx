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
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  Container,
  alpha,
  useTheme,
  CircularProgress,
  Link
} from '@mui/material';

// MUI Icons
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShieldIcon from '@mui/icons-material/Shield';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ResetPasswordPage() {
  const { language } = useApp();
  const theme = useTheme();
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
      toast.error(language === 'uz' ? 'Parol kamida 6 ta belgi bo\'lishi kerak' : language === 'ru' ? 'Пароль минимум 6 символов' : 'Password must be at least 6 characters');
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

  // Token yo'q bo'lsa — xato sahifa
  if (!token) {
    return (
      <Container maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, bgcolor: alpha(theme.palette.error.main, 0.08), color: 'error.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
              <ErrorOutlineIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
              {language === 'uz' ? 'Token topilmadi' : language === 'ru' ? 'Токен не найден' : 'Token Not Found'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
              {language === 'uz'
                ? 'Emailga yuborilgan havoladan to\'g\'ri kiring. Havola eskirgan bo\'lishi mumkin.'
                : language === 'ru'
                ? 'Перейдите по ссылке из письма. Ссылка могла устареть.'
                : 'Please use the link from your email. The link may have expired.'}
            </Typography>
            <Button
              fullWidth
              variant="contained"
              component={RouterLink}
              to="/forgot-password"
              sx={{ fontWeight: 800 }}
            >
              {language === 'uz' ? 'Qaytadan so\'rov yuborish' : language === 'ru' ? 'Отправить снова' : 'Request Again'}
            </Button>
            <Link component={RouterLink} to="/login" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 2, fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
              <ArrowBackIcon sx={{ fontSize: 14 }} />
              {t.backToLogin}
            </Link>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{ width: 64, height: 64, bgcolor: 'primary.main', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, color: 'white' }}>
          <ShieldIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>{t.resetPassword}</Typography>
        <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1.5 }}>
          Secure Password Update
        </Typography>
      </Box>

      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 4 }}>
          {!success ? (
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label={t.newPassword}
                  type={showPassword ? 'text' : 'password'}
                  size="small"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  inputProps={{ minLength: 6 }}
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
                  label={t.confirmNewPassword}
                  type="password"
                  size="small"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  inputProps={{ minLength: 6 }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  endIcon={!loading && <ArrowForwardIcon fontSize="small" />}
                  sx={{ height: 48, fontWeight: 800 }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : t.updatePassword}
                </Button>

                <Link component={RouterLink} to="/forgot-password" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                  {language === 'uz' ? 'Yangi havola so\'rash' : language === 'ru' ? 'Запросить новую ссылку' : 'Request new link'}
                </Link>
              </Stack>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ width: 64, height: 64, bgcolor: alpha(theme.palette.success.main, 0.08), color: 'success.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>{t.success}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 4, px: 2 }}>
                {t.passwordUpdated}. {language === 'uz' ? 'Endi yangi parolingiz bilan tizimga kirishingiz mumkin.' : language === 'ru' ? 'Теперь вы можете войти с новым паролем.' : 'You can now log in with your new password.'}
              </Typography>
              <Button fullWidth variant="contained" onClick={() => navigate('/login')} sx={{ fontWeight: 800 }}>
                 {t.signIn}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
