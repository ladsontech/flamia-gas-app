
import React from "react";
import BrandCardNew from "./BrandCardNew";
import { Brand } from "@/hooks/useHomeData";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BrandsGridProps {
  brands: Brand[];
}

const BrandsGrid = ({ brands }: BrandsGridProps) => {
  const queryClient = useQueryClient();

  const prefetchBrandData = (brandId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['brand', brandId],
      queryFn: async () => {
        const { data } = await supabase
          .from('brands')
          .select('*')
          .eq('id', brandId)
          .single();
        return data;
      },
      staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    });
  };

  const allCards = brands.reduce((acc: React.ReactNode[], brand) => {
    if (brand.refill_price_3kg) {
      acc.push(
        <div 
          key={`${brand.id}-3kg`}
          onMouseEnter={() => prefetchBrandData(brand.id)}
        >
          <BrandCardNew
            name={brand.name}
            brand={brand.brand}
            image={brand.image_url_3kg || ''}
            size="3kg"
            price="Contact for Price"
            refillPrice={brand.refill_price_3kg}
          />
        </div>
      );
    }
    if (brand.price_6kg) {
      acc.push(
        <div 
          key={`${brand.id}-6kg`}
          onMouseEnter={() => prefetchBrandData(brand.id)}
        >
          <BrandCardNew
            name={brand.name}
            brand={brand.brand}
            image={brand.image_url_6kg || ''}
            size="6kg"
            price={brand.price_6kg}
            refillPrice={brand.refill_price_6kg}
          />
        </div>
      );
    }
    if (brand.price_12kg) {
      acc.push(
        <div 
          key={`${brand.id}-12kg`}
          onMouseEnter={() => prefetchBrandData(brand.id)}
        >
          <BrandCardNew
            name={brand.name}
            brand={brand.brand}
            image={brand.image_url_12kg || ''}
            size="12kg"
            price={brand.price_12kg}
            refillPrice={brand.refill_price_12kg}
          />
        </div>
      );
    }
    return acc;
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      {allCards}
    </div>
  );
};

export default BrandsGrid;
