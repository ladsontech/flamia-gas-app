
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PromotionalOffer {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  image_url: string | null;
}

const PromotionsSection: React.FC = () => {
  const [promotionalOffers, setPromotionalOffers] = useState<PromotionalOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotionalOffers();
  }, []);

  const fetchPromotionalOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('promotional_offers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching promotional offers:', error);
      } else {
        setPromotionalOffers(data || []);
      }
    } catch (error) {
      console.error('Error fetching promotional offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (offer: PromotionalOffer) => {
    const whatsappNumber = "+256753894149";
    const message = `Flamia 🔥
------------------------
*Promotional Offer Order*
------------------------
*Product:* ${offer.title}
*Description:* ${offer.description || 'No description'}
*Price:* ${offer.price || 'Contact for price'}
------------------------
I'm interested in this promotion.`;
    
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <section className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse lg:hidden"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  if (promotionalOffers.length === 0) {
    return null;
  }

  return (
    <section className="mb-4">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold">Special Promotions</h2>
        <Button variant="ghost" size="sm" className="text-primary flex items-center gap-1 text-xs lg:text-sm lg:hidden">
          <span>View All</span>
          <ArrowRight size={14} />
        </Button>
      </div>
      
      {/* Mobile Layout (lg and below) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 lg:hidden">
        {promotionalOffers.map((offer) => (
          <Card key={offer.id} className="overflow-hidden flex flex-col h-full shadow-sm border-gray-200">
            <div className="relative">
              <div className="flex sm:flex-col">
                <div className="w-1/3 sm:w-full h-24 sm:h-32 bg-white flex items-center justify-center p-0">
                  <img 
                    src={offer.image_url || '/images/placeholder.png'} 
                    alt={offer.title} 
                    className="h-[80%] sm:h-[70%] object-contain"
                    loading="lazy"
                  />
                </div>
                
                <div className="w-2/3 sm:w-full p-3">
                  <div className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-md w-fit mb-2">
                    {offer.price || "Contact for price"}
                  </div>
                  
                  <h3 className="font-medium text-sm truncate sm:mt-0">{offer.title}</h3>
                  <p className="text-muted-foreground text-xs line-clamp-2 min-h-[2rem] mb-2">{offer.description}</p>
                  <Button 
                    className="w-full text-xs bg-accent hover:bg-accent/90 text-white py-1 h-7" 
                    onClick={() => handleOrderClick(offer)}
                  >
                    Order Now
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop Layout - Mobile-style cards in grid without stretching */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {promotionalOffers.map((offer) => (
            <Card 
              key={offer.id} 
              className="group relative overflow-hidden bg-white border border-gray-200 hover:border-accent/40 transition-all duration-300 hover:shadow-md"
            >
              <div className="p-0">
                {/* Image Section */}
                <div className="w-full h-32 bg-white flex items-center justify-center p-4">
                  <img 
                    src={offer.image_url || '/images/placeholder.png'} 
                    alt={offer.title} 
                    className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Content Section */}
                <div className="p-3 space-y-2">
                  {/* Price Badge */}
                  <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-2 py-1 rounded text-xs font-semibold w-fit">
                    {offer.price || "Contact for price"}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-accent transition-colors duration-300 line-clamp-2 leading-tight">
                    {offer.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-xs leading-tight line-clamp-2 min-h-[2rem]">
                    {offer.description}
                  </p>
                  
                  {/* Order Button */}
                  <Button 
                    className="w-full bg-accent hover:bg-accent/90 text-white text-xs font-medium h-7 mt-2" 
                    onClick={() => handleOrderClick(offer)}
                  >
                    Order Now
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Hot Deal Indicator */}
              <div className="absolute top-2 right-2 flex items-center gap-1 text-orange-500 opacity-70">
                <Flame className="w-3 h-3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromotionsSection;
