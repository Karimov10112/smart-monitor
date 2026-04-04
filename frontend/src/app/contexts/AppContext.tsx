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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SOCKET_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

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

  // Socket initialization
  const socket = useMemo(() => io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true
  }), []);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      socket.connect();
      socket.emit('join-room', user._id);

      socket.on('new-message', async (messageData) => {
        if (messageData && messageData.sender === 'admin') {
           // Play notification sound
           const sound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
           sound.play().catch(() => {});

           toast.info(language === 'uz' ? 'Support: Yangi xabar keldi' : 'Support: Новое сообщение', {
              duration: 5000, 
              position: 'top-right'
           });
        }
        
        try {
          const { data } = await authAPI.getMe();
          updateUser(data.user);
        } catch (err) {
          console.error('Socket refresh error:', err);
        }
      });

      socket.on('messages-read', async () => {
        try {
          const { data } = await authAPI.getMe();
          updateUser(data.user);
        } catch (err) {}
      });

      return () => {
        socket.off('new-message');
        socket.off('messages-read');
        socket.disconnect();
      };
    }
  }, [isAuthenticated, user?._id, socket, updateUser, language]);
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
      socket
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
