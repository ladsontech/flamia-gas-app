
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useCarouselImages } from "@/hooks/useCarouselImages";

interface ImageCarouselProps {
  category?: 'gas' | 'gadgets';
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ category = 'gas' }) => {
  const { carouselImages, loading, error } = useCarouselImages();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  // Filter images by category
  const filteredImages = carouselImages.filter(image => image.category === category);

  // Auto-advance the carousel
  useEffect(() => {
    if (filteredImages.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => prevIndex === filteredImages.length - 1 ? 0 : prevIndex + 1);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [filteredImages.length]);

  const nextSlide = () => {
    setCurrentIndex(prevIndex => prevIndex === filteredImages.length - 1 ? 0 : prevIndex + 1);
  };

  const prevSlide = () => {
    setCurrentIndex(prevIndex => prevIndex === 0 ? filteredImages.length - 1 : prevIndex - 1);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  if (loading) {
    return (
      <div className="relative w-full overflow-hidden rounded-lg shadow-sm bg-white">
        <div className="aspect-[4/3] lg:aspect-[3/2] flex items-center justify-center bg-gray-100">
          <div className="w-6 h-6 lg:w-4 lg:h-4 border-3 border-accent rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || filteredImages.length === 0) {
    return (
      <div className="relative w-full overflow-hidden rounded-lg shadow-sm bg-white">
        <div className="aspect-[4/3] lg:aspect-[3/2] flex items-center justify-center bg-gray-100">
          <p className="text-gray-500 text-sm">No carousel images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-sm bg-white">
      <div className="aspect-[4/3] lg:aspect-[3/2]">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-50">
            <div className="w-6 h-6 lg:w-4 lg:h-4 border-3 border-accent rounded-full border-t-transparent animate-spin"></div>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.7 }} 
            className="absolute inset-0"
          >
            <AspectRatio ratio={4 / 3} className="lg:aspect-[3/2]">
              <img 
                src={filteredImages[currentIndex].image_url} 
                alt={filteredImages[currentIndex].title} 
                loading="lazy" 
                onLoad={handleImageLoad} 
                width="2400" 
                height="1600" 
                className="w-full h-full bg-white object-cover" 
              />
            </AspectRatio>
            <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-1.5 text-white z-20">
              <h3 className="text-sm lg:text-xs font-bold drop-shadow-md">
                {filteredImages[currentIndex].title}
              </h3>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation arrows - hidden on small screens, visible on medium and up */}
      <button 
        onClick={prevSlide} 
        className="absolute left-1 top-1/2 transform -translate-y-1/2 z-30 hidden sm:flex items-center justify-center w-5 h-5 lg:w-4 lg:h-4 rounded-full bg-white/70 hover:bg-white/90 text-accent" 
        aria-label="Previous slide"
      >
        <ChevronLeft size={12} className="lg:w-3 lg:h-3" />
      </button>
      
      <button 
        onClick={nextSlide} 
        className="absolute right-1 top-1/2 transform -translate-y-1/2 z-30 hidden sm:flex items-center justify-center w-5 h-5 lg:w-4 lg:h-4 rounded-full bg-white/70 hover:bg-white/90 text-accent" 
        aria-label="Next slide"
      >
        <ChevronRight size={12} className="lg:w-3 lg:h-3" />
      </button>
      
      {/* Indicator dots */}
      <div className="absolute bottom-0.5 lg:bottom-0.5 left-0 right-0 flex justify-center gap-1 z-30">
        {filteredImages.map((_, index) => (
          <button 
            key={index} 
            onClick={() => setCurrentIndex(index)} 
            className={`w-1 h-1 lg:w-1 lg:h-1 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-accent w-2 lg:w-1.5" : "bg-accent/50"
            }`} 
            aria-label={`Go to slide ${index + 1}`} 
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
