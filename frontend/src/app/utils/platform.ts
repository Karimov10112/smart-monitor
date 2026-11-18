import { Capacitor } from '@capacitor/core';

/** True inside the Android/iOS app (Capacitor WebView). */
export const isNativeApp = Capacitor.isNativePlatform();

/**
 * Local development = the site opened from localhost/LAN in a normal browser.
 * The native app is also served from https://localhost, so it must be excluded
 * here, otherwise it would try to reach a backend on the phone itself.
 */
export const isLocalDev = !isNativeApp && typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.')
);

const PROD_ORIGIN = (import.meta as any).env?.VITE_API_URL || 'https://smart-monitor-1-a037.onrender.com';

/** Backend origin (no trailing /api). */
export const API_ORIGIN = isLocalDev ? 'http://localhost:5000' : PROD_ORIGIN;

/**
 * Save a generated jsPDF document. In the browser this downloads the file;
 * in the app (where WebView downloads do nothing) it writes the PDF to the
 * cache and opens the Android share sheet so the user can save or send it.
 */
export async function savePdf(doc: any, fileName: string): Promise<void> {
  if (!isNativeApp) {
    doc.save(fileName);
    return;
  }
  const [{ Filesystem, Directory }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ]);
  const dataUri: string = doc.output('datauristring');
  const base64 = dataUri.substring(dataUri.indexOf(',') + 1);
  const written = await Filesystem.writeFile({ path: fileName, data: base64, directory: Directory.Cache });
  await Share.share({ title: fileName, url: written.uri, dialogTitle: fileName });
}
