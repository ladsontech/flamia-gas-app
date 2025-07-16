
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Gadget } from "@/types/gadget";

const FeaturedGadgets = () => {
  const [featuredGadgets, setFeaturedGadgets] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedGadgets();
  }, []);

  const fetchFeaturedGadgets = async () => {
    try {
      const { data, error } = await supabase
        .from('gadgets')
        .select('*')
        .eq('in_stock', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      
      setFeaturedGadgets((data || []).map(gadget => ({
        ...gadget,
        condition: gadget.condition as 'brand_new' | 'used'
      })));
    } catch (error) {
      console.error('Error fetching featured gadgets:', error);
      // Fallback to latest gadgets if no featured ones
      fetchLatestGadgets();
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestGadgets = async () => {
    try {
      const { data, error } = await supabase
        .from('gadgets')
        .select('*')
        .eq('in_stock', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      
      setFeaturedGadgets((data || []).map(gadget => ({
        ...gadget,
        condition: gadget.condition as 'brand_new' | 'used'
      })));
    } catch (error) {
      console.error('Error fetching latest gadgets:', error);
    }
  };

  const handleGadgetClick = (gadget: Gadget) => {
    navigate(`/gadget/${gadget.id}`);
  };

  if (loading) {
    return (
      <section className="mb-3 max-w-3xl mx-auto px-2 lg:hidden">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2 w-32"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-28 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featuredGadgets.length === 0) {
    return null;
  }

  return (
    <section className="mb-3 max-w-3xl mx-auto px-2 lg:hidden">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold">Featured Gadgets</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary flex items-center gap-1 text-xs px-2 py-1 h-auto"
          onClick={() => navigate('/gadgets')}
        >
          <span>View All</span>
          <ArrowRight size={12} />
        </Button>
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-1">
          {featuredGadgets.map((gadget) => (
            <CarouselItem key={gadget.id} className="pl-1 basis-1/4 sm:basis-1/5">
              <Card 
                className="overflow-hidden flex flex-col h-28 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 p-1"
                onClick={() => handleGadgetClick(gadget)}
              >
                <div className="relative h-16 bg-gray-50 rounded-sm flex items-center justify-center mb-1">
                  <img 
                    src={gadget.image_url || '/images/gadget-fallback.jpg'} 
                    alt={gadget.name} 
                    className="h-full w-full object-contain p-0.5"
                    loading="lazy"
                  />
                </div>
                <div className="px-1 pb-1 flex-1 flex flex-col justify-end">
                  <h3 className="font-medium text-[10px] line-clamp-1 mb-0.5 leading-tight">
                    {gadget.name}
                  </h3>
                  <div className="text-[10px] font-semibold text-accent">
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
        <div className="hidden md:flex lg:hidden justify-end items-center mt-1 gap-2">
          <CarouselPrevious className="static translate-y-0 h-6 w-6" />
          <CarouselNext className="static translate-y-0 h-6 w-6" />
        </div>
      </Carousel>
    </section>
  );
};

export default FeaturedGadgets;
