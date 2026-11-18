import { useEffect, useState } from 'react';
import { authAPI } from './api';

const FALLBACK = 'https://t.me/diabetmed_uz_bot';

/**
 * Telegram botni ulash uchun imzolangan havolani backend'dan oladi.
 * Havola olinmaguncha oddiy bot havolasi qaytariladi (u yerda /login orqali ulanish mumkin).
 */
export function useTelegramLink(enabled = true): string {
  const [url, setUrl] = useState(FALLBACK);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    authAPI
      .getTelegramLink()
      .then(({ data }) => {
        if (!cancelled && data?.url) setUrl(data.url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return url;
}
