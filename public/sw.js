// All-in-one-calculator Progressive Web App Service Worker
const CACHE_NAME = 'allinone-calc-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-16x16.png',
  '/icon-32x32.png',
  '/apple-touch-icon.png',
  '/style.css',
  '/css/sci.css',
  '/js/common.js',
  '/js/calc-engines.js',
  '/js/conversion.js',
  '/js/quick-conversion.js',
  '/img/svg/allinone-logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('SW precache partial failure:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Only handle same-origin http(s) requests cleanly
  if (!url.protocol.startsWith('http') || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // Network-First for HTML navigation
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((res) => res || caches.match('/')))
    );
    return;
  }

  // Stale-While-Revalidate for JS/CSS and static assets so fixes propagate cleanly
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
