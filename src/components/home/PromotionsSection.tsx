
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { promotionalOffers } from "./promotionalData";
import { ArrowRight } from "lucide-react";

const PromotionsSection: React.FC = () => {
  const handleOrderClick = (whatsappNumber: string) => {
    window.open(`https://wa.me/${whatsappNumber}?text=I'm interested in your gas promotion.`, '_blank');
  };

  return (
    <section className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base md:text-lg font-bold">Special Promotions</h2>
        <Button variant="ghost" size="sm" className="text-primary flex items-center gap-1 text-xs p-0 h-auto">
          <span>View All</span>
          <ArrowRight size={12} />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2">
        {promotionalOffers.map((offer) => (
          <Card key={offer.id} className="overflow-hidden flex flex-col h-full shadow-sm p-0">
            <div className="relative">
              {/* Discount badge - removed the percent icon */}
              <div className="absolute top-1 right-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-md">
                <span>20% OFF</span>
              </div>
              
              <div className="flex sm:flex-col">
                <div className="w-1/3 sm:w-full h-16 sm:h-24 md:h-28 bg-gray-50 flex items-center justify-center">
                  <img 
                    src={offer.image} 
                    alt={offer.title} 
                    className="h-[80%] sm:h-[70%] object-contain"
                    loading="lazy"
                  />
                </div>
                
                <div className="w-2/3 sm:w-full p-2">
                  <h3 className="font-medium text-xs truncate">{offer.title}</h3>
                  <p className="text-muted-foreground text-xs line-clamp-1 mb-1">{offer.description}</p>
                  <Button 
                    className="w-full text-xs bg-accent hover:bg-accent/90 text-white py-0.5 h-6" 
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
