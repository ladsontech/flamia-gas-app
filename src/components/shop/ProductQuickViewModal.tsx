import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, X, Package, Eye } from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';

interface ProductQuickViewModalProps {
  product: MarketplaceProduct | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: () => void;
  onViewDetails: () => void;
}

export const ProductQuickViewModal = ({ 
  product, 
  open, 
  onClose, 
  onAddToCart,
  onViewDetails
}: ProductQuickViewModalProps) => {
  if (!product) return null;

  const discountPercent = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Quick View</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="aspect-square w-full bg-muted rounded-lg overflow-hidden border">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {product.featured && (
                  <Badge className="bg-orange-500 text-white border-0">
                    New
                  </Badge>
                )}
                {product.source === 'seller' && product.shop_name && (
                  <Badge variant="secondary">
                    {product.shop_name}
                  </Badge>
                )}
                {product.source === 'flamia' && (
                  <Badge className="bg-orange-500 text-white border-0">
                    Flamia
                  </Badge>
                )}
                <Badge variant="outline">{product.category}</Badge>
              </div>
              {product.viewCount && product.viewCount > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <Eye className="w-4 h-4" />
                  <span>{product.viewCount.toLocaleString()} views</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-primary">
                  UGX {product.price.toLocaleString()}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      UGX {product.original_price.toLocaleString()}
                    </span>
                    {discountPercent > 0 && (
                      <Badge className="bg-orange-500 text-white">
                        Save {discountPercent}%
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                  {product.description}
                </p>
              </div>
            )}

            {/* Availability */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Availability:</span>
              <span className="font-medium text-green-600">
                {product.in_stock !== false && product.is_available !== false ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              <Button 
                onClick={onAddToCart} 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                size="lg"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button 
                onClick={onViewDetails} 
                variant="outline"
                className="w-full"
              >
                View Full Details
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
