import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus, Tag, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const CartSummary: React.FC = () => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    getTotalPrice, 
    getSubtotal,
    clearCart,
    promoCode,
    promoDiscount,
    applyPromoCode,
    removePromoCode
  } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [promoInput, setPromoInput] = useState('');
  
  // Check if cart has any gas items (eligible for promo codes)
  const hasGasItems = useMemo(() => {
    return items.some(item => 
      item.type === 'full_set' || item.type === 'refill' || item.type === 'accessory'
    );
  }, [items]);

  if (items.length === 0) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
        <p className="text-muted-foreground mb-4">Add some products to get started!</p>
        <div className="space-y-2">
          <Button onClick={() => navigate('/')} className="w-full">
            Browse Gas Cylinders
          </Button>
          <Button onClick={() => navigate('/gadgets')} variant="outline" className="w-full">
            Browse Gadgets
          </Button>
          <Button onClick={() => navigate('/accessories')} variant="outline" className="w-full">
            Browse Accessories
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cart Summary</h3>
        <Button onClick={clearCart} variant="outline" size="sm">
          Clear Cart
        </Button>
      </div>

      {items.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-medium text-sm">{item.name}</h4>
              <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {item.type === 'full_set' ? 'Full Set' : 
                   item.type === 'refill' ? 'Refill' : 
                   item.type === 'gadget' ? 'Gadget' : 'Accessory'}
                </Badge>
                {item.brand && <span className="text-xs text-muted-foreground">{item.brand}</span>}
                {item.size && <span className="text-xs text-muted-foreground">{item.size}</span>}
              </div>
            </div>
            <Button
              onClick={() => removeFromCart(item.id)}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <Button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <span className="font-semibold text-sm">
              UGX {(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        </Card>
      ))}

      {/* Promo Code Section - Only show for gas orders */}
      {hasGasItems && (
        <Card className="p-4 border-dashed border-2 border-accent/20">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Promo Code</span>
          </div>
          
          {promoCode ? (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {promoCode.toUpperCase()}
                </Badge>
                <span className="text-sm text-green-700">
                  -{promoDiscount.toLocaleString()} UGX per gas item
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  removePromoCode();
                  setPromoInput('');
                  toast({
                    title: "Promo code removed",
                    description: "The discount has been removed from your order.",
                  });
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={async () => {
                  const success = await applyPromoCode(promoInput);
                  if (success) {
                    toast({
                      title: "Promo code applied!",
                      description: `UGX ${promoDiscount.toLocaleString()} discount added to your order.`,
                    });
                  } else {
                    toast({
                      title: "Invalid promo code",
                      description: "Please check your code and try again.",
                      variant: "destructive",
                    });
                  }
                }}
                className="bg-accent hover:bg-accent/90"
              >
                Apply
              </Button>
            </div>
          )}
        </Card>
      )}

      <Card className="p-4 bg-accent/5">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Subtotal:</span>
            <span className="text-sm">UGX {getSubtotal().toLocaleString()}</span>
          </div>
          
          {promoDiscount > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span className="text-sm">Promo Discount:</span>
              <span className="text-sm">-UGX {promoDiscount.toLocaleString()}</span>
            </div>
          )}
          
          <div className="border-t pt-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="text-xl font-bold text-accent">
                UGX {getTotalPrice().toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground text-center mt-2">
          Free delivery within Kampala
        </p>
      </Card>

      <div className="space-y-2">
        <Button onClick={() => navigate('/')} variant="outline" className="w-full">
          Add More Items
        </Button>
      </div>
    </div>
  );
};