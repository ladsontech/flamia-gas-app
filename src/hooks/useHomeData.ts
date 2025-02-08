
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface HotDeal {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: string | null;
}

export interface Brand {
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

export const useHomeData = () => {
  const { toast } = useToast();
  const [hotDeals, setHotDeals] = useState<HotDeal[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
            await new Promise(resolve => setTimeout(resolve, 1000));
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

    fetchData();
  }, [toast]);

  return { hotDeals, brands, loading };
};
