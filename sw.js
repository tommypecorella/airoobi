// ── AIROOBI Service Worker — Push + Cache + Offline ──
var CACHE_NAME = 'airoobi-v1';
var STATIC_ASSETS = [
  '/offline.html',
  '/src/dapp.css',
  '/public/images/AIROOBI_Symbol_White.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
          .map(function(n) { return caches.delete(n); })
      );
    }).then(function() { return clients.claim(); })
  );
});

// Network-first for HTML/API, cache-first for static assets
self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // Skip non-GET and cross-origin
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  // Static assets: cache-first
  if (url.pathname.startsWith('/src/') || url.pathname.startsWith('/public/') || url.pathname === '/manifest.json') {
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        return cached || fetch(e.request).then(function(res) {
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
          return res;
        });
      })
    );
    return;
  }

  // HTML pages: network-first, offline fallback
  if (e.request.headers.get('accept') && e.request.headers.get('accept').indexOf('text/html') !== -1) {
    e.respondWith(
      fetch(e.request).catch(function() {
        return caches.match('/offline.html');
      })
    );
    return;
  }
});

// ── Push Notifications ──
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
