
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

interface OrderFormFieldsProps {
  formData: {
    address: string;
    quantity: number;
    size: string;
    contact?: string;
  };
  setFormData: (data: any) => void;
  selectedBrand?: string;
}

export const OrderFormFields = ({ formData, setFormData, selectedBrand }: OrderFormFieldsProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' ? parseInt(value) || 1 : value 
    }));
  };

  const handleSizeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      size: value
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {selectedBrand && (
        <motion.div variants={itemVariants} className="space-y-1">
          <Label className="text-sm">Selected Brand</Label>
          <Input value={selectedBrand} readOnly className="bg-muted/50 border-accent/20 h-8 text-sm" />
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="space-y-1">
        <Label htmlFor="size" className="text-sm">Weight</Label>
        <Select
          value={formData.size}
          onValueChange={handleSizeChange}
        >
          <SelectTrigger className="bg-white h-8 text-sm">
            <SelectValue placeholder="Select weight" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-md">
            <SelectItem value="6KG">6KG</SelectItem>
            <SelectItem value="12KG">12KG</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-1">
        <Label htmlFor="quantity" className="text-sm">Quantity</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={handleInputChange}
          required
          placeholder="Enter quantity"
          className="border-accent/20 focus:border-accent/40 h-8 text-sm"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-1">
        <Label htmlFor="contact" className="text-sm">Contact Number</Label>
        <Input
          id="contact"
          name="contact"
          type="tel"
          value={formData.contact}
          onChange={handleInputChange}
          required
          placeholder="Enter your phone number"
          className="border-accent/20 focus:border-accent/40 h-8 text-sm"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-1">
        <Label htmlFor="address" className="text-sm">Delivery Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          required
          placeholder="Enter your delivery address"
          className="border-accent/20 focus:border-accent/40 h-8 text-sm"
        />
      </motion.div>
    </motion.div>
  );
};
