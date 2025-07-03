import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Heart } from 'lucide-react';
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">({gadget.total_reviews})</span>
      </div>
    );
  };

  const discountPercentage = gadget.original_price 
    ? Math.round(((gadget.original_price - gadget.price) / gadget.original_price) * 100)
    : 0;

  return (
    <Card className="group h-full flex flex-col bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200">
      <CardHeader className="p-3 pb-2">
        <div className="relative">
          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3">
            <img
              src={gadget.image_url || '/images/gadget-fallback.jpg'}
              alt={gadget.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercentage > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                -{discountPercentage}%
              </Badge>
            )}
            {!gadget.in_stock && (
              <Badge variant="secondary" className="text-xs">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-accent transition-colors">
            {gadget.name}
          </h3>
          
          {gadget.brand && (
            <p className="text-xs text-gray-500 font-medium">{gadget.brand}</p>
          )}
          
          {renderStars(gadget.rating)}
        </div>
      </CardHeader>

      <CardContent className="p-3 py-2 flex-grow">
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
          {gadget.description}
        </p>

        {/* Features */}
        {gadget.features && gadget.features.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {gadget.features.slice(0, 2).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                  {feature}
                </Badge>
              ))}
              {gadget.features.length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{gadget.features.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-accent">
              ${gadget.price.toFixed(2)}
            </span>
            {gadget.original_price && (
              <span className="text-sm text-gray-500 line-through">
                ${gadget.original_price.toFixed(2)}
              </span>
            )}
          </div>
          
          {gadget.stock_quantity > 0 && gadget.stock_quantity <= 10 && (
            <p className="text-xs text-orange-600">
              Only {gadget.stock_quantity} left in stock
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0">
        <Button
          onClick={handleOrder}
          disabled={!gadget.in_stock}
          className="w-full bg-accent hover:bg-accent/90 text-white text-sm font-semibold transition-all duration-300 group-hover:shadow-lg"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {gadget.in_stock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GadgetCard;