
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

// Static hot deals data
const staticHotDeals: HotDeal[] = [
  {
    id: "1",
    title: "Weekend Special - Total Gas 6KG",
    description: "Get a brand new Total Gas 6KG cylinder at a discounted price. Limited time offer!",
    image_url: "https://images.unsplash.com/photo-1598449426314-8b17b0cc9c46?q=80&w=3000&auto=format&fit=crop",
    price: "UGX 110,000"
  },
  {
    id: "2",
    title: "Shell Gas 12KG Bundle",
    description: "12KG Shell Gas cylinder with free delivery and installation. Comes with a regulator.",
    image_url: "https://images.unsplash.com/photo-1611587644068-17ccb3e2ac40?q=80&w=2942&auto=format&fit=crop",
    price: "UGX 175,000"
  },
  {
    id: "3",
    title: "Oryx Gas Refill Deal",
    description: "Get your Oryx 6KG cylinder refilled at a special price this week only.",
    image_url: "https://images.unsplash.com/photo-1599909631178-f1d3e0166f5b?q=80&w=2940&auto=format&fit=crop",
    price: "UGX 40,000"
  }
];

// Static brands data
const staticBrands: Brand[] = [
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
