
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GadgetCard from '@/components/gadgets/GadgetCard';
import GadgetSearch from '@/components/gadgets/GadgetSearch';
import GadgetCarousel from '@/components/gadgets/GadgetCarousel';
import ImageCarousel from '@/components/home/ImageCarousel';
import { useGadgets } from '@/hooks/useGadgets';
import { Skeleton } from '@/components/ui/skeleton';

const Gadgets = () => {
  const { category } = useParams();
  const { gadgets, loading, error } = useGadgets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000000]);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  // Filter gadgets based on search and filters
  const filteredGadgets = gadgets.filter(gadget => {
    const matchesSearch = gadget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gadget.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (gadget.brand && gadget.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || gadget.category === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || gadget.brand === selectedBrand;
    const matchesPrice = gadget.price >= priceRange[0] && gadget.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice && gadget.in_stock;
  });

  // Get unique categories and brands for filters
  const categories = ['all', ...Array.from(new Set(gadgets.map(g => g.category)))];
  const brands = ['all', ...Array.from(new Set(gadgets.map(g => g.brand).filter(Boolean)))];

  // Group gadgets by category for carousels
  const featuredGadgets = filteredGadgets.filter(g => g.featured);
  const phoneGadgets = filteredGadgets.filter(g => g.category.toLowerCase().includes('phone'));
  const laptopGadgets = filteredGadgets.filter(g => g.category.toLowerCase().includes('laptop'));
  const accessoryGadgets = filteredGadgets.filter(g => 
    g.category.toLowerCase().includes('accessory') || 
    g.category.toLowerCase().includes('cable') ||
    g.category.toLowerCase().includes('charger')
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Carousel Skeleton */}
          <Skeleton className="w-full h-64 rounded-lg" />
          
          {/* Search Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
          
          {/* Gadgets Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Gadgets Carousel */}
        <ImageCarousel category="gadgets" />
        
        {/* Search and Filters */}
        <GadgetSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedBrand={selectedBrand}
          onBrandChange={setSelectedBrand}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          categories={categories}
          brands={brands}
        />

        {/* Featured Gadgets Carousel */}
        {featuredGadgets.length > 0 && (
          <GadgetCarousel gadgets={featuredGadgets} title="Featured Gadgets" />
        )}

        {/* Category Carousels */}
        {phoneGadgets.length > 0 && (
          <GadgetCarousel gadgets={phoneGadgets} title="Phones & Tablets" />
        )}
        
        {laptopGadgets.length > 0 && (
          <GadgetCarousel gadgets={laptopGadgets} title="Laptops & Computers" />
        )}
        
        {accessoryGadgets.length > 0 && (
          <GadgetCarousel gadgets={accessoryGadgets} title="Accessories" />
        )}

        {/* All Gadgets Grid */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            All Gadgets {selectedCategory !== 'all' && `- ${selectedCategory}`}
          </h2>
          
          {filteredGadgets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No gadgets found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredGadgets.map(gadget => (
                <GadgetCard key={gadget.id} gadget={gadget} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gadgets;
