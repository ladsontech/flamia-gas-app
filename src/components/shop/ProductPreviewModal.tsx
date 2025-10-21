import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Tag, TrendingUp } from 'lucide-react';
import type { BusinessProduct } from '@/types/business';

interface ProductPreviewModalProps {
  product: BusinessProduct | null;
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
  commissionRate?: number;
}

export const ProductPreviewModal = ({ 
  product, 
  open, 
  onClose, 
  onAdd,
  commissionRate 
}: ProductPreviewModalProps) => {
  if (!product) return null;

  const calculatedCommission = commissionRate || product.commission_rate || 0;
  const commissionAmount = (product.price * calculatedCommission) / 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Preview</DialogTitle>
          <DialogDescription>
            Review product details and commission before adding to your shop
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Image */}
          {product.image_url && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
              {product.description && (
                <p className="text-muted-foreground">{product.description}</p>
              )}
            </div>

            <Separator />

            {/* Pricing */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Product Price</p>
                <p className="text-3xl font-bold text-primary">
                  UGX {product.price.toLocaleString()}
                </p>
                {product.original_price && product.original_price > product.price && (
                  <p className="text-sm text-muted-foreground line-through">
                    UGX {product.original_price.toLocaleString()}
                  </p>
                )}
              </div>
              
              {product.is_featured && (
                <Badge variant="secondary">
                  <Tag className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>

            <Separator />

            {/* Commission Info */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Your Commission</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Commission Rate</p>
                  <p className="text-2xl font-bold text-primary">{calculatedCommission}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Per Sale</p>
                  <p className="text-2xl font-bold text-primary">
                    UGX {commissionAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                You'll earn UGX {commissionAmount.toLocaleString()} for each unit sold through your shop
              </p>
            </div>

            {/* Category */}
            {product.category && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Category</p>
                <Badge variant="outline">{product.category}</Badge>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onAdd} className="flex-1">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to My Shop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};