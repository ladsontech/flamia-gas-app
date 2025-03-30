
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
    <section className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Special Promotions</h2>
        <Button variant="ghost" size="sm" className="text-primary flex items-center gap-1">
          <span>View All</span>
          <ArrowRight size={14} />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {promotionalOffers.map((offer) => (
          <Card key={offer.id} className="overflow-hidden flex flex-col h-full shadow-sm">
            <div className="relative">
              {/* Discount badge */}
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
                <span>20% OFF</span>
              </div>
              
              <div className="flex flex-col">
                <div className="w-full h-32 bg-gray-50 flex items-center justify-center">
                  <img 
                    src={offer.image} 
                    alt={offer.title} 
                    className="h-24 object-contain"
                    loading="lazy"
                  />
                </div>
                
                <div className="p-3">
                  <h3 className="font-medium text-sm">{offer.title}</h3>
                  <p className="text-muted-foreground text-xs mb-2">{offer.description}</p>
                  <Button 
                    className="w-full text-xs bg-accent hover:bg-accent/90 text-white" 
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
