import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { isNativeApp } from '../utils/platform';

/**
 * Android/iOS-only glue (renders nothing, no-op in the browser):
 * - status bar colour follows light/dark theme
 * - Android hardware back button goes back in history, exits on the first screen
 * - hides the splash screen once React has mounted
 */
export default function NativeBridge() {
  const { isDarkMode } = useApp();

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
      // Style.Light = dark icons (for a light background), Style.Dark = light icons
      StatusBar.setStyle({ style: isDarkMode ? Style.Dark : Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: isDarkMode ? '#0B1220' : '#F4F7FA' }).catch(() => {});
    })();
  }, [isDarkMode]);

  return null;
}
