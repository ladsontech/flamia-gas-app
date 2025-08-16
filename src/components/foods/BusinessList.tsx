
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Star } from 'lucide-react';
import { Business } from '@/types/business';

interface BusinessListProps {
  businesses: Business[];
  onBusinessSelect: (business: Business) => void;
}

const BusinessList: React.FC<BusinessListProps> = ({ businesses, onBusinessSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {businesses.map((business) => (
        <Card 
          key={business.id} 
          className="group cursor-pointer hover:shadow-lg transition-all duration-300 bg-white"
          onClick={() => onBusinessSelect(business)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-4 mb-3">
              <Avatar className="w-12 h-12 border-2 border-gray-100">
                <AvatarImage 
                  src={business.image_url} 
                  alt={business.name}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {business.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {business.name}
                  </h3>
                  {business.is_featured && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                  )}
                </div>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="text-sm truncate">{business.location}</span>
                </div>
              </div>
            </div>
            
            {business.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {business.description}
              </p>
            )}
            
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              View Menu
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BusinessList;
