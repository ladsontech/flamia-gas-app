
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Fix the import to get the array correctly
import { promotionalImages } from './ImageCarousel';

const promotionCards = [
  // Combine promotional images with existing promotionCards
  ...promotionalImages.map((img, index) => ({
    id: `promo-${index + 1}`, // Assign a unique id
    image: img.src,
  })),

  {
    id: "make-order",    
    image: "/images/make_order.png",
  },
  {
    id: "free-delivery",   
    image: "/images/free_delivery.png",
  },
  {
    id: "cook-healthy",
    image: "/images/cook_healthy.png",
  },
  {
    id: "eat-healthy",    
    image: "/images/eat_healthy.png",
  },
  {
    id: "stay-healthy",    
    image: "/images/stay_healthy.png",
  },
];

const CardCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Handle touch start
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  // Handle touch move
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // Handle touch end
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextCard();
    }
    
    if (isRightSwipe) {
      prevCard();
    }
  };

  // Mouse drag functionality
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragEnd, setDragEnd] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setDragEnd(e.clientX);
    }
  };

  const onMouseUp = () => {
    if (isDragging) {
      const distance = dragStart - dragEnd;
      if (Math.abs(distance) > minSwipeDistance) {
        if (distance > 0) {
          nextCard();
        } else {
          prevCard();
        }
      }
      setIsDragging(false);
    }
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

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
      <div 
        className="relative w-[85%] mx-auto overflow-visible"
        ref={carouselRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
      >
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
