import { ReactNode } from 'react';
import { Helmet } from 'react-helmet';
import { StorefrontHeader } from './StorefrontHeader';
import { SUPABASE_URL } from '@/integrations/supabase/client';

interface StorefrontLayoutProps {
  children: ReactNode;
  shopName: string;
  shopSlug: string;
  shopDescription?: string;
  shopLogoUrl?: string;
  isOwner: boolean;
  shopType: 'seller' | 'affiliate';
  onShowAnalytics?: () => void;
}

export const StorefrontLayout = ({
  children,
  shopName,
  shopSlug,
  shopDescription,
  shopLogoUrl,
  isOwner,
  shopType,
  onShowAnalytics
}: StorefrontLayoutProps) => {
  const canonicalUrl = shopType === 'affiliate' 
    ? `https://flamia.store/affiliate/${shopSlug}`
    : `https://${shopSlug}.flamia.store/`;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>{shopName} – {shopType === 'affiliate' ? 'Affiliate' : ''} Store | Flamia</title>
        <meta name="description" content={`Shop ${shopName}: ${shopDescription || 'Discover quality products'}`} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Dynamic PWA Manifest with store logo */}
        <link 
          rel="manifest" 
          href={`${SUPABASE_URL}/functions/v1/generate-manifest?slug=${shopSlug}&type=${shopType}`}
        />
        <meta name="theme-color" content="#00b341" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={shopName} />
        
        {shopLogoUrl && (
          <>
            <link rel="apple-touch-icon" href={shopLogoUrl} />
            <link rel="icon" type="image/png" sizes="192x192" href={shopLogoUrl} />
            <link rel="icon" type="image/png" sizes="512x512" href={shopLogoUrl} />
          </>
        )}
      </Helmet>

      {/* Header - Always visible */}
      <StorefrontHeader
        shopName={shopName}
        shopLogoUrl={shopLogoUrl}
        isOwner={isOwner}
        shopType={shopType}
        onShowAnalytics={onShowAnalytics}
      />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

