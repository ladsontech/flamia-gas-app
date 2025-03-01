
import React from "react";
import BrandCardNew from "./BrandCardNew";

interface Brand {
  id: string;
  name: string;
  brand: string;
  image_url_3kg?: string;
  image_url_6kg?: string;
  image_url_12kg?: string;
  price_6kg?: string;
  price_12kg?: string;
  refill_price_3kg?: string;
  refill_price_6kg?: string;
  refill_price_12kg?: string;
  description_3kg?: string;
  description_6kg?: string;
  description_12kg?: string;
}

interface BrandsGridProps {
  brands: Brand[];
}

// Static brand data with optimized descriptions and keywords
const staticBrands = [
  {
    id: "1",
    name: "Total Gas Uganda",
    brand: "Total",
    image_url_6kg: "/images/total 6KG.png",
    image_url_12kg: "/images/total 12KG.png",
    price_6kg: "UGX 170,000",
    price_12kg: "UGX 350,000",
    refill_price_3kg: "UGX 28,000",
    refill_price_6kg: "UGX 45,000",
    refill_price_12kg: "UGX 95,000",
    description_6kg: "Affordable Total 6KG gas cylinder with same-day delivery in Uganda",
    description_12kg: "Total 12KG LPG gas cylinder - perfect for large families in Uganda"
  },
  {
    id: "2",
    name: "Shell Gas Uganda",
    brand: "Shell",
    image_url_6kg: "/images/shell 6KG.png",
    image_url_12kg: "/images/shell 12KG.png",
    price_6kg: "UGX 165,000",
    price_12kg: "UGX 300,000",
    refill_price_6kg: "UGX 45,000",
    refill_price_12kg: "UGX 95,000",
    description_6kg: "Shell 6KG gas cylinder with fastest delivery in Kampala & Wakiso",
    description_12kg: "Premium Shell 12KG gas cylinder - reliable LPG supplier in Uganda"
  },
  {
    id: "3",
    name: "Oryx Gas Uganda",
    brand: "Oryx",
    image_url_6kg: "/images/oryx-6kg.jpg",
    image_url_12kg: "/images/oryx-12kg.jpg",
    price_6kg: "UGX 165,000",
    refill_price_6kg: "UGX 45,000",
    refill_price_12kg: "UGX 95,000",
    description_3kg: "Compact Oryx 3KG gas cylinder for small households in Uganda",
    description_6kg: "Popular Oryx 6KG gas cylinder - affordable cooking gas with free delivery",
    description_12kg: "Oryx 12KG gas cylinder for restaurants and large homes in Uganda"
  },
  {
    id: "4",
    name: "Stabex Gas Uganda",
    brand: "Stabex",
    image_url_6kg: "/images/stabex 6KG.png",
    image_url_12kg: "/images/stabex 12KG.png",
    price_6kg: "UGX 145,000",
    price_12kg: "UGX 250,000",
    refill_price_6kg: "UGX 45,000",
    refill_price_12kg: "UGX 95,000",
    description_6kg: "Cheapest Stabex 6KG gas cylinder price in Uganda with free delivery",
    description_12kg: "Stabex 12KG gas cylinder - reliable cooking gas for Uganda homes"
  },
  {
    id: "5",
    name: "Hass Gas Uganda",
    brand: "Hass",
    image_url_6kg: "/images/hass-6kg.jpg",
    image_url_12kg: "/images/hass-12kg.jpg",
    price_6kg: "UGX 122,000",
    price_12kg: "UGX 183,000",
    refill_price_6kg: "UGX 39,000",
    refill_price_12kg: "UGX 79,000",
    description_6kg: "Hass 6KG gas cylinder - cheap LPG for delivery in Kampala & Wakiso",
    description_12kg: "Premium Hass 12KG gas cylinder for restaurants & large families"
  }
];

const BrandsGrid: React.FC<BrandsGridProps> = () => {
  // Use the staticBrands instead of the brands prop for static data
  const allCards = staticBrands.reduce((acc: React.ReactNode[], brand) => {
    // Only add 3kg cards if the brand has a refill price for 3kg
    if (brand.refill_price_3kg) {
      acc.push(
        <div key={`${brand.id}-3kg`}>
          <BrandCardNew
            name={brand.name}
            brand={brand.brand}
            image={brand.image_url_3kg || ''} // Use empty string as fallback
            size="3kg"
            price={brand.refill_price_3kg}
            description={brand.description_3kg || `Affordable ${brand.brand} 3KG gas refill with free delivery in Uganda`}
          />
        </div>
      );
    }
    
    // Add 6kg cards if the brand has a price for 6kg
    if (brand.price_6kg) {
      acc.push(
        <div key={`${brand.id}-6kg`}>
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
        <div key={`${brand.id}-12kg`}>
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
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      {allCards}
    </div>
  );
};

export default BrandsGrid;
