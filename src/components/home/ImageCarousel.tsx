
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
      <div className="relative w-full overflow-hidden bg-white">
        <div className="aspect-[16/9] lg:aspect-[2.5/1] flex items-center justify-center bg-gray-100">
          <div className="w-6 h-6 lg:w-4 lg:h-4 border-3 border-accent rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || filteredImages.length === 0) {
    return (
      <div className="relative w-full overflow-hidden bg-white">
        <div className="aspect-[16/9] lg:aspect-[2.5/1] flex items-center justify-center bg-gray-100">
          <p className="text-gray-500 text-sm">No carousel images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-white">
      <div className="aspect-[16/9] lg:aspect-[2.5/1]">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-50">
            <div className="w-6 h-6 lg:w-4 lg:h-4 border-3 border-accent rounded-full border-t-transparent animate-spin"></div>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex} 
            initial={{ opacity: 0, x: 100 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -100 }} 
            transition={{ 
              duration: 0.5,
              ease: "easeInOut"
            }} 
            className="absolute inset-0"
          >
            <AspectRatio ratio={16 / 9} className="lg:aspect-[2.5/1]">
              <img 
                src={filteredImages[currentIndex].image_url} 
                alt={filteredImages[currentIndex].title} 
                loading="lazy" 
                onLoad={handleImageLoad} 
                width="2400" 
                height="800" 
                className="w-full h-full bg-white object-cover" 
              />
            </AspectRatio>
            <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 text-white z-20">
              <h3 className="text-base lg:text-lg font-bold drop-shadow-md">
                {filteredImages[currentIndex].title}
              </h3>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation arrows - visible on all screen sizes */}
      <button 
        onClick={prevSlide} 
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-30 flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/80 hover:bg-white/95 text-accent shadow-lg" 
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} className="lg:w-6 lg:h-6" />
      </button>
      
      <button 
        onClick={nextSlide} 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/80 hover:bg-white/95 text-accent shadow-lg" 
        aria-label="Next slide"
      >
        <ChevronRight size={20} className="lg:w-6 lg:h-6" />
      </button>
      
      {/* Indicator dots */}
      <div className="absolute bottom-2 lg:bottom-3 left-0 right-0 flex justify-center gap-1.5 z-30">
        {filteredImages.map((_, index) => (
          <button 
            key={index} 
            onClick={() => setCurrentIndex(index)} 
            className={`w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-accent w-4 lg:w-5" : "bg-white/60"
            }`} 
            aria-label={`Go to slide ${index + 1}`} 
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
