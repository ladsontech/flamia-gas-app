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
  | 'manage_marketplace_settings'
  ;

export interface AdminPermissionRecord {
  id: string;
  user_id: string;
  permission: AdminPermission;
  granted_by: string | null;
  created_at: string;
  updated_at: string;
}

export const getAllPermissions = (): AdminPermission[] => [
  'manage_orders',
  'manage_withdrawals',
  'manage_gadgets',
  'manage_brands',
  'manage_businesses',
  'manage_products',
  'manage_seller_applications',
  'manage_promotions',
  'manage_carousel',
  'manage_marketplace_settings',
];

export const getPermissionLabels = (): Record<AdminPermission, string> => ({
  'manage_orders': 'Manage Orders',
  'manage_withdrawals': 'Manage Withdrawals',
  'manage_gadgets': 'Manage Gadgets',
  'manage_brands': 'Manage Brands',
  'manage_businesses': 'Manage Businesses',
  'manage_products': 'Manage Products',
  'manage_seller_applications': 'Manage Seller Applications',
  'manage_promotions': 'Manage Promotions',
  'manage_carousel': 'Manage Carousel',
  'manage_marketplace_settings': 'Manage Marketplace Settings',
  
});

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

export const grantPermission = async (userId: string, permission: AdminPermission): Promise<void> => {
  const { error } = await supabase
    .from('admin_permissions')
    .upsert({ 
      user_id: userId, 
      permission,
      granted_by: (await supabase.auth.getUser()).data.user?.id
    });

  if (error) throw error;
};

export const revokePermission = async (userId: string, permission: AdminPermission): Promise<void> => {
  const { error } = await supabase
    .from('admin_permissions')
    .delete()
    .eq('user_id', userId)
    .eq('permission', permission);

  if (error) throw error;
};

export const getAllUsersWithPermissions = async () => {
  const { data, error } = await supabase
    .from('admin_permissions')
    .select(`
      user_id,
      permission,
      created_at,
      profiles:user_id (
        display_name,
        full_name
      )
    `);

  if (error) throw error;

  // Group permissions by user
  const userPermissions: Record<string, {
    user_id: string;
    name: string;
    permissions: AdminPermission[];
  }> = {};

  data.forEach(item => {
    const userId = item.user_id;
    if (!userPermissions[userId]) {
      userPermissions[userId] = {
        user_id: userId,
        name: (item.profiles as any)?.display_name || (item.profiles as any)?.full_name || 'Unknown User',
        permissions: []
      };
    }
    userPermissions[userId].permissions.push(item.permission as AdminPermission);
  });

  return Object.values(userPermissions);
};