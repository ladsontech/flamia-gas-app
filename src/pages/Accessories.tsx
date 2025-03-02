
import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";

// Static accessories data
const accessories = [
  {
    id: "1",
    name: "Gas Regulator",
    description: "Universal gas regulator compatible with all major gas brands in Uganda. Safe and reliable pressure control for all cylinder sizes.",
    price: 15000,
    image_url: "/images/regulator.jpg"
  },
  {
    id: "2",
    name: "Gas Pipe (2 Meters)",
    description: "High-quality gas pipe that connects your cylinder to the cooker. Durable and leak-proof design for safety.",
    price: 8000,
    image_url: "/images/gas-pipe.jpg"
  },
  {
    id: "3",
    name: "2-Burner Gas Stove",
    description: "Efficient 2-burner gas stove perfect for Ugandan kitchens. Compatible with all LPG cylinders and easy to clean.",
    price: 85000,
    image_url: "/images/gas-stove.jpg"
  },
  {
    id: "4",
    name: "Cylinder Stand",
    description: "Sturdy gas cylinder stand for all sizes of LPG cylinders. Keeps your cylinder secure and prevents tipping.",
    price: 25000,
    image_url: "/images/cylinder-stand.jpg"
  },
  {
    id: "5",
    name: "Gas Level Indicator",
    description: "Easy-to-read gas level indicator that helps you monitor your remaining gas level. Never run out of gas unexpectedly.",
    price: 12000,
    image_url: "/images/level-indicator.jpg"
  },
  {
    id: "6",
    name: "Gas Lighter",
    description: "Long-lasting gas lighter with ergonomic design. Safe and reliable ignition for your gas cooker.",
    price: 5000,
    image_url: "/images/gas-lighter.jpg"
  }
];

const Accessories = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {accessories.map((accessory) => (
            <motion.div
              key={accessory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
                <CardHeader className="p-2 sm:p-3">
                  <div className="relative w-full pb-[100%] mb-2 rounded-md overflow-hidden bg-gray-50">
                    <img
                      src={accessory.image_url || '/images/accessory-fallback.jpg'}
                      alt={accessory.name}
                      className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/accessory-fallback.jpg';
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
