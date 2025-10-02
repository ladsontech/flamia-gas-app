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
          Download QR Code
        </Button>
      </div>

      <Card 
        id="referral-advert" 
        className="w-full max-w-[280px] mx-auto bg-white border-2 border-accent"
      >
        <CardContent className="p-6 flex justify-center items-center">
          <div className="bg-white p-3 rounded-lg border-2 border-accent/20">
            <QRCodeGenerator value={referralLink} size={200} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};