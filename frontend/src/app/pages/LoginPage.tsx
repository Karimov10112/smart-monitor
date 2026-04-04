import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import { useApp } from '../contexts/AppContext';
import { translations } from '../utils/translations';
import { toast } from 'sonner';

// MUI Components
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  Link,
  CircularProgress,
  Stack,
  useTheme,
  alpha,
  IconButton
} from '@mui/material';

// MUI Icons
import EmailIcon from '@mui/icons-material/EmailOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import LoginIcon from '@mui/icons-material/Login';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StorageIcon from '@mui/icons-material/Storage';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LanguageIcon from '@mui/icons-material/Language';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { language, setLanguage, isDarkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();
  const theme = useTheme();
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password, language });
      if (data.success) {
        login(data.token, data.refreshToken, data.user);
        toast.success(t.success);
        navigate(data.user.role === 'superadmin' ? '/admin' : '/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: 'background.default',
        position: 'relative'
      }}
    >
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

      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              mx: 'auto',
              mb: 2,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <StorageIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Qand <Box component="span" sx={{ color: 'primary.main' }}>Nazorati</Box>
          </Typography>
          <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 2, color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ fontSize: 14, color: 'primary.main' }} /> {t.appName || 'Smart Monitor System'}
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          {/* Official Banner */}
          <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02), p: 3, textAlign: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, mb: 2, color: 'text.secondary' }}>
              {t.noAccount || "Akkauntingiz yo'qmi?"}
            </Typography>
            <Button
              component={RouterLink}
              to="/register"
              variant="outlined"
              size="small"
              color="primary"
              endIcon={<ArrowForwardIcon />}
              sx={{ borderRadius: 1.5, px: 3 }}
            >
              {t.signUp || "Ro'yxatdan o'tish"}
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 4, md: 6 } }}>
            <Stack spacing={3}>
              <TextField
                label="Email Address"
                placeholder="admin yoki email@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="caption"
                  sx={{ fontWeight: 800, textTransform: 'uppercase', textDecoration: 'none' }}
                >
                  {t.forgotPassword}
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                endIcon={!loading && <LoginIcon />}
                sx={{
                  py: 1.5,
                  height: 54,
                  fontWeight: 800,
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none' }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : t.login}
              </Button>

              <Typography variant="caption" align="center" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {t.noAccount} <Link component={RouterLink} to="/register" sx={{ color: 'primary.main', ml: 1, textDecoration: 'none', fontWeight: 800 }}>{t.register}</Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, textAlign: 'center', opacity: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 2 }}>
            © {new Date().getFullYear()} QAND NAZORATI. PROFESSIONAL VERSION.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
