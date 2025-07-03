import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useGadgets } from '@/hooks/useGadgets';
import { GadgetFilters } from '@/types/gadget';
import GadgetCard from '@/components/gadgets/GadgetCard';
import GadgetSearch from '@/components/gadgets/GadgetSearch';
import GadgetCarousel from '@/components/gadgets/GadgetCarousel';
import { Loader2, Smartphone, Laptop, Headphones } from 'lucide-react';

const Gadgets = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<GadgetFilters>({});
  const { gadgets, loading, error } = useGadgets(filters, searchQuery);

  const featuredGadgets = gadgets.filter(g => g.rating >= 4.7).slice(0, 10);
  const newArrivals = gadgets.slice(0, 8);
  const smartphones = gadgets.filter(g => g.category === 'Smartphones').slice(0, 6);
  const laptops = gadgets.filter(g => g.category === 'Laptops').slice(0, 6);
  const audio = gadgets.filter(g => g.category === 'Audio').slice(0, 6);

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
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            Gadgets Store
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 max-w-3xl mx-auto mb-8"
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

        {/* Featured Products Carousel */}
        {!searchQuery && Object.keys(filters).length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <GadgetCarousel gadgets={featuredGadgets} title="✨ Featured Products" />
          </motion.div>
        )}

        {/* Category Carousels */}
        {!searchQuery && Object.keys(filters).length === 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              <GadgetCarousel gadgets={newArrivals} title="🆕 New Arrivals" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-6 h-6 text-accent" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Smartphones</h2>
              </div>
              <GadgetCarousel gadgets={smartphones} title="" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-12"
            >
              <div className="flex items-center gap-2 mb-4">
                <Laptop className="w-6 h-6 text-accent" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Laptops</h2>
              </div>
              <GadgetCarousel gadgets={laptops} title="" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mb-12"
            >
              <div className="flex items-center gap-2 mb-4">
                <Headphones className="w-6 h-6 text-accent" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Audio</h2>
              </div>
              <GadgetCarousel gadgets={audio} title="" />
            </motion.div>
          </>
        )}

        {/* Search Results Grid */}
        {(searchQuery || Object.keys(filters).length > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Filtered Results'}
              </h2>
              <span className="text-gray-600">{gadgets.length} products found</span>
            </div>

            {gadgets.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {gadgets.map((gadget, index) => (
                  <motion.div
                    key={gadget.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
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
        )}

        {/* All Products Grid */}
        {!searchQuery && Object.keys(filters).length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-12"
          >
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">All Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {gadgets.map((gadget, index) => (
                <motion.div
                  key={gadget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index % 20) * 0.05 }}
                >
                  <GadgetCard gadget={gadget} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Gadgets;