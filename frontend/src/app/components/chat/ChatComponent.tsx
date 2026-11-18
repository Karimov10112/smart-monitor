import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { toast } from 'sonner';
import { translations } from '../../utils/translations';

import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Stack,
  Paper,
  Chip,
  alpha,
  useTheme,
  CircularProgress,
  Badge,
  Divider,
  Skeleton
} from '@mui/material';

import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DoneIcon from '@mui/icons-material/Done';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { EmptyState } from '../common';
import { formatShortDate, formatTime as fmtTime } from '../../utils/format';

interface Message {
  _id: string;
  room: string;
  sender: { _id: string; firstName: string; lastName: string; role: string; avatar?: string };
  receiver: { _id: string; firstName: string; lastName: string; role: string; avatar?: string };
  text: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

interface Conversation {
  user: { _id: string; firstName: string; lastName: string; role: string; avatar?: string };
  lastMessage: Message;
  room: string;
  unreadCount: number;
}

interface ChatProps {
  initialUserId?: string; // Ochiq holda ma'lum foydalanuvchi bilan boshlash
}

export function Chat({ initialUserId }: ChatProps = {}) {
  const { socket, language } = useApp();
  const { user } = useAuth();
  const theme = useTheme();
  
  const t = translations[language] || translations['uz'];

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Suhbatlar va mavjud foydalanuvchilarni yuklash
  useEffect(() => {
    const load = async () => {
      try {
        const [convsRes, usersRes] = await Promise.all([
          api.get('/chat/conversations'),
          api.get('/chat/available-users'),
        ]);
        setConversations(convsRes.data.conversations || []);
        setAvailableUsers(usersRes.data.users || []);
      } catch {
        // silent
      } finally {
        setLoadingConvs(false);
      }
    };
    load();
  }, []);

  // initialUserId bilan ochish
  useEffect(() => {
    if (initialUserId && availableUsers.length > 0) {
      const found = availableUsers.find(u => u._id === initialUserId);
      if (found) openChat(found);
    }
  }, [initialUserId, availableUsers]);

  // Socket eventlar
  useEffect(() => {
    if (!socket || !user) return;

    const onNewMessage = ({ message }: { message: Message }) => {
      if (!message) return;

      // Agar aktiv suhbatda bo'lsa
      if (selectedUser && (
        message.sender._id === selectedUser._id ||
        message.receiver._id === selectedUser._id
      )) {
        setMessages(prev => {
          // Duplicate oldini olish
          if (prev.find(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        // O'qilgan deb belgilash
        socket.emit('mark-read', { userId: user._id, fromId: selectedUser._id });
        scrollToBottom();
      } else {
        // Boshqa suhbatdan xabar — toast ko'rsatish
        toast(message.sender.firstName + ' ' + message.sender.lastName, {
          description: message.text,
          icon: '💬',
          duration: 5000,
        });
        // Unread count yangilash
        setConversations(prev =>
          prev.map(c =>
            c.user._id === message.sender._id
              ? { ...c, lastMessage: message, unreadCount: (c.unreadCount || 0) + 1 }
              : c
          )
        );
      }
    };

    const onMessageSent = ({ message }: { message: Message }) => {
      if (!message) return;
      setMessages(prev => {
        if (prev.find(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
      setSending(false);
      scrollToBottom();
    };

    const onTyping = ({ isTyping: typing }: { isTyping: boolean }) => {
      setOtherTyping(typing);
    };

    const onMessagesRead = ({ by }: { by?: string }) => {
      setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
      // Suhbatlar ro'yxatidagi oxirgi xabarni ham o'qilgan deb belgilash
      if (by) {
        setConversations(prev => prev.map(c => 
          c.user._id === by && c.lastMessage 
            ? { ...c, lastMessage: { ...c.lastMessage, isRead: true } } 
            : c
        ));
      }
    };

    socket.on('new-message', onNewMessage);
    socket.on('message-sent', onMessageSent);
    socket.on('user-typing', onTyping);
    socket.on('messages-read', onMessagesRead);

    return () => {
      socket.off('new-message', onNewMessage);
      socket.off('message-sent', onMessageSent);
      socket.off('user-typing', onTyping);
      socket.off('messages-read', onMessagesRead);
    };
  }, [socket, user, selectedUser, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const openChat = async (chatUser: any) => {
    setSelectedUser(chatUser);
    setMessages([]);
    setLoadingMessages(true);
    try {
      const { data } = await api.get(`/chat/messages/${chatUser._id}`);
      setMessages(data.messages || []);
      // Unread tozalash
      setConversations(prev =>
        prev.map(c => c.user._id === chatUser._id ? { ...c, unreadCount: 0 } : c)
      );
      if (socket) {
        socket.emit('mark-read', { userId: user?._id, fromId: chatUser._id });
      }
    } catch {
      toast.error('Xabarlarni yuklaşda xato');
    } finally {
      setLoadingMessages(false);
    }
    setTimeout(scrollToBottom, 100);
    inputRef.current?.focus();
  };

  const sendMessage = async () => {
    if (!text.trim() || !selectedUser || sending) return;

    const msgText = text.trim();
    setText('');
    setSending(true);

    // Typing tozalash
    socket?.emit('typing', { to: selectedUser._id, isTyping: false, userId: user?._id });

    try {
      // Socket orqali yuborish
      if (socket?.connected) {
        socket.emit('send-message', {
          to: selectedUser._id,
          text: msgText,
          senderId: user?._id,
        });
      } else {
        // Fallback: REST API
        const { data } = await api.post('/chat/messages', {
          receiverId: selectedUser._id,
          text: msgText,
        });
        setMessages(prev => [...prev, data.message]);
        setSending(false);
        scrollToBottom();
      }
    } catch {
      toast.error('Xabar yuborişda xato');
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (socket && selectedUser) {
      socket.emit('typing', { to: selectedUser._id, isTyping: true, userId: user?._id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { to: selectedUser._id, isTyping: false, userId: user?._id });
      }, 2000);
    }
  };

  const formatTime = (dateStr: string) => fmtTime(dateStr);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Bugun';
    if (diffDays === 1) return 'Keça';
    return formatShortDate(d, language);
  };

  // Suhbat ro'yxati (conversations + availableUsers birlashtirish)
  const allUsers = React.useMemo(() => {
    const convUsers = conversations.map(c => c.user._id);
    const extra = availableUsers.filter(u => !convUsers.includes(u._id));
    return [
      ...conversations.map(c => ({
        ...c.user,
        lastMessage: c.lastMessage,
        unreadCount: c.unreadCount
      })),
      ...extra.map(u => ({ ...u, lastMessage: null, unreadCount: 0 }))
    ];
  }, [conversations, availableUsers]);

  // Foydalanuvchi yo'q bo'lsa
  if (allUsers.length === 0 && !loadingConvs) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 4 }}>
        <EmptyState
          icon={<ChatBubbleOutlineIcon />}
          title="Çat mavjud emas"
          description={<>Siz hali heç qanday suhbat başlaşingiz mumkin emas.<br />Şifokor sizga biriktirilişi kerak.</>}
        />
      </Paper>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      height: { xs: 'calc(100dvh - 176px)', sm: 'calc(100dvh - 200px)', lg: 'calc(100dvh - 150px)' },
      minHeight: 420,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 4,
      overflow: 'hidden',
      bgcolor: 'background.paper',
      boxShadow: theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.4)' : '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
    }}>
      {/* Sol panel: Suhbatlar ro'yxati */}
      <Box sx={{
        width: selectedUser ? { xs: 0, sm: 300 } : { xs: '100%', sm: 300 },
        minWidth: selectedUser ? { xs: 0, sm: 300 } : undefined,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.2s',
      }}>
        {/* Header */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Xabarlar
          </Typography>
          {!loadingConvs && (
            <Typography variant="caption" color="text.secondary">{allUsers.length}</Typography>
          )}
        </Box>

        {/* List */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
          {loadingConvs ? (
            <Stack spacing={1} sx={{ p: 2 }}>
              {[1, 2, 3].map(i => (
                <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                  <Skeleton variant="circular" width={44} height={44} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="60%" height={16} />
                    <Skeleton variant="text" width="80%" height={14} />
                  </Box>
                </Stack>
              ))}
            </Stack>
          ) : (
            allUsers.map((chatUser) => (
              <Box
                key={chatUser._id}
                onClick={() => openChat(chatUser)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') openChat(chatUser); }}
                sx={{
                  p: 1.25,
                  mb: 0.5,
                  borderRadius: 3,
                  cursor: 'pointer',
                  bgcolor: selectedUser?._id === chatUser._id
                    ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.08)
                    : 'transparent',
                  '&:hover': { bgcolor: selectedUser?._id === chatUser._id ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.text.primary, 0.04) },
                  transition: 'background-color 0.15s',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Badge
                    badgeContent={chatUser.unreadCount || 0}
                    color="primary"
                    max={99}
                  >
                    <Avatar sx={{
                      width: 42, height: 42,
                      bgcolor: alpha(chatUser.role === 'doctor' ? theme.palette.success.main : theme.palette.primary.main, 0.14),
                      color: chatUser.role === 'doctor' ? 'success.main' : 'primary.main',
                      fontWeight: 600, fontSize: 15,
                    }}>
                      {chatUser.firstName?.[0]}
                    </Avatar>
                  </Badge>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight={chatUser.unreadCount ? 700 : 600} noWrap>
                        {chatUser.firstName} {chatUser.lastName}
                      </Typography>
                      {chatUser.lastMessage && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, flexShrink: 0, ml: 1 }}>
                          {formatTime(chatUser.lastMessage.createdAt)}
                        </Typography>
                      )}
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 12 }}>
                        {chatUser.lastMessage ? chatUser.lastMessage.text : (chatUser.role === 'doctor' ? (t.doctorRole || 'Shifokor') : (t.patient || 'Bemor'))}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* O'ng panel: Chat */}
      {selectedUser ? (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Chat header */}
          <Box sx={{
            px: { xs: 1.5, sm: 2.5 }, py: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex', alignItems: 'center', gap: 1.5,
            bgcolor: 'background.paper'
          }}>
            <IconButton
              size="small"
              onClick={() => setSelectedUser(null)}
              sx={{ display: { sm: 'none' } }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.14), color: 'primary.main', width: 40, height: 40, fontWeight: 600 }}>
              {selectedUser.firstName?.[0]}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {selectedUser.firstName} {selectedUser.lastName}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {otherTyping ? (
                  <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ fontStyle: 'italic' }}>
                    Yozmoqda...
                  </Typography>
                ) : (
                  <>
                    <FiberManualRecordIcon sx={{ fontSize: 8, color: 'success.main' }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {selectedUser.role === 'doctor' ? (t.doctorRole || 'Shifokor') : (t.patient || 'Bemor')}
                    </Typography>
                  </>
                )}
              </Stack>
            </Box>
          </Box>

          {/* Xabarlar */}
          <Box sx={{
            flexGrow: 1, overflowY: 'auto', p: 2,
            display: 'flex', flexDirection: 'column', gap: 0.5,
            bgcolor: 'background.default',
          }}>
            {loadingMessages ? (
              <Stack spacing={1} sx={{ py: 2 }}>
                {[1, 2, 3, 4].map(i => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start' }}>
                    <Skeleton variant="rounded" width={180} height={40} sx={{ borderRadius: 2 }} />
                  </Box>
                ))}
              </Stack>
            ) : messages.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                <EmptyState compact icon={<ChatBubbleOutlineIcon />} title="Hali xabar yõq" description="Birinçi xabarni yuboring!" />
              </Box>
            ) : (
              <>
                {messages.map((msg, index) => {
                  const isMe = msg.sender._id === user?._id;
                  const prevMsg = index > 0 ? messages[index - 1] : null;
                  const showDate = !prevMsg ||
                    new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

                  return (
                    <React.Fragment key={msg._id}>
                      {showDate && (
                        <Box sx={{ textAlign: 'center', my: 1.5 }}>
                          <Chip
                            label={formatDate(msg.createdAt)}
                            size="small"
                            sx={{ fontSize: 11, fontWeight: 600, height: 22, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}
                          />
                        </Box>
                      )}
                      <Box sx={{
                        display: 'flex',
                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                        mb: 0.25,
                      }}>
                        <Box sx={{
                          maxWidth: '72%',
                          bgcolor: isMe
                            ? theme.palette.primary.main
                            : theme.palette.background.paper,
                          color: isMe ? theme.palette.primary.contrastText : 'text.primary',
                          borderRadius: isMe
                            ? '16px 16px 4px 16px'
                            : '16px 16px 16px 4px',
                          px: 1.75, py: 1,
                          boxShadow: 'none',
                          border: isMe ? 'none' : `1px solid ${theme.palette.divider}`,
                        }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                            {msg.text}
                          </Typography>
                          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
                            <Typography variant="caption" sx={{
                              fontSize: 10.5, opacity: 0.75, fontWeight: 500
                            }}>
                              {formatTime(msg.createdAt)}
                            </Typography>
                            {isMe && (
                              msg.isRead
                                ? <DoneAllIcon sx={{ fontSize: 12, opacity: 0.9 }} />
                                : <DoneIcon sx={{ fontSize: 12, opacity: 0.6 }} />
                            )}
                          </Stack>
                        </Box>
                      </Box>
                    </React.Fragment>
                  );
                })}

                {/* Typing indicator */}
                {otherTyping && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 0.5 }}>
                    <Box sx={{
                      bgcolor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '16px 16px 16px 4px',
                      px: 2, py: 1,
                      display: 'flex', gap: 0.5, alignItems: 'center'
                    }}>
                      {[0, 1, 2].map(i => (
                        <Box key={i} sx={{
                          width: 6, height: 6, borderRadius: '50%',
                          bgcolor: 'text.disabled',
                          animation: 'bounce 1.2s infinite',
                          animationDelay: `${i * 0.2}s`,
                          '@keyframes bounce': {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-4px)' },
                          }
                        }} />
                      ))}
                    </Box>
                  </Box>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </Box>

          {/* Xabar kiritish */}
          <Box sx={{
            p: { xs: 1.5, sm: 2 },
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}>
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <TextField
                inputRef={inputRef}
                value={text}
                onChange={handleTyping}
                onKeyDown={handleKeyPress}
                placeholder="Xabar yozing... (Enter — yuboriş)"
                multiline
                maxRows={4}
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    fontSize: '0.9375rem',
                  }
                }}
              />
              <IconButton
                onClick={sendMessage}
                disabled={!text.trim() || sending}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  width: 42, height: 42, borderRadius: 3,
                  '&:hover': { bgcolor: theme.palette.primary.dark },
                  '&.Mui-disabled': { bgcolor: alpha(theme.palette.primary.main, 0.25), color: theme.palette.primary.contrastText },
                  flexShrink: 0,
                }}
              >
                {sending
                  ? <CircularProgress size={18} color="inherit" />
                  : <SendIcon fontSize="small" />
                }
              </IconButton>
            </Stack>
          </Box>
        </Box>
      ) : (
        /* Chat tanlanmagan holat */
        <Box sx={{
          flexGrow: 1, display: { xs: 'none', sm: 'flex' },
          alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default',
        }}>
          <EmptyState icon={<ChatBubbleOutlineIcon />} title="Suhbat tanlang" description="Çap tomondagi rõyxatdan suhbatni tanlang" />
        </Box>
      )}
    </Box>
  );
}
