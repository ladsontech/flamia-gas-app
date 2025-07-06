
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
    const productDetailUrl = `${window.location.origin}/gadget/${gadget.id}`;
    const message = `Hello, I'm interested in this product:

*${gadget.name}*

${gadget.description}

Price: ${formatPrice(gadget.price)}

Product Details: ${productDetailUrl}

Please let me know about availability and delivery options.`;

    const whatsappUrl = `https://wa.me/25678972007?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCardClick = () => {
    navigate(`/gadget/${gadget.id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group h-full flex flex-col bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 overflow-hidden">
      {/* Image Container - Same size as brand cards */}
      <div 
        className="relative h-24 sm:h-28 md:h-32 bg-gray-50 overflow-hidden cursor-pointer rounded-t-md"
        onClick={handleCardClick}
      >
        <img
          src={gadget.image_url || '/images/gadget-fallback.jpg'}
          alt={gadget.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-1 left-1 flex flex-col gap-1">
          {/* Condition Badge */}
          <Badge 
            className={`text-xs px-1 py-0.5 ${
              gadget.condition === 'brand_new' 
                ? 'bg-green-500 text-white' 
                : 'bg-yellow-500 text-white'
            }`}
          >
            {gadget.condition === 'brand_new' ? 'New' : 'Used'}
          </Badge>
          
          {/* Stock Badge */}
          {!gadget.in_stock && (
            <Badge variant="secondary" className="text-xs px-1 py-0.5">
              Out of Stock
            </Badge>
          )}
        </div>
      </div>

      {/* Content - Same padding as brand cards */}
      <CardContent className="p-2 sm:p-3 flex-grow flex flex-col">
        {/* Title */}
        <h3 
          className="font-semibold text-sm sm:text-base line-clamp-2 text-gray-900 mb-1 group-hover:text-accent transition-colors cursor-pointer leading-tight"
          onClick={handleCardClick}
        >
          {gadget.name}
        </h3>
        
        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 flex-grow leading-relaxed">
          {gadget.description}
        </p>

        {/* Price */}
        <div className="mb-2">
          <span className="font-bold text-sm sm:text-base text-accent">
            {formatPrice(gadget.price)}
          </span>
        </div>

        {/* Order Button - Same size as brand cards */}
        <Button
          onClick={handleOrder}
          disabled={!gadget.in_stock}
          className="w-full bg-accent hover:bg-accent/90 text-white text-xs py-1 h-auto font-semibold transition-all duration-300"
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          {gadget.in_stock ? 'Order Now' : 'Out of Stock'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GadgetCard;
