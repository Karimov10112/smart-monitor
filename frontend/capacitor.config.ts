import type { CapacitorConfig } from '@capacitor/cli';

/**
 * The app loads the live site, so every push to main (Vercel deploy) reaches
 * the phone on the next launch without reinstalling the APK.
 * Build with CAP_BUNDLED=1 to ship the local dist/ copy instead (offline-first).
 */
const LIVE_URL = process.env.CAP_BUNDLED ? undefined : 'https://diabetmed.uz';

const config: CapacitorConfig = {
  appId: 'uz.diabetmed.app',
  appName: 'Qand Nazorati',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
  server: {
    androidScheme: 'https',
    url: LIVE_URL,
    // Shown from the APK when the site cannot be reached (no internet)
    errorPath: 'offline.html',
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
