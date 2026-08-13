                                                                                                                                      const CACHE_NAME = 'offerzonline-cache-v1';
const OFFLINE_URL = '/~offline';

const ASSETS_TO_CACHE = [
  '/',
  '/~offline',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Bypass service worker for admin routes and authentication APIs
  const url = new URL(event.request.url);
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api/admin') ||
    url.pathname.startsWith('/api/auth')
  ) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).catch((err) => {
          console.warn("Service worker fetch failed (likely offline):", err);
          return new Response("Offline / Network Error", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({ "Content-Type": "text/plain" }),
          });
        });
      })
    );
  }
});
