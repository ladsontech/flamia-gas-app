
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";

interface Accessory {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

const Accessories = () => {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccessories();
  }, []);

  const fetchAccessories = async () => {
    try {
      const { data, error } = await supabase
        .from('accessories')
        .select('*')
        .order('name');

      if (error) throw error;
      
      console.log('Fetched accessories:', data); // Debug log
      setAccessories(data || []);
    } catch (error: any) {
      console.error('Error fetching accessories:', error);
      toast({
        title: "Error",
        description: "Failed to load accessories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = (accessoryId: string) => {
    navigate(`/order?accessory=${accessoryId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-center text-muted-foreground">Loading accessories...</p>
        </div>
      </div>
    );
  }

  if (!accessories.length) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="text-center">
          <p className="text-muted-foreground">No accessories available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 flex-grow">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Shop</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
          {accessories.map((accessory) => (
            <motion.div
              key={accessory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
                <CardHeader className="p-2 sm:p-3">
                  <div className="relative w-full pb-[100%] mb-2 rounded-md overflow-hidden bg-gray-50">
                    <img
                      src={accessory.image_url || 'https://images.unsplash.com/photo-1590959651373-a3db0f38a961?q=80&w=3039&auto=format&fit=crop'}
                      alt={accessory.name}
                      className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1590959651373-a3db0f38a961?q=80&w=3039&auto=format&fit=crop';
                      }}
                    />
                  </div>
                  <CardTitle className="text-sm sm:text-base">{accessory.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-3 pt-0 flex-grow">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                    {accessory.description}
                  </p>
                  <p className="text-accent font-bold text-sm sm:text-base mb-2">
                    UGX {accessory.price.toLocaleString()}
                  </p>
                </CardContent>
                <CardFooter className="p-2 sm:p-3 pt-0">
                  <Button
                    onClick={() => handleOrder(accessory.id)}
                    className="w-full bg-accent hover:bg-accent/90 text-white text-xs sm:text-sm py-1 h-auto"
                  >
                    Order Now
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Accessories;
