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
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 flex flex-col h-full bg-card">
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground/40" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-2">
          {featured && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg backdrop-blur-sm">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featured
            </Badge>
          )}
          {discountPercent > 0 && (
            <Badge className="bg-destructive text-destructive-foreground border-0 shadow-lg ml-auto">
              -{discountPercent}% OFF
            </Badge>
          )}
        </div>

        {/* Shop Name Badge for Seller Products */}
        {shopName && source === 'seller' && (
          <Badge variant="secondary" className="absolute bottom-2 right-2 text-xs backdrop-blur-sm bg-background/80">
            {shopName}
          </Badge>
        )}
      </div>
      
      {/* Content Section */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight min-h-[3rem]">
          {name}
        </h3>
        
        {description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1 leading-relaxed">
            {description}
          </p>
        )}
        
        {/* Price Section */}
        <div className="space-y-3 mt-auto pt-3 border-t">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl font-extrabold text-primary">
              UGX {price.toLocaleString()}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-muted-foreground line-through">
                UGX {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          <Button 
            onClick={onAddToCart}
            className="w-full font-semibold group-hover:shadow-lg transition-all"
            size="default"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
