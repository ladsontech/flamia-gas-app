import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Store, LayoutGrid, LayoutList, Grid2x2, List } from 'lucide-react';
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
  const [gridLayout, setGridLayout] = useState<'1' | '2' | '3' | '4'>('3');

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
      {/* Header Section - Shopify Style */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center py-6 sm:py-8 md:py-12 gap-4 sm:gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              {shop.shop_logo_url ? (
                <img 
                  src={shop.shop_logo_url} 
                  alt={shop.shop_name}
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border-2 border-gray-100 shadow-sm">
                  <Store className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-primary" />
                </div>
              )}
            </div>
            
            {/* Store Name & Description */}
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                {shop.shop_name}
              </h1>
              {shop.shop_description && (
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed px-4">
                  {shop.shop_description}
                </p>
              )}
              
              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2">
                <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  {products.length} {products.length === 1 ? 'Product' : 'Products'}
                </span>
                {shop.tier === 'premium' && (
                  <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm">
                    ⭐ Premium Shop
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Products Section */}
      <section className="bg-gray-50/50 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Shop Our Collection</h2>
                <p className="text-sm sm:text-base text-gray-600">Discover {products.length} carefully curated {products.length === 1 ? 'product' : 'products'}</p>
              </div>
              
              {/* Grid Layout Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Label className="text-xs sm:text-sm font-medium text-gray-600 hidden sm:block">View:</Label>
                <RadioGroup
                  value={gridLayout}
                  onValueChange={(value: '1' | '2' | '3' | '4') => setGridLayout(value)}
                  className="flex gap-1.5 sm:gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="col-1" className="peer sr-only" />
                    <Label
                      htmlFor="col-1"
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-md border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                    >
                      <List className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 peer-data-[state=checked]:text-primary" />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="col-2" className="peer sr-only" />
                    <Label
                      htmlFor="col-2"
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-md border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                    >
                      <Grid2x2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 peer-data-[state=checked]:text-primary" />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="col-3" className="peer sr-only" />
                    <Label
                      htmlFor="col-3"
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-md border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                    >
                      <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 peer-data-[state=checked]:text-primary" />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id="col-4" className="peer sr-only" />
                    <Label
                      htmlFor="col-4"
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-md border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                    >
                      <LayoutList className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 peer-data-[state=checked]:text-primary" />
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 sm:py-20 md:py-24 px-4">
              <div className="max-w-md mx-auto">
                <Store className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Products Yet</h3>
                <p className="text-sm sm:text-base text-gray-600">This shop is still setting up. Check back soon for amazing products!</p>
              </div>
            </div>
          ) : (
            <div className={`grid gap-4 sm:gap-5 md:gap-6 ${
                gridLayout === '1' ? 'grid-cols-1 max-w-2xl mx-auto' :
                gridLayout === '2' ? 'grid-cols-1 sm:grid-cols-2' :
                gridLayout === '3' ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3' :
                'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}>
              {products.map((product) => (
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
