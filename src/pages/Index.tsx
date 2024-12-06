import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import HomeHeader from "@/components/home/Header";
import BrandCardNew from "@/components/home/BrandCardNew";
import HotDealCard from "@/components/home/HotDealCard";

interface HotDeal {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: string | null;
}

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hotDeals, setHotDeals] = useState<HotDeal[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    const fetchHotDeals = async () => {
      const { data, error } = await supabase
        .from('hot_deals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setHotDeals(data);
      }
    };

    checkAuth();
    fetchHotDeals();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const brands = [
    {
      name: "Stabex Gas",
      image: "/lovable-uploads/e9f58b5e-1991-4b14-b472-186d3ae2104c.png",
      prices: {
        '6kg': "UGX 140,000",
        '12kg': "UGX 350,000"
      }
    },
    {
      name: "Total Gas",
      image: "/lovable-uploads/de1ceb4f-f2dc-48e0-840d-abc0c4c37e53.png",
      prices: {
        '6kg': "UGX 180,000",
        '12kg': "UGX 400,000"
      }
    },
    {
      name: "Shell Gas",
      image: "/lovable-uploads/6d78b534-027a-4754-8770-24f2c82b4b71.png",
      prices: {
        '6kg': "UGX 160,000",
        '12kg': "UGX 380,000"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container px-2 sm:px-4 py-2 sm:py-4">
        <HomeHeader />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-3 md:mb-6 max-w-2xl mx-auto"
        >
          <div className="bg-accent text-white px-3 py-2 rounded-lg inline-block mb-2 transform transition-all duration-300 hover:scale-105">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-tight">
              Quality Gas Cylinders
            </h2>
          </div>
          <p className="text-muted-foreground mb-3 text-xs sm:text-sm">
            Choose from our selection of trusted gas brands
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6">
          {brands.map((brand) => (
            <BrandCardNew
              key={brand.name}
              {...brand}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6 md:mt-8"
        >
          <div className="text-center mb-3 md:mb-6">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-1">Special Offers</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">Limited time deals on gas cylinders and accessories</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {hotDeals.map((deal) => (
              <HotDealCard
                key={deal.id}
                {...deal}
                imageUrl={deal.image_url}
                onOrder={() => navigate('/order')}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;