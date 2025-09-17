import { supabase } from "@/integrations/supabase/client";

export type AdminPermission = 
  | 'manage_orders'
  | 'manage_withdrawals' 
  | 'manage_gadgets'
  | 'manage_brands'
  | 'manage_businesses'
  | 'manage_products'
  | 'manage_seller_applications'
  | 'manage_promotions'
  | 'manage_carousel'
  | 'manage_marketplace_settings';

export interface AdminPermissionRecord {
  id: string;
  user_id: string;
  permission: AdminPermission;
  granted_by: string | null;
  created_at: string;
  updated_at: string;
}

export const getUserPermissions = async (userId: string): Promise<AdminPermission[]> => {
  const { data, error } = await supabase
    .from('admin_permissions')
    .select('permission')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }

  return data.map(p => p.permission as AdminPermission);
};

export const hasPermission = async (userId: string, permission: AdminPermission): Promise<boolean> => {
  const { data, error } = await supabase
    .rpc('has_admin_permission', { 
      user_uuid: userId, 
      permission_name: permission 
    });

  if (error) {
    console.error('Error checking permission:', error);
    return false;
  }

  return data || false;
};