
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useGadgets } from '@/hooks/useGadgets';
import { GadgetFilters } from '@/types/gadget';
import GadgetCard from '@/components/gadgets/GadgetCard';
import GadgetSearch from '@/components/gadgets/GadgetSearch';
import GadgetsCarousel from '@/components/gadgets/GadgetsCarousel';
import { Loader2, Smartphone, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Gadgets = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<GadgetFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { gadgets, loading, error } = useGadgets(filters, searchQuery);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-14">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
          <span className="text-gray-600 text-lg">Loading gadgets...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-14">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-500 mb-4 text-lg">Error loading gadgets: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-accent hover:underline font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 md:pt-20">
      <Helmet>
        <title>Gadgets Store - Flamia</title>
        <meta name="description" content="Shop the latest gadgets including smartphones, laptops, tablets, and more. Best prices with fast delivery." />
        <meta name="keywords" content="gadgets, smartphones, laptops, tablets, electronics, technology" />
      </Helmet>

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-2 sm:px-4 lg:px-6 py-8 lg:py-12">
          {/* Image Carousel */}
          <GadgetsCarousel />

          {/* Hero Section */}
          <div className="text-center mb-6 lg:mb-8">
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
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 lg:mb-8"
            >
              Gadgets Store
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl lg:text-3xl text-gray-600 max-w-5xl mx-auto mb-8 lg:mb-12 leading-relaxed"
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
            className="mb-4 lg:mb-6"
          >
            <GadgetSearch
              onSearch={setSearchQuery}
              onFilter={setFilters}
              searchQuery={searchQuery}
              filters={filters}
            />
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-2 sm:px-4 lg:px-6 py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Results Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                  {searchQuery || Object.keys(filters).length > 0 
                    ? `${searchQuery ? `Results for "${searchQuery}"` : 'Filtered Results'}`
                    : 'All Products'
                  }
                </h2>
                <span className="text-lg md:text-xl lg:text-2xl text-gray-600">
                  {gadgets.length} {gadgets.length === 1 ? 'product' : 'products'} found
                </span>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden sm:block">View:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3 py-1 text-xs"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3 py-1 text-xs"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {gadgets.length > 0 ? (
            <div className={`grid gap-4 lg:gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 lg:p-12">
              <div className="text-center">
                <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No gadgets found matching your criteria.</p>
                <p className="text-gray-500 text-sm mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({});
                  }}
                  className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Clear search and filters
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Gadgets;
