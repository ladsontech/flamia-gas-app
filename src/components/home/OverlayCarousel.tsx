
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ImageCarousel from './ImageCarousel';

interface OverlaySection {
  id: string;
  title: string;
  description: string;
  backgroundImage: string;
  featuredProducts: Array<{
    id: string;
    name: string;
    price: number;
    original_price?: number;
    image_url: string;
    brand?: string;
  }>;
}

const OverlayCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sections, setSections] = useState<OverlaySection[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Sample data - replace with actual data from your backend
  const sampleSections: OverlaySection[] = [
    {
      id: '1',
      title: 'Kitchen Essentials',
      description: 'Under UGX 150,000',
      backgroundImage: '/lovable-uploads/0d017397-499d-4b7c-ab34-77eef301ec56.png',
      featuredProducts: [
        {
          id: '1',
          name: 'Smart Kettle',
          price: 120000,
          original_price: 150000,
          image_url: '/images/total 6KG.png',
          brand: 'Total'
        },
        {
          id: '2',
          name: 'Gas Cooker',
          price: 145000,
          image_url: '/images/shell 6KG.png',
          brand: 'Shell'
        },
        {
          id: '3',
          name: 'Pressure Cooker',
          price: 98000,
          original_price: 120000,
          image_url: '/images/oryx 6KG.png',
          brand: 'Oryx'
        },
        {
          id: '4',
          name: 'Blender Set',
          price: 135000,
          image_url: '/images/stabex 6KG.png',
          brand: 'Stabex'
        }
      ]
    }
  ];

  useEffect(() => {
    // For now, use sample data. Later you can fetch from your backend
    setSections(sampleSections);
    setLoading(false);
  }, []);

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % sections.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + sections.length) % sections.length);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/gadgets/${productId}`);
  };

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg"></div>
    );
  }

  if (sections.length === 0) {
    return <ImageCarousel />;
  }

  const currentSection = sections[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      {/* Base Image Carousel */}
      <div className="relative">
        <ImageCarousel />
        
        {/* Desktop Title and Description Overlay - Bottom Half Only */}
        <div className="hidden md:block absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
          <div className="p-6">
            {/* Title and Description */}
            <div className="mb-6">
              <motion.h2
                key={`title-${currentIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-2xl md:text-3xl font-bold text-white mb-2"
              >
                {currentSection.title}
              </motion.h2>
              <motion.p
                key={`desc-${currentIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg text-white/90"
              >
                {currentSection.description}
              </motion.p>
            </div>
          </div>
        </div>

        {/* Navigation Arrows - Only show if multiple sections */}
        {sections.length > 1 && (
          <>
            <Button
              onClick={prevSlide}
              variant="ghost"
              size="icon"
              className="hidden md:flex absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/80 hover:bg-white/95 text-gray-800 rounded-full w-10 h-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              onClick={nextSlide}
              variant="ghost"
              size="icon"
              className="hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/80 hover:bg-white/95 text-gray-800 rounded-full w-10 h-10"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Indicator Dots - Only show if multiple sections */}
        {sections.length > 1 && (
          <div className="hidden md:flex absolute bottom-4 right-8 gap-2 z-30">
            {sections.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? "bg-white w-6" 
                    : "bg-white/60 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OverlayCarousel;
