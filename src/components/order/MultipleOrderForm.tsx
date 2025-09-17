import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import { staticBrands, refillBrands } from '@/components/home/BrandsData';
import { accessories } from '@/components/accessories/AccessoriesData';
import { LocationPicker } from './LocationPicker';

interface OrderItem {
  id: string;
  type: 'full_set' | 'refill' | 'accessory';
  brand?: string;
  size?: string;
  accessoryId?: string;
  quantity: number;
  price: number;
}

interface MultipleOrderFormProps {
  onSubmit: (items: OrderItem[], address: string, contact: string, location?: any) => void;
  onCancel: () => void;
}

export const MultipleOrderForm: React.FC<MultipleOrderFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([{
    id: Date.now().toString(),
    type: 'full_set',
    quantity: 1,
    price: 0
  }]);
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState<any>(null);

  const addNewItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      type: 'full_set',
      quantity: 1,
      price: 0
    };
    setOrderItems([...orderItems, newItem]);
  };

  const removeItem = (id: string) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, updates: Partial<OrderItem>) => {
    setOrderItems(orderItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates };
        
        // Recalculate price based on type, brand, and size
        if (updatedItem.type === 'full_set' && updatedItem.brand && updatedItem.size) {
          const brand = staticBrands.find(b => b.brand === updatedItem.brand);
          if (brand) {
            const priceKey = `price_${updatedItem.size}` as keyof typeof brand;
            const priceStr = brand[priceKey] as string;
            if (priceStr) {
              updatedItem.price = parseInt(priceStr.replace(/[^0-9]/g, '')) * updatedItem.quantity;
            }
          }
        } else if (updatedItem.type === 'refill' && updatedItem.brand && updatedItem.size) {
          const brand = refillBrands.find(b => b.brand === updatedItem.brand);
          if (brand) {
            const priceKey = `refill_price_${updatedItem.size}` as keyof typeof brand;
            const priceStr = brand[priceKey] as string;
            if (priceStr) {
              updatedItem.price = parseInt(priceStr.replace(/[^0-9]/g, '')) * updatedItem.quantity;
            }
          }
        } else if (updatedItem.type === 'accessory' && updatedItem.accessoryId) {
          const accessory = accessories.find(a => a.id === updatedItem.accessoryId);
          if (accessory) {
            updatedItem.price = accessory.price * updatedItem.quantity;
          }
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const getTotalPrice = () => {
    return orderItems.reduce((total, item) => total + item.price, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address && contact && orderItems.every(item => item.price > 0)) {
      onSubmit(orderItems, address, contact, location);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Multiple Orders</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Items */}
        {orderItems.map((item, index) => (
          <Card key={item.id} className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Item {index + 1}</h3>
              {orderItems.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Order Type */}
              <div>
                <Label>Order Type</Label>
                <Select
                  value={item.type}
                  onValueChange={(value: 'full_set' | 'refill' | 'accessory') =>
                    updateItem(item.id, { type: value, brand: undefined, size: undefined, accessoryId: undefined, price: 0 })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_set">Full Set</SelectItem>
                    <SelectItem value="refill">Refill</SelectItem>
                    <SelectItem value="accessory">Accessory</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Brand/Accessory Selection */}
              {item.type === 'accessory' ? (
                <div>
                  <Label>Accessory</Label>
                  <Select
                    value={item.accessoryId}
                    onValueChange={(value) => updateItem(item.id, { accessoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select accessory" />
                    </SelectTrigger>
                    <SelectContent>
                      {accessories.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} - UGX {acc.price.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label>Brand</Label>
                  <Select
                    value={item.brand}
                    onValueChange={(value) => updateItem(item.id, { brand: value, size: undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {(item.type === 'full_set' ? staticBrands : refillBrands).map((brand) => (
                        <SelectItem key={brand.id} value={brand.brand}>
                          {brand.brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Size Selection */}
              {item.type !== 'accessory' && item.brand && (
                <div>
                  <Label>Size</Label>
                  <Select
                    value={item.size}
                    onValueChange={(value) => updateItem(item.id, { size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3kg">3KG</SelectItem>
                      <SelectItem value="6kg">6KG</SelectItem>
                      <SelectItem value="12kg">12KG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quantity */}
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            {/* Price Display */}
            <div className="text-right">
              <span className="text-lg font-semibold text-primary">
                UGX {item.price.toLocaleString()}
              </span>
            </div>
          </Card>
        ))}

        {/* Add New Item Button */}
        <Button
          type="button"
          variant="outline"
          onClick={addNewItem}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Item
        </Button>

        {/* Delivery Details */}
        <Card className="p-4 space-y-4">
          <h3 className="font-medium">Delivery Details</h3>
          
          <div>
            <Label>Contact Number</Label>
            <Input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div>
            <Label>Location</Label>
            <LocationPicker
              onLocationSelect={(loc) => {
                setLocation(loc);
                setAddress(loc.address);
              }}
            />
          </div>

          <div>
            <Label>Delivery Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter delivery address"
              required
            />
          </div>
        </Card>

        {/* Total and Actions */}
        <div className="flex flex-col space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              Total: UGX {getTotalPrice().toLocaleString()}
            </div>
            <p className="text-muted-foreground">Free delivery within Kampala</p>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!address || !contact || orderItems.some(item => item.price === 0)}
            >
              Place Orders
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};