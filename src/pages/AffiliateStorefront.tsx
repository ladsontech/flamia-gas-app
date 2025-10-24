import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { fetchAffiliateShopBySlug, fetchAffiliateShopProducts } from '@/services/affiliateService';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ShoppingCart, Store } from 'lucide-react';
import type { AffiliateShop, AffiliateShopProduct } from '@/types/affiliate';
import type { BusinessProduct } from '@/types/business';

export default function AffiliateStorefront() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const [shop, setShop] = useState<AffiliateShop | null>(null);
  const [products, setProducts] = useState<(BusinessProduct & { commission_rate?: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadShopData();
    }
  }, [slug]);

  const loadShopData = async () => {
    try {
      // Fetch shop
      const shopData = await fetchAffiliateShopBySlug(slug!);
      if (!shopData) {
        toast.error('Shop not found');
        setLoading(false);
        return;
      }
      setShop(shopData);

      // Fetch shop products
      const affiliateProducts = await fetchAffiliateShopProducts(shopData.id);
      
      // Fetch full product details
      const productIds = affiliateProducts.map(ap => ap.business_product_id);
      const { data: productsData, error: productsError } = await supabase
        .from('business_products')
        .select('*, businesses(name)')
        .in('id', productIds)
        .eq('is_available', true);

      if (productsError) throw productsError;

      // Merge commission data
      const productsWithCommission = (productsData || []).map(product => ({
        ...product,
        commission_rate: affiliateProducts.find(ap => ap.business_product_id === product.id)?.commission_rate
      })) as (BusinessProduct & { commission_rate?: number })[];

      setProducts(productsWithCommission);
    } catch (error: any) {
      console.error('Error loading shop:', error);
      toast.error('Failed to load shop');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: BusinessProduct) => {
    addToCart({
      type: 'shop' as const,
      name: product.name,
      price: product.price,
      quantity: 1,
      productId: product.id,
      description: product.description || '',
      businessName: '',
    });
    toast.success(`${product.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md">
          <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Shop Not Found</h2>
          <p className="text-muted-foreground">The shop you're looking for doesn't exist or has been deactivated.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-3 text-primary-foreground">
                {shop.shop_name}
              </h1>
              {shop.shop_description && (
                <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 mb-3 sm:mb-4 max-w-2xl mx-auto md:mx-0">
                  {shop.shop_description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground rounded-full text-xs sm:text-sm font-medium border border-primary-foreground/20">
                  {products.length} Products Available
                </span>
                {shop.tier === 'premium' && (
                  <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                    ⭐ Premium Shop
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16">
        {products.length === 0 ? (
          <Card className="p-8 sm:p-12 md:p-16 text-center border-2">
            <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">No Products Available</h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">This shop doesn't have any products listed yet. Check back soon!</p>
          </Card>
        ) : (
          <>
            <div className="mb-6 sm:mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Shop Our Collection</h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Discover {products.length} amazing products</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/30 flex flex-col">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.original_price && product.original_price > product.price && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-destructive text-destructive-foreground px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-bold shadow-lg">
                        SALE
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 md:p-6 flex-1 flex flex-col">
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
                        <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                          UGX {product.price.toLocaleString()}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-xs sm:text-sm text-muted-foreground line-through ml-2">
                            UGX {product.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <Button 
                        className="w-full text-sm sm:text-base group-hover:shadow-lg transition-shadow"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
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
          <p className="text-xs text-muted-foreground mt-1 sm:mt-2">
            Powered by <span className="font-semibold text-foreground">Flamia</span>
          </p>
        </div>
      </div>
    </div>
  );
}
