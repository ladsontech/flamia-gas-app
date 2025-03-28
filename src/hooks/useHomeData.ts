
import { useState } from "react";
import { staticBrands } from "@/components/home/BrandsData";

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

// Static hot deals data with SEO keywords
const staticHotDeals: HotDeal[] = [
  {
    id: "1",
    title: "Weekend Special - Total Gas 6KG with Free Delivery",
    description: "Get a brand new Total Gas 6KG cylinder at the best price in Uganda. Limited time offer with same-day delivery in Kampala!",
    image_url: "/images/total 6KG.png",
    price: "UGX 110,000"
  },
  {
    id: "2",
    title: "Shell Gas 12KG Bundle - Best Price in Uganda",
    description: "12KG Shell Gas cylinder with free delivery in Kampala, Wakiso, and Mukono. Includes regulator and quality guarantee.",
    image_url: "/images/shell 12KG.png",
    price: "UGX 175,000"
  },
  {
    id: "3",
    title: "Oryx Gas Refill Deal - Cheapest in Uganda",
    description: "Get your Oryx 6KG cylinder refilled at a special price with free delivery in Kampala. Fastest gas refill service!",
    image_url: "/images/oryx 6KG.png",
    price: "UGX 40,000"
  },
  {
    id: "4",
    title: "Stabex 6KG New Cylinder - Limited Offer",
    description: "Brand new Stabex 6KG gas cylinder with free regulator and delivery. Most affordable cooking gas in Uganda!",
    image_url: "/images/stabex 6KG.png",
    price: "UGX 105,000"
  },
  {
    id: "5",
    title: "Hass Gas 12KG Refill - Best For Restaurants",
    description: "Same-day Hass 12KG gas refill service for restaurants and large families in Kampala. Reliable LPG supplier!",
    image_url: "/images/hass 6KG.png",
    price: "UGX 75,000"
  }
];

// Convert static brands data to Brand interface
const mappedBrands: Brand[] = staticBrands.map(brand => ({
  id: brand.id,
  name: brand.name,
  brand: brand.brand,
  image_url_3kg: null,
  image_url_6kg: brand.image_url_6kg || null,
  image_url_12kg: brand.image_url_12kg || null,
  price_6kg: brand.price_6kg || null,
  price_12kg: brand.price_12kg || null,
  refill_price_3kg: null,
  refill_price_6kg: null,
  refill_price_12kg: null
}));

export const useHomeData = () => {
  const [hotDeals] = useState<HotDeal[]>(staticHotDeals);
  const [brands] = useState<Brand[]>(mappedBrands);
  const [loading] = useState(false);

  // Placeholder function for prefetching
  const prefetchBrand = async (brandId: string) => {
    console.log(`Prefetching brand data for ID: ${brandId}`);
    // This is now just a placeholder function since data is static
  };

  return { 
    hotDeals, 
    brands, 
    loading,
    prefetchBrand
  };
};
