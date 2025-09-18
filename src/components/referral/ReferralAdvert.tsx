import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { QRCodeGenerator } from '@/components/referral/QRCodeGenerator';

interface ReferralAdvertProps {
  referralCode: string;
  referralLink: string;
  userName?: string;
}

export const ReferralAdvert: React.FC<ReferralAdvertProps> = ({
  referralLink
}) => {
  const handleDownload = async () => {
    const element = document.getElementById('referral-advert');
    if (element) {
      try {
        // Import html2canvas dynamically
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 2,
        });
        
        const link = document.createElement('a');
        link.download = `flamia-gas-delivery.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Download Button - Fixed width and positioning */}
      <div className="flex justify-center">
        <Button 
          onClick={handleDownload} 
          variant="outline" 
          size="sm" 
          className="px-6 py-2 min-w-[140px]"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>
      </div>

      {/* Main Card - Fixed overflow and improved spacing */}
      <Card 
        id="referral-advert" 
        className="w-full max-w-[300px] mx-auto bg-white border-2 border-orange-500 shadow-lg overflow-hidden"
      >
        <CardContent className="p-0">
          {/* Container with proper height and flex layout */}
          <div className="h-[400px] flex flex-col justify-between p-6 text-center">
            
            {/* Header Section - Fixed spacing */}
            <div className="flex-shrink-0 space-y-3">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-xl">F</span>
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-orange-600 tracking-wide">FLAMIA</h1>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Uganda's fastest gas delivery service
                </p>
              </div>
            </div>

            {/* Main Content Section - Improved spacing and no overflow */}
            <div className="flex-1 flex flex-col justify-center space-y-4 py-4">
              {/* Features Box */}
              <div className="bg-orange-50 rounded-lg p-4 space-y-3 border border-orange-100">
                <h2 className="text-lg font-semibold text-orange-600">
                  🚀 Fast Gas Delivery!
                </h2>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-start text-left space-x-2">
                    <div className="flex-shrink-0 space-y-1">
                      <p>✅</p>
                      <p>✅</p>
                      <p>✅</p>
                      <p>✅</p>
                    </div>
                    <div className="space-y-1">
                      <p>Instant delivery available</p>
                      <p>All gas brands & sizes</p>
                      <p>Full cylinders & refills</p>
                      <p>Safe & reliable service</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Section - Centered and properly sized */}
              <div className="flex flex-col items-center space-y-2">
                <div className="bg-white p-3 rounded-lg border-2 border-orange-200 shadow-sm">
                  <QRCodeGenerator 
                    value={referralLink} 
                    size={80} 
                  />
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Scan to order gas instantly
                </p>
              </div>
            </div>

            {/* Footer Section - Fixed positioning */}
            <div className="flex-shrink-0 space-y-2 border-t border-gray-200 pt-4">
              <p className="text-sm font-bold text-orange-600">
                Order now at flamia.app
              </p>
              <p className="text-xs text-gray-500">
                Making gas delivery simple & fast
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
