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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/placeholder.svg"; // Fallback to placeholder image
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {accessories.map((accessory) => (
          <Card key={accessory.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="aspect-square w-full overflow-hidden rounded-lg mb-4">
                <img
                  src={accessory.image_url || "/placeholder.svg"}
                  alt={accessory.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
              <CardTitle className="text-lg">{accessory.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-gray-600 mb-4">{accessory.description}</p>
              <p className="text-accent font-bold text-xl">
                UGX {accessory.price.toLocaleString()}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleOrder(accessory.id)}
                className="w-full bg-accent hover:bg-accent/90"
              >
                Order Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default Accessories;