import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  Stack,
  Container,
  Paper,
  IconButton,
  Link,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';

// MUI Icons
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ActivityIcon from '@mui/icons-material/HistoryEdu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LanguageIcon from '@mui/icons-material/Language';

export default function ForgotPasswordPage() {
  const { language, setLanguage, isDarkMode, toggleDarkMode } = useApp();
  const theme = useTheme();
  const t = translations[language];

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.forgotPassword({ email });
      if (data.success) {
        setSent(true);
        toast.success(t.sent);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4, position: 'relative' }}>
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

      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ width: 64, height: 64, bgcolor: 'primary.main', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, color: 'white' }}>
            <ActivityIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>{t.forgotPassword}</Typography>
          <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1.5 }}>
            Password Recovery Process
          </Typography>
        </Box>

        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 4 }}>
            {!sent ? (
              <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'center', mb: 4, color: 'text.secondary', px: 2 }}>
                  {t.enterEmailToReset}
                </Typography>
                
                <Stack spacing={4}>
                  <TextField
                    fullWidth
                    label={t.email}
                    type="email"
                    size="small"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: <MailOutlineIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                    }}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    endIcon={!loading && <SendIcon fontSize="small" />}
                    sx={{ height: 48, fontWeight: 800 }}
                  >
                    {loading ? <CircularProgress size={20} color="inherit" /> : t.sendLink}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                     <Link component={RouterLink} to="/login" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, textDecoration: 'none', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                       <ArrowBackIcon sx={{ fontSize: 14 }} /> {t.backToLogin}
                     </Link>
                  </Box>
                </Stack>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{ width: 64, height: 64, bgcolor: alpha(theme.palette.success.main, 0.08), color: 'success.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>{t.sent}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 4, px: 2 }}>
                  {t.checkEmail}. {language === 'uz' ? 'Agar xat kelmasa, spam papkasini ham tekshirib ko\'ring.' : 'Если письмо не пришло, проверьте папку спам.'}
                </Typography>
                <Button fullWidth variant="outlined" component={RouterLink} to="/login" sx={{ fontWeight: 800, borderRadius: 1.5 }}>
                   {t.backToLogin}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
