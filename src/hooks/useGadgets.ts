import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Gadget, GadgetFilters } from '@/types/gadget';

export const useGadgets = (filters?: GadgetFilters, searchQuery?: string) => {
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGadgets();
  }, [filters, searchQuery]);

  const fetchGadgets = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('flamia_products')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.brand) {
        query = query.eq('brand', filters.brand);
      }
      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.inStock) {
        query = query.eq('in_stock', true);
      }

      // Apply search
      if (searchQuery && searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setGadgets((data || []).map(gadget => ({
        ...gadget,
        condition: gadget.condition as 'brand_new' | 'used'
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gadgets');
    } finally {
      setLoading(false);
    }
  };

  return { gadgets, loading, error, refetch: fetchGadgets };
};
