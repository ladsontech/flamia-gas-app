import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useGadgets } from '@/hooks/useGadgets';
import { GadgetFilters } from '@/types/gadget';
import GadgetCard from '@/components/gadgets/GadgetCard';
import GadgetSearch from '@/components/gadgets/GadgetSearch';
import GadgetsCarousel from '@/components/gadgets/GadgetsCarousel';
import { Loader2, Smartphone } from 'lucide-react';

const Gadgets = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<GadgetFilters>({});
  const { gadgets, loading, error } = useGadgets(filters, searchQuery);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <span className="ml-2 text-gray-600">Loading gadgets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading gadgets: {error}</p>
          <button onClick={() => window.location.reload()} className="text-accent hover:underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Helmet>
        <title>Gadgets Store - Flamia</title>
        <meta name="description" content="Shop the latest gadgets including smartphones, laptops, tablets, and more. Best prices with fast delivery." />
        <meta name="keywords" content="gadgets, smartphones, laptops, tablets, electronics, technology" />
      </Helmet>

      <div className="container mx-auto px-3 md:px-6 lg:px-8 py-6 max-w-7xl">
        {/* Image Carousel */}
        <GadgetsCarousel />

        {/* Hero Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4"
          >
            <Smartphone className="w-4 h-4" />
            Latest Tech Gadgets
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
          >
            Gadgets Store
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-8"
          >
            Discover the latest smartphones, laptops, tablets, and tech accessories. 
            Premium quality gadgets with competitive prices and fast delivery.
          </motion.p>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <GadgetSearch
            onSearch={setSearchQuery}
            onFilter={setFilters}
            searchQuery={searchQuery}
            filters={filters}
          />
        </motion.div>

        {/* Search Results or All Products */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {searchQuery || Object.keys(filters).length > 0 
                ? `${searchQuery ? `Search Results for "${searchQuery}"` : 'Filtered Results'}`
                : 'All Products'
              }
            </h2>
            <span className="text-gray-600">{gadgets.length} products found</span>
          </div>

          {gadgets.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              {gadgets.map((gadget, index) => (
                <motion.div
                  key={gadget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="h-full"
                >
                  <GadgetCard gadget={gadget} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No gadgets found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({});
                }}
                className="mt-4 text-accent hover:underline"
              >
                Clear search and filters
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Gadgets;