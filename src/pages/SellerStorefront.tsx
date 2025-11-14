import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, SUPABASE_URL } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Store, Search, List, Grid2x2, LayoutGrid, Grip, SlidersHorizontal, Info, X } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { fetchSellerShopBySlug } from '@/services/sellerService';
import type { SellerShop } from '@/types/seller';
import type { BusinessProduct } from '@/types/business';
import { useCart } from '@/contexts/CartContext';
import { useSellerCart } from '@/contexts/SellerCartContext';
import { SellerCartButton } from '@/components/seller/SellerCartButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
import { StorefrontAnalytics } from '@/components/storefront/StorefrontAnalytics';
import { getProductViewCounts } from '@/services/productViewsService';
import { ProductQuickViewModal } from '@/components/shop/ProductQuickViewModal';
import { StorePerformance } from '@/components/storefront/StorePerformance';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';

const SellerStorefront = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const flamiaCart = useCart();
  const sellerCart = useSellerCart();
  const [shop, setShop] = useState<SellerShop | null>(null);
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridLayout, setGridLayout] = useState<'1' | '2' | '3' | '4'>('3');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [storeDetailsOpen, setStoreDetailsOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<MarketplaceProduct | null>(null);

  const getSubdomainSlug = () => {
    if (typeof window === 'undefined') return null;
    const match = window.location.hostname.match(/^([a-z0-9-]+)\.flamia\.store$/i);
    if (!match) return null;
    const subdomain = match[1];
    // Exclude common non-shop subdomains
    if (['www', 'app', 'admin', 'api'].includes(subdomain.toLowerCase())) {
      return null;
    }
    return subdomain;
  };

  const isIndependentStorefront = !!getSubdomainSlug();
  const addToCart = isIndependentStorefront ? sellerCart.addToCart : flamiaCart.addToCart;

  const loadShopData = useCallback(async () => {
    const effectiveSlug = slug || getSubdomainSlug();
    if (!effectiveSlug) {
      // If no slug and we're on www subdomain, redirect to home
      const isWwwSubdomain = typeof window !== 'undefined' && window.location.hostname.toLowerCase().startsWith('www.');
      if (isWwwSubdomain) {
        window.location.href = 'https://flamia.store';
      }
      return;
    }
    
    try {
      setLoading(true);
      
      // Fetch shop
      const shopData = await fetchSellerShopBySlug(effectiveSlug);
      if (!shopData) {
        toast({
          title: 'Shop not found',
          description: 'This shop does not exist or is not active.',
          variant: 'destructive',
        });
        return;
      }
      setShop(shopData);

      // Fetch products for this shop's business
      if (shopData.business_id) {
        const { data: productsData, error } = await supabase
          .from('business_products')
          .select('*')
          .eq('business_id', shopData.business_id)
          .eq('is_available', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        const products = (productsData || []) as BusinessProduct[];
        
        // Fetch view counts for products
        const productIds = products.map(p => p.id);
        const viewCounts = await getProductViewCounts(productIds);
        
        // Add view counts to products
        const productsWithViews = products.map(product => ({
          ...product,
          viewCount: viewCounts[product.id] || 0
        }));
        
        setProducts(productsWithViews);
      }
    } catch (error: any) {
      console.error('Error loading shop:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [slug, toast]);

  useEffect(() => {
    loadShopData();
    checkOwner();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (shop) {
        checkOwnerStatus(session?.user?.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadShopData]);

  const checkOwner = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (shop && user) {
        checkOwnerStatus(user.id);
      }
    } catch (error) {
      console.error('Error checking owner:', error);
    }
  };

  const checkOwnerStatus = async (userId?: string) => {
    if (!shop || !userId) {
      setIsOwner(false);
      return;
    }
    // Check if the logged-in user owns this shop
    const { data: sellerShop } = await supabase
      .from('seller_shops')
      .select('user_id')
      .eq('id', shop.id)
      .eq('user_id', userId)
      .single();
    
    setIsOwner(!!sellerShop);
  };

  useEffect(() => {
    if (shop && user) {
      checkOwnerStatus(user.id);
    }
  }, [shop, user]);

  const handleAddToCart = (product: BusinessProduct) => {
    addToCart({
      type: 'shop',
      name: product.name,
      price: product.price,
      description: product.description || '',
      image: product.image_url || '/placeholder.svg',
      quantity: 1,
      productId: product.id,
      businessName: shop?.shop_name,
    });
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Extract unique categories from products
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchesSearch = !searchTerm || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popular':
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [products, searchTerm, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Shop Not Found</h2>
          <p className="text-muted-foreground mb-4">This shop does not exist or is not active.</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

      return (
        <StorefrontLayout
          shopName={shop.shop_name}
          shopSlug={shop.shop_slug}
          shopDescription={shop.shop_description}
          shopLogoUrl={shop.shop_logo_url}
          isOwner={isOwner}
          shopType="seller"
        >

          {/* Shop Info Banner - Only show when accessed via main store */}
          {!isIndependentStorefront && (
            <div className="bg-gradient-to-r from-orange-50 via-white to-orange-50 border-b border-orange-200 py-4 sm:py-6">
              <div className="container max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-4">
                  {shop.shop_logo_url && (
                    <img
                      src={shop.shop_logo_url}
                      alt={shop.shop_name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-orange-200"
                    />
                  )}
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 text-transparent bg-clip-text">
                      {shop.shop_name}
                    </h1>
                    {shop.shop_description && (
                      <p className="text-sm sm:text-base text-gray-600 mt-1">{shop.shop_description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Owner Analytics - Show inline when accessed via main store */}
          {!isIndependentStorefront && isOwner && shop && (
            <div className="bg-gray-50 py-6">
              <div className="container max-w-7xl mx-auto px-4 space-y-6">
                <StorePerformance shopId={shop.id} shopType="seller" />
                  <StorefrontAnalytics
                    shopId={shop.id}
                    businessId={shop.business_id}
                    shopType="seller"
                  />
                </div>
            </div>
          )}

          {/* Search and Filters Bar */}
          <div className="bg-white border-b border-gray-200 sticky top-14 z-40 shadow-sm py-3">
        <div className="container max-w-7xl mx-auto px-3 sm:px-4">
          {/* Search Bar */}
          <div className="relative mb-2 sm:mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
            <Input
              placeholder="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm bg-white border border-gray-300 rounded-full focus:bg-white"
            />
          </div>

          {/* Filters Button - Mobile */}
          <div className="md:hidden mb-2">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="w-full h-9">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters & Sort
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                      <Store className="w-4 h-4 text-white" />
                    </div>
                    <SheetTitle className="text-base sm:text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-500 text-transparent bg-clip-text tracking-wide">
                      Flamia Mall
                    </SheetTitle>
                  </div>
                </SheetHeader>
                <div className="py-4 space-y-6">
                  {/* Categories */}
                  {categories.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-3">Categories</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={selectedCategory === 'all' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedCategory('all')}
                          className={selectedCategory === 'all' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                        >
                          All
                        </Button>
                        {categories.map(category => (
                          <Button
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                            className={selectedCategory === category ? 'bg-orange-500 hover:bg-orange-600' : ''}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sort */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3">Sort By</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={sortBy === 'newest' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('newest')}
                        className={sortBy === 'newest' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                      >
                        Newest
                      </Button>
                      <Button
                        variant={sortBy === 'popular' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('popular')}
                        className={sortBy === 'popular' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                      >
                        Popular
                      </Button>
                      <Button
                        variant={sortBy === 'price-low' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('price-low')}
                        className={sortBy === 'price-low' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                      >
                        Price: Low-High
                      </Button>
                      <Button
                        variant={sortBy === 'price-high' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('price-high')}
                        className={sortBy === 'price-high' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                      >
                        Price: High-Low
                      </Button>
                    </div>
                  </div>

                  <Button onClick={() => setFiltersOpen(false)} className="w-full bg-orange-500 hover:bg-orange-600">
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Filters - Hidden on Mobile */}
          <div className="hidden md:block space-y-2 mb-2">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
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
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-shrink-0 text-sm h-9 px-4 whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-orange-500 hover:bg-orange-600 text-white border-0'
                        : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline Analytics for Owners - Only show on subdomain visits */}
      {isIndependentStorefront && isOwner && (
        <section className="bg-white">
          <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
            <StorePerformance shopId={shop.id} shopType="seller" />
            <StorefrontAnalytics
              shopId={shop.id}
              businessId={shop.business_id}
              shopType="seller"
            />
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="bg-white py-4 sm:py-6">
        <div className="container max-w-7xl mx-auto px-3 sm:px-4">
          {/* Products Count & Grid Layout Controls */}
          {filteredProducts.length > 0 && (
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs sm:text-sm text-gray-600">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                </p>
                
                {/* Grid Layout Controls - Desktop */}
                <div className="hidden sm:flex gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGridLayout('1')}
                    className={`h-7 w-7 p-0 ${gridLayout === '1' ? 'bg-white shadow-sm' : ''}`}
                    title="Single column"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGridLayout('2')}
                    className={`h-7 w-7 p-0 ${gridLayout === '2' ? 'bg-white shadow-sm' : ''}`}
                    title="Two columns"
                  >
                    <Grid2x2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGridLayout('3')}
                    className={`h-7 w-7 p-0 ${gridLayout === '3' ? 'bg-white shadow-sm' : ''}`}
                    title="Three columns"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGridLayout('4')}
                    className={`h-7 w-7 p-0 ${gridLayout === '4' ? 'bg-white shadow-sm' : ''}`}
                    title="Four columns"
                  >
                    <Grip className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Sort Controls - Desktop Only */}
              <div className="hidden md:flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
                <Button
                  variant={sortBy === 'newest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('newest')}
                  className={`flex-shrink-0 text-xs h-8 px-3 ${
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
                  className={`flex-shrink-0 text-xs h-8 px-3 ${
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
                  className={`flex-shrink-0 text-xs h-8 px-3 whitespace-nowrap ${
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
                  className={`flex-shrink-0 text-xs h-8 px-3 whitespace-nowrap ${
                    sortBy === 'price-high'
                      ? 'bg-orange-500 hover:bg-orange-600 text-white border-0'
                      : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'
                  }`}
                >
                  Price: High-Low
                </Button>
              </div>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="max-w-md mx-auto">
                <Store className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter.' 
                    : 'This shop is still setting up. Check back soon!'}
                </p>
                {(searchTerm || selectedCategory !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="text-xs sm:text-sm"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className={`grid gap-4 md:gap-6 ${
                gridLayout === '1' ? 'grid-cols-1 max-w-2xl mx-auto' :
                gridLayout === '2' ? 'grid-cols-1 sm:grid-cols-2' :
                gridLayout === '3' ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3' :
                'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      description={product.description}
                      price={product.price}
                      originalPrice={product.original_price}
                      imageUrl={product.image_url}
                      featured={product.is_featured}
                      viewCount={(product as any).viewCount}
                      onAddToCart={() => handleAddToCart(product)}
                      detailsHref={isIndependentStorefront ? `/product/${product.id}` : `/shop/${slug}/product/${product.id}`}
                      onQuickView={() => setQuickViewProduct(product as any)}
                    />
                  ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Independent Cart Button for Seller Storefronts */}
      {isIndependentStorefront && <SellerCartButton />}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12 sm:mt-16 md:mt-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            © {new Date().getFullYear()} {shop.shop_name}. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Powered by <span className="font-semibold text-orange-600">Flamia</span>
          </p>
        </div>
      </footer>

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        open={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={() => {
          if (quickViewProduct) {
            handleAddToCart(quickViewProduct as any);
            setQuickViewProduct(null);
          }
        }}
        onViewDetails={() => {
          if (quickViewProduct?.id) {
            navigate(`/shop/${slug}/product/${quickViewProduct.id}`);
            setQuickViewProduct(null);
          }
        }}
      />
        </StorefrontLayout>
  );
};

export default SellerStorefront;
