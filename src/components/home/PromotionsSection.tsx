
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
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-xl font-bold">Special Promotions</h2>
        <Button variant="ghost" size="sm" className="text-primary flex items-center gap-1 text-xs">
          <span>View All</span>
          <ArrowRight size={14} />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {promotionalOffers.map((offer) => (
          <Card key={offer.id} className="overflow-hidden flex flex-col h-full">
            <div className="relative p-2 pb-1">
              <div className="h-20 sm:h-24 md:h-28 bg-gray-50 rounded-md flex items-center justify-center mb-2">
                <img 
                  src={offer.image} 
                  alt={offer.title} 
                  className="h-full object-contain p-1"
                  loading="lazy"
                />
              </div>
              <h3 className="font-medium text-xs sm:text-sm truncate">{offer.title}</h3>
              <p className="text-muted-foreground text-xs line-clamp-1 mb-2">{offer.description}</p>
              <Button 
                className="w-full text-xs bg-accent hover:bg-accent/90 text-white py-1 h-7" 
                onClick={() => handleOrderClick(offer.whatsapp)}
              >
                Order Now
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default PromotionsSection;
