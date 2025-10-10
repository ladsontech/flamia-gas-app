import { supabase } from "@/integrations/supabase/client";

export type AdminPermission = 
  | 'manage_gas_orders'
  | 'manage_shop_orders'
  | 'manage_commissions'
  | 'manage_users'
  | 'manage_marketing'
  | 'manage_gadgets'
  | 'manage_brands'
  | 'manage_businesses'
  | 'manage_products'
  | 'manage_seller_applications'
  | 'manage_promotions'
  | 'manage_carousel';

export interface AdminPermissionRecord {
  id: string;
  user_id: string;
  permission: AdminPermission;
  granted_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserWithPermissions {
  id: string;
  full_name: string | null;
  display_name: string | null;
  phone_number: string | null;
  created_at: string;
  referral_count: number;
  permissions: AdminPermission[];
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

export const getAllUsers = async (): Promise<UserWithPermissions[]> => {
  // Optimized query with better performance
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      display_name,
      phone_number,
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(1000); // Reasonable limit for admin interface

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return [];
  }

  // Get referral counts in one optimized query
  const { data: referralCounts, error: referralError } = await supabase
    .from('referrals')
    .select('referrer_id')
    .eq('status', 'completed');

  if (referralError) {
    console.error('Error fetching referral counts:', referralError);
  }

  // Get all admin permissions in one query
  const { data: permissions, error: permissionsError } = await supabase
    .from('admin_permissions')
    .select('user_id, permission');

  if (permissionsError) {
    console.error('Error fetching permissions:', permissionsError);
  }

  // Create maps for O(1) lookups instead of nested loops
  const referralMap = new Map<string, number>();
  referralCounts?.forEach(referral => {
    const count = referralMap.get(referral.referrer_id) || 0;
    referralMap.set(referral.referrer_id, count + 1);
  });

  const permissionsMap = new Map<string, AdminPermission[]>();
  permissions?.forEach(perm => {
    const userPerms = permissionsMap.get(perm.user_id) || [];
    userPerms.push(perm.permission as AdminPermission);
    permissionsMap.set(perm.user_id, userPerms);
  });

  // Combine data and sort by referral count
  return profiles
    .map(profile => ({
      ...profile,
      referral_count: referralMap.get(profile.id) || 0,
      permissions: permissionsMap.get(profile.id) || []
    }))
    .sort((a, b) => b.referral_count - a.referral_count);
};

export const assignPermission = async (userId: string, permission: AdminPermission): Promise<void> => {
  const { error } = await supabase
    .from('admin_permissions')
    .insert({
      user_id: userId,
      permission,
      granted_by: (await supabase.auth.getUser()).data.user?.id
    });

  if (error) {
    console.error('Error assigning permission:', error);
    throw error;
  }
};

export const removePermission = async (userId: string, permission: AdminPermission): Promise<void> => {
  const { error } = await supabase
    .from('admin_permissions')
    .delete()
    .eq('user_id', userId)
    .eq('permission', permission);

  if (error) {
    console.error('Error removing permission:', error);
    throw error;
  }
};