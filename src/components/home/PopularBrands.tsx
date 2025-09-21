
import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Gadget {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url?: string;
  brand?: string;
  category: string;
  description: string;
  condition: 'brand_new' | 'used';
  featured?: boolean;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

const PopularBrands: React.FC = () => {
  const [featuredGadgets, setFeaturedGadgets] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedGadgets();
  }, []);

  const fetchFeaturedGadgets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gadgets')
        .select('*')
        .eq('in_stock', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      
      const gadgets = (data || []).map(gadget => ({
        ...gadget,
        condition: gadget.condition as 'brand_new' | 'used'
      }));
      
      setFeaturedGadgets(gadgets);
    } catch (err) {
      console.error('Error fetching featured gadgets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch featured gadgets');
      
      // Fallback to any gadgets if featured ones fail
      try {
        const { data, error } = await supabase
          .from('gadgets')
          .select('*')
          .eq('in_stock', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;
        
        const gadgets = (data || []).map(gadget => ({
          ...gadget,
          condition: gadget.condition as 'brand_new' | 'used'
        }));
        
        setFeaturedGadgets(gadgets);
      } catch (fallbackErr) {
        console.error('Error fetching fallback gadgets:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGadgetClick = (gadget: Gadget) => {
    navigate(`/gadget/${gadget.id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && featuredGadgets.length === 0) {
    return null;
  }

  if (featuredGadgets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Featured Products</h2>
        <button 
          onClick={() => navigate('/gadgets')}
          className="text-sm text-accent hover:text-accent/80 font-medium hover:underline"
        >
          See all
        </button>
      </div>
      
      {/* Mobile Grid Layout - 2 columns */}
      <div className="block md:hidden">
        <div className="grid grid-cols-2 gap-4">
          {featuredGadgets.slice(0, 6).map((gadget) => (
            <Card 
              key={gadget.id}
              className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleGadgetClick(gadget)}
            >
              <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                <img 
                  src={gadget.image_url || '/images/gadget-fallback.jpg'} 
                  alt={gadget.name} 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-3 space-y-2">
                <h3 className="font-medium text-sm line-clamp-2 text-gray-900 group-hover:text-accent transition-colors">
                  {gadget.name}
                </h3>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-accent">
                    {formatPrice(gadget.price)}
                  </div>
                  {gadget.original_price && gadget.original_price > gadget.price && (
                    <div className="text-xs text-gray-500 line-through">
                      {formatPrice(gadget.original_price)}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Desktop Layout - Removed brand info and discount badges */}
      <div className="hidden md:block">
        <div className="grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {featuredGadgets.map((gadget) => (
            <Card 
              key={gadget.id}
              className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-full flex flex-col"
              onClick={() => handleGadgetClick(gadget)}
            >
              {/* Product Image Container */}
              <div className="relative bg-white p-4 flex-shrink-0">
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={gadget.image_url || '/images/gadget-fallback.jpg'} 
                    alt={gadget.name} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                
                {/* Condition Badge */}
                {gadget.condition === 'brand_new' && (
                  <div className="absolute top-2 left-2">
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium">
                      New
                    </span>
                  </div>
                )}
              </div>
              
              {/* Product Details */}
              <div className="p-3 flex-grow flex flex-col justify-between">
                {/* Product Title */}
                <div className="mb-2">
                  <h3 className="text-sm font-normal text-gray-900 line-clamp-2 leading-tight group-hover:text-accent transition-colors">
                    {gadget.name}
                  </h3>
                </div>
                
                {/* Price Section */}
                <div className="mt-auto">
                  {/* Price */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(gadget.price)}
                      </span>
                      {gadget.original_price && gadget.original_price > gadget.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(gadget.original_price)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Free delivery note */}
                  <div className="text-xs text-green-700 mt-1 font-medium">
                    FREE delivery
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularBrands;
