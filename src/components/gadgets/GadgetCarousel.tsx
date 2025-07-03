import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import GadgetCard from './GadgetCard';
import { Gadget } from '@/types/gadget';

interface GadgetCarouselProps {
  gadgets: Gadget[];
  title: string;
}

const GadgetCarousel: React.FC<GadgetCarouselProps> = ({ gadgets, title }) => {
  if (gadgets.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <div className="relative">
          <CarouselContent className="-ml-2 md:-ml-4">
            {gadgets.map((gadget) => (
              <CarouselItem key={gadget.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <GadgetCard gadget={gadget} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </div>
      </Carousel>
    </div>
  );
};

export default GadgetCarousel;