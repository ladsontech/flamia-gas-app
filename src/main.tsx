
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found!");
}

// Custom event bus for service worker updates
const swEvents = new EventTarget();

// Check if the app is running in standalone mode (installed PWA)
const isAppInstalled = () => {
  // For iOS Safari
  const standaloneSafari = (window.navigator as any).standalone === true;
  // For other browsers
  const standaloneMode = window.matchMedia('(display-mode: standalone)').matches;
  
  return standaloneSafari || standaloneMode;
};

// IndexedDB helper for offline storage
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('flamia-offline-db', 1);
    
    request.onerror = () => reject('Failed to open database');
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('pending-actions')) {
        db.createObjectStore('pending-actions', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('user-data')) {
        db.createObjectStore('user-data', { keyPath: 'key' });
      }
    };
    
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
  });
};

// Register Service Worker with update handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Function to check for updates more frequently
      const checkForUpdates = () => {
        registration.update().catch(err => {
          console.error('Error checking for service worker updates:', err);
        });
      };

      // Check for updates on page focus
      window.addEventListener('focus', checkForUpdates);

      // Also check periodically (every 30 minutes)
      setInterval(checkForUpdates, 30 * 60 * 1000);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, dispatch event only if app is installed
              console.log('New service worker installed and waiting to activate');
              if (isAppInstalled()) {
                swEvents.dispatchEvent(new Event('update-available'));
              }
            }
          });
        }
      });

      // Enable background sync for orders
      if ('sync' in registration) {
        // Request notification permission
        if ('Notification' in window) {
          Notification.requestPermission();
        }
        
        // Initialize IndexedDB for offline storage
        try {
          await openDatabase();
          console.log('Offline database initialized');
        } catch (error) {
          console.error('Failed to initialize offline database:', error);
        }
        
        // Setup listeners for sync events from service worker
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data && event.data.type === 'SYNC_COMPLETED') {
            console.log('Sync completed:', event.data);
            document.dispatchEvent(
              new CustomEvent('sync-status', { 
                detail: { 
                  success: event.data.success,
                  actionId: event.data.actionId,
                  error: event.data.error
                } 
              })
            );
          }
        });
      }

      console.log('SW registered:', registration);
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  });

  // Helper function for offline actions
  window.saveOfflineAction = async (action) => {
    if (!navigator.serviceWorker.controller) {
      console.warn('No active service worker found, cannot store offline action');
      return false;
    }
    
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.type === 'ACTION_STORED') {
          resolve(event.data.success);
        }
      };
      
      navigator.serviceWorker.controller.postMessage(
        {
          type: 'STORE_OFFLINE_ACTION',
          action
        },
        [messageChannel.port2]
      );
    });
  };

  // Handle offline/online status
  window.addEventListener('online', () => {
    console.log('Application is online');
    document.dispatchEvent(new CustomEvent('app-status', { detail: { isOnline: true } }));
    
    // Trigger background sync for any pending actions
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('sync-pending-data')
          .then(() => console.log('Background sync registered for pending data'))
          .catch(err => console.error('Background sync registration failed:', err));
      });
    }
  });

  window.addEventListener('offline', () => {
    console.log('Application is offline');
    document.dispatchEvent(new CustomEvent('app-status', { detail: { isOnline: false } }));
  });
}

// Expose service worker events to window for component access
window.swEvents = swEvents;

// Add TypeScript interface for window
declare global {
  interface Window {
    swEvents: EventTarget;
    saveOfflineAction: (action: any) => Promise<boolean>;
  }
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
