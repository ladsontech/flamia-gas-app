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

interface Brand {
  id: string;
  name: string;
  brand: string;
  image_url: string | null;
  price_6kg: string | null;
  price_12kg: string | null;
  refill_price_3kg: string | null;
  refill_price_6kg: string | null;
  refill_price_12kg: string | null;
}

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hotDeals, setHotDeals] = useState<HotDeal[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

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

    const fetchBrands = async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('brand', { ascending: true });
      
      if (!error && data) {
        setBrands(data);
      }
    };

    checkAuth();
    fetchHotDeals();
    fetchBrands();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const groupedBrands = brands.reduce((acc, brand) => {
    if (!acc[brand.brand]) {
      acc[brand.brand] = [];
    }
    acc[brand.brand].push(brand);
    return acc;
  }, {} as Record<string, Brand[]>);

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

        {Object.entries(groupedBrands).map(([brandName, brandItems]) => (
          <div key={brandName} className="mb-8">
            <h3 className="text-lg md:text-xl font-semibold mb-4 text-accent">{brandName}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              {brandItems.map((item) => (
                <BrandCardNew
                  key={item.id}
                  name={item.name}
                  image={item.image_url || ''}
                  prices={{
                    '6kg': item.price_6kg || 'N/A',
                    '12kg': item.price_12kg || 'N/A',
                  }}
                />
              ))}
            </div>
          </div>
        ))}

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