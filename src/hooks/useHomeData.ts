
import { useState } from "react";

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
    image_url: "https://images.unsplash.com/photo-1598449426314-8b17b0cc9c46?q=80&w=800&auto=format&fit=crop",
    price: "UGX 110,000"
  },
  {
    id: "2",
    title: "Shell Gas 12KG Bundle - Best Price in Uganda",
    description: "12KG Shell Gas cylinder with free delivery in Kampala, Wakiso, and Mukono. Includes regulator and quality guarantee.",
    image_url: "https://images.unsplash.com/photo-1611587644068-17ccb3e2ac40?q=80&w=800&auto=format&fit=crop",
    price: "UGX 175,000"
  },
  {
    id: "3",
    title: "Oryx Gas Refill Deal - Cheapest in Uganda",
    description: "Get your Oryx 6KG cylinder refilled at a special price with free delivery in Kampala. Fastest gas refill service!",
    image_url: "https://images.unsplash.com/photo-1599909631178-f1d3e0166f5b?q=80&w=800&auto=format&fit=crop",
    price: "UGX 40,000"
  },
  {
    id: "4",
    title: "Stabex 6KG New Cylinder - Limited Offer",
    description: "Brand new Stabex 6KG gas cylinder with free regulator and delivery. Most affordable cooking gas in Uganda!",
    image_url: "https://images.unsplash.com/photo-1603665301175-57ba46f392bf?q=80&w=800&auto=format&fit=crop",
    price: "UGX 105,000"
  },
  {
    id: "5",
    title: "Hass Gas 12KG Refill - Best For Restaurants",
    description: "Same-day Hass 12KG gas refill service for restaurants and large families in Kampala. Reliable LPG supplier!",
    image_url: "https://images.unsplash.com/photo-1574328595366-a35e89721cc6?q=80&w=800&auto=format&fit=crop",
    price: "UGX 75,000"
  }
];

// Static brands data with SEO keywords
const staticBrands: Brand[] = [
  {
    id: "1",
    name: "Total Gas Uganda",
    brand: "Total",
    image_url_3kg: "https://images.unsplash.com/photo-1590959651373-a3db0f38a961?q=80&w=800&auto=format&fit=crop",
    image_url_6kg: "https://images.unsplash.com/photo-1598449426314-8b17b0cc9c46?q=80&w=800&auto=format&fit=crop",
    image_url_12kg: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=800&auto=format&fit=crop",
    price_6kg: "UGX 120,000",
    price_12kg: "UGX 180,000",
    refill_price_3kg: "UGX 30,000",
    refill_price_6kg: "UGX 45,000",
    refill_price_12kg: "UGX 85,000"
  },
  {
    id: "2",
    name: "Shell Gas Uganda",
    brand: "Shell",
    image_url_3kg: null,
    image_url_6kg: "https://images.unsplash.com/photo-1585666876200-20c138ae56aa?q=80&w=800&auto=format&fit=crop",
    image_url_12kg: "https://images.unsplash.com/photo-1611587644068-17ccb3e2ac40?q=80&w=800&auto=format&fit=crop",
    price_6kg: "UGX 130,000",
    price_12kg: "UGX 190,000",
    refill_price_3kg: null,
    refill_price_6kg: "UGX 48,000",
    refill_price_12kg: "UGX 90,000"
  },
  {
    id: "3",
    name: "Oryx Gas Uganda",
    brand: "Oryx",
    image_url_3kg: "https://images.unsplash.com/photo-1595398062834-5b4e948ce181?q=80&w=800&auto=format&fit=crop",
    image_url_6kg: "https://images.unsplash.com/photo-1599909631178-f1d3e0166f5b?q=80&w=800&auto=format&fit=crop",
    image_url_12kg: "https://images.unsplash.com/photo-1598128558393-70ff21433be0?q=80&w=800&auto=format&fit=crop",
    price_6kg: "UGX 125,000",
    price_12kg: "UGX 185,000",
    refill_price_3kg: "UGX 28,000",
    refill_price_6kg: "UGX 42,000",
    refill_price_12kg: "UGX 80,000"
  },
  {
    id: "4",
    name: "Stabex Gas Uganda",
    brand: "Stabex",
    image_url_3kg: null,
    image_url_6kg: "https://images.unsplash.com/photo-1603665301175-57ba46f392bf?q=80&w=800&auto=format&fit=crop",
    image_url_12kg: "https://images.unsplash.com/photo-1603665270146-bbdf9858ea55?q=80&w=800&auto=format&fit=crop",
    price_6kg: "UGX 118,000",
    price_12kg: "UGX 178,000",
    refill_price_3kg: null,
    refill_price_6kg: "UGX 40,000",
    refill_price_12kg: "UGX 78,000"
  },
  {
    id: "5",
    name: "Hass Gas Uganda",
    brand: "Hass",
    image_url_3kg: null,
    image_url_6kg: "https://images.unsplash.com/photo-1592155931584-901ac15763e3?q=80&w=800&auto=format&fit=crop",
    image_url_12kg: "https://images.unsplash.com/photo-1574328595366-a35e89721cc6?q=80&w=800&auto=format&fit=crop",
    price_6kg: "UGX 122,000",
    price_12kg: "UGX 183,000",
    refill_price_3kg: null,
    refill_price_6kg: "UGX 39,000",
    refill_price_12kg: "UGX 79,000"
  }
];

export const useHomeData = () => {
  const [hotDeals] = useState<HotDeal[]>(staticHotDeals);
  const [brands] = useState<Brand[]>(staticBrands);
  const [loading] = useState(false);

  // Simulate prefetching data
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
