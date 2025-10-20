import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAffiliateShopByUser } from '@/services/affiliateService';
import type { AffiliateShop } from '@/types/affiliate';

export const useAffiliateShop = () => {
  const [shop, setShop] = useState<AffiliateShop | null>(null);
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

        const affiliateShop = await fetchAffiliateShopByUser(user.id);
        setShop(affiliateShop);
      } catch (err: any) {
        console.error('Error loading affiliate shop:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadShop();
  }, []);

  return {
    shop,
    isAffiliate: !!shop,
    isActive: shop?.is_active ?? false,
    tier: shop?.tier,
    isFree: shop?.tier === 'free',
    isPremium: shop?.tier === 'premium',
    loading,
    error,
  };
};
