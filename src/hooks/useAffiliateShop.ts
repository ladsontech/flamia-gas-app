import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAffiliateShopByUser } from '@/services/affiliateService';
import type { AffiliateShop } from '@/types/affiliate';

export const useAffiliateShop = () => {
  const { user, loading: authLoading } = useAuth();
  const [shop, setShop] = useState<AffiliateShop | null>(null);
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
        setLoading(false);
        return;
      }

      const affiliateShop = await fetchAffiliateShopByUser(user.id);
      setShop(affiliateShop);
    } catch (err: any) {
      console.error('Error loading affiliate shop:', err);
      setError(err.message);
      setShop(null);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    loadShop();
  }, [loadShop]);

  return {
    shop,
    isAffiliate: !!shop,
    isActive: shop?.is_active ?? false,
    tier: shop?.tier,
    isFree: shop?.tier === 'free',
    isPremium: shop?.tier === 'premium',
    loading: authLoading || loading,
    error,
    refetch: loadShop,
  };
};
