
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CarouselImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
  order_position: number;
  is_active: boolean;
}

export const useCarouselImages = () => {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCarouselImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true });

      if (error) throw error;
      setCarouselImages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch carousel images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarouselImages();
  }, []);

  return { carouselImages, loading, error, refetch: fetchCarouselImages };
};
