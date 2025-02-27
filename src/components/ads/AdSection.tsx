
import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSection = () => {
  useEffect(() => {
    try {
      // Push the ad only if adsbygoogle is defined
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (err) {
      console.error('Error loading AdSense:', err);
    }
  }, []);

  return (
    <div className="w-full py-6 bg-gray-50">
      <div className="container mx-auto px-4">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="YOUR-AD-CLIENT-ID" // Replace with your actual AdSense client ID
          data-ad-slot="YOUR-AD-SLOT-ID" // Replace with your actual ad slot ID
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};

export default AdSection;
