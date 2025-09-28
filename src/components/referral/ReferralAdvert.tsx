import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { QRCodeGenerator } from './QRCodeGenerator';

interface ReferralAdvertProps {
  referralCode: string;
  referralLink: string;
  userName?: string;
}

export const ReferralAdvert: React.FC<ReferralAdvertProps> = ({
  referralCode,
  referralLink,
  userName = "Friend"
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
    <div className="space-y-4">
      <div className="flex">
        <Button onClick={handleDownload} variant="outline" size="sm" className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>
      </div>

      <Card 
        id="referral-advert" 
        className="w-full max-w-[280px] sm:max-w-sm mx-auto bg-white border-2 border-accent print:shadow-none print:max-w-none"
        style={{ aspectRatio: '3/4' }}
      >
        <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-between text-center">
          {/* Header with Logo */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-center">
              <img 
                src="/images/icon.png" 
                alt="Flamia Logo" 
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-accent">FLAMIA</h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Uganda's fastest gas delivery service
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-accent/10 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
              <h2 className="text-base sm:text-lg font-semibold text-accent text-center">
                🚀 Fast Gas Delivery!
              </h2>
              <div className="space-y-1 text-xs sm:text-sm text-gray-700 text-left">
                <p>✅ Same-day delivery available</p>
                <p>✅ All gas brands & sizes</p>
                <p>✅ Full cylinders & refills</p>
                <p>✅ Safe & reliable service</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center overflow-hidden">
              <div className="bg-white p-2 sm:p-3 rounded-lg border-2 border-accent/20 flex-shrink-0">
                <QRCodeGenerator value={referralLink} size={80} className="w-20 h-20 sm:w-24 sm:h-24" />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Scan to order gas instantly
            </p>
          </div>

          {/* Footer */}
          <div className="space-y-3">
            <div className="space-y-1 border-t border-gray-200 pt-2">
              <p className="text-xs sm:text-sm font-bold text-accent">
                Order now at flamia.app
              </p>
              <p className="text-xs text-gray-400">
                Making gas delivery simple & fast
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};