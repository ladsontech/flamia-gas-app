
const CACHE_NAME = 'flamia-v1';
const OFFLINE_URL = '/offline.html';
const ASSETS_CACHE = 'flamia-assets-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icons/favicon-196.png',
  '/icons/apple-icon-180.png',
  '/src/index.css',
];

// Install event - cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)),
      // Create offline page cache
      fetch(OFFLINE_URL).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          return cache.put(OFFLINE_URL, response);
        });
      })
    ])
  );
  self.skipWaiting();
});

// Background sync for orders
self.addEventListener('sync', event => {
  if (event.tag === 'order-sync') {
    event.waitUntil(syncOrders());
  }
});

// Handle failed order submissions
async function syncOrders() {
  try {
    const failedOrders = await getFailedOrders();
    await Promise.all(failedOrders.map(order => {
      return fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
    }));
    await clearFailedOrders();
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Network first, falling back to cache strategy
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Clear old caches on activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== ASSETS_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification support
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: '/icons/favicon-196.png',
    badge: '/icons/favicon-196.png',
    vibrate: [100, 50, 100]
  };

  event.waitUntil(
    self.registration.showNotification('Flamia Gas', options)
  );
});
