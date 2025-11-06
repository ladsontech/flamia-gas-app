import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, AlertCircle, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useMarketplaceProducts, MarketplaceProduct } from '@/hooks/useMarketplaceProducts';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/shop/ProductCard';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const Shop: React.FC = () => {
  const { categories, loading, error, refetch } = useMarketplaceProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [initialShowCount, setInitialShowCount] = useState(6);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Calculate initial show count based on screen size
  useEffect(() => {
    const calculateShowCount = () => {
      if (window.innerWidth < 640) return 2; // Mobile: 1 column
      if (window.innerWidth < 1024) return 6; // Tablet: 2 columns
      if (window.innerWidth < 1280) return 8; // Desktop: 3 columns
      return 10; // Large: 4-5 columns
    };

    setInitialShowCount(calculateShowCount());
    
    const handleResize = () => {
      setInitialShowCount(calculateShowCount());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddToCart = (product: MarketplaceProduct) => {
    addToCart({
      type: 'shop',
      name: product.name,
      quantity: 1,
      price: product.price,
      description: product.description,
      businessName: product.source === 'flamia' ? 'Flamia' : product.shop_name,
      productId: product.id,
      image: product.image_url,
    });

    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    });

    navigate('/order');
  };

  const toggleCategory = (categorySlug: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categorySlug)) {
        newSet.delete(categorySlug);
      } else {
        newSet.add(categorySlug);
      }
      return newSet;
    });
  };

  // Filter products based on search and category, then apply sorting
  const filteredCategories = categories
    .map(category => ({
      ...category,
      products: category.products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || category.slug === selectedCategory;
        return matchesSearch && matchesCategory;
      }).sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'popular':
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
          case 'newest':
          default:
            // Featured products first, then by created_at
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return 0; // Keep existing order for same featured status
        }
      }),
    }))
    .filter(category => category.products.length > 0);


  if (loading) {
    return (
      <>
        <Helmet>
          <title>Shop - Flamia Marketplace Uganda</title>
          <meta name="description" content="Shop household materials, electronics, phones, laptops and more at Flamia marketplace Uganda" />
        </Helmet>
        <div className="min-h-screen bg-background pt-20 pb-20">
          <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
            <Skeleton className="h-12 w-full max-w-md" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
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
          <title>Shop - Flamia Marketplace Uganda</title>
        </Helmet>
        <div className="min-h-screen bg-background pt-20 pb-20 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-3 mx-auto" />
            <h2 className="text-2xl font-bold mb-2">Error Loading Products</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Shop - Flamia Marketplace | Household Materials, Electronics & More Uganda</title>
        <meta name="description" content="Shop the largest marketplace for household materials in Uganda. Phones, laptops, electronics, appliances and products from verified sellers. Fast delivery in Kampala." />
        <meta name="keywords" content="marketplace Uganda, household materials, electronics Uganda, phones Kampala, laptops Uganda, shop online Uganda" />
        <link rel="canonical" href="https://flamia.store/shop" />
        <meta property="og:title" content="Flamia Marketplace - Household Materials Uganda" />
        <meta property="og:description" content="Uganda's largest marketplace for household materials and electronics" />
        <meta property="og:url" content="https://flamia.store/shop" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-white pt-16 sm:pt-20 pb-20 sm:pb-24">
        {/* Sticky Header - Search & Filters */}
        <div className="bg-white shadow-sm sticky top-16 z-40 border-b border-gray-200">
          <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex flex-col gap-3">
              {/* Search Bar with Filter Button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base w-full bg-gray-50 border-gray-200 focus:bg-white"
                  />
                </div>
                {/* Mobile Filter Button */}
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="default" className="md:hidden h-10 sm:h-11 px-4">
                      <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[85vh]">
                    <SheetHeader>
                      <SheetTitle>Filters & Sort</SheetTitle>
                    </SheetHeader>
                    <div className="py-4 space-y-6 overflow-y-auto">
                      {/* Categories */}
                      {categories.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-sm mb-3 text-gray-900">Categories</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant={selectedCategory === 'all' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setSelectedCategory('all')}
                              className={selectedCategory === 'all' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                            >
                              All
                            </Button>
                            {categories.map(category => (
                              <Button
                                key={category.slug}
                                variant={selectedCategory === category.slug ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory(category.slug)}
                                className={selectedCategory === category.slug ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                              >
                                {category.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sort */}
                      <div>
                        <h3 className="font-semibold text-sm mb-3 text-gray-900">Sort By</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={sortBy === 'newest' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortBy('newest')}
                            className={sortBy === 'newest' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                          >
                            Newest
                          </Button>
                          <Button
                            variant={sortBy === 'popular' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortBy('popular')}
                            className={sortBy === 'popular' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                          >
                            Popular
                          </Button>
                          <Button
                            variant={sortBy === 'price-low' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortBy('price-low')}
                            className={sortBy === 'price-low' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                          >
                            Price: Low-High
                          </Button>
                          <Button
                            variant={sortBy === 'price-high' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortBy('price-high')}
                            className={sortBy === 'price-high' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                          >
                            Price: High-Low
                          </Button>
                        </div>
                      </div>

                      <Button 
                        onClick={() => setFiltersOpen(false)} 
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-4"
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop: Category Filter Only - Cleaner */}
              {categories.length > 0 && (
                <div className="hidden md:flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className={`flex-shrink-0 text-sm h-9 px-4 ${
                      selectedCategory === 'all'
                        ? 'bg-orange-500 hover:bg-orange-600 text-white border-0'
                        : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'
                    }`}
                  >
                    All
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category.slug}
                      variant={selectedCategory === category.slug ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`flex-shrink-0 text-sm h-9 px-4 whitespace-nowrap ${
                        selectedCategory === category.slug
                          ? 'bg-orange-500 hover:bg-orange-600 text-white border-0'
                          : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'
                      }`}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              )}

              {/* Desktop: Sort Controls - Compact */}
              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs text-gray-600 font-medium">Sort:</span>
                <div className="flex gap-1.5">
                  <Button
                    variant={sortBy === 'newest' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('newest')}
                    className={`text-xs h-8 px-3 ${
                      sortBy === 'newest'
                        ? 'bg-orange-500 hover:bg-orange-600 text-white border-0'
                        : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'
                    }`}
                  >
                    Newest
                  </Button>
                  <Button
                    variant={sortBy === 'popular' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('popular')}
                    className={`text-xs h-8 px-3 ${
                      sortBy === 'popular'
                        ? 'bg-orange-500 hover:bg-orange-600 text-white border-0'
                        : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'
                    }`}
                  >
                    Popular
                  </Button>
                  <Button
                    variant={sortBy === 'price-low' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('price-low')}
                    className={`text-xs h-8 px-3 whitespace-nowrap ${
                      sortBy === 'price-low'
                        ? 'bg-orange-500 hover:bg-orange-600 text-white border-0'
                        : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'
                    }`}
                  >
                    Price: Low-High
                  </Button>
                  <Button
                    variant={sortBy === 'price-high' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('price-high')}
                    className={`text-xs h-8 px-3 whitespace-nowrap ${
                      sortBy === 'price-high'
                        ? 'bg-orange-500 hover:bg-orange-600 text-white border-0'
                        : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'
                    }`}
                  >
                    Price: High-Low
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products by Category */}
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4 mx-auto" />
              <p className="text-gray-700 text-sm sm:text-base">No products found matching your search.</p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="mt-4 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-8 sm:space-y-10 md:space-y-12">
              {filteredCategories.map(category => {
                const isExpanded = expandedCategories.has(category.slug);
                // Separate featured and regular products
                const featuredProducts = category.products.filter(p => p.featured);
                const regularProducts = category.products.filter(p => !p.featured);
                
                // Show featured first, then regular
                const sortedProducts = [...featuredProducts, ...regularProducts];
                const displayProducts = isExpanded 
                  ? sortedProducts 
                  : sortedProducts.slice(0, initialShowCount);
                const hasMore = category.products.length > initialShowCount;

                return (
                  <section key={category.id} className="space-y-4 sm:space-y-5">
                    {/* Minimal Category Header */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{category.name}</h2>
                      {featuredProducts.length > 0 && (
                        <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                          {featuredProducts.length} featured
                        </span>
                      )}
                    </div>

                    {/* Products Grid - Mobile: 2 rows horizontal scroll, Desktop: Grid */}
                    <div className="relative z-0">
                      {/* Mobile: Horizontal scroll with 2 rows */}
                      <div className="sm:hidden overflow-x-auto pb-2 -mx-3 px-3 scrollbar-hide snap-x snap-mandatory">
                        <div className="inline-flex flex-col gap-3">
                          {/* Split products into pairs for 2 rows */}
                          {Array.from({ length: Math.ceil(displayProducts.length / 2) }).map((_, pairIndex) => {
                            const product1 = displayProducts[pairIndex * 2];
                            const product2 = displayProducts[pairIndex * 2 + 1];
                            
                            return (
                              <div key={pairIndex} className="flex gap-3 snap-start flex-shrink-0" style={{ width: 'calc(100vw - 2rem)' }}>
                                {/* First product in pair */}
                                {product1 && (
                                  <div className="flex-shrink-0" style={{ width: 'calc((100vw - 2rem - 0.75rem) / 2)' }}>
                                    <ProductCard
                                      name={product1.name}
                                      description={product1.description}
                                      price={product1.price}
                                      originalPrice={product1.original_price}
                                      imageUrl={product1.image_url}
                                      featured={product1.featured}
                                      shopName={product1.shop_name}
                                      source={product1.source}
                                      onAddToCart={() => handleAddToCart(product1)}
                                    />
                                  </div>
                                )}
                                {/* Second product in pair */}
                                {product2 && (
                                  <div className="flex-shrink-0" style={{ width: 'calc((100vw - 2rem - 0.75rem) / 2)' }}>
                                    <ProductCard
                                      name={product2.name}
                                      description={product2.description}
                                      price={product2.price}
                                      originalPrice={product2.original_price}
                                      imageUrl={product2.image_url}
                                      featured={product2.featured}
                                      shopName={product2.shop_name}
                                      source={product2.source}
                                      onAddToCart={() => handleAddToCart(product2)}
                                    />
                                  </div>
                                )}
                                {/* Empty space if odd number of products */}
                                {!product2 && <div className="flex-shrink-0" style={{ width: 'calc((100vw - 2rem - 0.75rem) / 2)' }} />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Desktop: Grid layout */}
                      <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                        {displayProducts.map(product => (
                          <ProductCard
                            key={product.id}
                            name={product.name}
                            description={product.description}
                            price={product.price}
                            originalPrice={product.original_price}
                            imageUrl={product.image_url}
                            featured={product.featured}
                            shopName={product.shop_name}
                            source={product.source}
                            onAddToCart={() => handleAddToCart(product)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* View More Button */}
                    {hasMore && (
                      <div className="flex justify-center pt-2">
                        <Button
                          variant="outline"
                          onClick={() => toggleCategory(category.slug)}
                          className="group text-xs sm:text-sm h-9 sm:h-10 bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                        >
                          {isExpanded ? (
                            <>
                              Show Less
                              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 rotate-90 transition-transform" />
                            </>
                          ) : (
                            <>
                              View All
                              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Shop;
