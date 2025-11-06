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
    <Card className="group overflow-hidden hover:shadow-lg active:shadow-md transition-all duration-200 border border-border/50 hover:border-primary/40 flex flex-col h-full bg-card rounded-xl sm:rounded-2xl">
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-2 z-10">
          {featured && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-md backdrop-blur-sm text-xs px-2 py-0.5">
              <Star className="w-3 h-3 mr-1 fill-current" />
              <span className="hidden sm:inline">Featured</span>
            </Badge>
          )}
          {discountPercent > 0 && (
            <Badge className="bg-destructive text-destructive-foreground border-0 shadow-md ml-auto text-xs px-2 py-0.5">
              -{discountPercent}%
            </Badge>
          )}
        </div>

        {/* Shop Name Badge for Seller Products */}
        {shopName && source === 'seller' && (
          <Badge variant="secondary" className="absolute bottom-2 right-2 text-xs backdrop-blur-sm bg-background/90 border-0 shadow-sm px-2 py-0.5">
            {shopName}
          </Badge>
        )}
      </div>
      
      {/* Content Section */}
      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col gap-2">
        <div className="flex-1 min-h-0">
          <h3 className="font-semibold text-sm sm:text-base mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {name}
          </h3>
          
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        
        {/* Price Section */}
        <div className="space-y-2 sm:space-y-3 mt-auto pt-2 sm:pt-3 border-t border-border/50">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg sm:text-xl font-bold text-primary">
              UGX {price.toLocaleString()}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                UGX {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          <Button 
            onClick={onAddToCart}
            className="w-full font-medium sm:font-semibold h-9 sm:h-10 text-sm sm:text-base active:scale-[0.98] transition-transform touch-manipulation"
            size="default"
          >
            <ShoppingCart className="w-4 h-4 mr-1.5 sm:mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
