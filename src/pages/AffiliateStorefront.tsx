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
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="container max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center gap-6">
            {shop.shop_logo_url ? (
              <img 
                src={shop.shop_logo_url} 
                alt={shop.shop_name}
                className="w-24 h-24 rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-primary/20 rounded-2xl flex items-center justify-center">
                <Store className="w-12 h-12 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{shop.shop_name}</h1>
              {shop.shop_description && (
                <p className="text-lg text-muted-foreground">{shop.shop_description}</p>
              )}
              <div className="flex items-center gap-4 mt-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {products.length} Products
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {products.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Products Available</h2>
            <p className="text-muted-foreground">This shop doesn't have any products listed yet.</p>
          </Card>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {product.image_url && (
                    <div className="relative">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-56 object-cover"
                      />
                      {product.commission_rate && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold">
                          {product.commission_rate}% Commission
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary">
                          UGX {product.price.toLocaleString()}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            UGX {product.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t mt-16">
        <div className="container max-w-6xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {shop.shop_name}. Powered by Flamia.</p>
        </div>
      </div>
    </div>
  );
}
