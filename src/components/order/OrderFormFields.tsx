
import { useState, useEffect } from "react";
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
import { Truck, Info } from "lucide-react";
import { staticBrands, refillBrands } from "../home/BrandsData"; // Import the refillBrands data

interface OrderFormFieldsProps {
  formData: {
    address: string;
    quantity: number;
    size: string;
    contact?: string;
    brand?: string;
    type?: string;
  };
  setFormData: (data: any) => void;
  selectedBrand?: string;
}

export const OrderFormFields = ({ formData, setFormData, selectedBrand }: OrderFormFieldsProps) => {
  const [brandPrices, setBrandPrices] = useState<{
    price6kg?: string;
    price12kg?: string;
    price3kg?: string;
  }>({});

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

  const handleBrandChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      brand: value
    }));
    
    // Update prices when brand changes
    const brandData = formData.type === "refill" 
      ? refillBrands.find(b => b.brand === value)
      : staticBrands.find(b => b.brand === value);
    
    if (brandData) {
      if (formData.type === "refill") {
        setBrandPrices({
          price3kg: (brandData as any).refill_price_3kg,
          price6kg: (brandData as any).refill_price_6kg,
          price12kg: (brandData as any).refill_price_12kg,
        });
      } else {
        setBrandPrices({
          price6kg: (brandData as any).price_6kg,
          price12kg: (brandData as any).price_12kg,
        });
      }
    }
  };

  // Gas brands list
  const gasBrands = [
    "Total", 
    "Taifa", 
    "Stabex", 
    "Shell", 
    "Hass", 
    "Meru", 
    "Ven Gas", 
    "Ola Energy", 
    "Oryx", 
    "Ultimate", 
    "K Gas", 
    "C Gas", 
    "Hashi"
  ];

  // Get price based on selected brand and size
  const getPrice = () => {
    if (formData.type === "refill") {
      const brand = refillBrands.find(b => b.brand === formData.brand);
      if (!brand) return "Price not available";

      if (formData.size === "3KG") return brand.refill_price_3kg || "Price not available";
      if (formData.size === "6KG") return brand.refill_price_6kg || "Price not available";
      if (formData.size === "12KG") return brand.refill_price_12kg || "Price not available";
    } else {
      const brand = staticBrands.find(b => b.brand === formData.brand);
      if (!brand) return "Price not available";

      if (formData.size === "6KG") return brand.price_6kg || "Price not available";
      if (formData.size === "12KG") return brand.price_12kg || "Price not available";
    }
    
    return "Price not available";
  };

  // Initialize brand data when component mounts or when form type/brand changes
  useEffect(() => {
    if (formData.brand) {
      handleBrandChange(formData.brand);
    }
  }, [formData.type, formData.brand]);

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
      {!selectedBrand && (
        <motion.div variants={itemVariants} className="space-y-1">
          <Label htmlFor="brand" className="text-sm">Brand</Label>
          <Select
            value={formData.brand}
            onValueChange={handleBrandChange}
          >
            <SelectTrigger id="brand" className={`h-8 text-sm ${formData.type === "fullset" ? "bg-white/90" : "bg-white"}`}>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-md max-h-[300px]">
              {gasBrands.map(brand => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      )}

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
          <SelectTrigger className={`h-8 text-sm ${formData.type === "fullset" ? "bg-white/90" : "bg-white"}`}>
            <SelectValue placeholder="Select weight" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-md">
            {(formData.brand === "Total" || formData.brand === "Taifa" || selectedBrand === "Total" || selectedBrand === "Taifa") && (
              <SelectItem value="3KG">3KG</SelectItem>
            )}
            <SelectItem value="6KG">6KG</SelectItem>
            <SelectItem value="12KG">12KG</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {formData.size && formData.brand && (
        <motion.div 
          variants={itemVariants} 
          className={`p-2 rounded-md flex items-center justify-between ${
            formData.type === "fullset" ? "bg-accent/10" : "bg-accent/5"
          }`}
        >
          <p className="text-accent font-semibold text-sm">
            Price: {getPrice()}
          </p>
          {formData.type === "fullset" && (
            <Info className="w-4 h-4 text-accent/70" />
          )}
        </motion.div>
      )}

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
          className={`border-accent/20 focus:border-accent/40 h-8 text-sm ${
            formData.type === "fullset" ? "bg-white/90" : "bg-white"
          }`}
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
          className={`border-accent/20 focus:border-accent/40 h-8 text-sm ${
            formData.type === "fullset" ? "bg-white/90" : "bg-white"
          }`}
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
          className={`border-accent/20 focus:border-accent/40 h-8 text-sm ${
            formData.type === "fullset" ? "bg-white/90" : "bg-white"
          }`}
        />
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className={`flex items-center justify-center text-sm text-muted-foreground mt-1 p-2 rounded-md ${
          formData.type === "fullset" ? "bg-accent/5" : "bg-gray-50/50"
        }`}
      >
        <Truck className="w-4 h-4 mr-2 text-accent" />
        <span>Free Delivery in Kampala</span>
      </motion.div>
    </motion.div>
  );
};
