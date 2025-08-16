
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Share2, MapPin, Star } from 'lucide-react';
import { Business } from '@/types/business';

interface BusinessHeaderProps {
  business: Business;
  onBack: () => void;
  onShare: (business: Business) => void;
}

const BusinessHeader: React.FC<BusinessHeaderProps> = ({ business, onBack, onShare }) => {
  return (
    <div className="bg-white border-b border-gray-100 sticky top-16 z-20">
      <div className="container mx-auto px-4 py-4">
        {/* Back button and actions */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => onShare(business)}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
        
        {/* Business info card */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
              <AvatarImage 
                src={business.image_url} 
                alt={business.name}
              />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {business.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {business.name}
                </h1>
                {business.is_featured && (
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                )}
              </div>
              
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">{business.location}</span>
              </div>
              
              {business.description && (
                <p className="text-gray-700 text-sm leading-relaxed">
                  {business.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessHeader;
