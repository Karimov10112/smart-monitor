import React, { useState } from 'react';
import {
  IconButton, Badge, Menu, MenuItem, Typography, Box,
  Stack, Divider, Button, Chip, alpha, useTheme
} from '@mui/material';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';

export default function NotificationBell() {
  const theme = useTheme();
  const { notifications, unreadNotificationsCount, markNotificationRead, markAllNotificationsRead } = useApp();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (notif: any) => {
    if (!notif.isRead && notif._id) {
      markNotificationRead(notif._id);
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-label="Notifications"
        sx={{
          width: 40,
          height: 40,
          border: 1,
          borderColor: unreadNotificationsCount > 0 ? alpha(theme.palette.error.main, 0.4) : 'divider',
          bgcolor: 'background.paper',
          position: 'relative',
        }}
      >
        <Badge
          badgeContent={unreadNotificationsCount}
          color="error"
          overlap="circular"
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontWeight: 700,
              fontSize: '0.6875rem',
              height: 18,
              minWidth: 18,
            },
          }}
        >
          <NotificationsNoneRoundedIcon sx={{ fontSize: 20, color: unreadNotificationsCount > 0 ? 'error.main' : 'text.primary' }} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            width: 360,
            maxWidth: '90vw',
            maxHeight: 480,
            p: 0,
            mt: 1,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700}>
              Bildirishnomalar
            </Typography>
            {unreadNotificationsCount > 0 && (
              <Chip
                label={`${unreadNotificationsCount} yangi`}
                color="error"
                size="small"
                sx={{ height: 20, fontSize: 11 }}
              />
            )}
          </Stack>
          {unreadNotificationsCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon sx={{ fontSize: 14 }} />}
              onClick={markAllNotificationsRead}
              sx={{ fontSize: 12, minHeight: 28, px: 1 }}
            >
              Hammasini o'qildi qilish
            </Button>
          )}
        </Box>
        <Divider />

        {/* Notifications List */}
        <Box sx={{ overflowY: 'auto', maxHeight: 360 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 36, color: 'success.main', mb: 1 }} />
              <Typography variant="body2" fontWeight={500}>
                Yangi bildirishnomalar yo'q
              </Typography>
            </Box>
          ) : (
            notifications.map((notif: any) => {
              const isUnread = !notif.isRead;
              return (
                <MenuItem
                  key={notif._id}
                  onClick={() => handleItemClick(notif)}
                  sx={{
                    p: 1.5,
                    px: 1.5,
                    my: 0.25,
                    bgcolor: isUnread ? alpha(theme.palette.error.main, 0.06) : 'transparent',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    whiteSpace: 'normal',
                    '&:hover': {
                      bgcolor: isUnread ? alpha(theme.palette.error.main, 0.12) : alpha(theme.palette.action.hover, 0.05),
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: alpha(theme.palette.error.main, 0.12),
                      borderRadius: 2.5,
                      color: 'error.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.5,
                    }}
                  >
                    <WarningAmberIcon fontSize="small" />
                  </Box>

                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={isUnread ? 700 : 600} color={isUnread ? 'error.main' : 'text.primary'}>
                        {notif.title || '🚨 Shoshilinch ogohlantirish'}
                      </Typography>
                      {isUnread && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main', flexShrink: 0 }} />
                      )}
                    </Stack>

                    <Typography variant="body2" sx={{ fontSize: 13, mt: 0.25, color: 'text.secondary' }}>
                      {notif.message}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      {notif.sugarLevel && (
                        <Chip
                          label={`${notif.sugarLevel} mmol/l`}
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ height: 20, fontSize: 11 }}
                        />
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                        {notif.createdAt ? format(new Date(notif.createdAt), 'dd.MM.yyyy HH:mm') : ''}
                      </Typography>
                    </Stack>
                  </Box>
                </MenuItem>
              );
            })
          )}
        </Box>
      </Menu>
    </>
  );
}
