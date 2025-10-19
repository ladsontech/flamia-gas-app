import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchSellerShopByUser, fetchSellerApplicationByUser } from '@/services/sellerService';
import type { SellerShop, SellerApplication } from '@/types/seller';

export const useSellerShop = () => {
  const [shop, setShop] = useState<SellerShop | null>(null);
  const [application, setApplication] = useState<SellerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadShop = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setShop(null);
          setApplication(null);
          return;
        }

        const sellerShop = await fetchSellerShopByUser(user.id);
        setShop(sellerShop);

        // If no shop, check for pending application
        if (!sellerShop) {
          const sellerApplication = await fetchSellerApplicationByUser(user.id);
          setApplication(sellerApplication);
        }
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
    application,
    isSeller: !!shop,
    isApproved: shop?.is_approved ?? false,
    isActive: shop?.is_active ?? false,
    hasPendingApplication: application?.status === 'pending',
    loading,
    error,
  };
};
