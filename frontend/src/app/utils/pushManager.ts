import api from './api';

// Base64 VAPID public keyni Uint8Array ga o'tkazish
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Service Workerni ro'yxatdan o'tkazish va Web Push obunasini faollashtirish
 */
export async function registerWebPush(): Promise<{ success: boolean; message?: string }> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, message: 'Brauzeringiz Web Push xabarnomalarni qo\'llab-quvvatlamaydi' };
  }

  try {
    // 1. Service workerni ro'yxatdan o'tkazish
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    // 2. Foydalanuvchidan bildirishnomalarga ruxsat so'rash
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, message: 'Bildirishnomalarga ruxsat berilmadi' };
    }

    // 3. Backenddan VAPID public keyni olish
    const keyRes = await api.get('/notifications/vapid-key');
    const publicKey = keyRes.data?.publicKey;
    if (!publicKey) {
      return { success: false, message: 'VAPID kalit topilmadi' };
    }

    // 4. PushManager orqali obuna bo'lish
    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    // 5. Obunani backendga yuborish
    await api.post('/notifications/subscribe', {
      subscription: subscription.toJSON(),
    });

    return { success: true, message: 'Push bildirishnomalar muvaffaqiyatli yoqildi!' };
  } catch (err: any) {
    console.error('Web Push registration error:', err);
    return { success: false, message: err.message || 'Xatolik yuz berdi' };
  }
}

