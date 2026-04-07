// ── AIROOBI Service Worker — Push Notifications ──

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});

self.addEventListener('push', function(e) {
  var data = {};
  try { data = e.data.json(); } catch (err) {
    data = { title: 'AIROOBI', body: e.data ? e.data.text() : '' };
  }

  var title = data.title || 'AIROOBI';
  var options = {
    body: data.body || '',
    icon: '/public/images/AIROOBI_Symbol_White.png',
    badge: '/public/images/AIROOBI_Symbol_White.png',
    tag: data.tag || 'airoobi-notification',
    data: { url: data.url || '/' },
    vibrate: [100, 50, 100]
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/';

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url.indexOf('airoobi') !== -1 && 'focus' in clientList[i]) {
          clientList[i].navigate(url);
          return clientList[i].focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
