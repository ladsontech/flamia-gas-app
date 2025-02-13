
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

const fetchHotDeals = async () => {
  const { data, error } = await supabase
    .from('hot_deals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as HotDeal[];
};

const fetchBrands = async () => {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('brand', { ascending: true });

  if (error) throw error;
  return data as Brand[];
};

export const useHomeData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for hot deals
  const { 
    data: hotDeals = [], 
    isLoading: hotDealsLoading 
  } = useQuery({
    queryKey: ['hotDeals'],
    queryFn: fetchHotDeals,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep unused data for 30 minutes
    retry: 3,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  // Query for brands
  const { 
    data: brands = [], 
    isLoading: brandsLoading 
  } = useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands,
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes
    gcTime: 1000 * 60 * 60, // Keep unused data for 1 hour
    retry: 3,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  // Prefetch on hover
  const prefetchBrand = async (brandId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['brand', brandId],
      queryFn: () => fetchBrandDetails(brandId),
      staleTime: 1000 * 60 * 5
    });
  };

  // Prefetch related data
  useEffect(() => {
    // Prefetch orders data
    queryClient.prefetchQuery({
      queryKey: ['orders'],
      queryFn: () => supabase.from('orders').select('*').order('created_at', { ascending: false }),
      staleTime: 1000 * 60 * 2
    });

    // Prefetch accessories data
    queryClient.prefetchQuery({
      queryKey: ['accessories'],
      queryFn: () => supabase.from('accessories').select('*'),
      staleTime: 1000 * 60 * 5
    });
  }, [queryClient]);

  return { 
    hotDeals, 
    brands, 
    loading: hotDealsLoading || brandsLoading,
    prefetchBrand
  };
};

// Additional utility function for single brand details
const fetchBrandDetails = async (brandId: string) => {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .single();

  if (error) throw error;
  return data;
};
