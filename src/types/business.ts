
export interface Business {
  id: string;
  name: string;
  location: string;
  contact: string;
  description?: string;
  is_featured: boolean;
  is_active: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessProduct {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  image_url?: string;
  category?: string;
  is_available: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessWithProducts extends Business {
  products?: BusinessProduct[];
}
