import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './app/App';
import { AuthProvider } from './app/contexts/AuthContext';
import { AppProvider, useApp } from './app/contexts/AppContext';
import { getTheme } from './theme';
import NativeBridge from './app/components/NativeBridge';
// Single entry so Tailwind compiles the theme tokens (theme.css) together with the utilities
import './styles/index.css';

const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isDarkMode } = useApp();
  const theme = React.useMemo(() => getTheme(isDarkMode ? 'dark' : 'light'), [isDarkMode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NativeBridge />
      {children}
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <AppProvider>
        <ThemeWrapper>
          <App />
        </ThemeWrapper>
      </AppProvider>
    </AuthProvider>
  </BrowserRouter>
);
