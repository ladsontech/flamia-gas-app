import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import GadgetCard from '@/components/gadgets/GadgetCard';
import GadgetSearch from '@/components/gadgets/GadgetSearch';
import GadgetCarousel from '@/components/gadgets/GadgetCarousel';
import ImageCarousel from '@/components/home/ImageCarousel';
import { useGadgets } from '@/hooks/useGadgets';
import { Skeleton } from '@/components/ui/skeleton';
import { GadgetFilters } from '@/types/gadget';

const Gadgets = () => {
  const { category } = useParams();
  const { gadgets, loading, error } = useGadgets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<GadgetFilters>({});

  const canonicalUrl = category 
    ? `https://flamia.store/gadgets/${category}`
    : "https://flamia.store/gadgets";

  useEffect(() => {
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    }
  }, [category]);

  // Filter gadgets based on search and filters
  const filteredGadgets = gadgets.filter(gadget => {
    const matchesSearch = gadget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gadget.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (gadget.brand && gadget.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !filters.category || gadget.category === filters.category;
    const matchesBrand = !filters.brand || gadget.brand === filters.brand;
    const matchesMinPrice = !filters.minPrice || gadget.price >= filters.minPrice;
    const matchesMaxPrice = !filters.maxPrice || gadget.price <= filters.maxPrice;
    
    return matchesSearch && matchesCategory && matchesBrand && matchesMinPrice && matchesMaxPrice && gadget.in_stock;
  });

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
      <>
        <Helmet>
          <title>Gadgets - Flamia Electronics Store Uganda</title>
          <meta name="description" content="Shop electronics and gadgets in Uganda. Phones, laptops, accessories with delivery in Kampala." />
          <link rel="canonical" href={canonicalUrl} />
          <meta name="robots" content="index, follow" />
        </Helmet>
        <div className="min-h-screen bg-gray-50 pt-16 md:pt-20">
          <div className="container mx-auto px-4 py-4 space-y-6">
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
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Gadgets - Flamia Electronics Store Uganda</title>
          <link rel="canonical" href={canonicalUrl} />
          <meta name="robots" content="index, follow" />
        </Helmet>
        <div className="min-h-screen bg-gray-50 pt-16 md:pt-20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gadgets & Electronics - Flamia Uganda | Phones, Laptops, Accessories</title>
        <meta name="description" content="Shop quality electronics and gadgets in Uganda. Phones, laptops, accessories, chargers with fast delivery in Kampala, Wakiso, Mukono." />
        <meta name="keywords" content="gadgets Uganda, electronics Kampala, phones Uganda, laptops Uganda, accessories, chargers, tech gadgets" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content="Gadgets & Electronics - Flamia Uganda" />
        <meta property="og:description" content="Shop quality electronics and gadgets in Uganda. Phones, laptops, accessories with fast delivery." />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        
        {/* SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="geo.region" content="UG" />
        <meta name="geo.placename" content="Kampala" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-16 md:pt-20">
        <div className="container mx-auto px-4 py-4 space-y-6">
          {/* Gadgets Carousel */}
          <ImageCarousel category="gadgets" />
          
          {/* Search and Filters */}
          <GadgetSearch
            onSearch={setSearchQuery}
            onFilter={setFilters}
            searchQuery={searchQuery}
            filters={filters}
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
              All Gadgets {filters.category && `- ${filters.category}`}
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
    </>
  );
};

export default Gadgets;
