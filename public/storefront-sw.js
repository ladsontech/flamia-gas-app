// Storefront Service Worker Proxy
// This file detects the current storefront and loads the appropriate SW code

(async function() {
  // Determine storefront info from current URL
  const hostname = self.location.hostname;
  const pathname = self.location.pathname;
  
  let slug = null;
  let type = 'seller';
  let scope = '/';
  
  // Check if we're on a subdomain
  const subdomainMatch = hostname.match(/^([a-z0-9-]+)\.flamia\.store$/i);
  if (subdomainMatch && !['www', 'app', 'admin', 'api'].includes(subdomainMatch[1].toLowerCase())) {
    slug = subdomainMatch[1];
    type = 'seller';
    scope = '/';
  } else if (pathname.startsWith('/shop/')) {
    const pathMatch = pathname.match(/^\/shop\/([^/]+)/);
    if (pathMatch && pathMatch[1] !== 'category') {
      slug = pathMatch[1];
      type = 'seller';
      scope = `/shop/${slug}/`;
    }
  } else if (pathname.startsWith('/affiliate/')) {
    const pathMatch = pathname.match(/^\/affiliate\/([^/]+)/);
    if (pathMatch) {
      slug = pathMatch[1];
      type = 'affiliate';
      scope = `/affiliate/${slug}/`;
    }
  }

  if (!slug) {
    console.log('[SW Proxy] No storefront detected, using default Flamia SW');
    // Import default Flamia service worker
    self.importScripts('/sw.js');
    return;
  }

  // Generate cache name for this storefront
  const CACHE_NAME = `${slug}-store-v1`;
  const urlsToCache = [
    scope,
    '/images/icon.png'
  ];

  // Install event - cache core assets
  self.addEventListener('install', (event) => {
    console.log(`[SW] Installing for ${slug}`);
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log(`[SW] Opened cache for ${slug}`);
          return cache.addAll(urlsToCache);
        })
        .then(() => self.skipWaiting())
    );
  });

  // Activate event - clean up old caches
  self.addEventListener('activate', (event) => {
    console.log(`[SW] Activating for ${slug}`);
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name.startsWith(`${slug}-store-`) && name !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            }
          })
        );
      }).then(() => self.clients.claim())
    );
  });

  // Fetch event - serve from cache, fallback to network
  self.addEventListener('fetch', (event) => {
    // Only handle requests within our scope
    if (!event.request.url.includes(scope) && !event.request.url.includes('/images/')) {
      return;
    }

    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Cache hit - return response
          if (response) {
            return response;
          }

          // Clone the request
          const fetchRequest = event.request.clone();

          return fetch(fetchRequest).then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }).catch(() => {
            // Return offline page if available
            return caches.match('/offline.html');
          });
        })
    );
  });

  // Background sync for offline orders
  self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-orders') {
      event.waitUntil(syncOrders());
    }
  });

  async function syncOrders() {
    console.log(`[SW] Syncing pending orders for ${slug}`);
  }

  // Push notifications
  self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || `${slug} Store`;
    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/images/icon.png',
      badge: '/images/icon.png',
      data: data.url || scope,
      tag: `${slug}-notification`
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });

  // Notification click
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
      clients.openWindow(event.notification.data || scope)
    );
  });

  console.log(`[SW] Service Worker loaded for ${slug} storefront (${type})`);
})();

