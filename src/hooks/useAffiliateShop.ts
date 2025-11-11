import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAffiliateShopByUser } from '@/services/affiliateService';
import type { AffiliateShop } from '@/types/affiliate';

export const useAffiliateShop = () => {
  const [shop, setShop] = useState<AffiliateShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShop = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error in useAffiliateShop:', authError);
        setShop(null);
        setLoading(false);
        return;
      }
      
      if (!user) {
        setShop(null);
        setLoading(false);
        return;
      }

      const affiliateShop = await fetchAffiliateShopByUser(user.id);
      setShop(affiliateShop);
    } catch (err: any) {
      console.error('Error loading affiliate shop:', err);
      console.error('Error stack:', err.stack);
      setError(err.message);
      setShop(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    if (mounted) {
      loadShop();
    }
    
    return () => {
      mounted = false;
    };
  }, [loadShop]);

  return {
    shop,
    isAffiliate: !!shop,
    isActive: shop?.is_active ?? false,
    tier: shop?.tier,
    isFree: shop?.tier === 'free',
    isPremium: shop?.tier === 'premium',
    loading,
    error,
    refetch: loadShop,
  };
};
