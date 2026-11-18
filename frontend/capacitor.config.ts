import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uz.diabetmed.app',
  appName: 'Qand Nazorati',
  webDir: 'dist',
  android: {
    // WebView content is served from https://localhost (backend CORS already allows it)
    allowMixedContent: false,
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#0E7490',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      backgroundColor: '#0E7490',
      style: 'DARK',
      overlaysWebView: false,
    },
  },
};

export default config;
