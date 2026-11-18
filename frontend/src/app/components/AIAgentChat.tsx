import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, IconButton, Typography, TextField, Avatar,
  CircularProgress, Chip, alpha, useTheme, Paper, Fade, Tooltip
} from '@mui/material';
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
    '🥗 Bugun nima yeyiş kerak?',
    '👤 Profilim haqida ma\'lumot',
    '💊 Diabet bõyiça maslahat',
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
  alert_doctor: '🚨 Şifokor ogohlantiriş',
};

// Simple markdown-like renderer
const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const renderMarkdown = (text: string) => {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^• /gm, '&nbsp;&nbsp;• ')
    .replace(/\n/g, '<br/>');
};

export default function AIAgentChat({ bottomOffset = 0 }: { bottomOffset?: number }) {
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
          bottom: { xs: `calc(${16 + bottomOffset}px + var(--sab))`, sm: `calc(${24 + bottomOffset}px + var(--sab))` },
          right: { xs: 16, sm: 24 },
          zIndex: 1300,
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
            aria-label="AI"
            sx={{
              width: 56,
              height: 56,
              borderRadius: '18px',
              bgcolor: open ? 'background.paper' : accentColor,
              color: open ? 'text.primary' : theme.palette.primary.contrastText,
              border: open ? `1px solid ${theme.palette.divider}` : 'none',
              boxShadow: open
                ? '0 4px 16px rgba(0,0,0,0.12)'
                : `0 8px 24px ${alpha(accentColor, 0.4)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: open ? 'background.paper' : theme.palette.primary.dark,
                boxShadow: `0 10px 28px ${alpha(accentColor, 0.45)}`,
              },
            }}
          >
            <Box sx={{
              transition: 'all 0.3s',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              display: 'flex',
            }}>
              {open ? <CloseIcon /> : <AutoAwesomeIcon />}
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
            bottom: { xs: `calc(${84 + bottomOffset}px + var(--sab))`, sm: `calc(${92 + bottomOffset}px + var(--sab))` },
            right: { xs: 16, sm: 24 },
            width: { xs: 'calc(100vw - 32px)', sm: 400 },
            maxWidth: 400,
            height: { xs: `calc(100dvh - ${110 + bottomOffset}px - var(--sat) - var(--sab))`, sm: 580 },
            maxHeight: 600,
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1299,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.6)' : '0 24px 60px rgba(15,30,46,0.18), 0 4px 12px rgba(15,30,46,0.08)',
          }}
        >
          {/* Header */}
          <Box sx={{
            px: 2,
            py: 1.5,
            bgcolor: 'background.paper',
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}>
            <Box sx={{
              width: 38, height: 38,
              borderRadius: 2.5,
              background: `linear-gradient(140deg, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
              color: theme.palette.primary.contrastText,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AutoAwesomeIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {lang === 'uz' ? 'Diabet AI Agent' : lang === 'ru' ? 'Диабет AI Агент' : 'Diabetes AI Agent'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'success.main', flexShrink: 0 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: 11 }}>
                  {lang === 'uz' ? 'Faol • Gemini 2.5 + Groq' : lang === 'ru' ? 'Активен • Gemini 2.5 + Groq' : 'Active • Gemini 2.5 + Groq'}
                </Typography>
              </Box>
            </Box>
            <Tooltip title={lang === 'uz' ? 'Tozalaş' : lang === 'ru' ? 'Очистить' : 'Clear'}>
              <IconButton size="small" onClick={clearChat} sx={{ color: 'text.secondary' }}>
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
            bgcolor: 'background.default',
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
                    width: 28, height: 28, flexShrink: 0,
                    bgcolor: alpha(accentColor, 0.14),
                    color: accentColor,
                    '& .MuiSvgIcon-root': { fontSize: 16 }
                  }}>
                    <AutoAwesomeIcon />
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
                            height: 20,
                            fontSize: 10.5,
                            fontWeight: 600,
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
                      border: `1px solid ${theme.palette.divider}`,
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
                        color: msg.role === 'user' ? theme.palette.primary.contrastText : 'text.primary',
                        borderRadius: msg.role === 'user'
                          ? '16px 16px 4px 16px'
                          : '16px 16px 16px 4px',
                        boxShadow: 'none',
                        border: msg.role === 'user'
                          ? 'none'
                          : `1px solid ${theme.palette.divider}`,
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
                          fontSize: '0.875rem',
                          wordBreak: 'break-word',
                          '& strong': { fontWeight: 700 },
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
                      fontSize: 10.5,
                      color: 'text.disabled',
                      fontWeight: 500,
                      mt: 0.4,
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
              bgcolor: 'background.default',
            }}>
              {quickPrompts.map(prompt => (
                <Chip
                  key={prompt}
                  label={prompt}
                  size="small"
                  onClick={() => sendMessage(prompt)}
                  sx={{
                    height: 30,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    border: `1px solid ${theme.palette.divider}`,
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
                  borderRadius: 3,
                  fontSize: '0.875rem',
                }
              }}
            />
            <IconButton
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              sx={{
                width: 40, height: 40, flexShrink: 0,
                bgcolor: accentColor,
                color: theme.palette.primary.contrastText,
                borderRadius: 3,
                '&:hover': { bgcolor: theme.palette.primary.dark },
                '&.Mui-disabled': { bgcolor: alpha(accentColor, 0.25), color: theme.palette.primary.contrastText },
                transition: 'all 0.2s',
              }}
            >
              {loading
                ? <CircularProgress size={18} color="inherit" />
                : <SendIcon sx={{ fontSize: 18 }} />
              }
            </IconButton>
          </Box>

          {/* Powered by */}
          <Box sx={{
            px: 2, py: 0.75,
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}>
            <AutoAwesomeIcon sx={{ fontSize: 10, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled" fontWeight={500} sx={{ fontSize: 10 }}>
              Gemini 2.5 Flash + Groq Llama 3.3
            </Typography>
          </Box>
        </Paper>
      </Fade>
    </>
  );
}
