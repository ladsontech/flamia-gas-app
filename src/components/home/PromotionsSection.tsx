
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { promotionalOffers } from "./promotionalData";
import { ArrowRight, Percent } from "lucide-react";

const PromotionsSection: React.FC = () => {
  const handleOrderClick = (whatsappNumber: string) => {
    window.open(`https://wa.me/${whatsappNumber}?text=I'm interested in your gas promotion.`, '_blank');
  };

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-xl font-bold">Special Promotions</h2>
        <Button variant="ghost" size="sm" className="text-primary flex items-center gap-1 text-xs">
          <span>View All</span>
          <ArrowRight size={14} />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {promotionalOffers.map((offer) => (
          <Card key={offer.id} className="overflow-hidden flex flex-col h-full shadow-sm">
            <div className="relative">
              {/* Discount badge */}
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center">
                <span>20% OFF</span>
                <Percent size={12} className="ml-0.5" />
              </div>
              
              <div className="flex sm:flex-col">
                <div className="w-1/3 sm:w-full h-24 sm:h-32 md:h-40 bg-gray-50 flex items-center justify-center">
                  <img 
                    src={offer.image} 
                    alt={offer.title} 
                    className="h-[80%] sm:h-[70%] object-contain"
                    loading="lazy"
                  />
                </div>
                
                <div className="w-2/3 sm:w-full p-3">
                  <h3 className="font-medium text-sm truncate">{offer.title}</h3>
                  <p className="text-muted-foreground text-xs line-clamp-1 mb-2">{offer.description}</p>
                  <Button 
                    className="w-full text-xs bg-accent hover:bg-accent/90 text-white py-1 h-7" 
                    onClick={() => handleOrderClick(offer.whatsapp)}
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
