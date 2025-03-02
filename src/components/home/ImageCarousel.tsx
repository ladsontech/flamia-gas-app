
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Array of promotional images to cycle through
const promotionalImages = [
  {
    src: "/images/promo-1.jpg",
    alt: "Fast gas delivery in Kampala and surrounding areas",
    caption: "Same-day gas delivery in Kampala"
  },
  {
    src: "/images/promo-2.jpg",
    alt: "Best gas cylinder prices in Uganda",
    caption: "Best prices in Uganda"
  },
  {
    src: "/images/gas-fallback.jpg",
    alt: "Reliable LPG supply in Uganda",
    caption: "Reliable cooking gas supply"
  },
  {
    src: "/images/promo-3.jpg",
    alt: "Free gas delivery service in Kampala",
    caption: "Free delivery on all orders"
  }
];

const ImageCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Auto-advance the carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === promotionalImages.length - 1 ? 0 : prevIndex + 1
      );
      setIsImageLoaded(false); // Reset image load state for the next image
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === promotionalImages.length - 1 ? 0 : prevIndex + 1
    );
    setIsImageLoaded(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? promotionalImages.length - 1 : prevIndex - 1
    );
    setIsImageLoaded(false);
  };

  // Calculate the next index for preview
  const nextIndex = currentIndex === promotionalImages.length - 1 ? 0 : currentIndex + 1;

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-md mb-8 aspect-[16/9]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20 z-10" />
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-5">
              <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={promotionalImages[currentIndex].src}
            alt={promotionalImages[currentIndex].alt}
            className="w-full h-full object-cover"
            loading="lazy"
            onLoad={() => setIsImageLoaded(true)}
            style={{ opacity: isImageLoaded ? 1 : 0 }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white z-20">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold drop-shadow-md">
              {promotionalImages[currentIndex].caption}
            </h3>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Preview of next image (visible only on larger screens) */}
      <div className="hidden md:block absolute top-0 bottom-0 right-0 w-[15%] overflow-hidden">
        <div className="absolute inset-0 bg-black/25 z-10" />
        <img
          src={promotionalImages[nextIndex].src}
          alt="Next slide preview"
          className="h-full object-cover transform translate-x-1/4 opacity-60"
          loading="lazy"
        />
      </div>
      
      {/* Navigation arrows - hidden on small screens, visible on medium and up */}
      <button 
        onClick={prevSlide}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-30 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>
      
      {/* Indicator dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 z-30">
        {promotionalImages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setIsImageLoaded(false);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white w-4" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
