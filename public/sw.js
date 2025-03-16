
// Cache names
const CACHE_NAME = 'flamia-cache-v3'; // Incrementing version to force cache refresh
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const OFFLINE_PAGE = '/offline.html';

// Resources to cache immediately on install
const STATIC_RESOURCES = [
  '/',
  OFFLINE_PAGE,
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/lovable-uploads/icon.png'
];

// Version info for update notifications
const APP_VERSION = {
  version: '1.2.1',
  buildDate: new Date().toISOString(),
  features: ['Improved update notifications', 'Better offline support', 'Enhanced splash screen']
};

// Install event - cache static resources
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE)
        .then(cache => cache.addAll(STATIC_RESOURCES))
        .then(() => self.skipWaiting()) // Force new service worker to become active
    ])
  );
  console.log('Service Worker installed - cache version v3');
});

// Activate event - clean up old caches and notify clients about update
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName.startsWith('flamia-cache-') && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE;
          }).map(cacheName => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated and old caches removed');
        
        // Notify all clients about the update
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'APP_UPDATED',
              version: APP_VERSION
            });
          });
          return self.clients.claim(); // Take control of all clients
        });
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // For API requests (Supabase), use network first, fall back to cache
  if (event.request.url.includes('supabase.co')) {
    return networkFirstStrategy(event);
  }

  // For all other requests, try cache first, fall back to network
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // We found a match in cache, return it immediately
          return cachedResponse;
        }

        // No cache match, fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response - one to return, one to cache
            const responseToCache = networkResponse.clone();
            
            // Store in dynamic cache
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(error => {
            console.log('Fetch failed, serving offline page', error);
            
            // Check if this is a navigation request
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_PAGE);
            }
            
            // For image requests, you could return a placeholder
            if (event.request.destination === 'image') {
              return new Response('', { 
                status: 200, 
                statusText: 'OK' 
              });
            }
            
            // Return empty response for other asset types
            return new Response('', { 
              status: 408, 
              statusText: 'Request timed out' 
            });
          });
      })
  );
});

// Network-first strategy for API calls
function networkFirstStrategy(event) {
  return event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Clone the response to cache it and return it
        const clonedResponse = networkResponse.clone();
        
        caches.open(DYNAMIC_CACHE)
          .then(cache => {
            cache.put(event.request, clonedResponse);
          });
          
        return networkResponse;
      })
      .catch(error => {
        console.log('Network request failed, trying cache', error);
        
        return caches.match(event.request)
          .then(cachedResponse => {
            return cachedResponse || Promise.reject('No network or cache response available');
          });
      })
  );
}

// Background sync for offline operations
self.addEventListener('sync', event => {
  if (event.tag === 'sync-refill-prices') {
    console.log('Syncing refill prices data...');
    // The actual sync logic will be handled by the application
    // when it detects it's back online
  }
  
  // Add additional sync handlers for different operations
  if (event.tag === 'sync-pending-orders') {
    console.log('Syncing pending orders...');
    // Sync pending orders that were created offline
  }
  
  if (event.tag === 'sync-user-preferences') {
    console.log('Syncing user preferences...');
    // Sync any user preference changes made offline
  }
});

// Push notification handling
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body || 'New update from Flamia Gas',
    icon: '/lovable-uploads/icon.png',
    badge: '/lovable-uploads/icon.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Flamia Gas Notification', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Message handler for communication with the app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.source.postMessage({
      type: 'VERSION_INFO',
      version: APP_VERSION
    });
  }
  
  // Handle message requests for background sync
  if (event.data && event.data.type === 'SYNC_DATA') {
    self.registration.sync.register(event.data.syncTag || 'sync-data')
      .then(() => {
        console.log(`Background sync registered for: ${event.data.syncTag}`);
        event.source.postMessage({
          type: 'SYNC_REGISTERED',
          syncTag: event.data.syncTag
        });
      })
      .catch(error => {
        console.error('Background sync registration failed:', error);
        event.source.postMessage({
          type: 'SYNC_ERROR',
          error: error.message
        });
      });
  }
});
