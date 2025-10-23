import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Store, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { fetchSellerShopBySlug } from '@/services/sellerService';
import type { SellerShop } from '@/types/seller';
import type { BusinessProduct } from '@/types/business';
import { useCart } from '@/contexts/CartContext';
import { Helmet } from 'react-helmet';

const SellerStorefront = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [shop, setShop] = useState<SellerShop | null>(null);
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const getSubdomainSlug = () => {
    if (typeof window === 'undefined') return null;
    const match = window.location.hostname.match(/^([a-z0-9-]+)\.flamia\.store$/i);
    return match ? match[1] : null;
  };

  useEffect(() => {
    loadShopData();
  }, [slug]);

  const loadShopData = async () => {
    const effectiveSlug = slug || getSubdomainSlug();
    if (!effectiveSlug) return;
    
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
        {products.length === 0 ? (
          <Card className="p-8 sm:p-12 md:p-16 text-center border-2">
            <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">No Products Yet</h3>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">This shop is still setting up. Check back soon for amazing products!</p>
          </Card>
        ) : (
          <>
            <div className="mb-6 sm:mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Our Products</h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground">Browse {products.length} quality products</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {products.map((product) => (
                <Card 
                  key={product.id}
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/30 flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.is_featured && (
                      <Badge className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-primary text-primary-foreground shadow-lg text-xs">
                        Featured
                      </Badge>
                    )}
                    {product.original_price && product.original_price > product.price && (
                      <Badge className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-destructive text-destructive-foreground shadow-lg text-xs">
                        SALE
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-3 sm:p-4 md:p-6 flex-1 flex flex-col">
                    <h3 className="font-bold text-base sm:text-lg md:text-xl mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    
                    {product.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 flex-1">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 sm:space-y-3 mt-auto">
                      <div>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                          UGX {product.price.toLocaleString()}
                        </p>
                        {product.original_price && product.original_price > product.price && (
                          <p className="text-xs sm:text-sm text-muted-foreground line-through">
                            UGX {product.original_price.toLocaleString()}
                          </p>
                        )}
                      </div>
                      
                      <Button 
                        onClick={() => handleAddToCart(product)}
                        className="w-full group-hover:shadow-lg transition-shadow text-xs sm:text-sm"
                        size="sm"
                      >
                        <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

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
