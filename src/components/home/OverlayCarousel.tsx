
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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

  if (sections.length === 0) return null;

  const currentSection = sections[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-purple-400 via-pink-300 to-purple-500">
      {/* Background Image */}
      <div className="relative h-96">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src={currentSection.backgroundImage}
              alt={currentSection.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {sections.length > 1 && (
          <>
            <Button
              onClick={prevSlide}
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/80 hover:bg-white/95 text-gray-800 rounded-full w-10 h-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              onClick={nextSlide}
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/80 hover:bg-white/95 text-gray-800 rounded-full w-10 h-10"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Title and Description Overlay */}
        <div className="absolute top-8 left-8 z-20">
          <motion.h2
            key={`title-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white mb-2"
          >
            {currentSection.title}
          </motion.h2>
          <motion.p
            key={`desc-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl text-white/90"
          >
            {currentSection.description}
          </motion.p>
        </div>

        {/* Featured Products Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl">
            {currentSection.featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="aspect-square bg-gray-50 p-3">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-accent">
                          {formatPrice(product.price)}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>
                      {product.original_price && product.original_price > product.price && (
                        <div className="text-xs text-red-600 font-medium">
                          Save {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                        </div>
                      )}
                    </div>
                    {product.brand && (
                      <div className="text-xs text-gray-600 mt-1">
                        {product.brand}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Indicator Dots */}
        {sections.length > 1 && (
          <div className="absolute bottom-4 right-8 flex gap-2 z-30">
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
