
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { promotionalOffers } from "./promotionalData";

const CardCarousel = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-3 bg-white rounded-lg shadow-sm mb-3">
      <h3 className="text-base font-medium mb-2">Popular Gas Brands</h3>
      <div className="space-y-2.5">
        {promotionalOffers.map((item, index) => (
          <div key={index} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50">
            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover" 
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-medium truncate">{item.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <Button 
        variant="ghost" 
        className="w-full mt-2 text-xs bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center gap-1 py-1 h-8" 
        onClick={() => navigate("/order")}
      >
        <span>View All Brands</span>
        <ArrowRight size={14} />
      </Button>
    </div>
  );
};

export default CardCarousel;
