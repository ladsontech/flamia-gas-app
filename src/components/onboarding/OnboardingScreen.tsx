import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, Flame, Package, Wrench, Smartphone, ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OnboardingSlide {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  image?: string;
}

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: OnboardingSlide[] = [
    {
      id: 1,
      icon: <Flame className="w-16 h-16" />,
      title: "Welcome to Flamia",
      description: "Fast LPG gas delivery & kitchen essentials in Uganda."
    },
    {
      id: 2,
      icon: <Package className="w-16 h-16" />,
      title: "Gas & Refills",
      description: "6KG-45KG cylinders from Shell, Total, Hass, Oryx & Stabex. Same-day delivery.",
      image: "/images/Nova 6kg.png"
    },
    {
      id: 3,
      icon: <Wrench className="w-16 h-16" />,
      title: "Accessories",
      description: "Regulators, pipes, burners, stoves & more for your kitchen.",
      image: "/images/regulator.jpeg"
    },
    {
      id: 4,
      icon: <Smartphone className="w-16 h-16" />,
      title: "Gadgets",
      description: "Quality electronics & appliances. Brand new and used items.",
    },
    {
      id: 5,
      icon: <ShoppingBag className="w-16 h-16" />,
      title: "Marketplace",
      description: "General online market for all products from verified sellers.",
      image: "/images/marketplace_shop.jpeg"
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Check if both policies are accepted
      const termsAccepted = localStorage.getItem('flamia_terms_accepted') === 'true';
      const privacyAccepted = localStorage.getItem('flamia_privacy_accepted') === 'true';
      
      if (termsAccepted && privacyAccepted) {
        onComplete();
      }
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
      {/* Skip button */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground text-sm md:text-base"
        >
          Skip
          <X className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
        </Button>
      </div>

      {/* Slide content - with proper scrolling */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="min-h-full flex items-center justify-center px-4 py-16 md:px-8 md:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-lg w-full space-y-6 md:space-y-10 text-center"
            >
              {/* Icon */}
              <div className="flex justify-center">
                <div className="p-4 md:p-6 bg-primary/10 rounded-full text-primary">
                  {slides[currentSlide].icon}
                </div>
              </div>

              {/* Image if available */}
              {slides[currentSlide].image && (
                <div className="flex justify-center my-4 md:my-8">
                  <img
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title}
                    className="w-32 h-32 md:w-48 md:h-48 object-contain rounded-lg"
                  />
                </div>
              )}

              {/* Title */}
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground px-4">
                {slides[currentSlide].title}
              </h2>

              {/* Description */}
              <p className="text-muted-foreground text-base md:text-lg lg:text-xl leading-relaxed px-4 md:px-6">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom navigation - fixed at bottom */}
      <div className="flex-shrink-0 p-4 md:p-8 space-y-4 md:space-y-6 bg-background border-t border-border">
        {/* Policy acceptance links on last slide */}
        {currentSlide === slides.length - 1 && (
          <div className="max-w-lg mx-auto mb-2 md:mb-4">
            <div className="bg-card border border-border rounded-xl shadow-lg p-4 md:p-8 space-y-3 md:space-y-5">
              <p className="text-sm md:text-lg text-center text-foreground mb-2 md:mb-4">
                Please review and accept our policies to continue:
              </p>
              
              {/* Terms and Conditions */}
              <Link 
                to="/terms-and-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 md:p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <span className="text-sm md:text-lg text-foreground">Terms and Conditions</span>
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              </Link>

              {/* Privacy Policy */}
              <Link 
                to="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 md:p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <span className="text-sm md:text-lg text-foreground">Privacy Policy</span>
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              </Link>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 md:gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 md:h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-6 md:w-8 bg-primary'
                  : 'w-1.5 md:w-2 bg-muted-foreground/30'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Next/Get Started button */}
        <Button
          onClick={handleNext}
          disabled={currentSlide === slides.length - 1 && (localStorage.getItem('flamia_terms_accepted') !== 'true' || localStorage.getItem('flamia_privacy_accepted') !== 'true')}
          className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 md:gap-3 h-12 md:h-14 text-base md:text-lg"
          size="lg"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
