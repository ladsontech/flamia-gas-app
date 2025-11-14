export interface AffiliateShop {
  id: string;
  user_id: string;
  shop_name: string;
  shop_slug: string;
  shop_description?: string;
  shop_logo_url?: string;
  tier: 'free' | 'premium';
  custom_domain?: string;
  is_active: boolean;
  monthly_fee: number;
  last_payment_date?: string;
  next_payment_due?: string;
  preferred_price_model?: 'fixed' | 'flexible' | 'both';
  created_at: string;
  updated_at: string;
}

export interface AffiliateShopProduct {
  id: string;
  affiliate_shop_id: string;
  business_product_id: string;
  commission_rate: number;
  commission_type: 'percentage' | 'fixed';
  fixed_commission?: number;
  is_active: boolean;
  added_at: string;
}

export interface AffiliateOrder {
  id: string;
  affiliate_shop_id: string;
  order_id: string;
  business_product_id: string;
  commission_amount: number;
  status: 'pending' | 'approved' | 'cancelled';
  created_at: string;
  approved_at?: string;
}
