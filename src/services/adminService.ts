import { supabase } from "@/integrations/supabase/client";

// Note: using any to avoid strict typing mismatch with generated Database types

export type UserRole = 'super_admin' | 'business_owner' | 'delivery_man' | 'user';

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  const { data, error } = await (supabase as any)
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('getUserRole error', error);
    return 'user';
  }
  return data?.role ?? 'user';
};

export const setUserRole = async (userId: string, role: UserRole) => {
  const { error } = await (supabase as any)
    .from('user_roles')
    .upsert({ user_id: userId, role }, { onConflict: 'user_id' });
  if (error) throw error;
};

// Marketplace settings
export interface MarketplaceSettings {
  id: number;
  images_per_product: number;
}

export const getMarketplaceSettings = async (): Promise<MarketplaceSettings> => {
  const { data, error } = await (supabase as any)
    .from('marketplace_settings')
    .select('*')
    .eq('id', 1)
    .single();
  if (error) throw error;
  return data as MarketplaceSettings;
};

export const updateMarketplaceSettings = async (updates: Partial<MarketplaceSettings>) => {
  const { error } = await (supabase as any)
    .from('marketplace_settings')
    .update(updates)
    .eq('id', 1);
  if (error) throw error;
};

export const getImagesLimit = async (): Promise<number> => {
  try {
    const settings = await getMarketplaceSettings();
    return settings.images_per_product ?? 4;
  } catch (e) {
    return 4;
  }
};

// Seller applications
export interface SellerApplication {
  id: string;
  user_id: string;
  shop_name: string;
  category: string | null;
  description: string | null;
  sample_product_name: string | null;
  sample_images: string[];
  status: 'pending' | 'approved' | 'rejected';
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export const createSellerApplication = async (payload: Omit<SellerApplication, 'id' | 'status' | 'review_notes' | 'reviewed_at' | 'created_at'>) => {
  const { error } = await (supabase as any)
    .from('seller_applications')
    .insert([{ ...payload, status: 'pending' }]);
  if (error) throw error;
};

export const listSellerApplications = async (status?: 'pending' | 'approved' | 'rejected'): Promise<SellerApplication[]> => {
  let query = (supabase as any).from('seller_applications').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as SellerApplication[];
};

export const reviewSellerApplication = async (
  id: string,
  action: 'approve' | 'reject',
  notes?: string
) => {
  const status = action === 'approve' ? 'approved' : 'rejected';
  const { data, error } = await (supabase as any)
    .from('seller_applications')
    .update({ status, review_notes: notes ?? null, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .select('user_id, status')
    .single();
  if (error) throw error;

  // If approved, set user role as business_owner
  if (data?.status === 'approved' && data?.user_id) {
    await setUserRole(data.user_id, 'business_owner');
  }
};

// Get user businesses
export const getUserBusinesses = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        business_id,
        businesses:business_id (
          id,
          name,
          location,
          contact,
          description,
          image_url
        )
      `)
      .eq('user_id', userId)
      .eq('role', 'business_owner')
      .not('business_id', 'is', null);

    if (error) {
      console.error('Error fetching user businesses:', error);
      return [];
    }

    return data?.map(item => item.businesses).filter(Boolean) || [];
  } catch (error) {
    console.error('Error in getUserBusinesses:', error);
    return [];
  }
};

