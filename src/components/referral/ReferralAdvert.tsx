import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import referralAdvertImage from '@/assets/referral-advert.png';

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
  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = 'flamia-gas-delivery.png';
    link.href = referralAdvertImage;
    link.click();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Download Button */}
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

      {/* Advert Image */}
      <div className="flex justify-center">
        <img 
          src={referralAdvertImage} 
          alt="Flamia Gas Delivery Referral Advert" 
          className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200"
        />
      </div>
    </div>
  );
};

// Demo component
export default function ReferralAdvertDemo() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Referral Advert Component
        </h1>
        <ReferralAdvert 
          referralCode="FLAME123"
          referralLink="https://flamia.app/ref/FLAME123"
          userName="John"
        />
      </div>
    </div>
  );
}