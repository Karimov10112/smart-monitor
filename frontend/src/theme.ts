import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Indigo 500
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6', // Violet 500
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    success: {
      main: '#10b981', // Emerald 500
      light: '#34d399',
      dark: '#059669',
    },
    error: {
      main: '#ef4444', // Red 500
    },
    background: {
      default: '#f8fafc', // Modern airy background
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b', // Slate 800
      secondary: '#64748b', // Slate 500
    },
  },
  shape: {
    borderRadius: 12, // Modern rounded look
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "system-ui", sans-serif',
    h1: { fontWeight: 900, letterSpacing: -1 },
    h2: { fontWeight: 900, letterSpacing: -0.5 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 800 },
    button: {
      textTransform: 'none', 
      fontWeight: 700,
      letterSpacing: 0.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '12px 24px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: 12,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)',
          border: 'none',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          boxShadow: '0 2px 6px rgba(124, 58, 237, 0.2)',
          border: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.3s ease',
          border: 'none', // Remove formal borders
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease',
            backgroundColor: '#ffffff',
            '&:hover': {
              backgroundColor: '#fcfcfd',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.1)',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#ffffff', 0.8),
          backdropFilter: 'blur(12px)',
          color: '#1e293b',
          borderBottom: '1px solid #f1f5f9',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          border: 'none',
        },
      },
    },
  },
});

export default theme;
