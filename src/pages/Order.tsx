import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { OrderHeader } from "@/components/order/OrderHeader";
import { OrderFormFields } from "@/components/order/OrderFormFields";
import { Flame } from "lucide-react";
import Footer from "@/components/Footer";

const Order = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const selectedBrand = searchParams.get("brand") || "";
  const orderType = searchParams.get("type") || "fullset";
  const size = searchParams.get("size") || "";
  const accessoryId = searchParams.get("accessory");

  const [formData, setFormData] = useState({
    address: "",
    type: orderType,
    size: size,
    quantity: 1,
    contact: "",
    accessory_id: accessoryId || undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const message = `Flamia 🔥%0A
------------------------%0A
*New Gas Order*%0A
------------------------%0A
*Order Type:* ${formData.type}%0A
*Brand:* ${selectedBrand}%0A
*Size:* ${formData.size}%0A
*Quantity:* ${formData.quantity}%0A
*Contact:* ${formData.contact}%0A
*Address:* ${formData.address}%0A
------------------------`;

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
      <div className="container max-w-md px-4 py-12">
        <BackButton />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          <Card className="p-6 relative overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-flame-inner via-flame-middle to-flame-outer opacity-75" />
            
            <OrderHeader orderType={formData.type} />

            <form onSubmit={handleSubmit} className="space-y-6 relative">
              <OrderFormFields 
                formData={formData}
                setFormData={setFormData}
                selectedBrand={selectedBrand}
              />

              <motion.div 
                className="pt-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-accent text-white hover:bg-accent/90 relative overflow-hidden group h-12"
                  disabled={loading}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? "Processing..." : "Order Now"}
                    <Flame className="w-5 h-5 transition-transform group-hover:rotate-12" />
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
