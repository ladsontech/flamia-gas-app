import { supabase } from '@/integrations/supabase/client';

export interface AffiliateCommission {
  id: string;
  affiliate_shop_id: string;
  order_id: string;
  business_product_id: string;
  commission_amount: number;
  status: 'pending' | 'approved' | 'cancelled';
  created_at: string;
  approved_at: string | null;
  order?: {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
  };
  product?: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

export interface AffiliateEarnings {
  totalPending: number;
  totalApproved: number;
  totalEarnings: number;
  commissionsCount: number;
}

/**
 * Track affiliate commission when an order is placed through affiliate link
 */
export const trackAffiliateCommission = async (
  affiliateShopId: string,
  orderId: string,
  productId: string,
  productPrice: number,
  quantity: number = 1
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get affiliate product commission settings
    const { data: affiliateProduct, error: productError } = await supabase
      .from('affiliate_shop_products')
      .select('commission_rate, commission_type, fixed_commission')
      .eq('affiliate_shop_id', affiliateShopId)
      .eq('business_product_id', productId)
      .eq('is_active', true)
      .single();

    if (productError || !affiliateProduct) {
      console.error('Affiliate product not found:', productError);
      return { success: false, error: 'Affiliate product not found' };
    }

    // Calculate commission
    let commissionAmount = 0;
    const totalPrice = productPrice * quantity;

    if (affiliateProduct.commission_type === 'fixed' && affiliateProduct.fixed_commission) {
      commissionAmount = affiliateProduct.fixed_commission * quantity;
    } else {
      // Percentage commission
      commissionAmount = (totalPrice * affiliateProduct.commission_rate) / 100;
    }

    // Create affiliate order record
    const { error: insertError } = await supabase
      .from('affiliate_orders')
      .insert({
        affiliate_shop_id: affiliateShopId,
        order_id: orderId,
        business_product_id: productId,
        commission_amount: commissionAmount,
        status: 'pending'
      });

    if (insertError) {
      console.error('Error tracking affiliate commission:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in trackAffiliateCommission:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get affiliate commissions for a specific shop
 */
export const getAffiliateCommissions = async (
  affiliateShopId: string,
  status?: 'pending' | 'approved' | 'cancelled'
): Promise<AffiliateCommission[]> => {
  try {
    let query = supabase
      .from('affiliate_orders')
      .select(`
        *,
        order:orders(id, created_at, total_amount, status),
        product:business_products(id, name, price, image_url)
      `)
      .eq('affiliate_shop_id', affiliateShopId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching affiliate commissions:', error);
      return [];
    }

    return (data || []) as AffiliateCommission[];
  } catch (error) {
    console.error('Error in getAffiliateCommissions:', error);
    return [];
  }
};

/**
 * Get affiliate earnings summary
 */
export const getAffiliateEarnings = async (affiliateShopId: string): Promise<AffiliateEarnings> => {
  try {
    const { data, error } = await supabase
      .from('affiliate_orders')
      .select('commission_amount, status')
      .eq('affiliate_shop_id', affiliateShopId);

    if (error) {
      console.error('Error fetching affiliate earnings:', error);
      return {
        totalPending: 0,
        totalApproved: 0,
        totalEarnings: 0,
        commissionsCount: 0
      };
    }

    const totalPending = data
      ?.filter(o => o.status === 'pending')
      .reduce((sum, o) => sum + (o.commission_amount || 0), 0) || 0;

    const totalApproved = data
      ?.filter(o => o.status === 'approved')
      .reduce((sum, o) => sum + (o.commission_amount || 0), 0) || 0;

    return {
      totalPending,
      totalApproved,
      totalEarnings: totalPending + totalApproved,
      commissionsCount: data?.length || 0
    };
  } catch (error) {
    console.error('Error in getAffiliateEarnings:', error);
    return {
      totalPending: 0,
      totalApproved: 0,
      totalEarnings: 0,
      commissionsCount: 0
    };
  }
};

/**
 * Admin: Approve affiliate commission
 */
export const approveAffiliateCommission = async (commissionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('affiliate_orders')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', commissionId);

    if (error) {
      console.error('Error approving commission:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in approveAffiliateCommission:', error);
    return false;
  }
};

/**
 * Admin: Cancel affiliate commission
 */
export const cancelAffiliateCommission = async (commissionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('affiliate_orders')
      .update({ status: 'cancelled' })
      .eq('id', commissionId);

    if (error) {
      console.error('Error cancelling commission:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in cancelAffiliateCommission:', error);
    return false;
  }
};

/**
 * Admin: Get all pending commissions
 */
export const getAllPendingCommissions = async (): Promise<AffiliateCommission[]> => {
  try {
    const { data, error } = await supabase
      .from('affiliate_orders')
      .select(`
        *,
        order:orders(id, created_at, total_amount, status),
        product:business_products(id, name, price, image_url),
        affiliate_shop:affiliate_shops(id, shop_name, user_id)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending commissions:', error);
      return [];
    }

    return (data || []) as AffiliateCommission[];
  } catch (error) {
    console.error('Error in getAllPendingCommissions:', error);
    return [];
  }
};

