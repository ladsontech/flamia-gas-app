import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

export const PWADebugger = () => {
  const location = useLocation();
  const params = useParams<{ slug?: string }>();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const checkPWAStatus = async () => {
      const info: any = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        pathname: location.pathname,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        isHTTPS: window.location.protocol === 'https:',
        isLocalhost: window.location.hostname === 'localhost',
      };

      // Check subdomain
      const subdomainMatch = window.location.hostname.match(/^([a-z0-9-]+)\.flamia\.store$/i);
      info.subdomain = subdomainMatch ? subdomainMatch[1] : null;
      info.isSubdomain = !!subdomainMatch;

      // Check route type
      info.isSellerRoute = /^\/shop\/[^/]+$/.test(location.pathname) && !location.pathname.startsWith('/shop/category/');
      info.isAffiliateRoute = /^\/affiliate\/[^/]+$/.test(location.pathname);
      info.slug = params.slug || info.subdomain;

      // Check manifest
      const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      info.manifestLink = manifestLink?.href || 'NOT FOUND';
      
      if (manifestLink) {
        try {
          const response = await fetch(manifestLink.href);
          info.manifestStatus = response.status;
          if (response.ok) {
            const manifest = await response.json();
            info.manifest = manifest;
          } else {
            info.manifestError = `HTTP ${response.status}`;
          }
        } catch (error: any) {
          info.manifestError = error.message;
        }
      }

      // Check service worker
      if ('serviceWorker' in navigator) {
        info.serviceWorkerSupported = true;
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            info.serviceWorker = {
              scope: registration.scope,
              active: registration.active?.scriptURL || 'none',
              state: registration.active?.state || 'none',
            };
          } else {
            info.serviceWorker = 'NOT REGISTERED';
          }
        } catch (error: any) {
          info.serviceWorkerError = error.message;
        }
      } else {
        info.serviceWorkerSupported = false;
      }

      // Check if app is installed
      info.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Check beforeinstallprompt
      info.installPromptNote = 'Listening for beforeinstallprompt event...';

      setDebugInfo(info);
    };

    checkPWAStatus();

    // Listen for beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      setDebugInfo(prev => ({
        ...prev,
        installPromptReceived: true,
        installPromptTime: new Date().toISOString()
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [location.pathname, params.slug]);

  // Show debug panel if URL has ?debug=pwa
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowDebug(params.get('debug') === 'pwa');
  }, [location.search]);

  if (!showDebug) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '50vh',
        overflow: 'auto',
        backgroundColor: '#1a1a1a',
        color: '#00ff00',
        fontFamily: 'monospace',
        fontSize: '12px',
        padding: '16px',
        zIndex: 999999,
        borderTop: '2px solid #00ff00'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <strong style={{ fontSize: '14px' }}>PWA DEBUGGER</strong>
        <button 
          onClick={() => setShowDebug(false)}
          style={{ 
            background: '#ff0000', 
            color: 'white', 
            border: 'none', 
            padding: '4px 8px',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          CLOSE
        </button>
      </div>
      <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      <div style={{ marginTop: '16px', borderTop: '1px solid #00ff00', paddingTop: '12px' }}>
        <strong>Quick Actions:</strong>
        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={async () => {
              const regs = await navigator.serviceWorker.getRegistrations();
              for (const reg of regs) {
                await reg.unregister();
              }
              alert('All service workers unregistered. Reload page.');
            }}
            style={{
              background: '#ff6600',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            Unregister All SWs
          </button>
          <button
            onClick={() => {
              window.location.href = window.location.origin + window.location.pathname;
            }}
            style={{
              background: '#0066ff',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            Hard Reload
          </button>
          <button
            onClick={() => {
              navigator.serviceWorker.getRegistrations().then(regs => {
                console.log('Service Workers:', regs);
              });
              fetch(document.querySelector('link[rel="manifest"]')?.getAttribute('href') || '')
                .then(r => r.json())
                .then(m => console.log('Manifest:', m))
                .catch(e => console.error('Manifest error:', e));
            }}
            style={{
              background: '#00aa00',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            Log to Console
          </button>
        </div>
      </div>
      <div style={{ marginTop: '12px', fontSize: '11px', opacity: 0.7 }}>
        Add ?debug=pwa to URL to show this panel. Remove to hide.
      </div>
    </div>
  );
};

