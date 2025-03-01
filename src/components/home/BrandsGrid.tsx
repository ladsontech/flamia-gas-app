
import React from "react";
import BrandCardNew from "./BrandCardNew";
import { Brand } from "@/hooks/useHomeData";

interface BrandsGridProps {
  brands: Brand[];
}

// Static brand data
const staticBrands = [
  {
    id: "1",
    name: "Total Gas",
    brand: "Total",
    image_url_3kg: "https://images.unsplash.com/photo-1590959651373-a3db0f38a961?q=80&w=3039&auto=format&fit=crop",
    image_url_6kg: "https://images.unsplash.com/photo-1598449426314-8b17b0cc9c46?q=80&w=3000&auto=format&fit=crop",
    image_url_12kg: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=2942&auto=format&fit=crop",
    price_6kg: "UGX 120,000",
    price_12kg: "UGX 180,000",
    refill_price_3kg: "UGX 30,000",
    refill_price_6kg: null,
    refill_price_12kg: null
  },
  {
    id: "2",
    name: "Shell Gas",
    brand: "Shell",
    image_url_3kg: null,
    image_url_6kg: "https://images.unsplash.com/photo-1585666876200-20c138ae56aa?q=80&w=3087&auto=format&fit=crop",
    image_url_12kg: "https://images.unsplash.com/photo-1611587644068-17ccb3e2ac40?q=80&w=2942&auto=format&fit=crop",
    price_6kg: "UGX 130,000",
    price_12kg: "UGX 190,000",
    refill_price_3kg: null,
    refill_price_6kg: null,
    refill_price_12kg: null
  },
  {
    id: "3",
    name: "Oryx Gas",
    brand: "Oryx",
    image_url_3kg: "https://images.unsplash.com/photo-1595398062834-5b4e948ce181?q=80&w=2080&auto=format&fit=crop",
    image_url_6kg: "https://images.unsplash.com/photo-1599909631178-f1d3e0166f5b?q=80&w=2940&auto=format&fit=crop",
    image_url_12kg: "https://images.unsplash.com/photo-1598128558393-70ff21433be0?q=80&w=2789&auto=format&fit=crop",
    price_6kg: "UGX 125,000",
    price_12kg: "UGX 185,000",
    refill_price_3kg: "UGX 28,000",
    refill_price_6kg: null,
    refill_price_12kg: null
  }
];

const BrandsGrid: React.FC<BrandsGridProps> = ({ brands }) => {
  // Use the brands prop instead of staticBrands
  const allCards = staticBrands.reduce((acc: React.ReactNode[], brand) => {
    if (brand.refill_price_3kg) {
      acc.push(
        <div key={`${brand.id}-3kg`}>
          <BrandCardNew
            name={brand.name}
            brand={brand.brand}
            image={brand.image_url_3kg || ''}
            size="3kg"
            price="Contact for Price"
          />
        </div>
      );
    }
    if (brand.price_6kg) {
      acc.push(
        <div key={`${brand.id}-6kg`}>
          <BrandCardNew
            name={brand.name}
            brand={brand.brand}
            image={brand.image_url_6kg || ''}
            size="6kg"
            price={brand.price_6kg}
          />
        </div>
      );
    }
    if (brand.price_12kg) {
      acc.push(
        <div key={`${brand.id}-12kg`}>
          <BrandCardNew
            name={brand.name}
            brand={brand.brand}
            image={brand.image_url_12kg || ''}
            size="12kg"
            price={brand.price_12kg}
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
