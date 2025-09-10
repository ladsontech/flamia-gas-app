
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserRole } from "@/services/adminService";

export const useUserRole = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          setIsSeller(false);
          setLoading(false);
          return;
        }
        const role = await getUserRole(user.id);
        setIsAdmin(role === 'super_admin');
        setIsSeller(role === 'seller' || role === 'super_admin');
      } catch (e) {
        setIsAdmin(false);
        setIsSeller(false);
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, []);

  return { isAdmin, isSeller, loading };
};
