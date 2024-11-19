import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, UserCircle2 } from "lucide-react";
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
      description: "High-quality gas cylinders for your home and business needs."
    },
    {
      name: "Total Gas",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      description: "Reliable gas solutions with nationwide coverage."
    },
    {
      name: "Shell Gas",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
      description: "Premium gas cylinders with safety guarantee."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white">
      <div className="container px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary-foreground">
            Gas Delivery Service
          </h1>
          <Button
            variant="ghost"
            onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")}
            className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
          >
            {isLoggedIn ? (
              <>
                <UserCircle2 className="h-5 w-5" />
                <span>Account</span>
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </>
            )}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <span className="px-4 py-1 bg-accent text-accent-foreground rounded-full text-sm mb-4 inline-block shadow-sm">
            Premium Gas Delivery
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Gas Delivery Made Simple
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Fast, reliable, and safe gas delivery right to your doorstep
          </p>
          <Button
            onClick={() => navigate("/refill")}
            className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
            size="lg"
          >
            View Refill Prices
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="glass-card p-6 hover-scale overflow-hidden">
                <div className="relative h-48 mb-4 rounded-md overflow-hidden">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{brand.name}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">{brand.description}</p>
                <Button
                  onClick={() => navigate(`/order?brand=${brand.name}`)}
                  variant="outline"
                  className="w-full hover:bg-accent hover:text-accent-foreground"
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