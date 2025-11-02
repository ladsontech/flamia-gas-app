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
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{shop.shop_name} – Storefront | Flamia</title>
        <meta name="description" content={`Shop ${shop.shop_name}: ${shop.shop_description || 'Discover quality products'}`} />
        <link rel="canonical" href={`https://${shop.shop_slug}.flamia.store/`} />
      </Helmet>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-20">
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-8">
            {shop.shop_logo_url ? (
              <img 
                src={shop.shop_logo_url} 
                alt={shop.shop_name}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-primary-foreground/20 shadow-2xl"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center border-4 border-primary-foreground/20 shadow-2xl">
                <Store className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-primary-foreground" />
              </div>
            )}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-2 sm:mb-3 text-primary-foreground">
                {shop.shop_name}
              </h1>
              {shop.shop_description && (
                <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 mb-3 sm:mb-4 max-w-2xl">
                  {shop.shop_description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground rounded-full text-xs sm:text-sm font-medium border border-primary-foreground/20">
                  {products.length} Products Available
                </span>
                {shop.tier === 'premium' && (
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                    ⭐ Premium Shop
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-16">
        {/* Grid Layout Controls */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Our Products</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">Browse {products.length} quality products</p>
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium hidden sm:block">Columns:</Label>
            <RadioGroup
              value={gridLayout}
              onValueChange={(value: '1' | '2' | '3' | '4') => setGridLayout(value)}
              className="flex gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="col-1" className="peer sr-only" />
                <Label
                  htmlFor="col-1"
                  className="flex items-center justify-center rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                >
                  <List className="h-4 w-4" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="col-2" className="peer sr-only" />
                <Label
                  htmlFor="col-2"
                  className="flex items-center justify-center rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                >
                  <Grid2x2 className="h-4 w-4" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="col-3" className="peer sr-only" />
                <Label
                  htmlFor="col-3"
                  className="flex items-center justify-center rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="col-4" className="peer sr-only" />
                <Label
                  htmlFor="col-4"
                  className="flex items-center justify-center rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                >
                  <LayoutList className="h-4 w-4" />
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Store className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No Products Yet</h3>
            <p className="text-muted-foreground">This shop is still setting up. Check back soon for amazing products!</p>
          </div>
        ) : (
          <div className={`grid gap-4 ${
              gridLayout === '1' ? 'grid-cols-1 max-w-2xl mx-auto' :
              gridLayout === '2' ? 'grid-cols-1 sm:grid-cols-2' :
              gridLayout === '3' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3' :
              'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
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
      
      {/* Independent Cart Button for Seller Storefronts */}
      {isIndependentStorefront && <SellerCartButton />}

      {/* Footer */}
      <div className="border-t bg-muted/30 mt-8 sm:mt-12 md:mt-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} {shop.shop_name}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Powered by <span className="font-semibold text-foreground">Flamia</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerStorefront;
