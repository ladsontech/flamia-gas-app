
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserRole, type UserRole } from "@/services/adminService";

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>('user' as UserRole);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUserRole('user' as UserRole);
          setLoading(false);
          return;
        }
        const role = await getUserRole(user.id);
        setUserRole(role || ('user' as UserRole));
      } catch (e) {
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
