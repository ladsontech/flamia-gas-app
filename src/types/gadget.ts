
export interface Gadget {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  brand?: string;
  image_url?: string;
  in_stock: boolean;
  condition: 'brand_new' | 'used';
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
