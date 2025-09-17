import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPermission, getUserPermissions, hasPermission } from "@/services/permissionsService";
import { useUserRole } from "./useUserRole";

export const useAdminPermissions = () => {
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, userRole } = useUserRole();

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !isAdmin) {
          setPermissions([]);
          setLoading(false);
          return;
        }

        // If super_admin, check their specific permissions
        if (userRole === 'super_admin') {
          const userPermissions = await getUserPermissions(user.id);
          // If no specific permissions set, give them all permissions (backward compatibility)
          if (userPermissions.length === 0) {
            setPermissions([
              'manage_orders',
              'manage_withdrawals',
              'manage_gadgets',
              'manage_brands',
              'manage_businesses',
              'manage_products',
              'manage_seller_applications',
              'manage_promotions',
              'manage_carousel',
              'manage_marketplace_settings'
            ]);
          } else {
            setPermissions(userPermissions);
          }
        } else {
          setPermissions([]);
        }
      } catch (error) {
        console.error('Error loading permissions:', error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [isAdmin, userRole]);

  const checkPermission = async (permission: AdminPermission): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || userRole !== 'super_admin') return false;
    
    return hasPermission(user.id, permission);
  };

  const hasPermissionSync = (permission: AdminPermission): boolean => {
    return permissions.includes(permission);
  };

  return {
    permissions,
    loading,
    checkPermission,
    hasPermission: hasPermissionSync,
    canManageOrders: hasPermissionSync('manage_orders'),
    canManageWithdrawals: hasPermissionSync('manage_withdrawals'),
    canManageGadgets: hasPermissionSync('manage_gadgets'),
    canManageBrands: hasPermissionSync('manage_brands'),
    canManageBusinesses: hasPermissionSync('manage_businesses'),
    canManageProducts: hasPermissionSync('manage_products'),
    canManageSellerApplications: hasPermissionSync('manage_seller_applications'),
    canManagePromotions: hasPermissionSync('manage_promotions'),
    canManageCarousel: hasPermissionSync('manage_carousel'),
    canManageMarketplaceSettings: hasPermissionSync('manage_marketplace_settings'),
    
  };
};