
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Define our promotional cards data with images only
const promotionCards = [
  {
    id: 1,    
    image: "/images/make_order.png",
  },
  {
    id: 2,   
    image: "/images/free_delivery.png",
  },
  {
    id: 3,
    image: "/images/cook_healthy.png",
  },
  {
    id: 4,    
    image: "/images/eat_healthy.png",
  },
  {
    id: 5,    
    image: "/images/stay_healthy.png",
  }
  
];

const CardCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Preload all images on component mount
  useEffect(() => {
    const preloadImages = async () => {
      const promises = promotionCards.map((card) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = card.image;
          img.onload = resolve;
          img.onerror = reject;
        });
      });
      
      try {
        await Promise.all(promises);
        setImagesPreloaded(true);
        setLoading(false);
      } catch (error) {
        console.error('Failed to preload images:', error);
        setLoading(false);
      }
    };
    
    preloadImages();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (!imagesPreloaded) return;
    
    const interval = setInterval(() => {
      nextCard();
    }, 5000);
    return () => clearInterval(interval);
  }, [imagesPreloaded]);

  const nextCard = () => {
    setCurrentIndex((prev) => 
      prev === promotionCards.length - 1 ? 0 : prev + 1
    );
  };

  const prevCard = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? promotionCards.length - 1 : prev - 1
    );
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  return (
    <div className="relative w-full overflow-visible mb-3">
      {/* Carousel container that will show a peek of next/previous cards */}
      <div className="relative w-[85%] mx-auto overflow-visible">
        <div className="relative aspect-square w-full">
          {loading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
              <div className="w-5 h-5 border-2 border-accent rounded-full border-t-transparent animate-spin"></div>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Card className="w-full h-full overflow-hidden border-0 shadow-sm">
                <CardContent className="p-0 h-full">
                  <div className="relative w-full h-full aspect-square">
                    <img 
                      src={promotionCards[currentIndex].image}
                      alt="Promotional image"
                      className="w-full h-full object-cover"
                      onLoad={handleImageLoad}
                      loading="eager"
                      width="300"
                      height="300"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Navigation buttons */}
      <button 
        onClick={prevCard}
        className="absolute left-0.5 top-1/2 transform -translate-y-1/2 z-30 flex items-center justify-center w-5 h-5 rounded-full bg-black/30 hover:bg-black/50 text-white"
        aria-label="Previous slide"
      >
        <ChevronLeft size={12} />
      </button>
      
      <button 
        onClick={nextCard}
        className="absolute right-0.5 top-1/2 transform -translate-y-1/2 z-30 flex items-center justify-center w-5 h-5 rounded-full bg-black/30 hover:bg-black/50 text-white"
        aria-label="Next slide"
      >
        <ChevronRight size={12} />
      </button>
      
      {/* Indicator dots */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5 z-30">
        {promotionCards.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-1 h-1 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white w-2" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardCarousel;
