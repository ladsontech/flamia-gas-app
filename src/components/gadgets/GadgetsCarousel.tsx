
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCarouselImages } from '@/hooks/useCarouselImages';

const GadgetsCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { carouselImages, loading } = useCarouselImages();

  useEffect(() => {
    if (carouselImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Auto-slide every 4 seconds

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? carouselImages.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === carouselImages.length - 1 ? 0 : currentIndex + 1);
  };

  if (loading || carouselImages.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-48 md:h-64 lg:h-80 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl overflow-hidden mb-6 shadow-lg">
      {/* Images */}
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {carouselImages.map((image) => (
          <div
            key={image.id}
            className="min-w-full h-full relative bg-gradient-to-br from-accent/10 to-accent/20"
          >
            <img
              src={image.image_url}
              alt={image.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Overlay with text */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h3 className="text-lg md:text-2xl font-bold mb-2">{image.title}</h3>
                <p className="text-sm md:text-base opacity-90">{image.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg border-0 w-10 h-10"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg border-0 w-10 h-10"
        onClick={goToNext}
      >
        <ChevronRight className="h-5 w-5 text-gray-700" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white shadow-lg' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default GadgetsCarousel;
