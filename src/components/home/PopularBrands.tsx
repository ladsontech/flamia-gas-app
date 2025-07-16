
import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface Gadget {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url?: string;
  brand?: string;
  category: string;
  description: string;
  condition: 'brand_new' | 'used';
  featured?: boolean;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

const PopularBrands: React.FC = () => {
  const [featuredGadgets, setFeaturedGadgets] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedGadgets();
  }, []);

  const fetchFeaturedGadgets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gadgets')
        .select('*')
        .eq('in_stock', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      
      const gadgets = (data || []).map(gadget => ({
        ...gadget,
        condition: gadget.condition as 'brand_new' | 'used'
      }));
      
      setFeaturedGadgets(gadgets);
    } catch (err) {
      console.error('Error fetching featured gadgets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch featured gadgets');
      
      // Fallback to any gadgets if featured ones fail
      try {
        const { data, error } = await supabase
          .from('gadgets')
          .select('*')
          .eq('in_stock', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        
        const gadgets = (data || []).map(gadget => ({
          ...gadget,
          condition: gadget.condition as 'brand_new' | 'used'
        }));
        
        setFeaturedGadgets(gadgets);
      } catch (fallbackErr) {
        console.error('Error fetching fallback gadgets:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGadgetClick = (gadget: Gadget) => {
    navigate(`/gadgets/${gadget.id}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded mb-2 w-32"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-48 md:h-56 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && featuredGadgets.length === 0) {
    return null;
  }

  if (featuredGadgets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">Featured Products</h2>
        <button 
          onClick={() => navigate('/gadgets')}
          className="text-sm text-accent hover:text-accent/80 font-medium"
        >
          View All
        </button>
      </div>
      
      <div className="block md:hidden">
        {/* Mobile Carousel */}
        <Carousel
          plugins={[
            Autoplay({
              delay: 3000,
            }),
          ]}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-1">
            {featuredGadgets.map((gadget) => (
              <CarouselItem key={gadget.id} className="pl-1 basis-1/3 sm:basis-1/4">
                <Card 
                  className="overflow-hidden flex flex-col h-48 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 p-1"
                  onClick={() => handleGadgetClick(gadget)}
                >
                  <div className="relative h-28 bg-gray-50 rounded-sm flex items-center justify-center mb-1">
                    <img 
                      src={gadget.image_url || '/images/gadget-fallback.jpg'} 
                      alt={gadget.name} 
                      className="w-full h-full object-cover rounded-sm"
                      loading="lazy"
                    />
                  </div>
                  <div className="px-1 pb-1 flex-1 flex flex-col justify-end">
                    <h3 className="font-medium text-[9px] line-clamp-1 mb-0.5 leading-tight">
                      {gadget.name}
                    </h3>
                    <div className="text-[9px] font-semibold text-accent">
                      {new Intl.NumberFormat('en-UG', {
                        style: 'currency',
                        currency: 'UGX',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(gadget.price)}
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="hidden md:block">
        {/* Desktop Carousel */}
        <Carousel
          plugins={[
            Autoplay({
              delay: 4000,
            }),
          ]}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {featuredGadgets.map((gadget) => (
              <CarouselItem key={gadget.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <Card 
                  className="overflow-hidden flex flex-col h-72 lg:h-80 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 p-3"
                  onClick={() => handleGadgetClick(gadget)}
                >
                  <div className="relative h-48 lg:h-52 bg-gray-50 rounded-sm flex items-center justify-center mb-3">
                    <img 
                      src={gadget.image_url || '/images/gadget-fallback.jpg'} 
                      alt={gadget.name} 
                      className="w-full h-full object-cover rounded-sm"
                      loading="lazy"
                    />
                  </div>
                  <div className="px-2 pb-2 flex-1 flex flex-col justify-end">
                    <h3 className="font-medium text-sm lg:text-base line-clamp-2 mb-2 leading-tight">
                      {gadget.name}
                    </h3>
                    <div className="text-sm lg:text-base font-semibold text-accent">
                      {new Intl.NumberFormat('en-UG', {
                        style: 'currency',
                        currency: 'UGX',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(gadget.price)}
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default PopularBrands;
