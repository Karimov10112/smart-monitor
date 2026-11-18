import { createTheme, alpha } from '@mui/material/styles';

/**
 * DiabetMed design system
 * -----------------------------------------------------------------------------
 * Calm clinical palette (teal/cyan primary), neutral slate surfaces and the
 * standard glucose range colours used by CGM reports (AGP):
 *   very low  < 3.0   low  3.0–3.8   in range 3.9–10.0   high 10.1–13.9   very high ≥ 14
 *
 * The same tokens are mirrored as CSS variables in `styles/theme.css` so the
 * Tailwind/shadcn parts of the app look identical to the MUI parts.
 */

export type GlucoseLevel = 'veryLow' | 'low' | 'inRange' | 'high' | 'veryHigh';

export const glucoseColors = {
  light: {
    veryLow: '#B91C1C',
    low: '#DC2626',
    inRange: '#15803D',
    high: '#B45309',
    veryHigh: '#C2410C',
  },
  dark: {
    veryLow: '#F87171',
    low: '#FB7185',
    inRange: '#4ADE80',
    high: '#FBBF24',
    veryHigh: '#FB923C',
  },
} as const;

const tokens = {
  light: {
    primary: { main: '#0E7490', light: '#0891B2', dark: '#155E75', contrastText: '#FFFFFF' },
    secondary: { main: '#4F46E5', light: '#6366F1', dark: '#4338CA', contrastText: '#FFFFFF' },
    ai: { main: '#7C3AED', light: '#8B5CF6', dark: '#6D28D9', contrastText: '#FFFFFF' },
    success: { main: '#15803D', light: '#22C55E', dark: '#166534', contrastText: '#FFFFFF' },
    warning: { main: '#B45309', light: '#F59E0B', dark: '#92400E', contrastText: '#FFFFFF' },
    error: { main: '#DC2626', light: '#EF4444', dark: '#B91C1C', contrastText: '#FFFFFF' },
    info: { main: '#0369A1', light: '#0EA5E9', dark: '#075985', contrastText: '#FFFFFF' },
    background: { default: '#F4F7FA', paper: '#FFFFFF' },
    text: { primary: '#0F1E2E', secondary: '#5A6B7D', disabled: '#94A3B8' },
    divider: '#E2E8F0',
    surfaceMuted: '#F1F5F9',
  },
  dark: {
    primary: { main: '#38BDD8', light: '#67D3E8', dark: '#0E9AB8', contrastText: '#03222B' },
    secondary: { main: '#818CF8', light: '#A5B4FC', dark: '#6366F1', contrastText: '#0B1023' },
    ai: { main: '#A78BFA', light: '#C4B5FD', dark: '#8B5CF6', contrastText: '#150A2E' },
    success: { main: '#4ADE80', light: '#86EFAC', dark: '#22C55E', contrastText: '#052E14' },
    warning: { main: '#FBBF24', light: '#FCD34D', dark: '#F59E0B', contrastText: '#2B1A02' },
    error: { main: '#F87171', light: '#FCA5A5', dark: '#EF4444', contrastText: '#2B0606' },
    info: { main: '#38BDF8', light: '#7DD3FC', dark: '#0EA5E9', contrastText: '#03202E' },
    background: { default: '#0B1220', paper: '#111A2B' },
    text: { primary: '#E6EDF5', secondary: '#94A3B8', disabled: '#5B6B80' },
    divider: 'rgba(148, 163, 184, 0.16)',
    surfaceMuted: '#162236',
  },
} as const;

declare module '@mui/material/styles' {
  interface Palette {
    ai: Palette['primary'];
    glucose: Record<GlucoseLevel, string>;
    surfaceMuted: string;
  }
  interface PaletteOptions {
    ai?: PaletteOptions['primary'];
    glucose?: Record<GlucoseLevel, string>;
    surfaceMuted?: string;
  }
}

export const FONT_FAMILY = '"Inter", "Segoe UI", system-ui, -apple-system, Roboto, sans-serif';

export const getTheme = (mode: 'light' | 'dark') => {
  const c = tokens[mode];
  const isDark = mode === 'dark';
  const cardShadow = isDark
    ? '0 1px 2px rgba(0,0,0,0.4)'
    : '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)';
  const popShadow = isDark
    ? '0 12px 32px rgba(0,0,0,0.55)'
    : '0 12px 32px rgba(15,30,46,0.12), 0 2px 6px rgba(15,30,46,0.06)';

  return createTheme({
    palette: {
      mode,
      primary: c.primary,
      secondary: c.secondary,
      ai: c.ai,
      success: c.success,
      warning: c.warning,
      error: c.error,
      info: c.info,
      background: c.background,
      text: c.text,
      divider: c.divider,
      glucose: { ...glucoseColors[mode] },
      surfaceMuted: c.surfaceMuted,
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: FONT_FAMILY,
      h1: { fontWeight: 700, fontSize: '2.25rem', letterSpacing: '-0.02em', lineHeight: 1.2 },
      h2: { fontWeight: 700, fontSize: '1.875rem', letterSpacing: '-0.02em', lineHeight: 1.25 },
      h3: { fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.015em', lineHeight: 1.3 },
      h4: { fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.015em', lineHeight: 1.3 },
      h5: { fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.01em', lineHeight: 1.35 },
      h6: { fontWeight: 600, fontSize: '1.0625rem', letterSpacing: '-0.005em', lineHeight: 1.4 },
      subtitle1: { fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.45 },
      subtitle2: { fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.45 },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', lineHeight: 1.55 },
      caption: { fontSize: '0.75rem', lineHeight: 1.45 },
      overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em', lineHeight: 1.5, textTransform: 'uppercase' },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            fontFeatureSettings: '"cv11", "ss01"',
          },
          '::selection': { backgroundColor: alpha(c.primary.main, 0.25) },
        },
      },
      MuiButtonBase: { defaultProps: { disableRipple: false } },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontWeight: 600,
            paddingInline: 16,
            minHeight: 38,
            transition: 'background-color .15s ease, border-color .15s ease, color .15s ease, box-shadow .15s ease',
            '&.Mui-focusVisible': { boxShadow: `0 0 0 3px ${alpha(c.primary.main, 0.35)}` },
          },
          sizeSmall: { minHeight: 32, paddingInline: 12, fontSize: '0.8125rem' },
          sizeLarge: { minHeight: 48, paddingInline: 22, fontSize: '0.9375rem' },
          outlined: { borderColor: c.divider, backgroundColor: 'transparent' },
          outlinedPrimary: { borderColor: alpha(c.primary.main, 0.4) },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            '&.Mui-focusVisible': { boxShadow: `0 0 0 3px ${alpha(c.primary.main, 0.35)}` },
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: 'none' },
          outlined: { borderColor: c.divider },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${c.divider}`,
            boxShadow: cardShadow,
            backgroundImage: 'none',
          },
        },
      },
      MuiCardContent: {
        styleOverrides: { root: { padding: 20, '&:last-child': { paddingBottom: 20 } } },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: isDark ? alpha('#fff', 0.02) : '#FFFFFF',
            transition: 'box-shadow .15s ease, border-color .15s ease',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? alpha('#fff', 0.14) : '#D5DDE6' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? alpha('#fff', 0.28) : '#AEBBC9' },
            '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(c.primary.main, 0.18)}` },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: c.primary.main, borderWidth: 1 },
            '&.Mui-error.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(c.error.main, 0.18)}` },
          },
        },
      },
      MuiInputLabel: { styleOverrides: { root: { fontWeight: 500 } } },
      MuiFormHelperText: { styleOverrides: { root: { marginLeft: 2, fontWeight: 500 } } },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 600 },
          sizeSmall: { fontSize: '0.75rem' },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 20, boxShadow: popShadow, backgroundImage: 'none' },
        },
      },
      MuiDialogTitle: { styleOverrides: { root: { fontWeight: 700, fontSize: '1.125rem', padding: '20px 24px 12px' } } },
      MuiDialogActions: { styleOverrides: { root: { padding: '12px 24px 20px', gap: 8 } } },
      MuiMenu: {
        styleOverrides: {
          paper: { borderRadius: 12, boxShadow: popShadow, border: `1px solid ${c.divider}` },
        },
      },
      MuiMenuItem: { styleOverrides: { root: { fontSize: '0.875rem', fontWeight: 500, borderRadius: 8, marginInline: 6 } } },
      MuiPopover: { styleOverrides: { paper: { borderRadius: 12, boxShadow: popShadow } } },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '0.75rem',
            fontWeight: 500,
            borderRadius: 8,
            backgroundColor: isDark ? '#E6EDF5' : '#0F1E2E',
            color: isDark ? '#0F1E2E' : '#FFFFFF',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 40 },
          indicator: { height: 2.5, borderRadius: 2 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', minHeight: 40, paddingInline: 14 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: c.divider, fontSize: '0.875rem' },
          head: {
            fontWeight: 600,
            fontSize: '0.75rem',
            color: c.text.secondary,
            backgroundColor: c.surfaceMuted,
            whiteSpace: 'nowrap',
          },
          stickyHeader: { backgroundColor: c.surfaceMuted },
        },
      },
      MuiTableRow: {
        styleOverrides: { root: { '&.MuiTableRow-hover:hover': { backgroundColor: alpha(c.primary.main, 0.04) } } },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12, alignItems: 'flex-start', fontSize: '0.875rem' },
          standardError: { border: `1px solid ${alpha(c.error.main, 0.3)}` },
          standardWarning: { border: `1px solid ${alpha(c.warning.main, 0.3)}` },
          standardSuccess: { border: `1px solid ${alpha(c.success.main, 0.3)}` },
          standardInfo: { border: `1px solid ${alpha(c.info.main, 0.3)}` },
        },
      },
      MuiAlertTitle: { styleOverrides: { root: { fontWeight: 700, marginBottom: 2 } } },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            '&.Mui-selected': {
              backgroundColor: alpha(c.primary.main, isDark ? 0.16 : 0.1),
              color: c.primary.main,
              '& .MuiListItemIcon-root': { color: c.primary.main },
              '&:hover': { backgroundColor: alpha(c.primary.main, isDark ? 0.22 : 0.14) },
            },
          },
        },
      },
      MuiListItemIcon: { styleOverrides: { root: { minWidth: 36, color: c.text.secondary } } },
      MuiDrawer: { styleOverrides: { paper: { backgroundImage: 'none' } } },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'inherit' },
        styleOverrides: {
          root: {
            backgroundColor: alpha(c.background.default, 0.85),
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid ${c.divider}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiAvatar: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiLinearProgress: { styleOverrides: { root: { borderRadius: 4, height: 6 } } },
      MuiSwitch: {
        styleOverrides: {
          switchBase: { '&.Mui-checked + .MuiSwitch-track': { opacity: 1 } },
          track: { borderRadius: 10 },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${c.divider}`,
            '&:before': { display: 'none' },
          },
        },
      },
      MuiDivider: { styleOverrides: { root: { borderColor: c.divider } } },
      MuiBadge: { styleOverrides: { badge: { fontWeight: 700 } } },
      MuiSkeleton: { defaultProps: { animation: 'wave' } },
    },
  });
};
