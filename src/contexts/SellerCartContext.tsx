import { createContext, useContext, useState, type ReactNode } from 'react';

export interface SellerCartItem {
  id: string;
  type: 'shop';
  name: string;
  quantity: number;
  price: number;
  description: string;
  productId?: string;
  image?: string;
  businessName?: string;
}

interface SellerCartContextType {
  items: SellerCartItem[];
  addToCart: (item: Omit<SellerCartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const SellerCartContext = createContext<SellerCartContextType | undefined>(undefined);

export const useSellerCart = () => {
  const context = useContext(SellerCartContext);
  if (!context) {
    throw new Error('useSellerCart must be used within a SellerCartProvider');
  }
  return context;
};

export const SellerCartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<SellerCartItem[]>([]);

  const addToCart = (newItem: Omit<SellerCartItem, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Check if similar item already exists
    const existingItemIndex = items.findIndex(item => 
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
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value: SellerCartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getItemCount,
  };

  return (
    <SellerCartContext.Provider value={value}>
      {children}
    </SellerCartContext.Provider>
  );
};
