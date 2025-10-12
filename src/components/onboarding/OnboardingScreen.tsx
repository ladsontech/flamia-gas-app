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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const slides: OnboardingSlide[] = [
    {
      id: 1,
      icon: <Flame className="w-10 h-10" />,
      title: "Welcome to Flamia",
      description: "Fast LPG gas delivery & kitchen essentials in Uganda."
    },
    {
      id: 2,
      icon: <Package className="w-10 h-10" />,
      title: "Gas & Refills",
      description: "6KG-45KG cylinders from Shell, Total, Hass, Oryx & Stabex. Same-day delivery.",
      image: "/images/Nova 6kg.png"
    },
    {
      id: 3,
      icon: <Wrench className="w-10 h-10" />,
      title: "Accessories",
      description: "Regulators, pipes, burners, stoves & more for your kitchen.",
      image: "/images/regulator.jpeg"
    },
    {
      id: 4,
      icon: <Smartphone className="w-10 h-10" />,
      title: "Gadgets",
      description: "Quality electronics & appliances. Brand new and used items.",
    },
    {
      id: 5,
      icon: <ShoppingBag className="w-10 h-10" />,
      title: "Marketplace",
      description: "Fresh food from local restaurants & products from verified sellers.",
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else if (acceptedTerms && acceptedPrivacy) {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Skip button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground"
        >
          Skip
          <X className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-md w-full space-y-8 text-center"
          >
            {/* Icon */}
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full text-primary">
                {slides[currentSlide].icon}
              </div>
            </div>

            {/* Image if available */}
            {slides[currentSlide].image && (
              <div className="flex justify-center my-6">
                <img
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  className="w-32 h-32 object-contain rounded-lg"
                />
              </div>
            )}

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {slides[currentSlide].title}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed px-4">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="p-6 space-y-4">
        {/* Terms acceptance checkboxes on last slide */}
        {currentSlide === slides.length - 1 && (
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-card border border-border rounded-xl shadow-lg p-6 space-y-4">
              {/* Terms and Conditions */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  className="h-5 w-5 border-2 border-foreground data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                />
                <label
                  htmlFor="terms"
                  className="text-base text-foreground cursor-pointer flex-1"
                >
                  I accept the{' '}
                  <Link 
                    to="/terms-and-conditions" 
                    className="text-blue-600 underline hover:text-blue-700 font-normal"
                    target="_blank"
                  >
                    terms and conditions
                  </Link>
                </label>
              </div>

              {/* Privacy Policy */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id="privacy"
                  checked={acceptedPrivacy}
                  onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                  className="h-5 w-5 border-2 border-foreground data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                />
                <label
                  htmlFor="privacy"
                  className="text-base text-foreground cursor-pointer flex-1"
                >
                  I accept the{' '}
                  <Link 
                    to="/privacy-policy" 
                    className="text-blue-600 underline hover:text-blue-700 font-normal"
                    target="_blank"
                  >
                    privacy policy
                  </Link>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-6 bg-primary'
                  : 'w-1.5 bg-muted-foreground/30'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Next/Get Started button */}
        <Button
          onClick={handleNext}
          disabled={currentSlide === slides.length - 1 && (!acceptedTerms || !acceptedPrivacy)}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-2"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
