import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

interface ManifestData {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  icon_url?: string;
  theme_color: string;
}

const DEFAULT_MANIFEST = {
  name: "Flamia - Gas Delivery Service",
  short_name: "Flamia",
  description: "Quick and reliable gas delivery service in Uganda",
  start_url: "/?source=pwa",
  theme_color: "#FF4D00"
};

export const DynamicManifest = () => {
  const location = useLocation();
  const params = useParams<{ slug?: string }>();

  useEffect(() => {
    const updateManifest = async () => {
      console.log('[DynamicManifest] Starting update...');
      
      // Default to Flamia manifest
      let manifestUrl = '/manifest.json';
      let themeColor = DEFAULT_MANIFEST.theme_color;
      let appTitle = DEFAULT_MANIFEST.short_name;
      let serviceWorkerUrl = '/sw.js';
      
      // Check if we're on a seller storefront or affiliate storefront
      const isSellerStorefront = /^\/shop\/[^/]+$/.test(location.pathname) && 
                                 !location.pathname.startsWith('/shop/category/');
      const isAffiliateStorefront = /^\/affiliate\/[^/]+$/.test(location.pathname);
      
      // Check for subdomain
      const subdomainMatch = typeof window !== 'undefined' 
        ? window.location.hostname.match(/^([a-z0-9-]+)\.flamia\.store$/i) 
        : null;
      const isSubdomain = !!subdomainMatch;
      const subdomainSlug = subdomainMatch?.[1];

      // If on a storefront, use dynamic manifest from API
      if (isSellerStorefront || isAffiliateStorefront || isSubdomain) {
        const slug = params.slug || subdomainSlug;
        const type = isAffiliateStorefront ? 'affiliate' : 'seller';
        
        console.log('[DynamicManifest] Detected storefront:', { 
          slug, 
          type, 
          isSubdomain,
          isSellerStorefront,
          isAffiliateStorefront,
          pathname: location.pathname
        });
        
        // Use Supabase function to generate manifest
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jxepxcttyhzlyljfqjgz.supabase.co';
        manifestUrl = `${supabaseUrl}/functions/v1/generate-manifest?slug=${slug}&type=${type}`;
        
        console.log('[DynamicManifest] Manifest URL:', manifestUrl);
        
        // Use local service worker that auto-detects storefront
        serviceWorkerUrl = '/storefront-sw.js';
        
        // Fetch manifest to get theme color and title for meta tags
        try {
          console.log('[DynamicManifest] Fetching manifest...');
          const response = await fetch(manifestUrl);
          console.log('[DynamicManifest] Manifest response status:', response.status);
          
          if (response.ok) {
            const manifest = await response.json();
            console.log('[DynamicManifest] Manifest data:', manifest);
            
            themeColor = manifest.theme_color || DEFAULT_MANIFEST.theme_color;
            appTitle = manifest.short_name || DEFAULT_MANIFEST.short_name;
            
            // Update document title
            document.title = manifest.name || appTitle;
            console.log('[DynamicManifest] Updated title to:', document.title);
          } else {
            console.error('[DynamicManifest] Manifest fetch failed:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('[DynamicManifest] Error fetching manifest:', error);
        }
      }

      // Update manifest link tag
      let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (!manifestLink) {
        manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        document.head.appendChild(manifestLink);
        console.log('[DynamicManifest] Created new manifest link');
      }
      manifestLink.href = manifestUrl;
      console.log('[DynamicManifest] Set manifest href to:', manifestUrl);

      // Update theme color meta tag
      let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.name = 'theme-color';
        document.head.appendChild(themeColorMeta);
      }
      themeColorMeta.content = themeColor;

      // Update apple mobile web app title
      let appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]') as HTMLMetaElement;
      if (!appleTitleMeta) {
        appleTitleMeta = document.createElement('meta');
        appleTitleMeta.name = 'apple-mobile-web-app-title';
        document.head.appendChild(appleTitleMeta);
      }
      appleTitleMeta.content = appTitle;

      // Register service worker for storefronts
      if ((isSellerStorefront || isAffiliateStorefront || isSubdomain) && 'serviceWorker' in navigator) {
        const scope = isSubdomain ? '/' : (isAffiliateStorefront ? `/affiliate/${params.slug}/` : `/shop/${params.slug}/`);
        console.log('[DynamicManifest] Registering service worker:', { serviceWorkerUrl, scope });
        
        try {
          // Check if there's already a registration
          const existingRegistration = await navigator.serviceWorker.getRegistration();
          console.log('[DynamicManifest] Existing registration:', existingRegistration?.active?.scriptURL);
          
          // Only register if not already registered with this SW
          if (!existingRegistration || existingRegistration.active?.scriptURL !== new URL(serviceWorkerUrl, window.location.origin).href) {
            // Unregister old service workers
            if (existingRegistration) {
              console.log('[DynamicManifest] Unregistering old SW');
              await existingRegistration.unregister();
            }
            
            // Register the storefront service worker
            console.log('[DynamicManifest] Registering new SW...');
            const registration = await navigator.serviceWorker.register(serviceWorkerUrl, { scope });
            
            console.log('[DynamicManifest] ✅ Service Worker registered:', registration);
            
            // Wait for the service worker to be ready
            await navigator.serviceWorker.ready;
            console.log('[DynamicManifest] ✅ Service Worker ready');
          } else {
            console.log('[DynamicManifest] ℹ️ Service Worker already registered');
          }
        } catch (error) {
          console.error('[DynamicManifest] ❌ Service Worker registration failed:', error);
        }
      } else {
        console.log('[DynamicManifest] Not a storefront or SW not supported');
      }
    };

    updateManifest();
  }, [location.pathname, params.slug]);

  return null; // This component doesn't render anything
};

