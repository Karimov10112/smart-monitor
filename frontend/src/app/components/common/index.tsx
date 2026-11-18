import React, { useState } from 'react';
import {
  Box,
  Card,
  Stack,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  ListItemIcon,
  alpha,
  useTheme,
  type SxProps,
  type Theme,
} from '@mui/material';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useApp } from '../../contexts/AppContext';
import { classifyGlucose, glucoseLabel } from '../../utils/glucose';
import { translations } from '../../utils/translations';
import { AuthIllustration } from './AuthIllustration';

/* -------------------------------------------------------------------------- */
/* Brand                                                                       */
/* -------------------------------------------------------------------------- */

export function BrandMark({ size = 36, showName = false, name = 'DiabetMed', subtitle }: {
  size?: number;
  showName?: boolean;
  name?: string;
  subtitle?: string;
}) {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: size > 40 ? 3.5 : 2.5,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          color: theme.palette.primary.contrastText,
          background: `linear-gradient(140deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
        }}
      >
        <WaterDropRoundedIcon sx={{ fontSize: size * 0.55 }} />
      </Box>
      {showName && (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', lineHeight: 1.2, letterSpacing: '-0.01em' }} noWrap>
            {name}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
    </Stack>
  );
}

/* -------------------------------------------------------------------------- */
/* Page + section layout                                                       */
/* -------------------------------------------------------------------------- */

export function PageHeader({ title, subtitle, icon, actions, sx }: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      sx={{ mb: 3, ...(sx as object) }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
        {icon && <IconTile color="primary">{icon}</IconTile>}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" component="h1">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      {actions && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}

type Tone = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'ai';

export function IconTile({ children, color = 'primary', size = 40, sx }: {
  children: React.ReactNode;
  color?: Tone | string;
  size?: number;
  sx?: SxProps<Theme>;
}) {
  const theme = useTheme();
  const paletteColor = (theme.palette as any)[color]?.main ?? color;
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 2.5,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        color: paletteColor,
        bgcolor: alpha(paletteColor, theme.palette.mode === 'dark' ? 0.16 : 0.1),
        '& .MuiSvgIcon-root': { fontSize: size * 0.5 },
        ...(sx as object),
      }}
    >
      {children}
    </Box>
  );
}

export function SectionCard({ title, subtitle, icon, iconColor = 'primary', action, children, noPadding, sx, contentSx }: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  iconColor?: Tone | string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  noPadding?: boolean;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
}) {
  return (
    <Card sx={{ overflow: 'hidden', ...(sx as object) }}>
      {(title || action) && (
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: { xs: 2, sm: 2.5 }, pt: { xs: 2, sm: 2.5 }, pb: noPadding ? 2 : 0, ...(noPadding ? { borderBottom: 1, borderColor: 'divider' } : {}) }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            {icon && <IconTile color={iconColor} size={36}>{icon}</IconTile>}
            <Box sx={{ minWidth: 0 }}>
              {title && <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 650 }}>{title}</Typography>}
              {subtitle && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{subtitle}</Typography>}
            </Box>
          </Stack>
          {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
        </Stack>
      )}
      <Box sx={{ p: noPadding ? 0 : { xs: 2, sm: 2.5 }, ...(contentSx as object) }}>{children}</Box>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Data display                                                                */
/* -------------------------------------------------------------------------- */

export function StatTile({ label, value, unit, icon, color = 'primary', hint, valueColor }: {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  icon?: React.ReactNode;
  color?: Tone | string;
  hint?: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between">
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
            <Stack direction="row" spacing={0.75} alignItems="baseline" sx={{ mt: 0.75 }}>
              <Typography sx={{ fontSize: { xs: '1.625rem', sm: '1.875rem' }, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: valueColor, fontVariantNumeric: 'tabular-nums' }}>
                {value}
              </Typography>
              {unit && <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{unit}</Typography>}
            </Stack>
            {hint && <Box sx={{ mt: 1 }}>{hint}</Box>}
          </Box>
          {icon && <IconTile color={color} size={40} sx={{ display: { xs: 'none', sm: 'grid' } }}>{icon}</IconTile>}
        </Stack>
      </Box>
    </Card>
  );
}

export function GlucoseBadge({ value, size = 'small', showLabel = true }: {
  value?: number | null;
  size?: 'small' | 'medium';
  showLabel?: boolean;
}) {
  const theme = useTheme();
  const { language } = useApp();
  const level = classifyGlucose(value);
  if (!level) return <Typography component="span" color="text.disabled">—</Typography>;
  const color = theme.palette.glucose[level];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: size === 'small' ? 1 : 1.25,
        py: size === 'small' ? 0.25 : 0.5,
        borderRadius: 2,
        bgcolor: alpha(color, theme.palette.mode === 'dark' ? 0.16 : 0.1),
        color,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.8125rem' : '0.875rem',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}
    >
      <Box component="span" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      {Number(value).toFixed(1)}
      {showLabel && (
        <Box component="span" sx={{ fontWeight: 500, opacity: 0.85, fontSize: '0.75rem' }}>
          · {glucoseLabel(level, language)}
        </Box>
      )}
    </Box>
  );
}

export function EmptyState({ icon, title, description, action, compact }: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <Stack alignItems="center" textAlign="center" spacing={1.25} sx={{ py: compact ? 4 : 8, px: 2 }}>
      {icon && (
        <IconTile color="primary" size={compact ? 44 : 56} sx={{ borderRadius: '50%', mb: 0.5 }}>
          {icon}
        </IconTile>
      )}
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ pt: 1 }}>{action}</Box>}
    </Stack>
  );
}

/* -------------------------------------------------------------------------- */
/* Preferences: language + theme                                               */
/* -------------------------------------------------------------------------- */

const LANGS = [
  { code: 'uz', label: 'Õzbekça', short: 'UZ' },
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'en', label: 'English', short: 'EN' },
] as const;

export function LanguageMenuButton({ variant = 'icon' }: { variant?: 'icon' | 'text' }) {
  const { language, setLanguage } = useApp();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const current = LANGS.find(l => l.code === language) || LANGS[0];
  return (
    <>
      <Tooltip title={current.label}>
        <IconButton
          onClick={e => setAnchor(e.currentTarget)}
          aria-label="Language"
          sx={{ border: 1, borderColor: 'divider', bgcolor: 'background.paper', gap: 0.5, px: variant === 'text' ? 1.25 : 1, height: 40, minWidth: 40 }}
        >
          <TranslateRoundedIcon sx={{ fontSize: 18 }} />
          {variant === 'text' && <Typography variant="caption" sx={{ fontWeight: 700 }}>{current.short}</Typography>}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 170 } } }}
      >
        {LANGS.map(l => (
          <MenuItem key={l.code} selected={l.code === language} onClick={() => { setLanguage(l.code as any); setAnchor(null); }}>
            <Typography variant="caption" sx={{ fontWeight: 700, width: 26, color: 'text.secondary' }}>{l.short}</Typography>
            <Box sx={{ flexGrow: 1 }}>{l.label}</Box>
            {l.code === language && <ListItemIcon sx={{ minWidth: 0, ml: 1 }}><CheckRoundedIcon fontSize="small" color="primary" /></ListItemIcon>}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function ThemeToggleButton() {
  const { isDarkMode, toggleDarkMode } = useApp();
  return (
    <Tooltip title={isDarkMode ? 'Light' : 'Dark'}>
      <IconButton
        onClick={toggleDarkMode}
        aria-label="Toggle theme"
        sx={{ border: 1, borderColor: 'divider', bgcolor: 'background.paper', width: 40, height: 40 }}
      >
        {isDarkMode ? <LightModeOutlinedIcon sx={{ fontSize: 19 }} /> : <DarkModeOutlinedIcon sx={{ fontSize: 19 }} />}
      </IconButton>
    </Tooltip>
  );
}

/* -------------------------------------------------------------------------- */
/* Auth layout                                                                 */
/* -------------------------------------------------------------------------- */

const AUTH_COPY: Record<string, { headline: string; points: string[] }> = {
  uz: {
    headline: 'Qandli diabetni kundalik nazorat qiliş uçun klinik platforma',
    points: ['Qon şakari, bosim va insulin kundaligi', 'Me\'yor oraliğidagi vaqt va HbA1c tahlili', 'Şifokor bilan real vaqtda aloqa', 'Telegram orqali dori eslatmalari'],
  },
  ru: {
    headline: 'Клиническая платформа для ежедневного контроля диабета',
    points: ['Дневник сахара, давления и инсулина', 'Время в целевом диапазоне и HbA1c', 'Связь с врачом в реальном времени', 'Напоминания о лекарствах в Telegram'],
  },
  en: {
    headline: 'A clinical platform for everyday diabetes care',
    points: ['Glucose, blood pressure and insulin log', 'Time in range and estimated HbA1c', 'Real-time connection with your doctor', 'Medication reminders via Telegram'],
  },
};

export function AuthLayout({ children, title, subtitle, icon, maxWidth = 440 }: {
  children: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  maxWidth?: number;
}) {
  const theme = useTheme();
  const { language } = useApp();
  const copy = AUTH_COPY[language] || AUTH_COPY.uz;
  const appName = (translations[language] || translations.uz).appName;
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', bgcolor: 'background.default' }}>
      {/* Brand panel (desktop) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: { md: '42%', lg: '40%' },
          maxWidth: 560,
          p: { md: 5, lg: 6 },
          position: 'sticky',
          top: 0,
          height: '100dvh',
          gap: 3,
          color: '#fff',
          overflow: 'hidden',
          background: isDark
            ? 'linear-gradient(160deg, #0B3B4A 0%, #0B1220 100%)'
            : 'linear-gradient(160deg, #0E7490 0%, #0B4F63 100%)',
        }}
      >
        <Box sx={{ position: 'absolute', right: -120, top: -120, width: 360, height: 360, borderRadius: '50%', bgcolor: alpha('#fff', 0.06) }} />
        <Box sx={{ position: 'absolute', left: -80, bottom: -140, width: 320, height: 320, borderRadius: '50%', bgcolor: alpha('#fff', 0.05) }} />

        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ position: 'relative' }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: alpha('#fff', 0.16) }}>
            <WaterDropRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.2 }}>{appName}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.75 }}>diabetmed.uz</Typography>
          </Box>
        </Stack>

        {/* Illustration + subtle grid */}
        <Box
          sx={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
            backgroundImage: `linear-gradient(${alpha('#fff', 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#fff', 0.05)} 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse at 50% 40%, #000 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, #000 30%, transparent 75%)',
          }}
        />
        <Box sx={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AuthIllustration sx={{ maxWidth: 440, maxHeight: '100%', '& svg': { maxHeight: '36vh' } }} />
        </Box>

        <Box sx={{ position: 'relative' }}>
          <Typography sx={{ fontSize: { md: '1.625rem', lg: '1.875rem' }, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', mb: 3 }}>
            {copy.headline}
          </Typography>
          <Stack spacing={1.5}>
            {copy.points.map(p => (
              <Stack key={p} direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: alpha('#fff', 0.16), display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <CheckRoundedIcon sx={{ fontSize: 15 }} />
                </Box>
                <Typography sx={{ fontSize: '0.9375rem', opacity: 0.92 }}>{p}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ opacity: 0.7, position: 'relative' }}>
          © {new Date().getFullYear()} diabetmed.uz
        </Typography>
      </Box>

      {/* Form side */}
      <Box
        sx={{
          flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative',
          backgroundImage: `radial-gradient(${alpha(theme.palette.primary.main, isDark ? 0.14 : 0.1)} 1px, transparent 1.5px), radial-gradient(circle at 100% 0%, ${alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1)}, transparent 45%), radial-gradient(circle at 0% 100%, ${alpha(theme.palette.ai.main, isDark ? 0.12 : 0.06)}, transparent 40%)`,
          backgroundSize: '22px 22px, 100% 100%, 100% 100%',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: { md: 'none' } }}><BrandMark size={34} showName name={appName} /></Box>
          <Box sx={{ display: { xs: 'none', md: 'block' } }} />
          <Stack direction="row" spacing={1}>
            <LanguageMenuButton variant="text" />
            <ThemeToggleButton />
          </Stack>
        </Stack>

        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 2, sm: 3 }, pb: 6 }}>
          <Box sx={{ width: '100%', maxWidth }}>
            <Box
              sx={{
                display: { xs: 'flex', md: 'none' },
                justifyContent: 'center',
                mb: 3,
                px: 2,
                py: 1.5,
                borderRadius: 5,
                overflow: 'hidden',
                background: isDark
                  ? 'linear-gradient(160deg, #0B3B4A 0%, #0B1220 100%)'
                  : 'linear-gradient(160deg, #0E7490 0%, #0B4F63 100%)',
              }}
            >
              <AuthIllustration sx={{ maxWidth: 250 }} />
            </Box>
            <Box sx={{ mb: 3.5 }}>
              {icon && <IconTile size={48} sx={{ mb: 2 }}>{icon}</IconTile>}
              <Typography variant="h4" component="h1">{title}</Typography>
              {subtitle && <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>{subtitle}</Typography>}
            </Box>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
