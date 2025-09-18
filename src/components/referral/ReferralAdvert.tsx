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
  referralCode,
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
          useCORS: true,
          allowTaint: true,
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
    <div className="w-full max-w-sm mx-auto space-y-4">
      {/* Download Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleDownload} 
          variant="outline" 
          size="sm" 
          className="px-4 py-2"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>
      </div>

      {/* Main Card */}
      <Card 
        id="referral-advert" 
        className="w-full max-w-[280px] mx-auto bg-white border-2 border-primary shadow-lg overflow-hidden"
      >
        <CardContent className="p-0">
          {/* Container with proper height and flex layout */}
          <div className="h-[380px] flex flex-col justify-between p-5 text-center">
            
            {/* Header Section */}
            <div className="flex-shrink-0 space-y-3">
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">F</span>
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-primary tracking-wide">FLAMIA</h1>
                <p className="text-xs text-muted-foreground">
                  Uganda's fastest gas delivery
                </p>
              </div>
            </div>

            {/* Main Content Section */}
            <div className="flex-1 flex flex-col justify-center space-y-3 py-3">
              {/* Features Box */}
              <div className="bg-primary/5 rounded-lg p-3 space-y-2 border border-primary/20">
                <h2 className="text-base font-semibold text-primary">
                  🚀 Fast Gas Delivery!
                </h2>
                <div className="space-y-1 text-xs text-foreground">
                  <div className="flex items-start text-left space-x-2">
                    <div className="flex-shrink-0 space-y-0.5">
                      <p>✅</p>
                      <p>✅</p>
                      <p>✅</p>
                      <p>✅</p>
                    </div>
                    <div className="space-y-0.5">
                      <p>Instant delivery available</p>
                      <p>All gas brands & sizes</p>
                      <p>Full cylinders & refills</p>
                      <p>Safe & reliable service</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center space-y-2">
                <div className="bg-white p-2 rounded-lg border-2 border-primary/20 shadow-sm">
                  <QRCodeGenerator 
                    value={referralLink} 
                    size={70} 
                  />
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  Scan to order gas instantly
                </p>
              </div>
            </div>

            {/* Footer Section */}
            <div className="flex-shrink-0 space-y-1 border-t border-border pt-3">
              <p className="text-sm font-bold text-primary">
                Order now at flamia.app
              </p>
              <p className="text-xs text-muted-foreground">
                Making gas delivery simple & fast
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
