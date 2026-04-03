import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Paper,
  alpha,
  useTheme,
  CircularProgress
} from '@mui/material';

// MUI Icons
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShieldIcon from '@mui/icons-material/Shield';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

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
      toast.error(language === 'uz' ? 'Parollar mos emas' : 'Пароли не совпадают');
      return;
    }
    if (!token) {
      toast.error('Token topilmadi');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword({ token, password });
      if (data.success) {
        setSuccess(true);
        toast.success(t.passwordUpdated);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

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
              </Stack>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ width: 64, height: 64, bgcolor: alpha(theme.palette.success.main, 0.08), color: 'success.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>{t.success}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 4, px: 2 }}>
                {t.passwordUpdated}. {language === 'uz' ? 'Endi yangi parolingiz bilan tizimga kirishingiz mumkin.' : 'Теперь вы можете войти с новым паролем.'}
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
