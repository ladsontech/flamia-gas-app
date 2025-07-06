
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { promotionalOffers } from "./promotionalData";
import { ArrowRight, Star, Flame } from "lucide-react";

const PromotionsSection: React.FC = () => {
  const handleOrderClick = (offer: typeof promotionalOffers[0]) => {
    const message = `Flamia 🔥
------------------------
*Promotional Offer Order*
------------------------
*Product:* ${offer.title}
*Description:* ${offer.description}
*Price:* ${offer.discount}
------------------------
I'm interested in this promotion.`;
    
    window.open(`https://wa.me/${offer.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section className="mb-4">
      <div className="flex items-center justify-between mb-3 lg:hidden">
        <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold">Special Promotions</h2>
        <Button variant="ghost" size="sm" className="text-primary flex items-center gap-1 text-xs lg:text-sm">
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
                <div className="w-1/3 sm:w-full h-24 sm:h-32 bg-gray-50 flex items-center justify-center">
                  <img 
                    src={offer.image} 
                    alt={offer.title} 
                    className="h-[80%] sm:h-[70%] object-contain"
                    loading="lazy"
                  />
                </div>
                
                <div className="w-2/3 sm:w-full p-3">
                  <div className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-md w-fit mb-2">
                    {offer.discount || "Price not available"}
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

      {/* Desktop Sidebar Layout */}
      <div className="hidden lg:block">
        <div className="space-y-3">
          {promotionalOffers.map((offer) => (
            <Card 
              key={offer.id} 
              className="group relative overflow-hidden bg-white border border-gray-200 hover:border-accent/40 transition-all duration-300 hover:shadow-md"
            >
              <div className="p-3">
                <div className="flex items-center gap-3">
                  {/* Image */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={offer.image} 
                      alt={offer.title} 
                      className="w-full h-full object-contain drop-shadow-sm"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-accent transition-colors duration-300 line-clamp-1">
                      {offer.title}
                    </h3>
                    <p className="text-gray-600 text-xs mb-2 leading-tight line-clamp-2">
                      {offer.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-2 py-1 rounded text-xs font-semibold">
                        {offer.discount}
                      </div>
                      
                      <Button 
                        size="sm"
                        className="bg-accent hover:bg-accent/90 text-white px-3 py-1 rounded text-xs font-medium h-6" 
                        onClick={() => handleOrderClick(offer)}
                      >
                        Order
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hot Deal Indicator */}
              <div className="absolute top-1 right-1 flex items-center gap-1 text-orange-500 opacity-70">
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
