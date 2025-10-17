import { createContext, useContext, useState, type ReactNode } from 'react';
import { accessories } from '@/components/accessories/AccessoriesData';
import { staticBrands, refillBrands } from '@/components/home/BrandsData';

export interface CartItem {
  id: string;
  type: 'full_set' | 'refill' | 'accessory' | 'gadget' | 'shop';
  brand?: string;
  size?: string;
  name: string;
  quantity: number;
  price: number;
  description: string;
  accessoryId?: string;
  gadgetId?: string;
  image?: string;
  businessName?: string;
  productId?: string;
}

interface CartContextType {
  items: CartItem[];
  promoCode: string;
  promoDiscount: number;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  getTotalPrice: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Check if similar item already exists
    const existingItemIndex = items.findIndex(item => 
      item.type === newItem.type &&
      item.brand === newItem.brand &&
      item.size === newItem.size &&
      item.accessoryId === newItem.accessoryId &&
      item.gadgetId === newItem.gadgetId &&
      item.productId === newItem.productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      setItems(prev => prev.map((item, index) => 
        index === existingItemIndex 
          ? { ...item, quantity: item.quantity + newItem.quantity }
          : item
      ));
    } else {
      // Add new item
      setItems(prev => [...prev, { ...newItem, id }]);
    }
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode('');
    setPromoDiscount(0);
  };

  const applyPromoCode = (code: string): boolean => {
    const normalizedCode = code.toLowerCase().trim();
    
    // Check if code is valid
    const validCodes: { [key: string]: number } = {
      'banda': 5000,
    };
    
    if (validCodes[normalizedCode]) {
      setPromoCode(code);
      setPromoDiscount(validCodes[normalizedCode]);
      return true;
    }
    
    return false;
  };

  const removePromoCode = () => {
    setPromoCode('');
    setPromoDiscount(0);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalPrice = () => {
    const subtotal = getSubtotal();
    
    // Apply 5000 UGX discount per gas and accessory product when promo code is active
    if (promoCode && promoDiscount > 0) {
      const gasAndAccessoryCount = items.reduce((count, item) => {
        if (item.type === 'full_set' || item.type === 'refill' || item.type === 'accessory') {
          return count + item.quantity;
        }
        return count;
      }, 0);
      
      const totalDiscount = gasAndAccessoryCount * 5000;
      return Math.max(0, subtotal - totalDiscount);
    }
    
    return subtotal;
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    promoCode,
    promoDiscount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyPromoCode,
    removePromoCode,
    getTotalPrice,
    getSubtotal,
    getItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};