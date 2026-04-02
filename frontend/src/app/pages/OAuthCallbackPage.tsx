import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');
    const needsProfile = params.get('needsProfile') === 'true';

    if (token && refreshToken) {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      authAPI.getMe().then(({ data }) => {
        login(token, refreshToken, data.user);
        if (needsProfile) navigate('/complete-profile');
        else if (data.user.role === 'superadmin') navigate('/admin');
        else navigate('/');
      }).catch(() => navigate('/login?error=oauth_failed'));
    } else {
      navigate('/login?error=oauth_failed');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
      <p className="text-lg font-black">Kirish amalga oshirilmoqda...</p>
    </div>
  );
}
