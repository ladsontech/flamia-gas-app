import React, { useState } from 'react';
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
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

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

      <div className="min-h-screen bg-background pt-20 pb-20">
        {/* Header */}
        <div className="bg-card shadow-sm sticky top-16 z-10 border-b">
          <div className="container max-w-7xl mx-auto px-4 py-4 sm:py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <Store className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  Flamia Marketplace
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">Your one-stop shop for household materials</p>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <span><strong className="text-foreground">{totalProducts}</strong> Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <span><strong className="text-foreground">{uniqueCategories}</strong> Categories</span>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-2xl mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 sm:h-12 text-sm sm:text-base"
              />
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className="flex-shrink-0"
                >
                  All Categories
                </Button>
                {categories.map(category => (
                  <Button
                    key={category.slug}
                    variant={selectedCategory === category.slug ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.slug)}
                    className="flex-shrink-0"
                  >
                    {category.name} ({category.products.length})
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Products by Category */}
        <div className="container max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-8 sm:space-y-12">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-3 mx-auto" />
              <p className="text-muted-foreground">No products found matching your search.</p>
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
              const initialShowCount = window.innerWidth < 640 ? 4 : 6;
              const displayProducts = isExpanded 
                ? category.products 
                : [...featuredProducts, ...regularProducts].slice(0, initialShowCount);
              const hasMore = category.products.length > initialShowCount;

              return (
                <section key={category.id} className="space-y-4 sm:space-y-6">
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{category.name}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {featuredProducts.length > 0 && `${featuredProducts.length} featured • `}
                        {category.products.length} total items
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      {category.products.length}
                    </Badge>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
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

                  {/* View More Button */}
                  {hasMore && !isExpanded && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        onClick={() => toggleCategory(category.slug)}
                        className="group"
                      >
                        View More Products
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  )}
                  {isExpanded && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        onClick={() => toggleCategory(category.slug)}
                      >
                        Show Less
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
