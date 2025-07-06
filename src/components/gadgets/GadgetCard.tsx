
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { Gadget } from '@/types/gadget';
import { useNavigate } from 'react-router-dom';

interface GadgetCardProps {
  gadget: Gadget;
}

const GadgetCard: React.FC<GadgetCardProps> = ({ gadget }) => {
  const navigate = useNavigate();

  const handleOrder = () => {
    navigate(`/order?gadget=${gadget.id}`);
  };

  const discountPercentage = gadget.original_price 
    ? Math.round(((gadget.original_price - gadget.price) / gadget.original_price) * 100)
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group h-full flex flex-col bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 overflow-hidden">
      {/* Square Image Container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={gadget.image_url || '/images/gadget-fallback.jpg'}
          alt={gadget.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {/* Condition Badge */}
          <Badge 
            className={`text-xs px-2 py-1 ${
              gadget.condition === 'brand_new' 
                ? 'bg-green-500 text-white' 
                : 'bg-yellow-500 text-white'
            }`}
          >
            {gadget.condition === 'brand_new' ? 'Brand New' : 'Used'}
          </Badge>
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <Badge className="bg-red-500 text-white text-xs px-2 py-1">
              -{discountPercentage}%
            </Badge>
          )}
          
          {/* Stock Badge */}
          {!gadget.in_stock && (
            <Badge variant="secondary" className="text-xs">
              Out of Stock
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-3 flex-grow flex flex-col">
        {/* Title */}
        <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 mb-2 group-hover:text-accent transition-colors">
          {gadget.name}
        </h3>
        
        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-3 flex-grow">
          {gadget.description}
        </p>

        {/* Price */}
        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-accent">
              {formatPrice(gadget.price)}
            </span>
            {gadget.original_price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(gadget.original_price)}
              </span>
            )}
          </div>
        </div>

        {/* Order Button */}
        <Button
          onClick={handleOrder}
          disabled={!gadget.in_stock}
          className="w-full bg-accent hover:bg-accent/90 text-white text-xs py-2 h-8 font-semibold transition-all duration-300 group-hover:shadow-lg mt-3"
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          {gadget.in_stock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GadgetCard;
