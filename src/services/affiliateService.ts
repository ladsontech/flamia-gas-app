import { supabase } from '@/integrations/supabase/client';
import type { AffiliateShop, AffiliateShopProduct } from '@/types/affiliate';

export const generateAffiliateShopSlug = async (shopName: string): Promise<string> => {
  let slug = shopName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  let finalSlug = slug;
  let counter = 1;

  while (true) {
    const { data, error } = await supabase
      .from('affiliate_shops')
      .select('id')
      .eq('shop_slug', finalSlug)
      .single();

    if (error && error.code === 'PGRST116') {
      break;
    }

    if (data) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    } else {
      break;
    }
  }

  return finalSlug;
};

export const createAffiliateShop = async (
  shopData: Omit<AffiliateShop, 'id' | 'created_at' | 'updated_at' | 'shop_slug'>
): Promise<AffiliateShop> => {
  const slug = await generateAffiliateShopSlug(shopData.shop_name);

  const { data, error } = await supabase
    .from('affiliate_shops')
    .insert({
      ...shopData,
      shop_slug: slug,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AffiliateShop;
};

export const fetchAffiliateShopByUser = async (userId: string): Promise<AffiliateShop | null> => {
  const { data, error } = await supabase
    .from('affiliate_shops')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as AffiliateShop | null;
};

export const fetchAffiliateShopBySlug = async (slug: string): Promise<AffiliateShop | null> => {
  const { data, error } = await supabase
    .from('affiliate_shops')
    .select('*')
    .eq('shop_slug', slug)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as AffiliateShop | null;
};

export const updateAffiliateShop = async (
  shopId: string,
  updates: Partial<AffiliateShop>
): Promise<void> => {
  const { error } = await supabase
    .from('affiliate_shops')
    .update(updates)
    .eq('id', shopId);

  if (error) throw error;
};

export const addProductToAffiliateShop = async (
  affiliateShopId: string,
  businessProductId: string,
  commissionRate: number,
  commissionType: 'percentage' | 'fixed',
  fixedCommission?: number
): Promise<void> => {
  const { error } = await supabase
    .from('affiliate_shop_products')
    .insert({
      affiliate_shop_id: affiliateShopId,
      business_product_id: businessProductId,
      commission_rate: commissionRate,
      commission_type: commissionType,
      fixed_commission: fixedCommission,
    });

  if (error) throw error;
};

export const removeProductFromAffiliateShop = async (productId: string): Promise<void> => {
  const { error } = await supabase
    .from('affiliate_shop_products')
    .delete()
    .eq('id', productId);

  if (error) throw error;
};

export const fetchAffiliateShopProducts = async (
  affiliateShopId: string
): Promise<AffiliateShopProduct[]> => {
  const { data, error } = await supabase
    .from('affiliate_shop_products')
    .select('*')
    .eq('affiliate_shop_id', affiliateShopId)
    .eq('is_active', true);

  if (error) throw error;
  return (data || []) as AffiliateShopProduct[];
};

export const countAffiliateShopProducts = async (affiliateShopId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('affiliate_shop_products')
    .select('*', { count: 'exact', head: true })
    .eq('affiliate_shop_id', affiliateShopId)
    .eq('is_active', true);

  if (error) throw error;
  return count || 0;
};
