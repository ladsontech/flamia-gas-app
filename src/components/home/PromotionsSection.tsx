import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { promotionalOffers } from "./promotionalData";
import { ArrowRight } from "lucide-react";

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
      
      {/* Responsive grid that adapts to screen size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-6">
        {promotionalOffers.map((offer) => (
          <Card key={offer.id} className="overflow-hidden flex flex-col h-full shadow-sm border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <div className="relative">
              {/* Desktop layout - side by side */}
              <div className="hidden sm:flex lg:flex">
                {/* Image section - larger on desktop */}
                <div className="w-2/5 lg:w-1/2 h-32 lg:h-40 bg-gray-50 flex items-center justify-center p-4">
                  <img 
                    src={offer.image} 
                    alt={offer.title} 
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
                
                {/* Content section */}
                <div className="w-3/5 lg:w-1/2 p-4 lg:p-6 flex flex-col justify-between">
                  {/* Price badge - positioned at top */}
                  <div className="bg-green-600 text-white text-sm lg:text-base font-semibold px-3 py-2 rounded-lg w-fit mb-3">
                    {offer.discount || "Price not available"}
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-bold text-base lg:text-lg mb-2 line-clamp-2">{offer.title}</h3>
                    <p className="text-muted-foreground text-sm lg:text-base line-clamp-3 mb-4">{offer.description}</p>
                  </div>
                  
                  <Button 
                    className="w-full text-sm lg:text-base bg-accent hover:bg-accent/90 text-white py-2 lg:py-3 font-semibold rounded-lg" 
                    onClick={() => handleOrderClick(offer)}
                  >
                    Order Now
                  </Button>
                </div>
              </div>

              {/* Mobile layout - stacked */}
              <div className="flex sm:hidden">
                <div className="w-1/3 h-24 bg-gray-50 flex items-center justify-center">
                  <img 
                    src={offer.image} 
                    alt={offer.title} 
                    className="h-[80%] object-contain"
                    loading="lazy"
                  />
                </div>
                
                <div className="w-2/3 p-3">
                  {/* Price badge */}
                  <div className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-md w-fit mb-2">
                    {offer.discount || "Price not available"}
                  </div>
                  
                  <h3 className="font-medium text-sm truncate">{offer.title}</h3>
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
    </section>
  );
};

export default PromotionsSection;