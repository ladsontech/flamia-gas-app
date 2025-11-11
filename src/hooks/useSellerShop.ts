import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchSellerShopByUser, fetchSellerApplicationByUser } from '@/services/sellerService';
import type { SellerShop, SellerApplication } from '@/types/seller';

export const useSellerShop = () => {
  const { user, loading: authLoading } = useAuth();
  const [shop, setShop] = useState<SellerShop | null>(null);
  const [application, setApplication] = useState<SellerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShop = useCallback(async () => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        setShop(null);
        setApplication(null);
        setLoading(false);
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
  }, [user, authLoading]);

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
    loading: authLoading || loading,
    error,
    refetch: loadShop,
  };
};
