
import { useState, useEffect } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { staticBrands } from "./BrandsData";

const PopularBrands = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const popularBrands = staticBrands.slice(0, 5);

  return (
    <section className="mb-4 max-w-3xl mx-auto px-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-xl font-bold">Popular Gas Brands</h2>
        <Button variant="ghost" size="sm" className="text-primary flex items-center gap-1 text-xs">
          <span>View All</span>
          <ArrowRight size={14} />
        </Button>
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {popularBrands.map((brand) => (
            <CarouselItem key={brand.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3">
              <Card className="overflow-hidden flex flex-col h-full shadow-sm">
                <div className="relative p-2 pb-1">
                  <div className="h-16 sm:h-20 aspect-square bg-gray-50 rounded-md flex items-center justify-center mb-2">
                    <img 
                      src={brand.image_url_6kg || ''} 
                      alt={brand.name} 
                      className="h-full w-full object-contain p-1"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-medium text-xs sm:text-sm truncate">{brand.name}</h3>
                  <p className="text-muted-foreground text-xs line-clamp-1 mb-2">
                    {brand.description_6kg || `${brand.brand} gas for best prices in Uganda`}
                  </p>
                  <div className="text-sm font-semibold text-accent">
                    {brand.price_6kg}
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:flex justify-end items-center mt-2 gap-2">
          <CarouselPrevious className="static translate-y-0 h-8 w-8" />
          <CarouselNext className="static translate-y-0 h-8 w-8" />
        </div>
      </Carousel>
    </section>
  );
};

export default PopularBrands;
