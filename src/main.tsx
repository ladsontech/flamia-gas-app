
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
                
                // This will be picked up by the UpdateNotification component
                // The service worker 'message' event will handle the notification
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
  });

  window.addEventListener('offline', () => {
    console.log('Application is offline');
    document.dispatchEvent(new CustomEvent('app-status', { detail: { isOnline: false } }));
  });
}

// Expose service worker events to window for component access
window.swEvents = swEvents;

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
