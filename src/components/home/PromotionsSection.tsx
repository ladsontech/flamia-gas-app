
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
      <div className="flex items-center justify-between mb-3">
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

      {/* Desktop Layout (lg and above) - New Single Column Layout */}
      <div className="hidden lg:block">
        <div className="space-y-4 xl:space-y-6">
          {promotionalOffers.map((offer, index) => (
            <Card 
              key={offer.id} 
              className="group relative overflow-hidden bg-gradient-to-r from-white via-gray-50/30 to-white border border-gray-200 hover:border-accent/40 transition-all duration-300 hover:shadow-xl"
            >
              {/* Content Container */}
              <div className="p-4 xl:p-6">
                <div className="flex items-center gap-4 xl:gap-6">
                  {/* Image Section - Smaller and more proportional */}
                  <div className="flex-shrink-0 w-20 h-20 xl:w-24 xl:h-24 bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={offer.image} 
                      alt={offer.title} 
                      className="w-full h-full object-contain drop-shadow-md"
                      loading="lazy"
                    />
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      {/* Left side - Title and Description */}
                      <div className="flex-1 min-w-0 mr-4">
                        <h3 className="text-base xl:text-lg font-bold text-gray-900 mb-1 group-hover:text-accent transition-colors duration-300 line-clamp-1">
                          {offer.title}
                        </h3>
                        <p className="text-gray-600 text-sm xl:text-base mb-2 leading-relaxed line-clamp-2">
                          {offer.description}
                        </p>
                      </div>

                      {/* Right side - Price and Action */}
                      <div className="flex items-center gap-3 xl:gap-4 flex-shrink-0">
                        {/* Special Badge */}
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 xl:px-3 xl:py-1 rounded-full text-xs xl:text-sm font-bold flex items-center gap-1 shadow-md">
                          <Star className="w-3 h-3 fill-current" />
                          SPECIAL
                        </div>

                        {/* Price */}
                        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 xl:px-4 xl:py-2 rounded-lg font-bold text-sm xl:text-base shadow-md">
                          {offer.discount}
                        </div>

                        {/* Order Button */}
                        <Button 
                          className="bg-accent hover:bg-accent/90 text-white px-4 py-2 xl:px-6 xl:py-3 rounded-lg font-semibold text-sm xl:text-base shadow-md hover:shadow-lg transition-all duration-300" 
                          onClick={() => handleOrderClick(offer)}
                        >
                          Order Now
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hot Deal Indicator */}
              <div className="absolute top-2 right-2 flex items-center gap-1 text-accent opacity-70">
                <Flame className="w-4 h-4" />
                <span className="text-xs font-medium">Hot Deal!</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromotionsSection;
