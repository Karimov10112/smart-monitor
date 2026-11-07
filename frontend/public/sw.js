// Service Worker for Web Push Notifications
self.addEventListener('push', function (event) {
  let title = 'Qand Nazorati';
  let body = 'Sizda yangi bildirishnoma mavjud!';
  let data = {};

  if (event.data) {
    try {
      const json = event.data.json();
      title = json.title || title;
      body = json.body || body;
      data = json;
    } catch (e) {
      body = event.data.text() || body;
    }
  }

  const options = {
    body: body,
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'diabetes-alert-' + Date.now(),
    renotify: true,
    data: data,
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

