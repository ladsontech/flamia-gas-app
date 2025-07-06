
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

    const whatsappUrl = `https://wa.me/256789572007?text=${encodeURIComponent(message)}`;
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
    <Card className="group bg-white border-gray-100 shadow-sm hover:shadow-lg p-4 lg:p-6 transition-all duration-300 overflow-hidden h-full flex flex-col">
      <div className="relative w-full pb-[100%] mb-4 lg:mb-6 rounded-lg overflow-hidden bg-gray-50/80">
        <img
          src={gadget.image_url || '/images/gadget-fallback.jpg'}
          alt={gadget.name}
          className="absolute inset-0 w-full h-full object-contain p-2 lg:p-3 group-hover:scale-110 transition-transform duration-500 cursor-pointer"
          loading="lazy"
          onClick={handleCardClick}
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
            {gadget.condition === 'brand_new' ? 'New' : 'Used'}
          </Badge>
          
          {/* Stock Badge */}
          {!gadget.in_stock && (
            <Badge variant="secondary" className="text-xs px-2 py-1">
              Out of Stock
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex-grow">
        <h3 
          className="text-base sm:text-lg lg:text-xl font-semibold mb-3 lg:mb-4 text-gray-900 line-clamp-2 group-hover:text-accent transition-colors cursor-pointer"
          onClick={handleCardClick}
        >
          {gadget.name}
        </h3>
        <p className="text-muted-foreground mb-4 lg:mb-6 text-sm lg:text-base line-clamp-2">
          {gadget.description}
        </p>
      </div>
      
      <div className="pt-4 lg:pt-6 border-t border-gray-100">
        <div className="flex justify-between items-center mb-4 lg:mb-6">
          <span className="text-sm lg:text-base font-medium text-gray-600">Price</span>
          <span className="text-base sm:text-lg lg:text-xl font-semibold text-accent">
            {formatPrice(gadget.price)}
          </span>
        </div>
        <Button
          onClick={handleOrder}
          disabled={!gadget.in_stock}
          className="w-full bg-accent text-white hover:bg-accent/90 text-sm lg:text-base py-3 lg:py-4 h-11 lg:h-12 rounded-lg font-medium"
        >
          {gadget.in_stock ? 'Order Now' : 'Out of Stock'}
        </Button>
      </div>
    </Card>
  );
};

export default GadgetCard;
