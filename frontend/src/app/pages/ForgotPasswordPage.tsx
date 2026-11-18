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
  TextField,
  Button,
  Stack,
  Link,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { AuthLayout, IconTile } from '../components/common';

// MUI Icons
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';

export default function ForgotPasswordPage() {
  const { language } = useApp();
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
    <AuthLayout
      title={sent ? t.sent : t.forgotPassword}
      subtitle={sent ? undefined : t.enterEmailToReset}
      icon={sent ? undefined : <KeyOutlinedIcon />}
    >
      {!sent ? (
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label={t.email}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              InputProps={{ startAdornment: <InputAdornment position="start"><MailOutlineIcon fontSize="small" /></InputAdornment> }}
            />

            <Button fullWidth type="submit" variant="contained" size="large" disabled={loading} endIcon={!loading && <SendIcon fontSize="small" />}>
              {loading ? <CircularProgress size={22} color="inherit" /> : t.sendLink}
            </Button>

            <Link component={RouterLink} to="/login" underline="hover" variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
              <ArrowBackIcon sx={{ fontSize: 16 }} /> {t.backToLogin}
            </Link>
          </Stack>
        </Box>
      ) : (
        <Box>
          <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ p: 2, mb: 3, borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <IconTile color="success"><CheckCircleOutlineIcon /></IconTile>
            <Typography variant="body2" color="text.secondary">
              {t.checkEmail}. {language === 'uz' ? 'Agar xat kelmasa, spam papkasini ham tekşirib kõring.' : language === 'ru' ? 'Если письмо не пришло, проверьте папку спам.' : "If you don't see the email, check your spam folder."}
            </Typography>
          </Stack>
          <Button fullWidth variant="outlined" size="large" component={RouterLink} to="/login" startIcon={<ArrowBackIcon fontSize="small" />}>
            {t.backToLogin}
          </Button>
        </Box>
      )}
    </AuthLayout>
  );
}
