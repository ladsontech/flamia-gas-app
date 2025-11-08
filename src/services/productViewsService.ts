import { supabase } from '@/integrations/supabase/client';

/**
 * Track a product view - counts every visit as a separate view (total views, not unique)
 * Works for both gadgets and business_products
 */
export const trackProductView = async (productId: string, productType: 'gadget' | 'business_product' = 'business_product') => {
  try {
    // Get user ID if logged in
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Insert view record - every visit counts as a new view
    const { error } = await supabase
      .from('product_views' as any)
      .insert({
        product_id: productId,
        product_type: productType,
        user_id: userId,
        viewed_at: new Date().toISOString()
      });

    if (error) {
      // If table doesn't exist, silently fail (will be created via migration)
      console.warn('Failed to track product view:', error);
    }
  } catch (error) {
    console.warn('Error tracking product view:', error);
  }
};

export const getProductViewCount = async (productId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('product_views' as any)
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId);

    if (error) {
      console.warn('Failed to get product view count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.warn('Error getting product view count:', error);
    return 0;
  }
};

export const getProductViewCounts = async (productIds: string[]): Promise<Record<string, number>> => {
  try {
    if (!productIds || productIds.length === 0) {
      return {};
    }

    const { data, error } = await supabase
      .from('product_views' as any)
      .select('product_id')
      .in('product_id', productIds);

    if (error) {
      console.warn('Failed to get product view counts:', error);
      return {};
    }

    // Count views per product
    const counts: Record<string, number> = {};
    productIds.forEach(id => counts[id] = 0);
    
    (data as any)?.forEach((view: any) => {
      if (view.product_id) {
        counts[view.product_id] = (counts[view.product_id] || 0) + 1;
      }
    });

    return counts;
  } catch (error) {
    console.warn('Error getting product view counts:', error);
    return {};
  }
};

