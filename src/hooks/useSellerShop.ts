import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchSellerShopByUser } from '@/services/sellerService';
import type { SellerShop } from '@/types/seller';

export const useSellerShop = () => {
  const [shop, setShop] = useState<SellerShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadShop = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setShop(null);
          return;
        }

        const sellerShop = await fetchSellerShopByUser(user.id);
        setShop(sellerShop);
      } catch (err: any) {
        console.error('Error loading seller shop:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadShop();
  }, []);

  return {
    shop,
    isSeller: !!shop,
    isApproved: shop?.is_approved ?? false,
    isActive: shop?.is_active ?? false,
    loading,
    error,
  };
};
