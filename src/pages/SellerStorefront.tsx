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

const SellerStorefront = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [shop, setShop] = useState<SellerShop | null>(null);
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShopData();
  }, [slug]);

  const loadShopData = async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      
      // Fetch shop
      const shopData = await fetchSellerShopBySlug(slug);
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
    <div className="min-h-screen bg-background pt-16 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-4 mb-6">
            {shop.shop_logo_url ? (
              <img 
                src={shop.shop_logo_url} 
                alt={shop.shop_name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-background shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-background shadow-lg">
                <Store className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">
                {shop.shop_name}
              </h1>
              <p className="text-lg text-muted-foreground">
                {shop.shop_description || 'Welcome to our shop'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-sm">
              <Store className="w-3 h-3 mr-1" />
              {slug}.flamia.store
            </Badge>
            {shop.tier === 'premium' && (
              <Badge className="text-sm bg-gradient-to-r from-yellow-400 to-orange-500">
                ⭐ Premium Shop
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No Products Yet</h3>
            <p className="text-muted-foreground">This shop is still setting up. Check back soon!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Our Products</h2>
              <p className="text-muted-foreground">{products.length} items</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card 
                  key={product.id}
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.is_featured && (
                      <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                        Featured
                      </Badge>
                    )}
                    {product.original_price && product.original_price > product.price && (
                      <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
                        Sale
                      </Badge>
                    )}
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          UGX {product.price.toLocaleString()}
                        </p>
                        {product.original_price && product.original_price > product.price && (
                          <p className="text-sm text-muted-foreground line-through">
                            UGX {product.original_price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      className="w-full"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-8 mt-12 border-t">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Powered by</p>
          <Link to="/" className="text-primary font-semibold text-xl hover:underline">
            Flamia Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerStorefront;
