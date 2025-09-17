import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

export const CartSummary: React.FC = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

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

      <Card className="p-4 bg-accent/5">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Total:</span>
          <span className="text-xl font-bold text-accent">
            UGX {getTotalPrice().toLocaleString()}
          </span>
        </div>
        <p className="text-sm text-muted-foreground text-center">
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