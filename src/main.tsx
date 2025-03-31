
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

// Register Service Worker
if ('serviceWorker' in navigator) {
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
      
      console.log('SW registered:', registration);
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  });

  // Handle offline/online status
  window.addEventListener('online', () => {
    console.log('Application is online');
    document.dispatchEvent(new CustomEvent('app-status', { detail: { isOnline: true } }));
    
    // Trigger background sync for any pending actions if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        if ('sync' in registration) {
          registration.sync.register('sync-pending-data')
            .then(() => console.log('Background sync registered for pending data'))
            .catch(err => console.error('Background sync registration failed:', err));
        }
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
    saveOfflineAction?: (action: any) => Promise<boolean>;
  }
  
  interface ServiceWorkerRegistration {
    sync?: {
      register(tag: string): Promise<void>;
    };
  }
  
  interface WindowEventMap {
    'app-status': CustomEvent<{ isOnline: boolean }>;
  }
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
