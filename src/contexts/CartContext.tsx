import { createContext, useContext, useState, type ReactNode } from 'react';
import { accessories } from '@/components/accessories/AccessoriesData';
import { staticBrands, refillBrands } from '@/components/home/BrandsData';

export interface CartItem {
  id: string;
  type: 'full_set' | 'refill' | 'accessory' | 'gadget';
  brand?: string;
  size?: string;
  name: string;
  quantity: number;
  price: number;
  description: string;
  accessoryId?: string;
  gadgetId?: string;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
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

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Check if similar item already exists
    const existingItemIndex = items.findIndex(item => 
      item.type === newItem.type &&
      item.brand === newItem.brand &&
      item.size === newItem.size &&
      item.accessoryId === newItem.accessoryId &&
      item.gadgetId === newItem.gadgetId
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
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};