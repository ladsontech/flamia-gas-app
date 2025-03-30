
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Array of informational carousel images to cycle through with local paths
const carouselImages = [
  {
    src: "/images/make_order.png",
    alt: "Make your gas order online with Flamia",
    caption: "Easy Online Ordering"
  },
  {
    src: "/images/free_delivery.png",
    alt: "Free gas delivery service in Kampala, Uganda",
    caption: "Free Same-Day Delivery"
  },
  {
    src: "/images/cook_healthy.png",
    alt: "Cook healthy meals with reliable gas supply",
    caption: "Cook Healthy Meals"
  }
];

const ImageCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Auto-advance the carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
  };

  // Calculate next image preview index
  const nextImageIndex = currentIndex === carouselImages.length - 1 ? 0 : currentIndex + 1;

  const handleImageLoad = () => {
    setLoading(false);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-sm mb-4">
      <div className="aspect-[3/1.2]"> 
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-50">
            <div className="w-8 h-8 border-4 border-accent rounded-full border-t-transparent animate-spin"></div>
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
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent z-10" />
            <AspectRatio ratio={3/1.2}>
              <img
                src={carouselImages[currentIndex].src}
                alt={carouselImages[currentIndex].alt}
                className="w-full h-full object-contain bg-white"
                loading="lazy"
                width="2400"
                height="1600"
                onLoad={handleImageLoad}
              />
            </AspectRatio>
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white z-20">
              <h3 className="text-lg font-bold drop-shadow-md">
                {carouselImages[currentIndex].caption}
              </h3>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Preview of next image (only visible on medium screens and up) */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/12 overflow-hidden z-5 opacity-40 hover:opacity-60 transition-opacity">
          <div className="h-full w-full relative">
            <img
              src={carouselImages[nextImageIndex].src}
              alt="Next slide preview"
              className="h-full object-cover bg-white"
              style={{ objectPosition: 'left center' }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/50" />
          </div>
        </div>
      </div>
      
      {/* Navigation arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-30 flex items-center justify-center w-8 h-8 rounded-full bg-white/70 hover:bg-white/90 text-accent"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} />
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 flex items-center justify-center w-8 h-8 rounded-full bg-white/70 hover:bg-white/90 text-accent"
        aria-label="Next slide"
      >
        <ChevronRight size={18} />
      </button>
      
      {/* Indicator dots */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-30">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-accent w-4" : "bg-accent/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
