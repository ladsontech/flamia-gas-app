import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, AlertCircle, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useMarketplaceProducts, MarketplaceProduct } from '@/hooks/useMarketplaceProducts';
import { useCart } from '@/contexts/CartContext';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/shop/ProductCard';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import type { ProductCategory } from '@/types/seller';
import { ProductQuickViewModal } from '@/components/shop/ProductQuickViewModal';

const Shop: React.FC = () => {
  const { categories, loading, error, refetch } = useMarketplaceProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [initialShowCount, setInitialShowCount] = useState(6);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [allCategories, setAllCategories] = useState<ProductCategory[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<MarketplaceProduct | null>(null);
  const [categoryShowCount, setCategoryShowCount] = useState<Record<string, number>>({});
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { slug: categorySlugParam } = useParams<{ slug?: string }>();
  const { toast } = useToast();
  const [gridShowCount, setGridShowCount] = useState(24);
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Fetch all product categories (even without products)
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('product_categories')
          .select('*')
          .eq('is_active', true)
          .is('parent_id', null) // Only parent categories
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        setAllCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchAllCategories();
  }, []);

  // Read category from URL to support filtered "View All" pages
  useEffect(() => {
    // Prefer route param (/shop/category/:slug); fallback to query (?category=slug)
    const params = new URLSearchParams(location.search);
    const queryCategory = params.get('category');
    if (categorySlugParam) {
      setSelectedCategory(categorySlugParam);
    } else if (queryCategory) {
      setSelectedCategory(queryCategory);
    } else {
      setSelectedCategory('all');
    }
  }, [location.search, categorySlugParam]);

  // Reset grid pagination on filter/sort changes
  useEffect(() => {
    setGridShowCount(24);
  }, [selectedCategory, searchTerm, sortBy]);

  // Scroll to top when switching into a category grid
  useEffect(() => {
    if (selectedCategory !== 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedCategory]);

  // Calculate initial show count based on screen size - show more products
  useEffect(() => {
    const calculateShowCount = () => {
      if (window.innerWidth < 640) return 4; // Mobile: 2 columns, 2 rows
      if (window.innerWidth < 1024) return 12; // Tablet: 3 columns, 4 rows
      if (window.innerWidth < 1280) return 15; // Desktop: 5 columns, 3 rows
      return 20; // Large: 5 columns, 4 rows
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
    // Reset to initial show count when toggling (acts as "Show less")
    setCategoryShowCount(prev => ({
      ...prev,
      [categorySlug]: initialShowCount
    }));
  };

  const handleViewMore = (categorySlug: string, total: number) => {
    setCategoryShowCount(prev => {
      const current = prev[categorySlug] ?? initialShowCount;
      const next = Math.min(total, current + initialShowCount);
      return { ...prev, [categorySlug]: next };
    });
  };

  const getShowCount = (categorySlug: string) => categoryShowCount[categorySlug] ?? initialShowCount;

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
            <Button onClick={() => refetch()} variant="outline">
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
        <title>Flamia Marketplace Uganda | Shop Phones, Laptops, Fashion, Home Appliances | Black Friday Deals</title>
        <meta name="description" content="🛒 Uganda's biggest online marketplace! Shop phones, laptops, fashion, home appliances at massive discounts. Black Friday deals, flash sales, mega savings up to 80% off! Gas accessories, LPG cylinder supply. Verified sellers, secure shopping, fast delivery Kampala." />
        <meta name="keywords" content="online shopping Uganda, shop online Kampala, marketplace Uganda, e-commerce Uganda, buy online Uganda, phones Black Friday sale Uganda, Black Friday phone deals Uganda, huge phone deals Uganda, smartphones Uganda, cheap phones Kampala, Samsung phones Uganda, Tecno phones Uganda, Infinix phones Uganda, iPhone Uganda, laptops Uganda, cheap laptops Kampala, laptop deals Uganda, HP laptops Uganda, Dell laptops Uganda, Lenovo laptops Uganda, MacBook Uganda, fashion Black Friday sale Uganda, women's fashion Uganda, men's fashion Uganda, clothing Uganda, shoes Uganda, home appliances Uganda, kitchen appliances Uganda, refrigerators Uganda, washing machines Uganda, TVs Uganda, Black Friday Uganda, flash sale Uganda, mega savings Uganda, up to 80% off Uganda, treasure hunt deals, biggest sale of the year, verified sellers Uganda, secure online shopping Uganda, LPG gas cylinder supply, gas accessories Uganda, household materials, electronics Uganda" />
        <link rel="canonical" href="https://flamia.store/shop" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Flamia Marketplace - Shop Phones, Laptops, Fashion, Home Appliances Uganda" />
        <meta property="og:description" content="🛒 Uganda's biggest online marketplace! Phones, laptops, fashion, home appliances at massive discounts. Black Friday deals, flash sales, mega savings!" />
        <meta property="og:url" content="https://flamia.store/shop" />
        <meta property="og:type" content="website" />
        
        {/* Product Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            "name": "Flamia Marketplace Uganda",
            "description": "Uganda's biggest online marketplace for phones, laptops, fashion, home appliances, gas accessories, and household materials",
            "url": "https://flamia.store/shop",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Kampala",
              "addressCountry": "UG"
            },
            "areaServed": "Uganda",
            "priceRange": "UGX 10,000 - UGX 10,000,000",
            "paymentAccepted": ["Cash", "Mobile Money", "Bank Transfer"],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Electronics, Fashion, Home Appliances & Gas Accessories",
              "itemListElement": [
                {
                  "@type": "OfferCatalog",
                  "name": "Electronics & Phones",
                  "itemListElement": [
                    {"@type": "Offer", "itemOffered": {"@type": "Product", "name": "Smartphones"}},
                    {"@type": "Offer", "itemOffered": {"@type": "Product", "name": "Laptops"}},
                    {"@type": "Offer", "itemOffered": {"@type": "Product", "name": "Computers"}},
                    {"@type": "Offer", "itemOffered": {"@type": "Product", "name": "TVs"}}
                  ]
                },
                {
                  "@type": "OfferCatalog",
                  "name": "Fashion",
                  "itemListElement": [
                    {"@type": "Offer", "itemOffered": {"@type": "Product", "name": "Women's Fashion"}},
                    {"@type": "Offer", "itemOffered": {"@type": "Product", "name": "Men's Fashion"}},
                    {"@type": "Offer", "itemOffered": {"@type": "Product", "name": "Shoes"}},
                    {"@type": "Offer", "itemOffered": {"@type": "Product", "name": "Bags"}}
                  ]
                },
                {
                  "@type": "OfferCatalog",
                  "name": "Home Appliances",
                  "itemListElement": [
                    {"@type": "Offer", "itemOffered": {"@type": "Product", "name": "Refrigerators"}},
                    {"@type": "Offer", "itemOffered": {"@type": "Product", "name": "Washing Machines"}},
                    {"@type": "Offer", "itemOffered": {"@type": "Product", "name": "Microwaves"}},
                    {"@type": "Offer", "itemOffered": {"@type": "Product", "name": "Blenders"}}
                  ]
                },
                {
                  "@type": "OfferCatalog",
                  "name": "Gas Accessories",
                  "itemListElement": [
                    {"@type": "Offer", "itemOffered": {"@type": "Product", "name": "Gas Regulators"}},
                    {"@type": "Offer", "itemOffered": {"@type": "Product", "name": "Gas Cylinders"}},
                    {"@type": "Offer", "itemOffered": {"@type": "Product", "name": "Gas Safety Equipment"}}
                  ]
                }
              ]
            }
          })}
        </script>
        
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
                  <SheetContent side="right" className="w-[280px] sm:w-[340px]">
                    <SheetHeader>
                      <SheetTitle className="text-sm">Filters & Sort</SheetTitle>
                    </SheetHeader>
                    <div className="py-3 space-y-5 overflow-y-auto">
                      {/* Categories */}
                      {allCategories.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-xs mb-2 text-gray-800">Categories</h3>
                          <div className="grid grid-cols-2 gap-1.5">
                            <Link to="/shop" onClick={() => { setSelectedCategory('all'); setFiltersOpen(false); }}>
                              <Button
                                variant={selectedCategory === 'all' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8"
                              >
                                All
                              </Button>
                            </Link>
                            {allCategories.map(category => {
                              const categorySlug = category.slug;
                              const hasProducts = categories.some(c => c.slug === categorySlug);
                              return (
                                <Link key={category.id} to={`/shop/category/${categorySlug}`} onClick={() => { setSelectedCategory(categorySlug); setFiltersOpen(false); }}>
                                  <Button
                                    variant={selectedCategory === categorySlug ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={`h-8 ${!hasProducts ? 'opacity-60' : ''}`}
                                  >
                                    {category.name}
                                  </Button>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Sort */}
                      <div>
                        <h3 className="font-semibold text-xs mb-2 text-gray-800">Sort By</h3>
                        <div className="grid grid-cols-2 gap-1.5">
                          <Button
                            variant={sortBy === 'newest' ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={() => setSortBy('newest')}
                            className="h-8"
                          >
                            Newest
                          </Button>
                          <Button
                            variant={sortBy === 'popular' ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={() => setSortBy('popular')}
                            className="h-8"
                          >
                            Popular
                          </Button>
                          <Button
                            variant={sortBy === 'price-low' ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={() => setSortBy('price-low')}
                            className="h-8"
                          >
                            Price: Low-High
                          </Button>
                          <Button
                            variant={sortBy === 'price-high' ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={() => setSortBy('price-high')}
                            className="h-8"
                          >
                            Price: High-Low
                          </Button>
                        </div>
                      </div>

                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop: Sort Controls - Compact (in header) */}
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

        {/* Main Content with Sidebar */}
        <div className="flex gap-6 container max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
          {/* Desktop Sidebar - Categories */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-sm text-gray-900 mb-4">Categories</h3>
              <div className="space-y-1">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('all');
                    navigate('/shop');
                  }}
                  className={`w-full justify-start text-sm h-9 ${
                    selectedCategory === 'all'
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </Button>
                {allCategories.map(category => {
                  const categorySlug = category.slug;
                  const hasProducts = categories.some(c => c.slug === categorySlug);
                  return (
                    <Link key={category.id} to={`/shop/category/${categorySlug}`} onClick={() => setSelectedCategory(categorySlug)}>
                      <Button
                        variant={selectedCategory === categorySlug ? 'default' : 'ghost'}
                        size="sm"
                        className={`w-full justify-start text-sm h-9 ${
                          selectedCategory === categorySlug
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : 'text-gray-700 hover:bg-gray-50'
                        } ${!hasProducts ? 'opacity-60' : ''}`}
                      >
                        <span className="flex-1 text-left">{category.name}</span>
                        {hasProducts && (
                          <span className={`text-xs ml-2 ${
                            selectedCategory === categorySlug ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            ({categories.find(c => c.slug === categorySlug)?.products.length || 0})
                          </span>
                        )}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Products - Filtered Grid when a category is selected */}
          {selectedCategory !== 'all' ? (
            <div className="flex-1 min-w-0">
              {(() => {
                const activeCategory = categories.find(c => c.slug === selectedCategory);
                const products = (activeCategory?.products || [])
                  .filter(product => {
                    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      product.description.toLowerCase().includes(searchTerm.toLowerCase());
                    return matchesSearch;
                  })
                  .sort((a, b) => {
                    switch (sortBy) {
                      case 'price-low':
                        return a.price - b.price;
                      case 'price-high':
                        return b.price - a.price;
                      case 'popular':
                        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
                      case 'newest':
                      default:
                        // keep incoming order or feature first
                        if (a.featured && !b.featured) return -1;
                        if (!a.featured && b.featured) return 1;
                        return 0;
                    }
                  });

                // Infinite scroll setup
                const total = products.length;

                // Observer for bottom sentinel (runs when in filtered grid view)
                useEffect(() => {
                  if (selectedCategory === 'all') return;
                  if (!sentinelRef.current || total === 0) return;
                  const observer = new IntersectionObserver((entries) => {
                    const first = entries[0];
                    if (first.isIntersecting && gridShowCount < total) {
                      setIsAutoLoading(true);
                      setGridShowCount(prev => Math.min(total, prev + initialShowCount));
                    }
                  }, { root: null, rootMargin: '200px', threshold: 0.01 });
                  observer.observe(sentinelRef.current);
                  return () => observer.disconnect();
                }, [selectedCategory, total, gridShowCount, initialShowCount]);

                useEffect(() => {
                  if (selectedCategory === 'all') return;
                  setIsAutoLoading(false);
                }, [gridShowCount, selectedCategory]);

                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                        {activeCategory?.name || 'Products'}
                      </h2>
                      <div className="text-sm text-gray-600">{products.length} items</div>
                    </div>
                    <div className="grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {products.slice(0, gridShowCount).map(product => (
                        <ProductCard
                          key={product.id}
                          id={product.id}
                          name={product.name}
                          description={product.description}
                          price={product.price}
                          originalPrice={product.original_price}
                          imageUrl={product.image_url}
                          featured={product.featured}
                          shopName={product.shop_name}
                          source={product.source}
                          viewCount={product.viewCount}
                          condition={product.condition}
                          onAddToCart={() => handleAddToCart(product)}
                          onQuickView={() => setQuickViewProduct(product)}
                        />
                      ))}
                    </div>
                    {/* Infinite scroll sentinel & lightweight loader */}
                    <div ref={sentinelRef} className="h-8 w-full" />
                    {isAutoLoading && (
                      <div className="flex justify-center py-3 text-xs text-gray-500">Loading more...</div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
          /* Products by Category - Horizontal when not filtered */
          <div className="flex-1 min-w-0">
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
                const showCount = getShowCount(category.slug);
                // Separate featured and regular products
                const featuredProducts = category.products.filter(p => p.featured);
                const regularProducts = category.products.filter(p => !p.featured);
                
                // Show featured first, then regular
                const sortedProducts = [...featuredProducts, ...regularProducts];
                const displayProducts = sortedProducts.slice(0, showCount);
                const hasMore = showCount < category.products.length;

                return (
                  <section key={category.id} className="space-y-4 sm:space-y-5">
                    {/* Category Header with View More Button (Desktop) */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{category.name}</h2>
                      <div className="flex items-center gap-3">
                        {featuredProducts.length > 0 && (
                          <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                            {featuredProducts.length} featured
                          </span>
                        )}
                        {/* Desktop: View All navigates to filtered grid page */}
                        <Link to={`/shop/category/${category.slug}`} onClick={() => setSelectedCategory(category.slug)} className="hidden md:flex">
                          <Button
                            variant="default"
                            className="items-center gap-1.5 text-xs sm:text-sm h-8 sm:h-9 bg-orange-500 hover:bg-orange-600 text-white border-0"
                          >
                            View All ({category.products.length})
                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Products - Horizontal Scroll for All Views */}
                    <div className="relative z-0">
                      {/* All Screens: Horizontal Scroll Layout */}
                      <div className="overflow-x-auto pb-2 -mx-3 px-3 scrollbar-hide snap-x snap-mandatory">
                        <div className="inline-flex gap-3 sm:gap-4 md:gap-5">
                          {displayProducts.map(product => (
                            <div key={product.id} className="flex-shrink-0 snap-start w-[150px] sm:w-[180px] md:w-[200px] lg:w-[220px]">
                              <ProductCard
                                id={product.id}
                                name={product.name}
                                description={product.description}
                                price={product.price}
                                originalPrice={product.original_price}
                                imageUrl={product.image_url}
                                featured={product.featured}
                                shopName={product.shop_name}
                                source={product.source}
                                viewCount={product.viewCount}
                                condition={product.condition}
                                onAddToCart={() => handleAddToCart(product)}
                                onQuickView={() => setQuickViewProduct(product)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Mobile: View All navigates to filtered grid page */}
                    <div className="flex justify-center pt-2 md:hidden">
                      <Link to={`/shop/category/${category.slug}`} onClick={() => setSelectedCategory(category.slug)} className="w-full flex justify-center">
                        <Button
                          variant="outline"
                          className="group text-xs sm:text-sm h-9 sm:h-10 bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                        >
                          View All ({category.products.length})
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </section>
                );
              })}
            </div>
          )}
          </div>
          )}
        </div>
      </div>

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        open={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={() => {
          if (quickViewProduct) {
            handleAddToCart(quickViewProduct);
            setQuickViewProduct(null);
          }
        }}
        onViewDetails={() => {
          if (quickViewProduct?.id) {
            navigate(`/product/${quickViewProduct.id}`);
            setQuickViewProduct(null);
          }
        }}
      />
    </>
  );
};

export default Shop;
