
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
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      
      setFeaturedGadgets(data || []);
    } catch (error) {
      console.error('Error fetching featured gadgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGadgetClick = (gadget: Gadget) => {
    navigate(`/gadget/${gadget.id}`);
  };

  if (loading) {
    return (
      <section className="mb-4 max-w-3xl mx-auto px-2 lg:hidden">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-3 w-32"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-24 h-32 bg-gray-200 rounded"></div>
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
    <section className="mb-4 max-w-3xl mx-auto px-2 lg:hidden">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-xl font-bold">Featured Gadgets</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary flex items-center gap-1 text-xs"
          onClick={() => navigate('/gadgets')}
        >
          <span>View All</span>
          <ArrowRight size={14} />
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
            <CarouselItem key={gadget.id} className="pl-1 basis-1/3 sm:basis-1/4">
              <Card 
                className="overflow-hidden flex flex-col h-full shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 p-1"
                onClick={() => handleGadgetClick(gadget)}
              >
                <div className="relative aspect-square bg-gray-50 rounded-md flex items-center justify-center mb-1">
                  <img 
                    src={gadget.image_url || '/images/gadget-fallback.jpg'} 
                    alt={gadget.name} 
                    className="h-full w-full object-contain p-0.5"
                    loading="lazy"
                  />
                </div>
                <div className="px-1 pb-1">
                  <h3 className="font-medium text-xs line-clamp-2 mb-1 leading-tight">
                    {gadget.name}
                  </h3>
                  <div className="text-xs font-semibold text-accent">
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
        <div className="hidden md:flex lg:hidden justify-end items-center mt-2 gap-2">
          <CarouselPrevious className="static translate-y-0 h-8 w-8" />
          <CarouselNext className="static translate-y-0 h-8 w-8" />
        </div>
      </Carousel>
    </section>
  );
};

export default FeaturedGadgets;
