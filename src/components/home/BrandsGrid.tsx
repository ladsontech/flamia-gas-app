
import React from "react";
import BrandCardNew from "./BrandCardNew";
import { Brand } from "@/hooks/useHomeData";

interface BrandsGridProps {
  brands: Brand[];
}

const BrandsGrid = ({ brands }: BrandsGridProps) => {
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
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      {allCards}
    </div>
  );
};

export default BrandsGrid;
