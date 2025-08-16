
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
    <div className="bg-card border-b border-border sticky top-16 z-20">
      <div className="container mx-auto px-4 py-3">
        {/* Back button and actions */}
        <div className="flex items-center justify-between mb-3">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onShare(business)}
            className="flex items-center gap-2"
          >
            <Share2 className="w-3 h-3" />
            Share
          </Button>
        </div>
        
        {/* Compact business info */}
        <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
          <Avatar className="w-12 h-12 border border-border shadow-sm flex-shrink-0">
            <AvatarImage 
              src={business.image_url} 
              alt={business.name}
            />
            <AvatarFallback className="text-sm font-semibold bg-accent/10 text-accent-foreground">
              {business.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-bold text-foreground truncate">
                {business.name}
              </h1>
              {business.is_featured && (
                <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
              )}
            </div>
            
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{business.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessHeader;
