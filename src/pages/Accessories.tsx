import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
      setAccessories(data || []);
    } catch (error: any) {
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
      <div className="container mx-auto px-4 py-8">
        <p>Loading accessories...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-2xl font-bold mb-6">Gas Accessories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accessories.map((accessory) => (
          <motion.div
            key={accessory.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <CardHeader className="p-4">
                <div className="relative h-48 mb-3 rounded-md overflow-hidden bg-gray-100">
                  <img
                    src={accessory.image_url}
                    alt={accessory.name}
                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                      target.onerror = null;
                    }}
                  />
                </div>
                <CardTitle className="text-lg font-semibold">{accessory.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-muted-foreground mb-3 text-sm line-clamp-2">
                  {accessory.description}
                </p>
                <p className="text-accent font-bold text-xl mb-4">
                  UGX {accessory.price.toLocaleString()}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  onClick={() => handleOrder(accessory.id)}
                  className="w-full bg-accent hover:bg-accent/90 text-white"
                >
                  Order Now
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Accessories;