import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { toast } from 'sonner';

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
  const { socket } = useApp();
  const { user } = useAuth();
  const theme = useTheme();

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
      toast.error('Xabarlarni yuklashda xato');
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
      toast.error('Xabar yuborishda xato');
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

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Bugun';
    if (diffDays === 1) return 'Kecha';
    return d.toLocaleDateString('uz', { day: 'numeric', month: 'short' });
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
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', py: 10, gap: 2, opacity: 0.5
      }}>
        <ChatBubbleOutlineIcon sx={{ fontSize: 60 }} />
        <Typography variant="h6" fontWeight={800}>Chat mavjud emas</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Siz hali hech qanday suhbat boshlashingiz mumkin emas.<br />
          Shifokor sizga biriktirilishi kerak.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      height: { xs: 'calc(100vh - 120px)', lg: 'calc(100vh - 160px)' },
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      overflow: 'hidden',
      bgcolor: 'background.paper',
    }}>
      {/* Sol panel: Suhbatlar ro'yxati */}
      <Box sx={{
        width: selectedUser ? { xs: 0, sm: 280 } : { xs: '100%', sm: 280 },
        minWidth: selectedUser ? { xs: 0, sm: 280 } : undefined,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.2s',
      }}>
        {/* Header */}
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle1" fontWeight={900} letterSpacing={-0.5}>
            💬 Xabarlar
          </Typography>
        </Box>

        {/* List */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
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
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  bgcolor: selectedUser?._id === chatUser._id
                    ? alpha(theme.palette.primary.main, 0.08)
                    : 'transparent',
                  borderLeft: selectedUser?._id === chatUser._id
                    ? `3px solid ${theme.palette.primary.main}`
                    : '3px solid transparent',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                  transition: 'all 0.15s',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Badge
                    badgeContent={chatUser.unreadCount || 0}
                    color="primary"
                    max={99}
                  >
                    <Avatar sx={{
                      width: 44, height: 44,
                      bgcolor: theme.palette.primary.main,
                      fontWeight: 900, fontSize: 16,
                    }}>
                      {chatUser.firstName?.[0]}
                    </Avatar>
                  </Badge>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight={800} noWrap>
                        {chatUser.firstName} {chatUser.lastName}
                      </Typography>
                      {chatUser.lastMessage && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                          {formatTime(chatUser.lastMessage.createdAt)}
                        </Typography>
                      )}
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Chip
                        label={chatUser.role === 'doctor' ? '👨‍⚕️ Shifokor' : '🏥 Bemor'}
                        size="small"
                        sx={{ height: 16, fontSize: 9, fontWeight: 700, '& .MuiChip-label': { px: 0.5 } }}
                      />
                      {chatUser.lastMessage && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 11 }}>
                          {chatUser.lastMessage.text}
                        </Typography>
                      )}
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
            px: 2.5, py: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex', alignItems: 'center', gap: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.01)
          }}>
            <IconButton
              size="small"
              onClick={() => setSelectedUser(null)}
              sx={{ display: { sm: 'none' } }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40, fontWeight: 900 }}>
              {selectedUser.firstName?.[0]}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" fontWeight={900}>
                {selectedUser.firstName} {selectedUser.lastName}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {otherTyping ? (
                  <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ fontStyle: 'italic' }}>
                    Yozmoqda...
                  </Typography>
                ) : (
                  <>
                    <FiberManualRecordIcon sx={{ fontSize: 8, color: '#10b981' }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {selectedUser.role === 'doctor' ? 'Shifokor' : 'Bemor'}
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
            bgcolor: theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.default, 0.5)
              : alpha(theme.palette.primary.main, 0.01),
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
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, opacity: 0.4 }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body2" fontWeight={700}>Hali xabar yo'q</Typography>
                <Typography variant="caption" color="text.secondary">Birinchi xabarni yuboring!</Typography>
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
                            sx={{ fontSize: 10, fontWeight: 700, height: 20 }}
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
                          color: isMe ? 'white' : 'text.primary',
                          borderRadius: isMe
                            ? '16px 16px 4px 16px'
                            : '16px 16px 16px 4px',
                          px: 2, py: 1,
                          boxShadow: isMe
                            ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                            : '0 1px 4px rgba(0,0,0,0.08)',
                          border: isMe ? 'none' : `1px solid ${theme.palette.divider}`,
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-word' }}>
                            {msg.text}
                          </Typography>
                          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
                            <Typography variant="caption" sx={{
                              fontSize: 9, opacity: 0.7, fontWeight: 700
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
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}>
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <TextField
                inputRef={inputRef}
                value={text}
                onChange={handleTyping}
                onKeyDown={handleKeyPress}
                placeholder="Xabar yozing... (Enter — yuborish)"
                multiline
                maxRows={4}
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    fontSize: '0.9rem',
                  }
                }}
              />
              <IconButton
                onClick={sendMessage}
                disabled={!text.trim() || sending}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  width: 42, height: 42,
                  '&:hover': { bgcolor: theme.palette.primary.dark },
                  '&:disabled': { bgcolor: alpha(theme.palette.primary.main, 0.3) },
                  flexShrink: 0,
                }}
              >
                {sending
                  ? <CircularProgress size={18} sx={{ color: 'white' }} />
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
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          opacity: 0.4, gap: 2
        }}>
          <ChatBubbleOutlineIcon sx={{ fontSize: 64 }} />
          <Typography variant="h6" fontWeight={800}>Suhbat tanlang</Typography>
          <Typography variant="body2" color="text.secondary">
            Chap tomondagi ro'yxatdan suhbatni tanlang
          </Typography>
        </Box>
      )}
    </Box>
  );
}
