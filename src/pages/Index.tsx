
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import HomeHeader from "@/components/home/Header";
import BrandCardNew from "@/components/home/BrandCardNew";
import HotDealCard from "@/components/home/HotDealCard";
import { useToast } from "@/components/ui/use-toast";

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
  image_url_3kg: string | null;
  image_url_6kg: string | null;
  image_url_12kg: string | null;
  price_6kg: string | null;
  price_12kg: string | null;
  refill_price_3kg: string | null;
  refill_price_6kg: string | null;
  refill_price_12kg: string | null;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hotDeals, setHotDeals] = useState<HotDeal[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch hot deals
        const { data: hotDealsData, error: hotDealsError } = await supabase
          .from('hot_deals')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (hotDealsError) {
          console.error('Error fetching hot deals:', hotDealsError);
          toast({
            title: "Error",
            description: "Failed to load hot deals. Please try again.",
            variant: "destructive",
          });
        } else if (hotDealsData) {
          setHotDeals(hotDealsData);
        }

        // Fetch brands with retry logic
        let retries = 3;
        let brandsData = null;
        let brandsError = null;

        while (retries > 0 && !brandsData) {
          const { data, error } = await supabase
            .from('brands')
            .select('*')
            .order('brand', { ascending: true });

          if (data) {
            brandsData = data;
            break;
          }

          brandsError = error;
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          }
        }

        if (brandsError) {
          console.error('Error fetching brands:', brandsError);
          toast({
            title: "Error",
            description: "Failed to load brands. Please try again.",
            variant: "destructive",
          });
        } else if (brandsData) {
          setBrands(brandsData);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const groupedBrands = brands.reduce((acc, brand) => {
    if (!acc[brand.brand]) {
      acc[brand.brand] = [];
    }
    acc[brand.brand].push(brand);
    return acc;
  }, {} as Record<string, Brand[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Transform brands data into a flat array of cards
  const allCards = brands.reduce((acc: React.ReactNode[], brand) => {
    if (brand.refill_price_3kg) {
      acc.push(
        <BrandCardNew
          key={`${brand.id}-3kg`}
          name={brand.name}
          brand={brand.brand}
          image={brand.image_url_3kg || ''}
          size="3kg"
          price="Contact for Price"
          refillPrice={brand.refill_price_3kg}
        />
      );
    }
    if (brand.price_6kg) {
      acc.push(
        <BrandCardNew
          key={`${brand.id}-6kg`}
          name={brand.name}
          brand={brand.brand}
          image={brand.image_url_6kg || ''}
          size="6kg"
          price={brand.price_6kg}
          refillPrice={brand.refill_price_6kg}
        />
      );
    }
    if (brand.price_12kg) {
      acc.push(
        <BrandCardNew
          key={`${brand.id}-12kg`}
          name={brand.name}
          brand={brand.brand}
          image={brand.image_url_12kg || ''}
          size="12kg"
          price={brand.price_12kg}
          refillPrice={brand.refill_price_12kg}
        />
      );
    }
    return acc;
  }, []);

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

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {allCards}
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
