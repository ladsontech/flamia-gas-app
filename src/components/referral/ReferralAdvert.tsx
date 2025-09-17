import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, Download } from 'lucide-react';
import { QRCodeGenerator } from './QRCodeGenerator';
import { LionFlameLogo } from '@/components/ui/LionFlameLogo';

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
        link.download = `flamia-referral-${referralCode}.png`;
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
          Print Advert
        </Button>
        <Button onClick={handleDownload} variant="outline" size="sm" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>
      </div>

      <Card 
        id="referral-advert" 
        className="w-full max-w-md mx-auto bg-white border-2 border-accent print:shadow-none"
        style={{ aspectRatio: '3/4' }}
      >
        <CardContent className="p-6 h-full flex flex-col justify-between text-center">
          {/* Header with Logo */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <LionFlameLogo size={60} className="text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-accent">FLAMIA</h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Get your gas delivered fast & fresh!
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-4">
            <div className="bg-accent/10 rounded-lg p-4 space-y-3">
              <h2 className="text-lg font-semibold text-accent">
                🎉 Special Offer!
              </h2>
              <p className="text-sm text-gray-700">
                Order gas through Flamia using my referral code and get amazing deals!
              </p>
              
              <div className="bg-white rounded-md p-3 border border-accent/20">
                <p className="text-xs text-gray-500 mb-1">Referral Code:</p>
                <p className="text-lg font-mono font-bold text-accent tracking-wider">
                  {referralCode}
                </p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-3 rounded-lg border-2 border-accent/20">
                <QRCodeGenerator value={referralLink} size={120} />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Scan QR code or use referral code when ordering
            </p>
          </div>

          {/* Footer */}
          <div className="space-y-2">
            <div className="flex justify-center items-center space-x-4 text-xs text-gray-500">
              <span>🚚 Fast Delivery</span>
              <span>💯 Quality Gas</span>
              <span>📱 Easy Ordering</span>
            </div>
            <p className="text-xs text-accent font-medium">
              Order now at flamia.app
            </p>
            <p className="text-xs text-gray-400">
              Referred by: {userName}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};