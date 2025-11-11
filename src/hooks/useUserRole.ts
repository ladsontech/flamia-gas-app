
import { useState, useEffect } from "react";
import { getUserRole, type UserRole } from "@/services/adminService";
import { useAuth } from "@/contexts/AuthContext";

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>('user' as UserRole);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      try {
        if (!user) {
          setUserRole('user' as UserRole);
          setLoading(false);
          return;
        }
        
        try {
          const role = await getUserRole(user.id);
          setUserRole(role || ('user' as UserRole));
        } catch (roleError) {
          console.warn('Error getting user role:', roleError);
          setUserRole('user' as UserRole);
        }
      } catch (e) {
        console.warn('Error in loadRole:', e);
        setUserRole('user' as UserRole);
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, [user, authLoading]);

  return { 
    userRole,
    isAdmin: userRole === 'super_admin',
    isBusinessOwner: userRole === 'business_owner',
    isDeliveryMan: userRole === 'delivery_man',
    isSeller: userRole === 'business_owner' || userRole === 'super_admin',
    loading: authLoading || loading
  };
};
