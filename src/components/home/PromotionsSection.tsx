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
        <h2 className="text-lg md:text-xl font-bold">Special Promotions</h2>
        <Button variant="ghost" size="sm" className="text-primary flex items-center gap-1 text-xs">
          <span>View All</span>
          <ArrowRight size={14} />
        </Button>
      </div>
      
      {/* Mobile Layout (sm and below) */}
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

      {/* Desktop Layout (lg and above) - Completely New Design */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {promotionalOffers.map((offer, index) => (
            <Card 
              key={offer.id} 
              className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 hover:border-accent/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Special Offer Badge */}
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3 fill-current" />
                  SPECIAL OFFER
                </div>
              </div>

              {/* Content Container */}
              <div className="p-6">
                <div className="flex items-center gap-6">
                  {/* Image Section */}
                  <div className="flex-shrink-0 w-32 h-32 xl:w-40 xl:h-40 bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl flex items-center justify-center p-4 group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={offer.image} 
                      alt={offer.title} 
                      className="w-full h-full object-contain drop-shadow-lg"
                      loading="lazy"
                    />
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="text-xl xl:text-2xl font-bold text-gray-900 mb-2 group-hover:text-accent transition-colors duration-300">
                      {offer.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-base xl:text-lg mb-4 leading-relaxed">
                      {offer.description}
                    </p>

                    {/* Price and Action Row */}
                    <div className="flex items-center justify-between">
                      {/* Price */}
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl font-bold text-lg xl:text-xl shadow-lg">
                          {offer.discount}
                        </div>
                        <div className="flex items-center gap-1 text-accent">
                          <Flame className="w-4 h-4" />
                          <span className="text-sm font-medium">Hot Deal!</span>
                        </div>
                      </div>

                      {/* Order Button */}
                      <Button 
                        className="bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105" 
                        onClick={() => handleOrderClick(offer)}
                      >
                        Order Now
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent/10 to-transparent rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-accent/5 to-transparent rounded-tr-full"></div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromotionsSection;