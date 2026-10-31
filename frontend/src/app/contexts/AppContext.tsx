import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { Language } from '../utils/translations';
import { bloodSugarAPI, authAPI } from '../utils/api';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
export interface BloodSugarRecord {
  _id?: string;
  id?: string;
  date: string;
  fastingLevel: number;
  postMealLevel?: number;
  level?: number;
  category?: 'fasting' | 'post-meal' | string;
  notes?: string;
  mood?: string;
  exercise?: boolean;
  medication?: boolean;
  systolicPressure?: number;
  diastolicPressure?: number;
  pulse?: number;
  insulinUnits?: number;
  carbsUnits?: number;
  createdAt?: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  records: BloodSugarRecord[];
  loadRecords: () => Promise<void>;
  addRecord: (record: Omit<BloodSugarRecord, '_id' | 'id'>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  currentFasting?: number;
  currentPostMeal?: number;
  setCurrentFasting: (v?: number) => void;
  setCurrentPostMeal: (v?: number) => void;
  socket: any;
  notifications: any[];
  unreadNotificationsCount: number;
  loadNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const isLocalHost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.')
);

const SOCKET_URL = isLocalHost
  ? 'http://localhost:5000'
  : ((import.meta as any).env?.VITE_API_URL || 'https://smart-monitor-4fv9.onrender.com');

export function AppProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, updateUser } = useAuth();
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return ['uz', 'ru', 'en'].includes(saved) ? saved : 'uz';
  });
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };
  const [records, setRecords] = useState<BloodSugarRecord[]>([]);
  const [currentFasting, setCurrentFasting] = useState<number | undefined>();
  const [currentPostMeal, setCurrentPostMeal] = useState<number | undefined>();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { notificationAPI } = await import('../utils/api');
      const { data } = await notificationAPI.getAll();
      setNotifications(data.notifications || []);
      setUnreadNotificationsCount(data.unreadCount || 0);
    } catch {}
  }, [isAuthenticated]);

  const markNotificationRead = async (id: string) => {
    try {
      const { notificationAPI } = await import('../utils/api');
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllNotificationsRead = async () => {
    try {
      const { notificationAPI } = await import('../utils/api');
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotificationsCount(0);
    } catch {}
  };

  // Socket initialization
  const socket = useMemo(() => io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true
  }), []);

  // Effect 1: Connection management
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      const onConnect = () => {
        socket.emit('join-room', user._id);
        console.log('Joined room:', user._id);
      };

      socket.on('connect', onConnect);
      socket.connect();
      
      // Initial join
      if (socket.connected) onConnect();

      return () => {
        socket.off('connect', onConnect);
        socket.disconnect();
      };
    }
  }, [isAuthenticated, user?._id, socket]);

  useEffect(() => {
    if (isAuthenticated && socket) {
      const handleDoctorAlert = (data: {
        _id?: string;
        type: string;
        patientId: string;
        patientName: string;
        sugarLevel: number;
        category?: string;
        message: string;
        timestamp: string;
      }) => {
        try {
          const sound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          sound.play().catch(() => {});
        } catch (_) {}

        // Add to notifications list immediately
        setNotifications(prev => [{
          _id: data._id || Date.now().toString(),
          title: `🚨 Shoshilinch: ${data.patientName}`,
          message: data.message,
          sugarLevel: data.sugarLevel,
          category: data.category,
          type: data.type,
          isRead: false,
          createdAt: data.timestamp || new Date().toISOString(),
          sender: { firstName: data.patientName },
        }, ...prev]);

        setUnreadNotificationsCount(prev => prev + 1);

        toast.error(`🚨 SHIFOKOR OGOHLANTIRISHI: ${data.patientName}`, {
          description: `Qand darajasi: ${data.sugarLevel} mmol/l (${data.type === 'CRITICAL_HIGH' ? 'O\'ta yuqori' : 'Xavfli darajada past'}).`,
          duration: 15000,
        });
      };

      socket.on('doctor-alert', handleDoctorAlert);

      return () => {
        socket.off('doctor-alert', handleDoctorAlert);
      };
    }
  }, [isAuthenticated, socket]);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'doctor' || user?.role === 'superadmin' || user?.role === 'admin')) {
      loadNotifications();
    }
  }, [isAuthenticated, user?.role, loadNotifications]);

  useEffect(() => { localStorage.setItem('language', language); }, [language]);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const loadRecords = useCallback(async () => {
    try {
      const { data } = await bloodSugarAPI.getRecords();
      setRecords(data.records || []);
      if (data.records?.length > 0) {
        setCurrentFasting(data.records[0].fastingLevel);
        setCurrentPostMeal(data.records[0].postMealLevel);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadRecords();
  }, [isAuthenticated, loadRecords]);

  const addRecord = async (record: Omit<BloodSugarRecord, '_id' | 'id'>) => {
    const { data } = await bloodSugarAPI.addRecord(record);
    setRecords(prev => [data.record, ...prev]);
    setCurrentFasting(record.fastingLevel);
    setCurrentPostMeal(record.postMealLevel);
  };

  const deleteRecord = async (id: string) => {
    await bloodSugarAPI.deleteRecord(id);
    setRecords(prev => prev.filter(r => (r._id || r.id) !== id));
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, 
      isDarkMode, toggleDarkMode,
      records, loadRecords, addRecord, deleteRecord, 
      currentFasting, currentPostMeal, setCurrentFasting, setCurrentPostMeal,
      socket,
      notifications,
      unreadNotificationsCount,
      loadNotifications,
      markNotificationRead,
      markAllNotificationsRead,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
