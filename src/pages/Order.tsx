
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { OrderHeader } from "@/components/order/OrderHeader";
import { OrderFormFields } from "@/components/order/OrderFormFields";
import { Flame, Truck } from "lucide-react";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const Order = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accessoryData, setAccessoryData] = useState(null);

  const selectedBrand = searchParams.get("brand") || "";
  const orderType = searchParams.get("type") || "fullset";
  const size = searchParams.get("size") || "";
  const accessoryId = searchParams.get("accessory");

  // Gas brands for selection
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

  // Fetch accessory data if accessoryId is provided
  useEffect(() => {
    const fetchAccessoryData = async () => {
      if (accessoryId) {
        try {
          // This is a static lookup since we have a static array in Accessories.tsx
          // In a real app, you would fetch from Supabase or another data source
          const accessories = [
            {
              id: "1",
              name: "Gas Regulator",
              price: 15000,
            },
            {
              id: "2",
              name: "Gas Pipe (2 Meters)",
              price: 8000,
            },
            {
              id: "3",
              name: "2-Burner Gas Stove",
              price: 85000,
            },
            {
              id: "4",
              name: "Cylinder Stand",
              price: 25000,
            },
            {
              id: "5",
              name: "6Kg Burner",
              price: 25000,
            },
            {
              id: "6",
              name: "Gas Lighter",
              price: 5000,
            }
          ];
          
          const accessory = accessories.find(a => a.id === accessoryId);
          if (accessory) {
            setAccessoryData(accessory);
          }
        } catch (error) {
          console.error("Error fetching accessory data:", error);
        }
      }
    };
    
    fetchAccessoryData();
  }, [accessoryId]);

  const [formData, setFormData] = useState({
    address: "",
    type: orderType,
    size: size,
    quantity: 1,
    contact: "",
    accessory_id: accessoryId || undefined,
    brand: selectedBrand || (accessoryData ? "" : "Total") // Default to Total for new accessory orders
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let message = '';
      
      if (accessoryData) {
        // Format message for accessory order with brand and free delivery info
        message = `Flamia 🔥%0A
------------------------%0A
*New Accessory Order*%0A
------------------------%0A
*Item:* ${accessoryData.name}%0A
*Price:* UGX ${accessoryData.price.toLocaleString()}%0A
*Preferred Brand:* ${formData.brand}%0A
*Quantity:* ${formData.quantity}%0A
*Total Amount:* UGX ${(accessoryData.price * formData.quantity).toLocaleString()}%0A
*Contact:* ${formData.contact}%0A
*Address:* ${formData.address}%0A
*Free Delivery:* Within Kampala%0A
------------------------`;
      } else {
        // Get the price based on size
        let price = 0;
        if (formData.size === "3KG") price = 28000;
        else if (formData.size === "6KG") price = 45000;
        else if (formData.size === "12KG") price = 95000;
        
        // Format message for gas order with price and free delivery info
        message = `Flamia 🔥%0A
------------------------%0A
*New Gas Order*%0A
------------------------%0A
*Order Type:* ${formData.type}%0A
*Brand:* ${formData.brand}%0A
*Size:* ${formData.size}%0A
*Price:* UGX ${price.toLocaleString()}%0A
*Quantity:* ${formData.quantity}%0A
*Total Amount:* UGX ${(price * formData.quantity).toLocaleString()}%0A
*Contact:* ${formData.contact}%0A
*Address:* ${formData.address}%0A
*Free Delivery:* Within Kampala%0A
------------------------`;
      }

      window.open(`https://wa.me/+256789572007?text=${message}`, '_blank');
      
      toast({
        title: "Order Initiated",
        description: "Your order details have been sent to WhatsApp. Please complete the conversation there.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate WhatsApp order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white">
      <div className="container max-w-md px-3 py-6">
        <BackButton />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-4"
        >
          <Card className="p-4 relative overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-flame-inner via-flame-middle to-flame-outer opacity-75" />
            
            {accessoryData ? (
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm mb-3"
                >
                  <Flame className="w-4 h-4" />
                  Accessory Order
                </motion.div>
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="text-xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent"
                >
                  {accessoryData.name}
                </motion.h1>
                <p className="text-accent font-medium mt-2">
                  UGX {accessoryData.price.toLocaleString()}
                </p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground"
                >
                  <Truck className="w-4 h-4" />
                  <span>Free Delivery in Kampala</span>
                </motion.div>
              </div>
            ) : (
              <OrderHeader orderType={formData.type} />
            )}

            <form onSubmit={handleSubmit} className="space-y-4 relative">
              {!accessoryData && (
                <OrderFormFields 
                  formData={formData}
                  setFormData={setFormData}
                  selectedBrand={selectedBrand}
                />
              )}
              
              {accessoryData && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="brand" className="block text-sm font-medium">Preferred Brand</Label>
                    <Select
                      value={formData.brand}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}
                    >
                      <SelectTrigger id="brand" className="w-full px-3 py-2 border border-accent/20 rounded-md focus:outline-none focus:ring-1 focus:ring-accent">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {gasBrands.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="block text-sm font-medium">Quantity</Label>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      required
                      className="w-full px-3 py-2 border border-accent/20 rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact" className="block text-sm font-medium">Contact Number</Label>
                    <input
                      id="contact"
                      type="tel"
                      value={formData.contact}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                      required
                      placeholder="Enter your phone number"
                      className="w-full px-3 py-2 border border-accent/20 rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address" className="block text-sm font-medium">Delivery Address</Label>
                    <input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      required
                      placeholder="Enter your delivery address"
                      className="w-full px-3 py-2 border border-accent/20 rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>
              )}

              <motion.div 
                className="pt-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-accent text-white hover:bg-accent/90 relative overflow-hidden group h-10"
                  disabled={loading}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? "Processing..." : "Order Now"}
                    <Flame className="w-4 h-4 transition-transform group-hover:rotate-12" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-flame-inner via-flame-middle to-flame-outer opacity-0 group-hover:opacity-20 transition-opacity" />
                </Button>
              </motion.div>
            </form>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Order;
