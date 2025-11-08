import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, Star, Eye, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getProductViewCount } from '@/services/productViewsService';

interface ProductCardProps {
  id?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  featured?: boolean;
  shopName?: string;
  source?: string;
  viewCount?: number;
  onAddToCart: () => void;
  onQuickView?: () => void;
  detailsHref?: string;
}

export const ProductCard = ({
  id,
  name,
  description,
  price,
  originalPrice,
  imageUrl,
  featured,
  shopName,
  source,
  viewCount: initialViewCount,
  onAddToCart,
  onQuickView,
  detailsHref,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const [viewCount, setViewCount] = useState<number>(initialViewCount || 0);
  
  const discountPercent = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Fetch view count if not provided
  useEffect(() => {
    if (id && initialViewCount === undefined) {
      getProductViewCount(id).then(count => setViewCount(count));
    }
  }, [id, initialViewCount]);

  const handleCardClick = () => {
    if (!id) return;
    
    if (detailsHref) {
      navigate(detailsHref);
    } else {
      navigate(`/product/${id}`);
    }
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking button
    onAddToCart();
  };

  return (
    <Card 
      className="group bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg p-2 sm:p-3 transition-all duration-300 overflow-hidden h-full flex flex-col relative cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Square Image Container */}
      <div className="relative w-full pb-[100%] mb-2 sm:mb-3 rounded-lg overflow-hidden bg-gray-50 z-0">
        {/* Quick View Button */}
        {onQuickView && id && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView();
            }}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        )}
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
        
        {/* Badges - Ensure they stay below sticky header (z-40) and AppBar (z-50) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1" style={{ zIndex: 1 }}>
          {featured && (
            <Badge className="bg-orange-500 text-white border-0 shadow-sm text-xs px-1.5 sm:px-2 py-0.5">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 fill-current" />
              <span className="text-xs">New</span>
            </Badge>
          )}
        </div>

        {/* View Count Badge */}
        {viewCount > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs px-1.5 sm:px-2 py-0.5 rounded-full" style={{ zIndex: 1 }}>
            <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>{viewCount > 999 ? `${(viewCount / 1000).toFixed(1)}K` : viewCount}</span>
          </div>
        )}

        {/* Shop Name Badge for Seller Products */}
        {shopName && source === 'seller' && (
          <Badge variant="secondary" className="absolute bottom-2 right-2 text-xs px-1.5 sm:px-2 py-0.5 bg-white/90 backdrop-blur-sm border border-gray-200" style={{ zIndex: 1 }}>
            {shopName}
          </Badge>
        )}
      </div>
      
      {/* Content Section */}
      <div className="flex-grow px-1 sm:px-2 flex flex-col">
        {shopName && (
          <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5 leading-none line-clamp-1">{shopName}</div>
        )}
        <h3 className="text-sm sm:text-base font-medium mb-1 sm:mb-2 text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors leading-snug">
          {name}
        </h3>
        {/* Price Section */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap mb-2 sm:mb-3">
            {price && price > 0 ? (
              <span className="text-base sm:text-lg font-semibold text-gray-900 leading-tight block">
                UGX {price.toLocaleString()}
              </span>
            ) : (
              <span className="text-base sm:text-lg font-semibold text-gray-400 leading-tight block">
                Price on request
              </span>
            )}
            {originalPrice && originalPrice > 0 && price && originalPrice > price && (
              <span className="text-xs sm:text-sm text-gray-500 line-through block">
                UGX {originalPrice.toLocaleString()}
              </span>
            )}
            {originalPrice && originalPrice > price && discountPercent > 0 && (
              <span className="text-[10px] sm:text-xs font-medium text-orange-600">
                Save {discountPercent}%
              </span>
            )}
          </div>
          <Button 
            onClick={handleAddToCartClick}
            className="w-full font-medium h-8 sm:h-9 text-xs sm:text-sm active:scale-[0.98] transition-transform touch-manipulation bg-gray-900 hover:bg-black text-white"
            size="default"
          >
            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
            Add to cart
          </Button>
        </div>
      </div>
    </Card>
  );
};
