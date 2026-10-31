import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, IconButton, Typography, TextField, Avatar,
  CircularProgress, Chip, alpha, useTheme, Paper, Fade, Tooltip
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { toast } from 'sonner';

interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
  toolsUsed?: string[];
  timestamp: Date;
  isLoading?: boolean;
}

const QUICK_PROMPTS: Record<string, string[]> = {
  uz: [
    '📊 Qand darajamni tahlil qil',
    '🥗 Bugun nima yeyish kerak?',
    '👤 Profilim haqida ma\'lumot',
    '💊 Diabet bo\'yicha maslahat',
  ],
  ru: [
    '📊 Анализ моего сахара',
    '🥗 Что есть сегодня?',
    '👤 Моя информация',
    '💊 Совет по диабету',
  ],
  en: [
    '📊 Analyze my sugar levels',
    '🥗 What should I eat today?',
    '👤 My profile info',
    '💊 Diabetes advice',
  ],
};

const TOOL_LABELS: Record<string, string> = {
  get_blood_sugar: '🩸 Qand ma\'lumoti',
  get_user_profile: '👤 Profil',
  get_nutrition_advice: '🥗 Taom tavsiyasi',
  alert_doctor: '🚨 Shifokor ogohlantirish',
};

// Simple markdown-like renderer
const renderMarkdown = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^• /gm, '&nbsp;&nbsp;• ')
    .replace(/\n/g, '<br/>');
};

export default function AIAgentChat() {
  const theme = useTheme();
  const { language } = useApp();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const lang = (['uz', 'ru', 'en'].includes(language) ? language : 'uz') as 'uz' | 'ru' | 'en';
  const quickPrompts = QUICK_PROMPTS[lang];

  const greetingMsg: Record<string, string> = {
    uz: `Salom! 👋 Men sizning **Diabet AI Agentingizman**.\n\nQon shakari tahlili, ovqatlanish maslahati yoki diabet bo'yicha savollar bo'yicha yordam bera olaman. Nima haqida gaplashamiz?`,
    ru: `Привет! 👋 Я ваш **Диабет AI Агент**.\n\nМогу помочь с анализом сахара крови, советами по питанию и вопросами о диабете. О чём поговорим?`,
    en: `Hello! 👋 I'm your **Diabetes AI Agent**.\n\nI can help with blood sugar analysis, nutrition advice, and diabetes questions. What would you like to discuss?`,
  };

  // Pulse animation every 10 seconds when closed
  useEffect(() => {
    if (open || messages.length > 0) return;
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1500);
    }, 10000);
    return () => clearInterval(interval);
  }, [open, messages.length]);

  const chatRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLDivElement>(null);

  // Close chat when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        chatRef.current &&
        !chatRef.current.contains(target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: greetingMsg[lang],
        timestamp: new Date(),
      }]);
    }
  }, [open, lang]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || loading) return;

    setInput('');
    setLoading(true);

    const userMsg: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: msgText,
      timestamp: new Date(),
    };

    const loadingMsg: AgentMessage = {
      id: 'loading-' + Date.now(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);

    try {
      // Build conversation history for API
      const history = messages
        .filter(m => !m.isLoading && m.id !== 'welcome')
        .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

      const { data } = await api.post('/ai/agent', {
        message: msgText,
        language: lang,
        conversationHistory: history.slice(-20),
      });

      const assistantMsg: AgentMessage = {
        id: 'resp-' + Date.now(),
        role: 'assistant',
        content: data.message || 'Javob olinmadi.',
        provider: data.provider,
        toolsUsed: data.toolsUsed || [],
        timestamp: new Date(),
      };

      setMessages(prev => prev.filter(m => !m.isLoading).concat(assistantMsg));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Xato yuz berdi. Qayta urinib ko\'ring.';
      setMessages(prev => prev.filter(m => !m.isLoading).concat({
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: '❌ ' + errMsg,
        timestamp: new Date(),
      }));
      toast.error(errMsg);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome-new',
      role: 'assistant',
      content: greetingMsg[lang],
      timestamp: new Date(),
    }]);
  };

  const copyMsg = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(lang === 'uz' ? 'Nusxa olindi!' : lang === 'ru' ? 'Скопировано!' : 'Copied!');
  };

  if (!user) return null;

  const accentColor = theme.palette.primary.main;
  const isDark = theme.palette.mode === 'dark';

  return (
    <>
      {/* Floating Button */}
      <Box
        ref={toggleBtnRef}
        sx={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 1500,
        }}
      >
        {/* Unread / attention pulse ring */}
        {pulse && !open && (
          <Box sx={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            border: `2px solid ${accentColor}`,
            animation: 'agentPulse 1.5s ease-out',
            '@keyframes agentPulse': {
              '0%': { opacity: 0.8, transform: 'scale(1)' },
              '100%': { opacity: 0, transform: 'scale(2)' },
            },
            pointerEvents: 'none',
          }} />
        )}

        <Tooltip title={
          open ? '' :
            lang === 'uz' ? 'Diabet AI Agent' :
            lang === 'ru' ? 'Диабет AI Агент' : 'Diabetes AI Agent'
        } placement="left">
          <IconButton
            onClick={() => setOpen(o => !o)}
            sx={{
              width: 58,
              height: 58,
              bgcolor: open ? alpha(accentColor, 0.15) : accentColor,
              color: open ? accentColor : 'white',
              border: open ? `2px solid ${accentColor}` : 'none',
              boxShadow: open
                ? `0 0 0 4px ${alpha(accentColor, 0.15)}`
                : `0 4px 20px ${alpha(accentColor, 0.5)}`,
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              '&:hover': {
                transform: 'scale(1.1)',
                bgcolor: open ? alpha(accentColor, 0.2) : theme.palette.primary.dark,
              },
            }}
          >
            <Box sx={{
              transition: 'all 0.3s',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              display: 'flex',
            }}>
              {open ? <CloseIcon /> : <SmartToyIcon />}
            </Box>
          </IconButton>
        </Tooltip>
      </Box>

      {/* Chat Panel */}
      <Fade in={open} timeout={250}>
        <Paper
          ref={chatRef}
          elevation={24}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 28,
            width: { xs: 'calc(100vw - 32px)', sm: 400 },
            maxWidth: 400,
            height: { xs: 'calc(100vh - 120px)', sm: 580 },
            maxHeight: 580,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1499,
            border: `1px solid ${alpha(accentColor, 0.2)}`,
            boxShadow: `0 20px 60px ${alpha(accentColor, 0.25)}, 0 8px 24px rgba(0,0,0,0.2)`,
          }}
        >
          {/* Header */}
          <Box sx={{
            px: 2.5,
            py: 2,
            background: `linear-gradient(135deg, ${accentColor} 0%, ${theme.palette.primary.dark} 100%)`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}>
            <Box sx={{
              width: 40, height: 40,
              borderRadius: '50%',
              bgcolor: alpha('#fff', 0.2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid ' + alpha('#fff', 0.3),
            }}>
              <SmartToyIcon sx={{ color: 'white', fontSize: 22 }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" fontWeight={900} color="white" sx={{ lineHeight: 1.2 }}>
                {lang === 'uz' ? 'Diabet AI Agent' : lang === 'ru' ? 'Диабет AI Агент' : 'Diabetes AI Agent'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#4ade80', flexShrink: 0 }} />
                <Typography variant="caption" color={alpha('#fff', 0.85)} fontWeight={600} sx={{ fontSize: 10 }}>
                  {lang === 'uz' ? 'Faol • Gemini 2.5 + Groq' : lang === 'ru' ? 'Активен • Gemini 2.5 + Groq' : 'Active • Gemini 2.5 + Groq'}
                </Typography>
              </Box>
            </Box>
            <Tooltip title={lang === 'uz' ? 'Tozalash' : lang === 'ru' ? 'Очистить' : 'Clear'}>
              <IconButton size="small" onClick={clearChat} sx={{ color: alpha('#fff', 0.8), '&:hover': { color: 'white', bgcolor: alpha('#fff', 0.15) } }}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Messages */}
          <Box sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            bgcolor: isDark ? alpha(theme.palette.background.default, 0.7) : alpha(accentColor, 0.02),
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: alpha(accentColor, 0.3), borderRadius: 2 },
          }}>
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: 1,
                }}
              >
                {/* Avatar */}
                {msg.role === 'assistant' && (
                  <Avatar sx={{
                    width: 30, height: 30, flexShrink: 0,
                    bgcolor: accentColor,
                    '& .MuiSvgIcon-root': { fontSize: 16 }
                  }}>
                    <SmartToyIcon />
                  </Avatar>
                )}

                <Box sx={{ maxWidth: '82%' }}>
                  {/* Tool badges */}
                  {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                      {msg.toolsUsed.map(tool => (
                        <Chip
                          key={tool}
                          label={TOOL_LABELS[tool] || tool}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: 9,
                            fontWeight: 700,
                            bgcolor: alpha(accentColor, 0.1),
                            color: accentColor,
                            '& .MuiChip-label': { px: 0.8 },
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Bubble */}
                  {msg.isLoading ? (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 2, py: 1.5,
                      bgcolor: theme.palette.background.paper,
                      borderRadius: '16px 16px 16px 4px',
                      border: `1px solid ${alpha(accentColor, 0.15)}`,
                    }}>
                      {[0, 1, 2].map(i => (
                        <Box key={i} sx={{
                          width: 7, height: 7, borderRadius: '50%',
                          bgcolor: accentColor,
                          animation: 'dotBounce 1.2s infinite',
                          animationDelay: `${i * 0.2}s`,
                          '@keyframes dotBounce': {
                            '0%, 100%': { transform: 'translateY(0)', opacity: 0.5 },
                            '50%': { transform: 'translateY(-5px)', opacity: 1 },
                          },
                        }} />
                      ))}
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: 10, ml: 0.5 }}>
                        {lang === 'uz' ? 'O\'ylayapman...' : lang === 'ru' ? 'Думаю...' : 'Thinking...'}
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        px: 2, py: 1.25,
                        bgcolor: msg.role === 'user'
                          ? accentColor
                          : theme.palette.background.paper,
                        color: msg.role === 'user' ? 'white' : 'text.primary',
                        borderRadius: msg.role === 'user'
                          ? '16px 16px 4px 16px'
                          : '16px 16px 16px 4px',
                        boxShadow: msg.role === 'user'
                          ? `0 3px 10px ${alpha(accentColor, 0.35)}`
                          : `0 2px 8px rgba(0,0,0,0.08)`,
                        border: msg.role === 'user'
                          ? 'none'
                          : `1px solid ${alpha(accentColor, 0.12)}`,
                        position: 'relative',
                        cursor: 'default',
                        '&:hover .copy-btn': { opacity: 1 },
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{
                          fontWeight: 500,
                          lineHeight: 1.6,
                          fontSize: '0.82rem',
                          wordBreak: 'break-word',
                          '& strong': { fontWeight: 800 },
                        }}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                      {/* Copy button */}
                      {msg.role === 'assistant' && (
                        <IconButton
                          className="copy-btn"
                          size="small"
                          onClick={() => copyMsg(msg.content)}
                          sx={{
                            position: 'absolute',
                            top: 4, right: 4,
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            width: 22, height: 22,
                            color: 'text.secondary',
                          }}
                        >
                          <ContentCopyIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      )}
                    </Box>
                  )}

                  {/* Time + provider */}
                  {!msg.isLoading && (
                    <Typography variant="caption" sx={{
                      display: 'block',
                      fontSize: 9,
                      color: 'text.disabled',
                      fontWeight: 600,
                      mt: 0.25,
                      textAlign: msg.role === 'user' ? 'right' : 'left',
                      px: 0.5,
                    }}>
                      {new Date(msg.timestamp).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}
                      {msg.provider && ` · ${msg.provider}`}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Quick prompts */}
          {messages.length <= 1 && !loading && (
            <Box sx={{
              px: 2, pt: 1, pb: 0.5,
              display: 'flex', flexWrap: 'wrap', gap: 0.75,
              borderTop: `1px solid ${alpha(accentColor, 0.1)}`,
              bgcolor: isDark ? alpha(accentColor, 0.03) : alpha(accentColor, 0.02),
            }}>
              {quickPrompts.map(prompt => (
                <Chip
                  key={prompt}
                  label={prompt}
                  size="small"
                  onClick={() => sendMessage(prompt)}
                  sx={{
                    height: 26,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    bgcolor: alpha(accentColor, 0.08),
                    color: 'text.secondary',
                    border: `1px solid ${alpha(accentColor, 0.15)}`,
                    '&:hover': {
                      bgcolor: alpha(accentColor, 0.15),
                      color: accentColor,
                    },
                    '& .MuiChip-label': { px: 1 },
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </Box>
          )}

          {/* Input */}
          <Box sx={{
            px: 2, py: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            display: 'flex',
            gap: 1,
            alignItems: 'flex-end',
          }}>
            <TextField
              inputRef={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={
                lang === 'uz' ? 'Savol yozing... (Enter — yuborish)' :
                lang === 'ru' ? 'Задайте вопрос... (Enter — отправить)' :
                'Type a question... (Enter to send)'
              }
              multiline
              maxRows={4}
              fullWidth
              size="small"
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  fontSize: '0.82rem',
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: accentColor,
                    borderWidth: 1.5,
                  }
                }
              }}
            />
            <IconButton
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              sx={{
                width: 40, height: 40, flexShrink: 0,
                bgcolor: accentColor,
                color: 'white',
                borderRadius: 2,
                '&:hover': { bgcolor: theme.palette.primary.dark, transform: 'scale(1.05)' },
                '&:disabled': { bgcolor: alpha(accentColor, 0.25) },
                transition: 'all 0.2s',
              }}
            >
              {loading
                ? <CircularProgress size={18} sx={{ color: 'white' }} />
                : <SendIcon sx={{ fontSize: 18 }} />
              }
            </IconButton>
          </Box>

          {/* Powered by */}
          <Box sx={{
            px: 2, py: 0.75,
            borderTop: `1px solid ${alpha(accentColor, 0.08)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}>
            <AutoAwesomeIcon sx={{ fontSize: 10, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ fontSize: 9, letterSpacing: 0.5 }}>
              GEMINI 2.5 FLASH + GROQ LLAMA 3.3
            </Typography>
          </Box>
        </Paper>
      </Fade>
    </>
  );
}
