
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
  category_id?: string;
  is_available: boolean;
  is_featured: boolean;
  commission_rate?: number;
  commission_type?: 'percentage' | 'fixed';
  fixed_commission?: number;
  min_commission?: number;
  affiliate_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessWithProducts extends Business {
  products?: BusinessProduct[];
}
