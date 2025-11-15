import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
      let manifestData: ManifestData = DEFAULT_MANIFEST;
      
      // Check if we're on a seller storefront
      const isSellerStorefront = /^\/shop\/[^/]+$/.test(location.pathname) && 
                                 !location.pathname.startsWith('/shop/category/');
      const isAffiliateStorefront = /^\/affiliate\/[^/]+$/.test(location.pathname);
      
      // Check for subdomain
      const subdomainMatch = typeof window !== 'undefined' 
        ? window.location.hostname.match(/^([a-z0-9-]+)\.flamia\.store$/i) 
        : null;
      const isSubdomain = !!subdomainMatch;
      const subdomainSlug = subdomainMatch?.[1];

      if (isSellerStorefront || isAffiliateStorefront || isSubdomain) {
        try {
          const slug = params.slug || subdomainSlug;
          
          if (isSellerStorefront || isSubdomain) {
            // Fetch seller shop data
            const { data: shopData, error } = await supabase
              .from('seller_shops')
              .select('shop_name, description, logo_url, theme_color, slug')
              .eq('slug', slug)
              .eq('is_active', true)
              .single();

            if (!error && shopData) {
              manifestData = {
                name: `${shopData.shop_name} - Online Store`,
                short_name: shopData.shop_name,
                description: shopData.description || `Shop at ${shopData.shop_name}`,
                start_url: isSubdomain ? `/?source=pwa` : `/shop/${shopData.slug}?source=pwa`,
                icon_url: shopData.logo_url || undefined,
                theme_color: shopData.theme_color || "#FF4D00"
              };
            }
          } else if (isAffiliateStorefront) {
            // Fetch affiliate shop data
            const { data: shopData, error } = await supabase
              .from('affiliate_shops')
              .select('shop_name, description, logo_url, theme_color, slug')
              .eq('slug', slug)
              .eq('is_active', true)
              .single();

            if (!error && shopData) {
              manifestData = {
                name: `${shopData.shop_name} - Affiliate Store`,
                short_name: shopData.shop_name,
                description: shopData.description || `Shop at ${shopData.shop_name}`,
                start_url: `/affiliate/${shopData.slug}?source=pwa`,
                icon_url: shopData.logo_url || undefined,
                theme_color: shopData.theme_color || "#FF4D00"
              };
            }
          }
        } catch (error) {
          console.error('Error fetching shop data for manifest:', error);
        }
      }

      // Generate manifest object
      const manifest = {
        name: manifestData.name,
        short_name: manifestData.short_name,
        description: manifestData.description,
        start_url: manifestData.start_url,
        display: "standalone",
        display_override: ["tabbed", "window-controls-overlay", "standalone", "minimal-ui"],
        background_color: "#FFFFFF",
        theme_color: manifestData.theme_color,
        orientation: "portrait-primary",
        categories: ["shopping", "business"],
        icons: [
          {
            src: manifestData.icon_url || "/images/icon.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: manifestData.icon_url || "/images/icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: manifestData.icon_url || "/images/icon.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: manifestData.icon_url || "/images/icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        scope: "/",
        id: manifestData.short_name.toLowerCase().replace(/\s+/g, '-') + "-pwa",
        lang: "en",
        dir: "ltr"
      };

      // Convert manifest to blob URL
      const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const manifestURL = URL.createObjectURL(manifestBlob);

      // Update manifest link tag
      let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (!manifestLink) {
        manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        document.head.appendChild(manifestLink);
      }
      manifestLink.href = manifestURL;

      // Update theme color meta tag
      let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.name = 'theme-color';
        document.head.appendChild(themeColorMeta);
      }
      themeColorMeta.content = manifestData.theme_color;

      // Update apple mobile web app title
      let appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]') as HTMLMetaElement;
      if (!appleTitleMeta) {
        appleTitleMeta = document.createElement('meta');
        appleTitleMeta.name = 'apple-mobile-web-app-title';
        document.head.appendChild(appleTitleMeta);
      }
      appleTitleMeta.content = manifestData.short_name;

      // Update document title for storefronts
      if (isSellerStorefront || isAffiliateStorefront || isSubdomain) {
        document.title = manifestData.name;
      }

      // Cleanup: revoke old blob URLs when component unmounts or updates
      return () => {
        URL.revokeObjectURL(manifestURL);
      };
    };

    updateManifest();
  }, [location.pathname, params.slug]);

  return null; // This component doesn't render anything
};

