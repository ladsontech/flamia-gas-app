import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Flame, ArrowRight, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RefillPrice {
  id: string;
  brand: string;
  weight: string;
  price: number;
}

const Refill = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [brands, setBrands] = useState<string[]>([]);
  const [refillPrices, setRefillPrices] = useState<RefillPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRefillPrices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('refill_prices')
          .select('*')
          .order('brand', { ascending: true });
        
        if (error) throw error;
        
        setRefillPrices(data || []);
        // Extract unique brands
        const uniqueBrands = [...new Set(data?.map(item => item.brand) || [])];
        setBrands(uniqueBrands);
      } catch (error) {
        console.error('Error fetching refill prices:', error);
        toast({
          title: "Error",
          description: "Failed to load refill prices. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRefillPrices();
  }, [toast]);

  const handleOrder = (weight: string, price: number) => {
    if (!selectedBrand) {
      toast({
        title: "Please select a brand",
        description: "You need to select a gas brand before proceeding",
        variant: "destructive",
      });
      return;
    }
    navigate(`/order?type=refill&size=${weight}&price=${price}&brand=${selectedBrand}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary to-white py-4 sm:py-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  const filteredPrices = selectedBrand
    ? refillPrices.filter(price => price.brand === selectedBrand)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white flex flex-col">
      <div className="container px-2 sm:px-4 py-4 sm:py-6 flex-grow">
        <BackButton />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Gas Refill Prices</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-2">
            Choose your preferred gas cylinder size
          </p>
          
          {/* Free Delivery Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 text-accent font-medium mb-4"
          >
            <Truck className="w-4 h-4" />
            <span>Free Delivery on All Orders!</span>
          </motion.div>

          <div className="max-w-xs mx-auto mb-6">
            <Select
              value={selectedBrand}
              onValueChange={setSelectedBrand}
            >
              <SelectTrigger className="w-full bg-white/90 backdrop-blur-sm border-accent/20 h-12">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent 
                className="bg-white/95 backdrop-blur-md border-accent/20 shadow-lg overflow-y-auto"
                style={{
                  maxHeight: 'min(65vh, 600px)', // Increased height to show more items
                  minHeight: '300px' // Increased minimum height
                }}
              >
                {brands.map((brand) => (
                  <SelectItem 
                    key={brand} 
                    value={brand}
                    className="hover:bg-accent/10 py-3"
                  >
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {filteredPrices.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="relative overflow-hidden p-3 sm:p-4 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/10 opacity-10" />
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-2 sm:mb-3">
                    <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{item.weight}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                    Perfect for {item.weight === '3KG' ? 'small households' : 
                               item.weight === '6KG' ? 'medium-sized families' : 
                               'large families or commercial use'}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="p-2 sm:p-3 bg-accent/5 rounded-lg">
                      <p className="font-bold text-accent text-base sm:text-lg mb-2">
                        UGX {item.price.toLocaleString()}
                      </p>
                      <Button
                        onClick={() => handleOrder(item.weight, item.price)}
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
      <Footer />
    </div>
  );
};

export default Refill;
