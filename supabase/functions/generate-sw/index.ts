import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    let slug = url.searchParams.get('slug')
    let type = url.searchParams.get('type') || 'seller'
    
    // Check if request is from subdomain
    const hostname = url.hostname
    const subdomainMatch = hostname.match(/^([a-z0-9-]+)\.flamia\.store$/i)
    
    if (subdomainMatch && !['www', 'app', 'admin', 'api'].includes(subdomainMatch[1].toLowerCase())) {
      slug = subdomainMatch[1]
      type = 'seller'
    }

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Shop slug is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const isSubdomain = !!subdomainMatch
    const scope = isSubdomain ? '/' : (type === 'affiliate' ? `/affiliate/${slug}/` : `/shop/${slug}/`)
    const cacheName = `${slug}-store-v1`

    // Generate service worker code
    const serviceWorkerCode = `
// Service Worker for ${slug} storefront
// Cache name: ${cacheName}
// Scope: ${scope}

const CACHE_NAME = '${cacheName}';
const urlsToCache = [
  '${scope}',
  '/images/icon.png'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Opened cache for ${slug}');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name.startsWith('${slug}-store-') && name !== CACHE_NAME) {
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
  if (!event.request.url.includes('${scope}') && !event.request.url.includes('/images/')) {
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
  // Sync pending orders when back online
  console.log('[SW] Syncing pending orders for ${slug}');
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '${slug} Store';
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/images/icon.png',
    badge: '/images/icon.png',
    data: data.url || '${scope}',
    tag: '${slug}-notification'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '${scope}')
  );
});

console.log('[SW] Service Worker loaded for ${slug} storefront');
    `.trim();

    return new Response(
      serviceWorkerCode,
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=3600',
          'Service-Worker-Allowed': scope
        }
      }
    )
  } catch (error) {
    console.error('Error generating service worker:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

