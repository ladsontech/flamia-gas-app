
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import HomeHeader from "@/components/home/Header";
import HeaderSection from "@/components/home/HeaderSection";
import BrandsGrid from "@/components/home/BrandsGrid";
import HotDealsSection from "@/components/home/HotDealsSection";
import { useHomeData } from "@/hooks/useHomeData";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { hotDeals, brands, loading } = useHomeData();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container px-2 sm:px-4 py-2 sm:py-4">
        <HomeHeader />
        <HeaderSection />
        <BrandsGrid brands={brands} />
        <HotDealsSection hotDeals={hotDeals} />
      </div>
    </div>
  );
};

export default Index;
