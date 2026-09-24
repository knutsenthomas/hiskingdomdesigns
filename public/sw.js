const CACHE_NAME = 'hk-designs-cache-v7';
const ASSETS_TO_CACHE = [
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
  '/logo-hkm.png',
  '/manifest.json'
];

// Install event - caching shell assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - cleaning old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Caching strategy
self.addEventListener('fetch', (e) => {
  // Only handle GET requests and local/same-origin assets
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network-First for HTML navigation requests to preserve server-side SEO & avoid stale chunks
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .catch(() => {
          return caches.match(e.request);
        })
    );
    return;
  }

  // Stale-While-Revalidate caching strategy for other assets (images, fonts, static assets)
  e.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(e.request).then((cachedResponse) => {
        const fetchedResponse = fetch(e.request).then((networkResponse) => {
          // Never cache HTML responses into asset cache (prevents chunk 404 HTML poisoning)
          const contentType = networkResponse.headers.get('content-type') || '';
          if (networkResponse.status === 200 && !contentType.includes('text/html')) {
            const responseToCache = networkResponse.clone();
            cache.put(e.request, responseToCache).catch(() => {});
          }
          return networkResponse;
        }).catch(() => {
          return cachedResponse;
        });

        // Return cached version immediately if we have it, otherwise wait for network
        return cachedResponse || fetchedResponse;
      });
    })
  );
});
