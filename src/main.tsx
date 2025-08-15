
import React, { StrictMode } from 'react';
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

// Check if we're in a development environment that doesn't support Service Workers
const isServiceWorkerSupported = () => {
  // Check if Service Workers are supported by the browser
  if (!('serviceWorker' in navigator)) {
    return false;
  }
  
  // Check if we're in StackBlitz or similar environment
  const hostname = window.location.hostname;
  const isStackBlitz = hostname.includes('stackblitz') || hostname.includes('webcontainer');
  
  return !isStackBlitz;
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

// Helper to save offline action
const saveOfflineAction = async (action: any): Promise<boolean> => {
  // First try to use the service worker if available
  if (isServiceWorkerSupported() && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve) => {
      // Create a message channel to receive the response
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.type === 'ACTION_SAVED') {
          resolve(event.data.success);
        }
      };
      
      // Send the action to the service worker
      navigator.serviceWorker.controller.postMessage({
        type: 'SAVE_OFFLINE_ACTION',
        action: action
      }, [messageChannel.port2]);
    });
  } 
  
  // Fallback to direct IndexedDB if service worker isn't available
  try {
    const db = await openDatabase() as IDBDatabase;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('pending-actions', 'readwrite');
      const store = transaction.objectStore('pending-actions');
      
      const request = store.add(action);
      
      request.onsuccess = () => {
        console.log('Action saved for sync:', action);
        resolve(true);
      };
      
      request.onerror = () => {
        console.error('Failed to save action:', request.error);
        reject(false);
      };
    });
  } catch (error) {
    console.error('Error saving offline action:', error);
    return false;
  }
};

// Register Service Worker only if supported
if (isServiceWorkerSupported()) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Function to check for updates
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

      // Initialize IndexedDB for offline storage
      try {
        await openDatabase();
        console.log('Offline database initialized');
      } catch (error) {
        console.error('Failed to initialize offline database:', error);
      }
      
      // Register for periodic background sync if supported
      if ('periodicSync' in registration) {
        try {
          const status = await navigator.permissions.query({
            name: 'periodic-background-sync' as PermissionName,
          });
          
          if (status.state === 'granted') {
            await registration.periodicSync.register('content-sync', {
              minInterval: 24 * 60 * 60 * 1000, // 24 hours
            });
            console.log('Periodic background sync registered');
          }
        } catch (error) {
          console.error('Error registering periodic background sync:', error);
        }
      }
      
      console.log('SW registered:', registration);
    } catch (error) {
      console.log('Service Worker registration skipped - not supported in this environment');
    }
  });

  // Handle offline/online status
  window.addEventListener('online', () => {
    console.log('Application is online');
    document.dispatchEvent(new CustomEvent('app-status', { detail: { isOnline: true } }));
    
    // Trigger background sync for any pending actions if supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        // Check if background sync is supported before using it
        if ('sync' in registration) {
          registration.sync.register('sync-pending-data')
            .then(() => console.log('Background sync registered for pending data'))
            .catch(err => console.error('Background sync registration failed:', err));
        } else {
          console.log('Background Sync API not supported');
        }
      });
    }
  });

  window.addEventListener('offline', () => {
    console.log('Application is offline');
    document.dispatchEvent(new CustomEvent('app-status', { detail: { isOnline: false } }));
  });

  // Make the saveOfflineAction function available globally
  window.saveOfflineAction = saveOfflineAction;
} else {
  console.log('Service Worker not supported in this environment - PWA features will be limited');
  
  // Still initialize IndexedDB for offline storage even without service worker
  window.addEventListener('load', async () => {
    try {
      await openDatabase();
      console.log('Offline database initialized (without service worker)');
    } catch (error) {
      console.error('Failed to initialize offline database:', error);
    }
  });

  // Handle offline/online status even without service worker
  window.addEventListener('online', () => {
    console.log('Application is online');
    document.dispatchEvent(new CustomEvent('app-status', { detail: { isOnline: true } }));
  });

  window.addEventListener('offline', () => {
    console.log('Application is offline');
    document.dispatchEvent(new CustomEvent('app-status', { detail: { isOnline: false } }));
  });

  // Provide a fallback saveOfflineAction function
  window.saveOfflineAction = saveOfflineAction;
}

// Expose service worker events to window for component access
window.swEvents = swEvents;

// Add TypeScript interface for window
declare global {
  interface Window {
    swEvents: EventTarget;
    saveOfflineAction?: (action: any) => Promise<boolean>;
  }
  
  interface ServiceWorkerRegistration {
    periodicSync?: {
      register(tag: string, options?: { minInterval: number }): Promise<void>;
    };
    // Adding the sync property to the ServiceWorkerRegistration interface
    sync?: {
      register(tag: string): Promise<void>;
    };
  }
  
  interface WindowEventMap {
    'app-status': CustomEvent<{ isOnline: boolean }>;
  }
}

const root = createRoot(container);

// Render the app with proper React context
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
