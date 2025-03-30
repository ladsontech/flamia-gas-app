
import React from "react";
import BrandCardNew from "./BrandCardNew";
import { staticBrands } from "./BrandsData";

interface Brand {
  id: string;
  name: string;
  brand: string;
  image_url_6kg?: string;
  image_url_12kg?: string;
  price_6kg?: string;
  price_12kg?: string;
  description_6kg?: string;
  description_12kg?: string;
}

interface RefillBrand {
  id: string;
  name: string;
  brand: string;
  refill_price_6kg?: string;
  refill_price_12kg?: string;
}

interface BrandsGridProps {
  brands: Brand[];
}

const BrandsGrid: React.FC<BrandsGridProps> = () => {
  // Use the staticBrands instead of the brands prop for static data
  const allCards = staticBrands.reduce((acc: React.ReactNode[], brand) => {
    // Add 6kg cards if the brand has a price for 6kg
    if (brand.price_6kg) {
      acc.push(
        <div key={`${brand.id}-6kg`} className="h-full">
          <BrandCardNew
            name={brand.name}
            brand={brand.brand}
            image={brand.image_url_6kg || ''}
            size="6kg"
            price={brand.price_6kg}
            description={brand.description_6kg || `${brand.brand} 6KG gas cylinder - best prices in Uganda with same-day delivery`}
          />
        </div>
      );
    }
    
    // Add 12kg cards if the brand has a price for 12kg
    if (brand.price_12kg) {
      acc.push(
        <div key={`${brand.id}-12kg`} className="h-full">
          <BrandCardNew
            name={brand.name}
            brand={brand.brand}
            image={brand.image_url_12kg || ''}
            size="12kg"
            price={brand.price_12kg}
            description={brand.description_12kg || `${brand.brand} 12KG gas cylinder for commercial use and large families in Uganda`}
          />
        </div>
      );
    }
    
    return acc;
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-2 md:gap-3">
      {allCards}
    </div>
  );
};

export default BrandsGrid;
