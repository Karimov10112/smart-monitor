// Service Worker for Web Push Notifications
// Bu fayl brauzer yopiq bo'lsa ham fonga quloq solib turadi

self.addEventListener('push', function (event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Qand Nazorati', body: event.data.text() };
    }
  }

  const title = data.title || 'Qand Nazorati';
  const options = {
    body: data.body || 'Yangi bildirishnoma mavjud',
    icon: data.icon || '/favicon.png',
    badge: data.badge || '/favicon.png',
    tag: data.tag || 'diabetes-alert',
    renotify: true,
    requireInteraction: true, // Foydalanuvchi ko'rmaguncha ekranda turishi uchun
    vibrate: [200, 100, 200, 100, 200], // Vibratsiya
    data: {
      url: data.url || '/',
      ...data.data,
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // Agar ochiq oyna bo'lsa, fokus beramiz
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Agar sayt yopiq bo'lsa, yangi oyna ochamiz
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

