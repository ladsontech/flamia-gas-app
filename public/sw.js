// Cache names
const CACHE_NAME = 'flamia-cache-v1';
const OFFLINE_PAGE = '/offline.html';

// Import workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// Version info for update notifications
const APP_VERSION = {
  version: '1.3.0',
  buildDate: new Date().toISOString(),
  features: ['File handlers support', 'Share target integration', 'Widget support', 'Improved offline support']
};

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.add(OFFLINE_PAGE))
      .then(() => self.skipWaiting())
  );
  console.log('Service Worker installed - cache version v1');
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName.startsWith('flamia-cache-') && cacheName !== CACHE_NAME;
          }).map(cacheName => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated and old caches removed');
        return self.clients.claim();
      })
  );
});

// Enable workbox logging in development
workbox.setConfig({
  debug: false
});

// Enable navigation preload if supported
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Default page caching strategy
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache CSS, JS, and Web Worker requests with a Stale-While-Revalidate strategy
workbox.routing.registerRoute(
  ({ request }) => 
    request.destination === 'style' || 
    request.destination === 'script' || 
    request.destination === 'worker',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'assets-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache images with a Cache-First strategy
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Fallback to offline page when network fails
workbox.routing.setCatchHandler(({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match(OFFLINE_PAGE);
  }
  
  return Response.error();
});

// Handle share target requests
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/share-target/'),
  async ({ url, request }) => {
    try {
      const clientUrl = new URL('/', url.origin);
      
      // Get the shared data from the URL
      const title = url.searchParams.get('title') || '';
      const text = url.searchParams.get('text') || '';
      const shareUrl = url.searchParams.get('url') || '';
      
      // Append shared data as query params
      if (title) clientUrl.searchParams.set('title', title);
      if (text) clientUrl.searchParams.set('text', text);
      if (shareUrl) clientUrl.searchParams.set('shareUrl', shareUrl);
      
      // Add a special param to indicate this is from share
      clientUrl.searchParams.set('source', 'share-target');
      
      // Open a window to the client with the shared data
      const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });
      
      // If we have an existing client, use it
      for (const client of clients) {
        if (client.url.includes(self.registration.scope)) {
          return client.navigate(clientUrl.toString()).then(() => new Response('', {
            status: 303,
            headers: { Location: clientUrl.toString() }
          }));
        }
      }
      
      // If no existing client, open a new window
      await self.clients.openWindow(clientUrl.toString());
      
      return new Response('', {
        status: 200
      });
    } catch (error) {
      console.error('Share target error:', error);
      return new Response('Share target processing error', { status: 500 });
    }
  }
);

// Handle file_handlers
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Check if this is a file handler request
  if (url.pathname === '/order' && url.searchParams.has('file')) {
    event.respondWith(
      (async () => {
        try {
          // Get the file from the request
          const formData = await event.request.formData();
          const file = formData.get('file');
          
          if (!file) {
            return new Response('No file provided', { status: 400 });
          }
          
          // Process the file contents
          const text = await file.text();
          
          // Store file data in IndexedDB for the client to access
          const db = await openDB();
          const transaction = db.transaction('file-uploads', 'readwrite');
          const store = transaction.objectStore('file-uploads');
          
          const fileData = {
            id: Date.now().toString(),
            name: file.name,
            type: file.type,
            size: file.size,
            content: text,
            timestamp: new Date().toISOString()
          };
          
          await store.add(fileData);
          
          // Redirect to the order page with a reference to the file
          const redirectUrl = `/order?fileId=${fileData.id}`;
          return Response.redirect(redirectUrl, 303);
        } catch (error) {
          console.error('File handler error:', error);
          return new Response('File processing error', { status: 500 });
        }
      })()
    );
  }
});

// IndexedDB setup for offline data
const DB_NAME = 'flamia-offline-db';
const STORE_NAME = 'pending-actions';

// Open the IndexedDB database
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    
    request.onerror = () => reject(new Error('Could not open IndexedDB'));
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('file-uploads')) {
        db.createObjectStore('file-uploads', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => resolve(event.target.result);
  });
}

// Store an action to be synchronized later
async function storeAction(action) {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise((resolve, reject) => {
      const request = store.add(action);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Could not store action'));
    });
    
    console.log('Action stored for background sync:', action);
    return true;
  } catch (error) {
    console.error('Failed to store action:', error);
    return false;
  }
}

// Retrieve and process all pending actions
async function processPendingActions() {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const actions = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Could not retrieve actions'));
    });
    
    console.log('Processing pending actions:', actions.length);
    
    if (actions.length === 0) {
      return;
    }
    
    // Process each action
    for (const action of actions) {
      try {
        // Attempt to send the action to the server
        const response = await fetch(action.url, {
          method: action.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...action.headers
          },
          body: JSON.stringify(action.data)
        });
        
        if (response.ok) {
          // If successful, remove the action from the store
          await new Promise((resolve, reject) => {
            const request = store.delete(action.id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Could not delete action'));
          });
          
          console.log(`Action ID ${action.id} processed and removed from queue`);
        } else {
          console.error(`Failed to process action ID ${action.id}:`, response.statusText);
        }
      } catch (error) {
        console.error(`Error processing action ID ${action.id}:`, error);
        // Keep the action in the queue for the next sync attempt
      }
    }
  } catch (error) {
    console.error('Failed to process pending actions:', error);
  }
}

// Background sync for offline operations
self.addEventListener('sync', event => {
  if (event.tag === 'sync-pending-data') {
    event.waitUntil(processPendingActions());
  }
});

// Periodic sync for regular background processing
self.addEventListener('periodicsync', event => {
  if (event.tag === 'widget-update') {
    event.waitUntil(
      fetch('/widgets/quick-order-data.json')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to update widget data');
          }
          return response.json();
        })
        .then(data => {
          // Update the widget data in cache
          return caches.open('widget-cache')
            .then(cache => cache.put('/widgets/quick-order-data.json', new Response(JSON.stringify(data))));
        })
        .catch(error => console.error('Widget update failed:', error))
    );
  }

  if (event.tag === 'content-sync') {
    event.waitUntil(processPendingActions());
  }
});

// Register action saving method for client pages
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SAVE_OFFLINE_ACTION') {
    event.waitUntil(
      storeAction(event.data.action)
        .then(success => {
          // Notify the client of the result
          event.source.postMessage({
            type: 'ACTION_SAVED',
            success,
            actionId: event.data.action.id
          });
        })
    );
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.source.postMessage({
      type: 'VERSION_INFO',
      version: APP_VERSION
    });
  }
});

// Push notification handling
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'New Notification', body: 'You have a new notification' };
  
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
