import { supabase } from '@/integrations/supabase/client';
import type { SellerOrder } from '@/types/seller';

export interface SellerOrderWithDetails extends SellerOrder {
  business_product?: {
    id: string;
    name: string;
    image_url?: string;
    price: number;
  };
  order?: {
    id: string;
    created_at: string;
    status: string;
    checkout_method?: string;
  };
}

/**
 * Fetch all orders for a seller shop
 */
export const fetchSellerOrders = async (
  shopId: string
): Promise<SellerOrderWithDetails[]> => {
  const { data, error } = await supabase
    .from('seller_orders')
    .select(`
      *,
      business_product:business_products(id, name, image_url, price),
      order:orders(id, created_at, status, checkout_method)
    `)
    .eq('seller_shop_id', shopId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching seller orders:', error);
    throw error;
  }

  return (data as any[]) || [];
};

/**
 * Fetch WhatsApp orders specifically
 */
export const fetchWhatsAppOrders = async (
  shopId: string
): Promise<SellerOrderWithDetails[]> => {
  const { data, error } = await supabase
    .from('seller_orders')
    .select(`
      *,
      business_product:business_products(id, name, image_url, price),
      order:orders!inner(id, created_at, status, checkout_method)
    `)
    .eq('seller_shop_id', shopId)
    .eq('order.checkout_method', 'whatsapp')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching WhatsApp orders:', error);
    throw error;
  }

  return (data as any[]) || [];
};

/**
 * Update seller order status
 */
export const updateSellerOrderStatus = async (
  orderId: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
): Promise<void> => {
  const { error } = await supabase
    .from('seller_orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating seller order status:', error);
    throw error;
  }
};

/**
 * Get seller order analytics
 */
export const getSellerOrderAnalytics = async (shopId: string) => {
  const { data, error } = await supabase
    .from('seller_orders')
    .select('total_price, status, seller_commission, created_at')
    .eq('seller_shop_id', shopId);

  if (error) {
    console.error('Error fetching seller order analytics:', error);
    throw error;
  }

  const orders = data || [];
  
  return {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + Number(order.total_price), 0),
    totalCommission: orders.reduce((sum, order) => sum + Number(order.seller_commission), 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
  };
};

