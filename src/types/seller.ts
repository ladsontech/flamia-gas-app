export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  icon?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SellerApplication {
  id: string;
  user_id: string;
  shop_name: string;
  category_id: string | null;
  sample_product_name?: string;
  description?: string;
  sample_images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SellerShop {
  id: string;
  user_id: string;
  business_id?: string;
  application_id?: string;
  shop_name: string;
  shop_slug: string;
  category_id: string;
  tier: 'basic' | 'premium';
  custom_domain?: string;
  commission_enabled: boolean;
  is_active: boolean;
  is_approved: boolean;
  monthly_fee: number;
  last_payment_date?: string;
  next_payment_due?: string;
  shop_description?: string;
  shop_logo_url?: string;
  checkout_type?: 'flamia' | 'whatsapp' | 'both';
  whatsapp_number?: string;
  allow_affiliates?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SellerPayment {
  id: string;
  seller_shop_id: string;
  amount: number;
  payment_method?: string;
  payment_reference?: string;
  status: 'pending' | 'paid' | 'failed';
  payment_date?: string;
  billing_period_start?: string;
  billing_period_end?: string;
  created_at: string;
  updated_at: string;
}

export interface SellerOrder {
  id: string;
  seller_shop_id: string;
  order_id: string;
  business_product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  seller_commission: number;
  flamia_commission: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  whatsapp_order_data?: {
    customer_name?: string;
    phone?: string;
    message?: string;
    timestamp?: string;
  };
  created_at: string;
  updated_at: string;
}
