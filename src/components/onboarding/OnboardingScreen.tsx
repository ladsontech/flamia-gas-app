import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, Flame, Package, Wrench, Smartphone, ShoppingBag, X, FileText, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface OnboardingSlide {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  image?: string;
  link?: string;
  linkLabel?: string;
}

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(false);
  const [direction, setDirection] = useState(1);

  // Smoother, directional slide transitions
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60
    }),
    center: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 320,
        damping: 32,
        mass: 0.8
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      transition: { duration: 0.22, ease: 'easeInOut' }
    })
  } as const;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  // Preload carousel images in background
  useEffect(() => {
    const createdPreloadLinks: HTMLLinkElement[] = [];
    slides.forEach((slide) => {
      if (slide.image) {
        try {
          const preload = document.createElement('link');
          preload.rel = 'preload';
          preload.as = 'image';
          preload.href = slide.image;
          document.head.appendChild(preload);
          createdPreloadLinks.push(preload);
          const img = new Image();
          img.decoding = 'async';
          img.src = slide.image;
        } catch {}
      }
    });
    return () => {
      createdPreloadLinks.forEach((lnk) => {
        try {
          document.head.removeChild(lnk);
        } catch {}
      });
    };
  }, []);

  const slides: OnboardingSlide[] = [
    {
      id: 1,
      icon: <Flame className="w-full h-full" />,
      title: "Welcome to Flamia",
      description: "Fast LPG gas delivery & kitchen essentials in Uganda."
    },
    {
      id: 2,
      icon: <Package className="w-full h-full" />,
      title: "Gas & Refills",
      description: "6KG-45KG cylinders from Shell, Total, Hass, Oryx & Stabex. Same-day delivery.",
      image: "/images/Nova 6kg.png",
      link: "/refill",
      linkLabel: "Order a Refill"
    },
    {
      id: 3,
      icon: <Wrench className="w-full h-full" />,
      title: "Accessories",
      description: "Regulators, pipes, burners, stoves & more for your kitchen.",
      image: "/images/regulator.jpeg",
      link: "/accessories",
      linkLabel: "Shop Accessories"
    },
    {
      id: 4,
      icon: <Smartphone className="w-full h-full" />,
      title: "Gadgets",
      description: "Quality electronics & appliances. Brand new and used items.",
      link: "/gadgets",
      linkLabel: "Browse Gadgets"
    },
    {
      id: 5,
      icon: <ShoppingBag className="w-full h-full" />,
      title: "Marketplace",
      description: "General online market for all products from verified sellers.",
      image: "/images/marketplace_shop.jpeg",
      link: "/shop",
      linkLabel: "Explore Marketplace"
    },
    {
      id: 6,
      icon: <FileText className="w-full h-full" />,
      title: "Terms and Conditions",
      description: "Please review and accept our terms to continue."
    },
    {
      id: 7,
      icon: <Shield className="w-full h-full" />,
      title: "Privacy Policy",
      description: "Please review and accept our privacy policy to continue."
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      // On Terms slide, save acceptance
      if (currentSlide === 5 && termsAccepted) {
        localStorage.setItem('flamia_terms_accepted', 'true');
      }
      // On Privacy slide (second to last), save acceptance and complete
      if (currentSlide === 6 && privacyAccepted) {
        localStorage.setItem('flamia_privacy_accepted', 'true');
      }
      setCurrentSlide(currentSlide + 1);
    } else {
      // Final slide - complete onboarding and navigate home
      onComplete();
      navigate('/');
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
      {/* Skip button */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 touch-manipulation"
        >
          <span className="hidden sm:inline">Skip</span>
          <X className="w-4 h-4 sm:w-4 sm:h-4 sm:ml-1.5" />
        </Button>
      </div>

      {/* Slide content - with proper scrolling */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="min-h-full flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="max-w-md sm:max-w-lg w-full space-y-4 sm:space-y-6 md:space-y-8 text-center"
              style={{ willChange: 'transform, opacity' }}
            >
              {/* Icon */}
              <div className="flex justify-center mb-2 sm:mb-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="p-3 sm:p-4 md:p-5 bg-primary/10 rounded-full sm:rounded-2xl text-primary"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20">
                    {slides[currentSlide].icon}
                  </div>
                </motion.div>
              </div>

              {/* Image if available */}
              {slides[currentSlide].image && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="flex justify-center my-4 sm:my-6 md:my-8"
                >
                  {slides[currentSlide].link ? (
                    <Link to={slides[currentSlide].link} className="block">
                      <img
                        src={slides[currentSlide].image}
                        alt={slides[currentSlide].title}
                        decoding="async"
                        className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain rounded-xl sm:rounded-2xl shadow-lg"
                      />
                    </Link>
                  ) : (
                    <img
                      src={slides[currentSlide].image}
                      alt={slides[currentSlide].title}
                      decoding="async"
                      className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain rounded-xl sm:rounded-2xl shadow-lg"
                    />
                  )}
                </motion.div>
              )}

              {/* Title */}
              {slides[currentSlide].link ? (
                <Link to={slides[currentSlide].link}>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="text-[clamp(1.5rem,6vw,2.25rem)] font-bold text-foreground px-2 sm:px-4 leading-tight hover:underline"
                  >
                    {slides[currentSlide].title}
                  </motion.h2>
                </Link>
              ) : (
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-[clamp(1.5rem,6vw,2.25rem)] font-bold text-foreground px-2 sm:px-4 leading-tight"
                >
                  {slides[currentSlide].title}
                </motion.h2>
              )}

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="text-muted-foreground text-[clamp(1rem,4.5vw,1.25rem)] leading-relaxed px-3 sm:px-4 md:px-6 max-w-md mx-auto"
              >
                {slides[currentSlide].description}
              </motion.p>

              {/* Slide CTA Link */}
              {slides[currentSlide].link && (
                <div className="flex justify-center">
                  <Button asChild variant="outline" size="sm" className="mt-1 sm:mt-2">
                    <Link to={slides[currentSlide].link}>
                      {slides[currentSlide].linkLabel || 'Explore'}
                      <ChevronRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              )}

              {/* Terms Acceptance on slide 6 */}
              {currentSlide === 5 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="max-w-md mx-auto mt-4 sm:mt-6 md:mt-8"
                >
                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 md:p-5 bg-card border border-border/50 rounded-xl sm:rounded-2xl shadow-sm">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                      className="mt-0.5 sm:mt-1 h-5 w-5 sm:h-5 sm:w-5"
                    />
                    <div className="flex-1 pt-0.5">
                      <label htmlFor="terms" className="text-[clamp(0.95rem,4.2vw,1.125rem)] text-foreground cursor-pointer leading-relaxed block">
                        I accept the{' '}
                        <Link
                          to="/terms-and-conditions"
                          target={isDesktop ? "_blank" : undefined}
                          rel={isDesktop ? "noopener noreferrer" : undefined}
                          className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          Terms and Conditions
                        </Link>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Privacy Acceptance on slide 7 */}
              {currentSlide === 6 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="max-w-md mx-auto mt-4 sm:mt-6 md:mt-8"
                >
                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 md:p-5 bg-card border border-border/50 rounded-xl sm:rounded-2xl shadow-sm">
                    <Checkbox
                      id="privacy"
                      checked={privacyAccepted}
                      onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
                      className="mt-0.5 sm:mt-1 h-5 w-5 sm:h-5 sm:w-5"
                    />
                    <div className="flex-1 pt-0.5">
                      <label htmlFor="privacy" className="text-[clamp(0.95rem,4.2vw,1.125rem)] text-foreground cursor-pointer leading-relaxed block">
                        I accept the{' '}
                        <Link
                          to="/privacy-policy"
                          target={isDesktop ? "_blank" : undefined}
                          rel={isDesktop ? "noopener noreferrer" : undefined}
                          className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom navigation - fixed at bottom */}
      <div className="flex-shrink-0 p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 bg-background/95 backdrop-blur-sm border-t border-border/50 safe-area-inset-bottom">
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 sm:gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentSlide ? 1 : -1);
                setCurrentSlide(index);
              }}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 touch-manipulation ${
                index === currentSlide
                  ? 'w-6 sm:w-8 bg-primary'
                  : 'w-1.5 sm:w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Next/Get Started button */}
        <Button
          onClick={handleNext}
          disabled={
            (currentSlide === 5 && !termsAccepted) ||
            (currentSlide === 6 && !privacyAccepted)
          }
          className="w-full max-w-md sm:max-w-lg mx-auto flex items-center justify-center gap-2 h-11 sm:h-12 md:h-14 text-[clamp(1rem,4.5vw,1.25rem)] font-semibold active:scale-[0.98] transition-transform touch-manipulation shadow-lg"
          size="lg"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
