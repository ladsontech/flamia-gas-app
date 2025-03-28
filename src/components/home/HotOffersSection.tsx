
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { promotionalOffers } from "./promotionalData";

const HotOffersSection: React.FC = () => {
  const navigate = useNavigate();
  
  const handleOrderClick = (whatsappNumber: string) => {
    window.open(`https://wa.me/${whatsappNumber}?text=I'm interested in your gas promotion.`, '_blank');
  };

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-xl font-bold">Hot Offers</h2>
        <Button variant="ghost" size="sm" className="text-primary flex items-center gap-1 text-xs">
          <span>View All</span>
          <ArrowRight size={14} />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {promotionalOffers.map((offer) => (
          <Card key={offer.id} className="overflow-hidden flex flex-col h-full relative">
            {/* Hot Offer Ribbon */}
            <div className="absolute top-0 right-0 z-10 origin-top-right">
              <div className="bg-red-500 text-white transform rotate-45 translate-x-[30%] translate-y-[-10%] py-1 px-6 text-xs font-bold">
                HOT OFFER
              </div>
            </div>
            
            {/* Discount Badge */}
            <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                -17%
              </Badge>
            </div>
            
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
                className="w-full text-xs bg-accent hover:bg-accent/90 text-white py-1 h-7 mt-auto" 
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

export default HotOffersSection;
