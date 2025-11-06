import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, AlertCircle, Store, Package, ShoppingBag, ChevronRight } from 'lucide-react';
import { useMarketplaceProducts, MarketplaceProduct } from '@/hooks/useMarketplaceProducts';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/shop/ProductCard';

const Shop: React.FC = () => {
  const { categories, loading, error, refetch } = useMarketplaceProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [initialShowCount, setInitialShowCount] = useState(6);
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

  // Filter products based on search and category
  const filteredCategories = categories
    .map(category => ({
      ...category,
      products: category.products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || category.slug === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    }))
    .filter(category => category.products.length > 0);

  const totalProducts = categories.reduce((sum, cat) => sum + cat.products.length, 0);
  const uniqueCategories = categories.length;

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

      <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-16 sm:pb-20">
        {/* Header */}
        <div className="bg-card shadow-sm sticky top-16 z-10 border-b border-border/50">
          <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-5">
            <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4 md:mb-5">
              {/* Title and Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
                    <Store className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary flex-shrink-0" />
                    <span className="truncate">Flamia Marketplace</span>
                  </h1>
                  <p className="text-muted-foreground mt-0.5 sm:mt-1 text-xs sm:text-sm md:text-base">
                    Your one-stop shop for household materials
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
                    <span><strong className="text-foreground">{totalProducts}</strong> Products</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
                    <span><strong className="text-foreground">{uniqueCategories}</strong> Categories</span>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 h-9 sm:h-10 md:h-12 text-sm sm:text-base w-full"
                />
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="flex-shrink-0 text-xs sm:text-sm h-7 sm:h-8 md:h-9"
                  >
                    All
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category.slug}
                      variant={selectedCategory === category.slug ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.slug)}
                      className="flex-shrink-0 text-xs sm:text-sm h-7 sm:h-8 md:h-9"
                    >
                      {category.name} ({category.products.length})
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products by Category */}
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8 md:space-y-10">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-4 mx-auto" />
              <p className="text-muted-foreground text-sm sm:text-base">No products found matching your search.</p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="mt-4"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            filteredCategories.map(category => {
              const isExpanded = expandedCategories.has(category.slug);
              const featuredProducts = category.products.filter(p => p.featured);
              const regularProducts = category.products.filter(p => !p.featured);
              
              const displayProducts = isExpanded 
                ? category.products 
                : [...featuredProducts, ...regularProducts].slice(0, initialShowCount);
              const hasMore = category.products.length > initialShowCount;

              return (
                <section key={category.id} className="space-y-3 sm:space-y-4 md:space-y-5">
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-border/50 pb-2 sm:pb-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">{category.name}</h2>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                        {featuredProducts.length > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                            {featuredProducts.length} featured
                          </span>
                        )}
                        {featuredProducts.length > 0 && ' • '}
                        <span>{category.products.length} items</span>
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs sm:text-sm ml-3 flex-shrink-0">
                      {category.products.length}
                    </Badge>
                  </div>

                  {/* Products Grid - Mobile-first: 1 column, then 2, 3, 4, 5 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
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

                  {/* View More/Show Less Button */}
                  {hasMore && (
                    <div className="flex justify-center pt-2 sm:pt-3">
                      <Button
                        variant="outline"
                        onClick={() => toggleCategory(category.slug)}
                        className="group text-sm sm:text-base h-9 sm:h-10"
                      >
                        {isExpanded ? (
                          <>
                            Show Less
                            <ChevronRight className="w-4 h-4 ml-2 rotate-90 transition-transform" />
                          </>
                        ) : (
                          <>
                            View All {category.products.length} Products
                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default Shop;
