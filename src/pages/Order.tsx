import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { OrderHeader } from "@/components/order/OrderHeader";
import { OrderFormFields } from "@/components/order/OrderFormFields";

const Order = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const selectedBrand = searchParams.get("brand") || "";
  const defaultOrderType = searchParams.get("type") || "fullset";
  const selectedSize = searchParams.get("size") || "";

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    size: selectedSize || "6kg",
    quantity: 1,
    type: defaultOrderType
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    setUserEmail(session.user.email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('orders')
        .insert([
          {
            customer: userEmail,
            phone: formData.phone,
            address: formData.address,
            brand: selectedBrand,
            size: formData.size,
            quantity: formData.quantity,
            type: formData.type
          }
        ]);

      if (error) throw error;
      
      toast({
        title: "Order Placed Successfully",
        description: "We'll deliver your gas cylinder soon!",
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container max-w-md px-4">
        <BackButton />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="p-6">
            <OrderHeader orderType={formData.type} />

            <form onSubmit={handleSubmit} className="space-y-6">
              <OrderFormFields 
                formData={formData}
                setFormData={setFormData}
                selectedBrand={selectedBrand}
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-accent text-white hover:bg-accent/90"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Order;