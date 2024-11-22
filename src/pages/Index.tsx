import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const brands = [
    {
      name: "Stabex Gas",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
      description: "High-quality gas cylinders for your home and business needs.",
      price: "KES 2,300"
    },
    {
      name: "Total Gas",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      description: "Reliable gas solutions with nationwide coverage.",
      price: "KES 2,500"
    },
    {
      name: "Shell Gas",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
      description: "Premium gas cylinders with safety guarantee.",
      price: "KES 2,400"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-accent">
            Gas Delivery Service
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 max-w-2xl mx-auto"
        >
          <span className="px-3 py-1 bg-accent text-white rounded-full text-xs mb-3 inline-block">
            Fast Gas Delivery
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            Quality Gas Cylinders
          </h2>
          <p className="text-muted-foreground mb-6 text-base">
            Choose from our selection of trusted gas brands
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-white shadow-lg p-4 hover-scale overflow-hidden">
                <div className="relative h-40 mb-3 rounded-md overflow-hidden">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2">{brand.name}</h3>
                <p className="text-muted-foreground mb-2 text-sm line-clamp-2">{brand.description}</p>
                <p className="text-base font-semibold text-accent mb-3">{brand.price}</p>
                <Button
                  onClick={() => navigate(`/order?brand=${brand.name}`)}
                  variant="outline"
                  className="w-full bg-accent text-white hover:bg-accent/90"
                >
                  Order Now
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;