
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// For now, we'll use the same carousel images that are managed in the admin
// This should ideally come from a database table, but we'll use the same structure
const getCarouselImages = () => [
  {
    id: '1',
    title: 'Latest Smartphones',
    description: 'Discover the newest smartphone technology',
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
    order: 1
  },
  {
    id: '2',
    title: 'Premium Laptops',
    description: 'High-performance laptops for work and gaming',
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
    order: 2
  },
  {
    id: '3',
    title: 'Gaming Accessories',
    description: 'Enhance your gaming experience',
    image_url: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=600&fit=crop',
    order: 3
  }
];

const GadgetsCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselImages = getCarouselImages();

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

  if (carouselImages.length === 0) {
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
