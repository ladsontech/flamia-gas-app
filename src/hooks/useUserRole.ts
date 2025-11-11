
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserRole, type UserRole } from "@/services/adminService";

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>('user' as UserRole);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadRole = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user in useUserRole:', userError);
          if (mounted) {
            setUserRole('user' as UserRole);
            setLoading(false);
          }
          return;
        }
        
        if (!user) {
          if (mounted) {
            setUserRole('user' as UserRole);
            setLoading(false);
          }
          return;
        }
        
        try {
          const role = await getUserRole(user.id);
          if (mounted) {
            setUserRole(role || ('user' as UserRole));
          }
        } catch (roleError) {
          console.error('Error getting user role:', roleError);
          if (mounted) {
            setUserRole('user' as UserRole);
          }
        }
      } catch (e) {
        console.error('Error in loadRole:', e);
        if (mounted) {
          setUserRole('user' as UserRole);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadRole();
    
    return () => {
      mounted = false;
    };
  }, []);

  return { 
    userRole,
    isAdmin: userRole === 'super_admin',
    isBusinessOwner: userRole === 'business_owner',
    isDeliveryMan: userRole === 'delivery_man',
    isSeller: userRole === 'business_owner' || userRole === 'super_admin',
    loading 
  };
};
