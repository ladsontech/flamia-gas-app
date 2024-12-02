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
      image: "/lovable-uploads/e9f58b5e-1991-4b14-b472-186d3ae2104c.png",
      description: "High-quality gas cylinders with complete accessories included.",
      sizes: [
        { size: "6KG", price: "UGX 140,000" },
        { size: "12KG", price: "UGX 350,000" }
      ]
    },
    {
      name: "Total Gas",
      image: "/lovable-uploads/de1ceb4f-f2dc-48e0-840d-abc0c4c37e53.png",
      description: "Reliable gas solutions with nationwide coverage and full accessories.",
      sizes: [
        { size: "6KG", price: "UGX 180,000" },
        { size: "12KG", price: "UGX 400,000" }
      ]
    },
    {
      name: "Shell Gas",
      image: "/lovable-uploads/6d78b534-027a-4754-8770-24f2c82b4b71.png",
      description: "Premium gas cylinders with safety guarantee and complete accessories.",
      sizes: [
        { size: "6KG", price: "UGX 160,000" },
        { size: "12KG", price: "UGX 380,000" }
      ]
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
                <div className="relative h-48 mb-3 rounded-md overflow-hidden">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2">{brand.name}</h3>
                <p className="text-muted-foreground mb-3 text-sm line-clamp-2">{brand.description}</p>
                <div className="space-y-2 mb-4">
                  {brand.sizes.map((size) => (
                    <div key={size.size} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{size.size}</span>
                      <span className="text-base font-semibold text-accent">{size.price}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {brand.sizes.map((size) => (
                    <Button
                      key={size.size}
                      onClick={() => navigate(`/order?brand=${brand.name}&type=fullset&size=${size.size}`)}
                      variant="outline"
                      className="bg-accent text-white hover:bg-accent/90"
                    >
                      Order {size.size}
                    </Button>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;