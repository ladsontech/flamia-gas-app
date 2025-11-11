import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminPermission, getUserPermissions, hasPermission } from "@/services/permissionsService";
import { useUserRole } from "./useUserRole";

export const useAdminPermissions = () => {
  const { user, loading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, userRole, loading: roleLoading } = useUserRole();

  useEffect(() => {
    const loadPermissions = async () => {
      // Wait for auth and role to finish loading
      if (authLoading || roleLoading) {
        return;
      }

      try {
        if (!user) {
          setPermissions([]);
          setLoading(false);
          return;
        }

        // Super admins have all permissions
        if (userRole === 'super_admin') {
          setPermissions([
            'manage_gas_orders',
            'manage_shop_orders',
            'manage_commissions',
            'manage_users',
            'manage_marketing',
            'manage_gadgets',
            'manage_brands',
            'manage_businesses',
            'manage_products',
            'manage_seller_applications',
            'manage_promotions',
            'manage_carousel'
          ]);
        } else {
          // Load specific permissions for other users
          const userPermissions = await getUserPermissions(user.id);
          setPermissions(userPermissions);
        }
      } catch (error) {
        console.error('Error loading permissions:', error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [user, isAdmin, userRole, authLoading, roleLoading]);

  const checkPermission = async (permission: AdminPermission): Promise<boolean> => {
    if (!user) return false;
    return hasPermission(user.id, permission);
  };

  const hasPermissionSync = (permission: AdminPermission): boolean => {
    return permissions.includes(permission);
  };

  return {
    permissions,
    loading: authLoading || roleLoading || loading,
    checkPermission,
    hasPermission: hasPermissionSync,
    canManageGasOrders: hasPermissionSync('manage_gas_orders'),
    canManageShopOrders: hasPermissionSync('manage_shop_orders'),
    canManageCommissions: hasPermissionSync('manage_commissions'),
    canManageUsers: hasPermissionSync('manage_users'),
    canManageMarketing: hasPermissionSync('manage_marketing'),
    canManageGadgets: hasPermissionSync('manage_gadgets'),
    canManageBrands: hasPermissionSync('manage_brands'),
    canManageBusinesses: hasPermissionSync('manage_businesses'),
    canManageProducts: hasPermissionSync('manage_products'),
    canManageSellerApplications: hasPermissionSync('manage_seller_applications'),
    canManagePromotions: hasPermissionSync('manage_promotions'),
    canManageCarousel: hasPermissionSync('manage_carousel'),
  };
};