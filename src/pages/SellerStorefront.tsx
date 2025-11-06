import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Store, Search } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { fetchSellerShopBySlug } from '@/services/sellerService';
import type { SellerShop } from '@/types/seller';
import type { BusinessProduct } from '@/types/business';
import { useCart } from '@/contexts/CartContext';
import { useSellerCart } from '@/contexts/SellerCartContext';
import { SellerCartButton } from '@/components/seller/SellerCartButton';
import { Helmet } from 'react-helmet';

const SellerStorefront = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const flamiaCart = useCart();
  const sellerCart = useSellerCart();
  const [shop, setShop] = useState<SellerShop | null>(null);
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const gridLayout: '1' | '2' | '3' | '4' = '3';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  useEffect(() => {
    loadShopData();
  }, [slug]);

  const loadShopData = async () => {
    const effectiveSlug = slug || getSubdomainSlug();
    if (!effectiveSlug) {
      // If no slug and we're on www subdomain, redirect to home
      const isWwwSubdomain = window.location.hostname.toLowerCase().startsWith('www.');
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
        setProducts((productsData || []) as BusinessProduct[]);
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
  };

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

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !searchTerm || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

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
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{shop.shop_name} – Storefront | Flamia</title>
        <meta name="description" content={`Shop ${shop.shop_name}: ${shop.shop_description || 'Discover quality products'}`} />
        <link rel="canonical" href={`https://${shop.shop_slug}.flamia.store/`} />
      </Helmet>
      {/* Compact Header - App Style */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container max-w-7xl mx-auto px-3 sm:px-4">
          {/* Top Bar: Logo + Name (Compact) */}
          <div className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3">
            {/* Logo - Small on mobile */}
            <div className="flex-shrink-0">
              {shop.shop_logo_url ? (
                <img 
                  src={shop.shop_logo_url} 
                  alt={shop.shop_name}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 flex items-center justify-center border border-gray-200">
                  <Store className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-orange-600" />
                </div>
              )}
            </div>
            
            {/* Store Name - Compact */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
                {shop.shop_name}
              </h1>
              {shop.shop_description && (
                <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 hidden sm:block">
                  {shop.shop_description}
                </p>
              )}
            </div>

            {/* Badge - Compact */}
            {shop.tier === 'premium' && (
              <span className="hidden sm:inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                ⭐
              </span>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative mb-2 sm:mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 snap-x snap-mandatory">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 snap-start touch-manipulation ${
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
                  className={`flex-shrink-0 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 snap-start touch-manipulation whitespace-nowrap ${
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
      </header>

      {/* Products Section */}
      <section className="bg-white py-4 sm:py-6">
        <div className="container max-w-7xl mx-auto px-3 sm:px-4">
          {/* Products Count */}
          {filteredProducts.length > 0 && (
            <div className="mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </p>
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
            <div className={`grid gap-3 sm:gap-4 ${
                gridLayout === '1' ? 'grid-cols-1 max-w-2xl mx-auto' :
                gridLayout === '2' ? 'grid-cols-1 sm:grid-cols-2' :
                gridLayout === '3' ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3' :
                'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  originalPrice={product.original_price}
                  imageUrl={product.image_url}
                  featured={product.is_featured}
                  onAddToCart={() => handleAddToCart(product)}
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
    </div>
  );
};

export default SellerStorefront;
