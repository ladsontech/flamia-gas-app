import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { staticImages } from "./ImagesData";

interface ImageCarouselProps {
  location?: 'main' | 'sidebar';
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ location }) => {
  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <div className="relative w-full">
        <Carousel
          opts={{
            align: "start",
            loop: true,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-1 pl-1">
            {staticImages.map((image) => (
              <CarouselItem key={image.id} className="basis-1/2 md:basis-1/3 lg:basis-1/2">
                <div className="aspect-square overflow-hidden rounded-md">
                  <img
                    src={image.image_url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden lg:flex justify-center items-center gap-2 absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
            <CarouselPrevious className="h-7 w-7" />
            <CarouselNext className="h-7 w-7" />
          </div>
        </Carousel>
      </div>
      {location === 'sidebar' && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent z-10" />
      )}
    </div>
  );
};

export default ImageCarousel;
