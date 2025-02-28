
const CACHE_NAME = 'flamia-gas-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/icon.png',
  '/src/main.tsx',
  '/src/App.css',
  '/offline.html'
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache API requests or similar dynamic content
                if (!event.request.url.includes('/api/')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(() => {
            // If the network request fails, try to serve the offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background Sync for refill prices
self.addEventListener('sync', event => {
  console.log('Background sync event fired:', event.tag);
  
  if (event.tag === 'sync-refill-prices') {
    console.log('Attempting to sync refill prices');
    event.waitUntil(syncRefillPrices());
  }
});

// Function to handle refill prices sync
async function syncRefillPrices() {
  console.log('Syncing refill prices in background');
  
  try {
    // Fetch the latest prices
    const response = await fetch('/api/refill-prices');
    
    if (!response.ok) {
      throw new Error('Failed to sync refill prices');
    }
    
    const data = await response.json();
    console.log('Successfully synced refill prices:', data);
    
    // Notify the user if supported
    if (self.registration.showNotification) {
      await self.registration.showNotification('Flamia Gas', {
        body: 'Refill prices have been updated',
        icon: '/lovable-uploads/icon.png',
        badge: '/lovable-uploads/icon.png'
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error syncing refill prices:', error);
    return Promise.reject(error);
  }
}

// Handle offline fallback
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (event.request.mode === 'navigate' && event.request.method === 'GET' && navigator.onLine === false) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
  }
});
