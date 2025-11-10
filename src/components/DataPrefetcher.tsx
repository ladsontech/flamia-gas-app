import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getUserBusinesses } from '@/services/adminService';

const FLAMIA_BUSINESS_ID = '00000000-0000-0000-0000-000000000001';

export const DataPrefetcher = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Start prefetching after a short delay to not block initial render
    const prefetchTimer = setTimeout(() => {
      prefetchMarketplaceData();
      prefetchUserData();
    }, 1000); // 1 second delay

    return () => clearTimeout(prefetchTimer);
  }, []);

  const prefetchMarketplaceData = async () => {
    try {
      // Prefetch marketplace products
      await queryClient.prefetchQuery({
        queryKey: ['marketplace-products'],
        queryFn: async () => {
          const [categoriesResult, productsResult] = await Promise.all([
            supabase
              .from('product_categories')
              .select('*')
              .eq('is_active', true)
              .order('display_order'),
            
            supabase
              .from('business_products')
              .select(`
                *,
                businesses!inner(id, name)
              `)
              .eq('is_available', true)
              .limit(500)
          ]);

          if (categoriesResult.error) throw categoriesResult.error;
          if (productsResult.error) throw productsResult.error;

          return {
            categories: categoriesResult.data || [],
            products: productsResult.data || []
          };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    } catch (error) {
      console.error('Error prefetching marketplace data:', error);
    }
  };

  const prefetchUserData = async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Prefetch user profile
      await queryClient.prefetchQuery({
        queryKey: ['profile', user.id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, display_name, phone_number')
            .eq('id', user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            console.error('Error prefetching profile:', error);
            return null;
          }
          return data;
        },
        staleTime: 10 * 60 * 1000,
      });

      // Prefetch user role
      await queryClient.prefetchQuery({
        queryKey: ['userRole', user.id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (error) return null;
          return data?.role || 'user';
        },
        staleTime: 10 * 60 * 1000,
      });

      // Check if user is a business owner and prefetch businesses
      const { data: role } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (role?.role === 'business_owner') {
        await queryClient.prefetchQuery({
          queryKey: ['userBusinesses', user.id],
          queryFn: async () => {
            return await getUserBusinesses(user.id);
          },
          staleTime: 10 * 60 * 1000,
        });
      }
    } catch (error) {
      console.error('Error prefetching user data:', error);
    }
  };

  return null; // This component doesn't render anything
};

