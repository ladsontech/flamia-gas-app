import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Accessory {
  id: string;
  name: string;
  price: number;
}

interface OrderFormFieldsProps {
  formData: {
    phone: string;
    address: string;
    type: string;
    size: string;
    quantity: number;
    accessory_id?: string;
  };
  setFormData: (data: any) => void;
  selectedBrand: string;
}

export const OrderFormFields = ({ formData, setFormData, selectedBrand }: OrderFormFieldsProps) => {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccessories();
  }, []);

  const fetchAccessories = async () => {
    try {
      const { data, error } = await supabase
        .from('accessories')
        .select('id, name, price')
        .order('name');

      if (error) throw error;
      setAccessories(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load accessories",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {selectedBrand && (
        <div className="space-y-2">
          <Label>Selected Brand</Label>
          <Input value={selectedBrand} readOnly className="bg-muted" />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          required
          placeholder="+256 123 456 789"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Delivery Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          required
          placeholder="Enter your delivery address"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Order Type</Label>
        <Select 
          value={formData.type} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select order type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fullset">New Cylinder (Full Set)</SelectItem>
            <SelectItem value="refill">Refill Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="size">Cylinder Size</Label>
        <Select 
          value={formData.size} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, size: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select cylinder size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3kg">3 KG</SelectItem>
            <SelectItem value="6kg">6 KG</SelectItem>
            <SelectItem value="12kg">12 KG</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accessory">Add Accessory (Optional)</Label>
        <Select 
          value={formData.accessory_id || "none"} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, accessory_id: value === "none" ? undefined : value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an accessory" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Accessory</SelectItem>
            {accessories.map((accessory) => (
              <SelectItem key={accessory.id} value={accessory.id}>
                {accessory.name} - KES {accessory.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};