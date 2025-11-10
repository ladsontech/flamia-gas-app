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
import { EXTRA_CATEGORY_LOGOS } from '@/config/categoryLogos';

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

  // Active category grid (for deep-linked category view)
  const activeCategoryObj = selectedCategory !== 'all'
    ? categories.find(c => c.slug === selectedCategory)
    : undefined;
  const filteredGridProducts = (() => {
    if (selectedCategory === 'all') return [];
    const base = (activeCategoryObj?.products || []);
    const filtered = base.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
    return filtered.sort((a, b) => {
      // Always prioritize featured products to the top
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popular':
          // Already handled by featured priority above; keep as secondary no-op
          return 0;
        case 'newest':
        default:
          return 0;
      }
    });
  })();

  // Infinite scroll for filtered grid view (category page)
  useEffect(() => {
    if (selectedCategory === 'all') return;
    const total = filteredGridProducts.length;
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
  }, [selectedCategory, filteredGridProducts.length, gridShowCount, initialShowCount]);

  useEffect(() => {
    if (selectedCategory === 'all') return;
    setIsAutoLoading(false);
  }, [gridShowCount, selectedCategory]);

  // Helpers for category UI
  const sanitize = (s: string) =>
    s
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[\/\\]+/g, ' ')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

  const buildLogoCandidates = (slug: string, name: string) => {
    const baseSlug = sanitize(slug);
    const baseName = sanitize(name);
    const exts = ['png', 'jpg', 'jpeg', 'svg', 'webp'];
    const unique: string[] = [];
    const push = (p: string) => {
      if (!unique.includes(p)) unique.push(p);
    };
    exts.forEach(ext => push(`/images/category_logos/${baseSlug}.${ext}`));
    if (baseName && baseName !== baseSlug) {
      exts.forEach(ext => push(`/images/category_logos/${baseName}.${ext}`));
    }
    return unique;
  };

  const CategoryCard = ({ slug, name, small = false, src }: { slug: string; name: string; small?: boolean; src?: string }) => {
    const candidates = src ? [src] : buildLogoCandidates(slug, name);
    const [idx, setIdx] = React.useState(0);
    const currentSrc = candidates[idx] || '/images/icon.png';
    return (
      <Link to={`/shop/category/${slug}`} onClick={() => setSelectedCategory(slug)} className="block">
        <div
          className={`relative flex flex-col items-center justify-start rounded-xl border transition-colors ${
            selectedCategory === slug ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200 hover:bg-gray-50'
          } ${small ? 'p-2' : 'p-3'}`}
        >
          <div
            className={`relative rounded-full bg-orange-100 flex items-center justify-center overflow-visible ${
              small ? 'w-12 h-12' : 'w-14 h-14'
            }`}
          >
            {/* Image intentionally slightly larger than circle */}
            <img
              src={currentSrc}
              alt={name}
              className={`${small ? 'w-14 h-14' : 'w-16 h-16'} object-contain`}
              loading="lazy"
              onError={(e) => {
                if (idx < candidates.length - 1) {
                  setIdx(prev => prev + 1);
                } else {
                  e.currentTarget.src = '/images/icon.png';
                }
              }}
            />
          </div>
          <span className={`mt-2 text-center ${small ? 'text-[11px]' : 'text-xs'} text-gray-800 line-clamp-1`}>{name}</span>
        </div>
      </Link>
    );
  };

  // Build a comprehensive category list for logos
  const resolveCategorySlug = (displayName: string) => {
    const target = sanitize(displayName);
    // Try to find the best match inside DB categories
    const match = allCategories.find(cat => {
      const catName = sanitize(cat.name);
      return catName === target || catName.includes(target) || target.includes(catName);
    });
    return match?.slug || target;
  };

  const logoCategories = React.useMemo(() => {
    // Derive from DB first
    const dbLogos = allCategories.map(c => ({
      slug: c.slug,
      name: c.name,
      src: undefined as string | undefined,
    }));
    // Add all extras, mapping to DB slug if possible
    const extra = EXTRA_CATEGORY_LOGOS.map(e => ({
      slug: resolveCategorySlug(e.name),
      name: e.name,
      src: e.src,
    }));
    // Combine (we keep all extras as requested, even if they map to the same page)
    const combined = [...dbLogos, ...extra];
    // Remove umbrella categories (electronics, fashion, home, etc.) that are subdivided
    const isUmbrella = (n: string) => {
      const s = sanitize(n);
      return s === 'electronics' || s === 'fashion' || s === 'home' || s === 'home-appliances' || s === 'home-and-kitchen' || s === 'home-kitchen';
    };
    return combined.filter(item => !isUmbrella(item.name));
  }, [allCategories]);

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
                      {/* Categories with logos */}
                      {allCategories.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-xs mb-2 text-gray-800">Categories</h3>
                          <div className="grid grid-cols-3 gap-2 max-h-[65vh] overflow-y-auto pr-1">
                            <Link to="/shop" onClick={() => { setSelectedCategory('all'); setFiltersOpen(false); }} className="block">
                              <div className={`relative flex flex-col items-center justify-start rounded-xl border p-3 ${selectedCategory === 'all' ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}>
                                <div className="relative w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center overflow-visible">
                                  <img src="/images/category_logos/all.png" alt="All" className="w-16 h-16 object-contain" />
                                </div>
                                <span className="mt-2 text-center text-xs text-gray-800">All</span>
                              </div>
                            </Link>
                            {logoCategories.map((category, idx) => (
                              <div key={`${category.slug}-${idx}`} onClick={() => setFiltersOpen(false)}>
                                <CategoryCard slug={category.slug} name={category.name} src={category.src} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

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
              <div className="grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto pr-1">
                <Link to="/shop" onClick={() => setSelectedCategory('all')} className="block">
                  <div className={`relative flex flex-col items-center justify-start rounded-xl border p-3 ${selectedCategory === 'all' ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}>
                    <div className="relative w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center overflow-visible">
                      <img src="/images/category_logos/all.png" alt="All" className="w-18 h-18 object-contain" />
                    </div>
                    <span className="mt-2 text-center text-xs text-gray-800">All</span>
                  </div>
                </Link>
                {logoCategories.map((category, idx) => (
                  <CategoryCard key={`${category.slug}-${idx}`} slug={category.slug} name={category.name} src={category.src} />
                ))}
              </div>
            </div>
          </aside>

          {/* Products - Filtered Grid when a category is selected */}
          {selectedCategory !== 'all' ? (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {activeCategoryObj?.name || 'Products'}
                </h2>
                <div className="text-sm text-gray-600">{filteredGridProducts.length} items</div>
              </div>
              <div className="grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredGridProducts.slice(0, gridShowCount).map(product => (
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
            </div>
          ) : (
          /* Products by Category - Horizontal when not filtered */
          <div className="flex-1 min-w-0">
          {filteredCategories.length === 0 ? (
            <div className="py-8 sm:py-12 w-full">
              <div className="text-center mb-6">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-3 mx-auto" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">What would you like to shop?</h3>
                <p className="text-xs sm:text-sm text-gray-600">Select a category to start exploring products</p>
              </div>
              {/* Category grid prompt */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
                {logoCategories.map((category, idx) => (
                  <CategoryCard key={`${category.slug}-${idx}`} slug={category.slug} name={category.name} src={category.src} small />
                ))}
              </div>
              {searchTerm && (
                <div className="flex justify-center mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm('')}
                    className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    Clear search
                  </Button>
                </div>
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
