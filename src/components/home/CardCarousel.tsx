
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Define our promotional cards data
const promotionCards = [
  {
    id: 1,
    title: "Fast Delivery",
    description: "Same-day gas delivery in Kampala",
    image: "/images/total 6KG.png",
    color: "from-blue-500/20 to-blue-500/40",
  },
  {
    id: 2,
    title: "Best Prices",
    description: "Lowest gas prices in Uganda guaranteed",
    image: "/images/shell 6KG.png",
    color: "from-green-500/20 to-green-500/40",
  },
  {
    id: 3,
    title: "Reliable Supply",
    description: "Always available when you need it",
    image: "/images/total 12KG.png",
    color: "from-red-500/20 to-red-500/40",
  },
  {
    id: 4,
    title: "Free Delivery",
    description: "No delivery fees on any order",
    image: "/images/promo-3.jpg",
    color: "from-purple-500/20 to-purple-500/40",
  }
];

const CardCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextCard();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="relative w-full overflow-hidden rounded-lg my-4 md:my-6">
      <div className="relative aspect-[16/9] md:aspect-[2/1] w-full">
        {loading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="w-8 h-8 border-4 border-accent rounded-full border-t-transparent animate-spin"></div>
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
            <Card className="w-full h-full overflow-hidden border-0 shadow-lg">
              <CardContent className="p-0 h-full flex flex-col md:flex-row">
                <div className="relative w-full md:w-2/3 h-48 md:h-full">
                  <img 
                    src={promotionCards[currentIndex].image}
                    alt={promotionCards[currentIndex].title}
                    className="w-full h-full object-cover"
                    onLoad={handleImageLoad}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                </div>
                <div className={`flex-1 flex flex-col justify-center p-4 md:p-6 bg-gradient-to-r ${promotionCards[currentIndex].color}`}>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{promotionCards[currentIndex].title}</h3>
                  <p className="text-sm md:text-base">{promotionCards[currentIndex].description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation buttons */}
      <button 
        onClick={prevCard}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-30 flex items-center justify-center w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      
      <button 
        onClick={nextCard}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 flex items-center justify-center w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>
      
      {/* Indicator dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 z-30">
        {promotionCards.map((_, index) => (
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

export default CardCarousel;
