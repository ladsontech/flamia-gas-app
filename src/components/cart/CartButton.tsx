import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

export const CartButton: React.FC = () => {
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const itemCount = getItemCount();

  if (itemCount === 0) return null;

  return (
    <Button
      onClick={() => navigate('/order')}
      className="fixed bottom-20 right-4 z-40 bg-accent hover:bg-accent/90 text-white rounded-full w-14 h-14 shadow-lg"
    >
      <div className="relative">
        <ShoppingCart className="w-6 h-6" />
        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0">
          {itemCount}
        </Badge>
      </div>
    </Button>
  );
};