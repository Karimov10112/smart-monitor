import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { isNativeApp } from '../utils/platform';

/**
 * Android/iOS-only glue (renders nothing, no-op in the browser):
 * - status bar colour follows light/dark theme (teal on the sign-in screens)
 * - Android hardware back button goes back in history, exits on the first screen
 * - hides the splash screen once React has mounted
 */
export default function NativeBridge() {
  const { isDarkMode } = useApp();
  const { isAuthenticated, loading } = useAuth();
  // Sign-in screens have a teal hero at the top, so the status bar matches it
  const onAuthScreen = !loading && !isAuthenticated;

  useEffect(() => {
    if (!isNativeApp) return;
    let removeBack: (() => void) | undefined;
    (async () => {
      const [{ App }, { SplashScreen }] = await Promise.all([
        import('@capacitor/app'),
        import('@capacitor/splash-screen'),
      ]);
      SplashScreen.hide().catch(() => {});
      const handle = await App.addListener('backButton', ({ canGoBack }) => {
        // Close an open MUI dialog/menu first (they listen for Escape)
        const openModal = document.querySelector('.MuiDialog-root, .MuiPopover-root, .MuiDrawer-modal, [role="dialog"]');
        if (openModal) {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          (openModal.querySelector('.MuiBackdrop-root') as HTMLElement | null)?.click();
          return;
        }
        if (canGoBack && window.history.length > 1) window.history.back();
        else App.exitApp();
      });
      removeBack = () => handle.remove();
    })();
    return () => removeBack?.();
  }, []);

  useEffect(() => {
    if (!isNativeApp) return;
    (async () => {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      // What is behind the status bar depends on the device:
      //  - edge-to-edge (Android 15+ with WebView 140+): our page (teal hero / app bar)
      //  - Android < 15: the colour we set here
      //  - Android 15+ with an older WebView: the window background, which we cannot
      //    colour from JS; it follows the system light/dark setting
      const color = onAuthScreen ? (isDarkMode ? '#0B3B4A' : '#0E7490') : (isDarkMode ? '#0B1220' : '#F4F7FA');
      const pageColoredIcons = onAuthScreen || isDarkMode; // light icons over teal/dark
      await StatusBar.setBackgroundColor({ color }).catch(() => {});
      const info = await StatusBar.getInfo().catch(() => null);
      const colorApplied = !!info?.color && info.color.toLowerCase() === color.toLowerCase();
      const probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;top:0;height:var(--sat);visibility:hidden;pointer-events:none';
      document.body.appendChild(probe);
      const edgeToEdge = probe.getBoundingClientRect().height > 0;
      probe.remove();
      const lightIcons = colorApplied || edgeToEdge
        ? pageColoredIcons
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      // Style.Light = dark icons (for a light background), Style.Dark = light icons
      StatusBar.setStyle({ style: lightIcons ? Style.Dark : Style.Light }).catch(() => {});
    })();
  }, [isDarkMode, onAuthScreen]);

  return null;
}
