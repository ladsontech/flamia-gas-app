
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gadget } from '@/types/gadget';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';

interface GadgetCardProps {
  gadget: Gadget;
}

const GadgetCard: React.FC<GadgetCardProps> = ({ gadget }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleOrderClick = () => {
    addToCart({
      type: 'gadget',
      name: gadget.name,
      quantity: 1,
      price: gadget.price,
      description: gadget.description,
      gadgetId: gadget.id,
      image: gadget.image_url
    });
    
    toast({
      title: "Added to Cart!",
      description: `${gadget.name} has been added to your cart.`,
    });
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
    <Card className="group bg-white border-gray-100 shadow-sm hover:shadow-lg p-2 lg:p-2 transition-all duration-300 overflow-hidden h-full flex flex-col">
      <div className="relative w-full pb-[100%] mb-3 lg:mb-4 rounded-lg overflow-hidden bg-white">
        <img
          src={gadget.image_url || '/images/gadget-fallback.jpg'}
          alt={gadget.name}
          className="absolute inset-0 w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-500 cursor-pointer"
          loading="lazy"
          onClick={handleCardClick}
        />
        
        {/* Badges */}
        <div className="absolute top-1 left-1 flex flex-col gap-1">
          {/* Condition Badge */}
          <Badge 
            className={`text-xs px-1.5 py-0.5 ${
              gadget.condition === 'brand_new' 
                ? 'bg-orange-500 text-white' 
                : 'bg-yellow-500 text-white'
            }`}
          >
            {gadget.condition === 'brand_new' ? 'New' : 'Used'}
          </Badge>
          
          {/* Stock Badge */}
          {!gadget.in_stock && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              Out of Stock
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex-grow px-1 lg:px-2">
        <h3 
          className="text-sm sm:text-base lg:text-lg font-semibold mb-2 lg:mb-3 text-gray-900 line-clamp-2 group-hover:text-accent transition-colors cursor-pointer"
          onClick={handleCardClick}
        >
          {gadget.name}
        </h3>
        <p className="text-muted-foreground mb-3 lg:mb-4 text-xs lg:text-sm line-clamp-2">
          {gadget.description}
        </p>
      </div>
      
      <div className="pt-3 lg:pt-4 border-t border-gray-100 px-1 lg:px-2 pb-2 lg:pb-2">
        <div className="flex justify-between items-center mb-3 lg:mb-4">
          <span className="text-xs lg:text-sm font-medium text-gray-600">Price</span>
          <span className="text-sm sm:text-base lg:text-lg font-semibold text-accent">
            {formatPrice(gadget.price)}
          </span>
        </div>
          <Button
            onClick={handleOrderClick}
            disabled={!gadget.in_stock}
            className="w-full bg-accent text-white hover:bg-accent/90 text-xs lg:text-sm py-2 lg:py-3 h-9 lg:h-10 rounded-lg font-medium"
          >
            {gadget.in_stock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
      </div>
    </Card>
  );
};

export default GadgetCard;
