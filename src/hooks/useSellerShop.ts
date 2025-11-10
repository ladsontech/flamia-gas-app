import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchSellerShopByUser, fetchSellerApplicationByUser } from '@/services/sellerService';
import type { SellerShop, SellerApplication } from '@/types/seller';

export const useSellerShop = () => {
  const [shop, setShop] = useState<SellerShop | null>(null);
  const [application, setApplication] = useState<SellerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShop = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
      } else {
        setApplication(null);
      }
    } catch (err: any) {
      console.error('Error loading seller shop:', err);
      setError(err.message);
      setShop(null);
      setApplication(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShop();
  }, [loadShop]);

  return {
    shop,
    application,
    isSeller: !!shop,
    isApproved: shop?.is_approved ?? false,
    isActive: shop?.is_active ?? false,
    hasPendingApplication: application?.status === 'pending',
    applicationStatus: application?.status ?? null,
    isApplicationApproved: application?.status === 'approved',
    loading,
    error,
    refetch: loadShop,
  };
};
