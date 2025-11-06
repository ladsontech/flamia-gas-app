import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, Star } from 'lucide-react';

interface ProductCardProps {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  featured?: boolean;
  shopName?: string;
  source?: string;
  onAddToCart: () => void;
}

export const ProductCard = ({
  name,
  description,
  price,
  originalPrice,
  imageUrl,
  featured,
  shopName,
  source,
  onAddToCart,
}: ProductCardProps) => {
  const discountPercent = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Card className="group bg-white border border-gray-100 shadow-sm hover:shadow-md p-2 sm:p-3 transition-all duration-300 overflow-hidden h-full flex flex-col">
      {/* Square Image Container */}
      <div className="relative w-full pb-[100%] mb-2 sm:mb-3 rounded-lg overflow-hidden bg-gray-50">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name}
            className="absolute inset-0 w-full h-full object-contain p-2 sm:p-3 group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-0">
          {featured && (
            <Badge className="bg-orange-500 text-white border-0 shadow-sm text-xs px-1.5 sm:px-2 py-0.5">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 fill-current" />
              <span className="text-xs">New</span>
            </Badge>
          )}
          {discountPercent > 0 && (
            <Badge className="bg-red-500 text-white border-0 shadow-sm text-xs px-1.5 sm:px-2 py-0.5">
              -{discountPercent}%
            </Badge>
          )}
        </div>

        {/* Shop Name Badge for Seller Products */}
        {shopName && source === 'seller' && (
          <Badge variant="secondary" className="absolute bottom-2 right-2 text-xs px-1.5 sm:px-2 py-0.5 bg-white/90 backdrop-blur-sm border border-gray-200 z-0">
            {shopName}
          </Badge>
        )}
      </div>
      
      {/* Content Section */}
      <div className="flex-grow px-1 sm:px-2 flex flex-col">
        <h3 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-1.5 text-gray-900 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
          {name}
        </h3>
        
        {/* Description */}
        {description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-2 sm:mb-2.5 leading-snug">
            {description}
          </p>
        )}
        
        {/* Price Section */}
        <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-100">
          <div className="flex flex-col gap-1 sm:gap-1.5 mb-2 sm:mb-3">
            {/* Always show current price */}
            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-orange-600">
                UGX {price.toLocaleString()}
              </span>
              {/* Show original price if it exists and is higher than current price */}
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-gray-500 line-through">
                  UGX {originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {/* Show discount percentage if applicable */}
            {originalPrice && originalPrice > price && discountPercent > 0 && (
              <span className="text-xs font-medium text-orange-600">
                Save {discountPercent}%
              </span>
            )}
          </div>
          
          <Button 
            onClick={onAddToCart}
            className="w-full font-medium h-8 sm:h-9 text-xs sm:text-sm active:scale-[0.98] transition-transform touch-manipulation bg-orange-500 hover:bg-orange-600 text-white"
            size="default"
          >
            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
};
