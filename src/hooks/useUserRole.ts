
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserRole, type UserRole } from "@/services/adminService";

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>('user' as UserRole);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.warn('Error getting user in useUserRole:', userError);
          setUserRole('user' as UserRole);
          setLoading(false);
          return;
        }
        
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
