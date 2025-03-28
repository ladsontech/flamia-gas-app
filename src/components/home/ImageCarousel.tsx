
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  },
  {
    src: "/images/eat_healthy.png",
    alt: "Eat healthy food with consistent cooking gas",
    caption: "Eat Healthier Food"
  },
  {
    src: "/images/stay_healthy.png",
    alt: "Stay healthy with clean cooking gas options",
    caption: "Stay Healthy With Clean Gas"
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
    <div className="relative w-full overflow-hidden rounded-lg shadow-md mb-4 aspect-[16/9]">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10 z-10" />
          <img
            src={carouselImages[currentIndex].src}
            alt={carouselImages[currentIndex].alt}
            className="w-full h-full object-contain"
            loading="lazy"
            onLoad={handleImageLoad}
          />
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white z-20">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold drop-shadow-md">
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
            className="h-full object-cover"
            style={{ objectPosition: 'left center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/80" />
        </div>
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
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
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
