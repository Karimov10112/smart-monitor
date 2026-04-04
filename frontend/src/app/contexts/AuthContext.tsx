import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../utils/api';

export type UserRole = 'user' | 'doctor' | 'superadmin';

export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  telegramUsername?: string;
  dateOfBirth?: string;
  region?: string;
  district?: string;
  mfy?: string;
  gender?: string;
  diabetesType?: string;
  doctorName?: string;
  height?: number;
  weight?: number;
  isEmailVerified: boolean;
  isProfileComplete: boolean;
  lastLogin?: string;
  createdAt?: string;
  adminNotes?: string;
  doctorNotes?: string;
  supportMessages?: Array<{
    text: string;
    sender: 'user' | 'admin';
    createdAt: string;
    isReadByAdmin: boolean;
    isReadByUser: boolean;
  }>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => Promise<void>;
  updateUser: (user: any) => void;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const { data } = await authAPI.getMe();
          setUser(data.user);
          setToken(savedToken);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = React.useCallback((accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setToken(accessToken);
    setUser(userData);
  }, []);

  const logout = React.useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = React.useCallback((updatedUser: any) => {
    if (typeof updatedUser === 'function') {
      setUser(updatedUser);
    } else {
      setUser(updatedUser);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout, updateUser,
      isAuthenticated: !!user,
      isSuperAdmin: user?.role === 'superadmin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
