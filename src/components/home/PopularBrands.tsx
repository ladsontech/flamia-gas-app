
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
    
    // Check on initial load
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Select a subset of popular brands to display
  const popularBrands = staticBrands.slice(0, 5);

  return (
    <section className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base md:text-lg font-bold">Popular Gas Brands</h2>
        <Button variant="ghost" size="sm" className="text-primary flex items-center gap-1 text-xs p-0 h-auto">
          <span>View All</span>
          <ArrowRight size={12} />
        </Button>
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-3">
          {popularBrands.map((brand) => (
            <CarouselItem key={brand.id} className="pl-2 md:pl-3 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <Card className="overflow-hidden flex flex-col h-full shadow-sm">
                <div className="relative p-2 pb-1">
                  <div className="h-20 sm:h-24 md:h-28 bg-gray-50 rounded-md flex items-center justify-center mb-1.5">
                    <img 
                      src={brand.image_url_6kg || ''} 
                      alt={brand.name} 
                      className="h-full object-contain p-1"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-medium text-xs truncate">{brand.name}</h3>
                  <p className="text-muted-foreground text-xs line-clamp-1 mb-1">
                    {brand.description_6kg || `${brand.brand} gas for best prices in Uganda`}
                  </p>
                  <div className="text-xs font-semibold text-accent">
                    {brand.price_6kg}
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:flex justify-end items-center mt-1.5 gap-1.5">
          <CarouselPrevious className="static translate-y-0 h-6 w-6" />
          <CarouselNext className="static translate-y-0 h-6 w-6" />
        </div>
      </Carousel>
    </section>
  );
};

export default PopularBrands;
