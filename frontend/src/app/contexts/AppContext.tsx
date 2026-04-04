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

  // Effect 1: Connection management
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      socket.connect();
      socket.emit('join-room', user._id);
      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated, user?._id, socket]);

  // Effect 2: Global listeners
  useEffect(() => {
    if (isAuthenticated && socket) {
      const handleNewMessage = async (messageData: any) => {
        // For users: notify when admin sends a message
        if (messageData && messageData.sender === 'admin' && user?.role !== 'superadmin') {
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
      };

      const handleAdminNewMessage = async (messageData: any) => {
        // For admins: notify when ANY user sends a message
        if (user?.role === 'superadmin') {
           const sound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
           sound.play().catch(() => {});

           toast.info(`Support: ${messageData.userName || 'User'}`, {
              description: messageData.text?.substring(0, 50) + (messageData.text?.length > 50 ? '...' : ''),
              duration: 7000, 
              position: 'top-right'
           });
           
           try {
              const { data } = await authAPI.getMe();
              updateUser(data.user);
           } catch {}
        }
      };

      const handleMessagesRead = async () => {
        try {
          const { data } = await authAPI.getMe();
          updateUser(data.user);
        } catch (err) {}
      };

      socket.on('new-message', handleNewMessage);
      socket.on('admin-new-message', handleAdminNewMessage);
      socket.on('messages-read', handleMessagesRead);

      return () => {
        socket.off('new-message', handleNewMessage);
        socket.off('admin-new-message', handleAdminNewMessage);
        socket.off('messages-read', handleMessagesRead);
      };
    }
  }, [isAuthenticated, socket, updateUser, language, user?.role]);

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
