import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, Download } from 'lucide-react';
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
  const handlePrint = () => {
    const printContent = document.getElementById('referral-advert');
    if (printContent) {
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent.outerHTML;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // Reload to restore functionality
    }
  };

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
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handlePrint} variant="outline" size="sm" className="flex-1">
          <Printer className="w-4 h-4 mr-2" />
          Print Poster
        </Button>
        <Button onClick={handleDownload} variant="outline" size="sm" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>
      </div>

      <Card 
        id="referral-advert" 
        className="w-full max-w-xs sm:max-w-sm mx-auto bg-white border-2 border-accent print:shadow-none print:max-w-none"
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
              <h2 className="text-base sm:text-lg font-semibold text-accent">
                🚀 Fast Gas Delivery!
              </h2>
              <div className="space-y-2 text-xs sm:text-sm text-gray-700">
                <p>✅ Same-day delivery available</p>
                <p>✅ All gas brands & sizes</p>
                <p>✅ Full cylinders & refills</p>
                <p>✅ Safe & reliable service</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-2 sm:p-3 rounded-lg border-2 border-accent/20">
                <QRCodeGenerator value={referralLink} size={100} className="sm:w-28 sm:h-28" />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Scan to order gas instantly
            </p>
          </div>

          {/* Footer */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
              <span>📱 Mobile App</span>
              <span>💳 Easy Payment</span>
              <span>🔒 Secure</span>
              <span>⭐ Trusted</span>
            </div>
            <div className="space-y-1">
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