import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Flame, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Refill = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const sizes = [
    {
      size: "3KG",
      description: "Perfect for small households or portable use",
      color: "from-green-400 to-green-600",
      price: "UGX 25,000"
    },
    {
      size: "6KG",
      description: "Ideal for medium-sized families",
      color: "from-blue-400 to-blue-600",
      price: "UGX 50,000"
    },
    {
      size: "12KG",
      description: "Best value for large families or commercial use",
      color: "from-purple-400 to-purple-600",
      price: "UGX 100,000"
    }
  ];

  const handleOrder = (size: string, price: string) => {
    if (!selectedBrand) {
      toast({
        title: "Please select a brand",
        description: "You need to select a gas brand before proceeding",
        variant: "destructive",
      });
      return;
    }
    setSelectedSize(size);
    navigate(`/order?type=refill&size=${size}&price=${price}&brand=${selectedBrand}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white py-4 sm:py-6">
      <div className="container px-2 sm:px-4">
        <BackButton />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Gas Refill Prices</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Choose your preferred gas cylinder size
          </p>

          <div className="max-w-xs mx-auto mb-6">
            <Select
              value={selectedBrand}
              onValueChange={setSelectedBrand}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.name}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {sizes.map((item) => (
            <motion.div
              key={item.size}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="relative overflow-hidden p-3 sm:p-4 hover:shadow-lg transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-2 sm:mb-3">
                    <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{item.size}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">{item.description}</p>
                  
                  <div className="space-y-3">
                    <div className="p-2 sm:p-3 bg-accent/5 rounded-lg">
                      <p className="font-bold text-accent text-base sm:text-lg mb-2">
                        {item.price}
                      </p>
                      <Button
                        onClick={() => handleOrder(item.size, item.price)}
                        className="w-full group text-xs sm:text-sm py-1"
                      >
                        Order Refill
                        <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
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