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
        
        // Use Supabase function to generate manifest
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jxepxcttyhzlyljfqjgz.supabase.co';
        manifestUrl = `${supabaseUrl}/functions/v1/generate-manifest?slug=${slug}&type=${type}`;
        serviceWorkerUrl = `${supabaseUrl}/functions/v1/generate-sw?slug=${slug}&type=${type}`;
        
        // Fetch manifest to get theme color and title for meta tags
        try {
          const response = await fetch(manifestUrl);
          if (response.ok) {
            const manifest = await response.json();
            themeColor = manifest.theme_color || DEFAULT_MANIFEST.theme_color;
            appTitle = manifest.short_name || DEFAULT_MANIFEST.short_name;
          }
        } catch (error) {
          console.error('Error fetching manifest:', error);
        }
      }

      // Update manifest link tag
      let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (!manifestLink) {
        manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        document.head.appendChild(manifestLink);
      }
      manifestLink.href = manifestUrl;

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
        try {
          // Unregister any existing service workers first
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
          
          // Register the storefront-specific service worker
          const registration = await navigator.serviceWorker.register(serviceWorkerUrl, {
            scope: isSubdomain ? '/' : (isAffiliateStorefront ? `/affiliate/${params.slug}/` : `/shop/${params.slug}/`)
          });
          
          console.log('Service Worker registered:', registration);
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    updateManifest();
  }, [location.pathname, params.slug]);

  return null; // This component doesn't render anything
};

