export interface Gadget {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  brand?: string;
  image_url?: string;
  features?: string[];
  in_stock: boolean;
  stock_quantity: number;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface GadgetFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}