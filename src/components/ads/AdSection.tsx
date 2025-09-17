
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSection = () => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Add a delay to ensure React is fully mounted
    const timer = setTimeout(() => {
      if (!mountedRef.current) return;
      
      try {
        // Check if AdSense script is loaded and component is still mounted
        if (window.adsbygoogle && adRef.current && !isAdLoaded && !hasError) {
          // Use requestAnimationFrame to ensure we're not interfering with React's render cycle
          requestAnimationFrame(() => {
            if (mountedRef.current && !isAdLoaded) {
              try {
                window.adsbygoogle.push({});
                setIsAdLoaded(true);
              } catch (error) {
                console.error('Error pushing AdSense ad:', error);
                setHasError(true);
              }
            }
          });
        }
      } catch (err) {
        console.error('Error loading AdSense:', err);
        setHasError(true);
      }
    }, 1000); // Delay to ensure React context is stable

    return () => clearTimeout(timer);
  }, [isAdLoaded, hasError]);

  // Don't render if there's an error or during SSR
  if (hasError || typeof window === 'undefined') {
    return null;
  }

  return (
    <div className="w-full py-6 bg-gray-50" ref={adRef}>
      <div className="container mx-auto px-4">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9672218168779497"
          data-ad-slot="YOUR-AD-SLOT-ID" // You'll need to replace this with your actual ad slot ID
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};

export default AdSection;
