import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface OrderFormFieldsProps {
  formData: {
    phone: string;
    address: string;
    quantity: number;
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {selectedBrand && (
        <motion.div variants={itemVariants} className="space-y-2">
          <Label>Selected Brand</Label>
          <Input value={selectedBrand} readOnly className="bg-muted/50 border-accent/20" />
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={handleInputChange}
          required
          placeholder="Enter quantity"
          className="border-accent/20 focus:border-accent/40"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          required
          placeholder="+256 123 456 789"
          className="border-accent/20 focus:border-accent/40"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="address">Delivery Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          required
          placeholder="Enter your delivery address"
          className="border-accent/20 focus:border-accent/40"
        />
      </motion.div>
    </motion.div>
  );
};