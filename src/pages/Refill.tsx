import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Flame, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Brand {
  name: string;
  price_6kg: string;
  price_12kg: string;
  refill_price_6kg: string;
  refill_price_12kg: string;
}

const Refill = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('name, price_6kg, price_12kg, refill_price_6kg, refill_price_12kg');
      
      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load brands data",
        variant: "destructive",
      });
    }
  };

  const sizes = [
    {
      size: "6KG",
      description: "Perfect for small households",
      color: "from-blue-400 to-blue-600"
    },
    {
      size: "12KG",
      description: "Best for large families or businesses",
      color: "from-purple-400 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white py-4 sm:py-6">
      <div className="container px-2 sm:px-4">
        <BackButton />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Gas Prices</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Choose between a new cylinder or refill
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {sizes.map((item) => (
            <motion.div
              key={item.size}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="relative overflow-hidden p-4 sm:p-6">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-3 sm:mb-4">
                    <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{item.size}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>

                  <div className="space-y-4">
                    {brands.map((brand) => (
                      <div key={brand.name} className="p-3 bg-accent/5 rounded-lg">
                        <h3 className="font-semibold mb-2">{brand.name}</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-muted-foreground">New Cylinder</p>
                            <p className="font-bold text-accent">
                              {item.size === "6KG" ? brand.price_6kg : brand.price_12kg}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Refill Only</p>
                            <p className="font-bold text-accent">
                              {item.size === "6KG" ? brand.refill_price_6kg : brand.refill_price_12kg}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <Button
                            onClick={() => navigate(`/order?type=fullset&size=${item.size}&brand=${brand.name}`)}
                            className="w-full group text-xs sm:text-sm py-1 h-auto"
                            variant="secondary"
                          >
                            New Cylinder
                            <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                          <Button
                            onClick={() => navigate(`/order?type=refill&size=${item.size}&brand=${brand.name}`)}
                            className="w-full group text-xs sm:text-sm py-1 h-auto"
                          >
                            Order Refill
                            <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Refill;