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

  const slides: OnboardingSlide[] = [
    {
      id: 1,
      icon: <Flame className="w-12 h-12" />,
      title: "Welcome to Flamia",
      description: "Your trusted partner for LPG gas delivery and kitchen essentials in Uganda. Fast, reliable, and convenient service right to your doorstep."
    },
    {
      id: 2,
      icon: <Package className="w-12 h-12" />,
      title: "Gas Cylinders & Refills",
      description: "Brand new cylinders (6KG, 12KG, 13KG, 45KG) from trusted brands like Shell, Total, Hass, Oryx, and Stabex. Quick refills with same-day delivery in Kampala.",
      image: "/images/Nova 6kg.png"
    },
    {
      id: 3,
      icon: <Wrench className="w-12 h-12" />,
      title: "Gas Accessories",
      description: "Complete range of gas accessories including regulators, pipes, burners, stoves, cylinder stands, and lighters. Everything you need for your kitchen.",
      image: "/images/regulator.jpeg"
    },
    {
      id: 4,
      icon: <Smartphone className="w-12 h-12" />,
      title: "Electronics & Gadgets",
      description: "Browse our collection of quality electronics and gadgets. From phones to appliances, find great deals on brand new and used items.",
    },
    {
      id: 5,
      icon: <ShoppingBag className="w-12 h-12" />,
      title: "Food & Marketplace",
      description: "Order fresh food from local restaurants and discover products from verified sellers. Support local businesses while enjoying convenient delivery.",
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else if (acceptedTerms) {
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
      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-md w-full space-y-6 text-center"
          >
            {/* Icon */}
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full text-primary">
                {slides[currentSlide].icon}
              </div>
            </div>

            {/* Image if available */}
            {slides[currentSlide].image && (
              <div className="flex justify-center">
                <img
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  className="w-48 h-48 object-contain rounded-lg"
                />
              </div>
            )}

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {slides[currentSlide].title}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="p-6 space-y-4">
        {/* Terms acceptance checkbox on last slide */}
        {currentSlide === slides.length - 1 && (
          <div className="flex items-start gap-3 max-w-md mx-auto mb-4">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              className="mt-1"
            />
            <label
              htmlFor="terms"
              className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
            >
              I agree to Flamia's{' '}
              <Link to="/terms-and-conditions" className="text-primary hover:underline">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/30'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Next/Get Started button */}
        <Button
          onClick={handleNext}
          disabled={currentSlide === slides.length - 1 && !acceptedTerms}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-2"
          size="lg"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
