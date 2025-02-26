
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found!");
}

// Register Service Worker with update handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available
              if (confirm('New version available! Would you like to update?')) {
                window.location.reload();
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

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
