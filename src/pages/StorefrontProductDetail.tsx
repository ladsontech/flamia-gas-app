import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Share2, Package, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useSellerCart } from '@/contexts/SellerCartContext';

interface BusinessProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  original_price?: number | null;
  image_url?: string | null;
  category?: string | null;
  is_available?: boolean | null;
  created_at?: string;
}

const StorefrontProductDetail: React.FC = () => {
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const cart = useCart();
  const sellerCart = useSellerCart();
  const [product, setProduct] = useState<BusinessProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewCount, setViewCount] = useState<number>(0);

  const isStorefrontHost = typeof window !== 'undefined' && /^(?!www\.).+\.flamia\.store$/i.test(window.location.hostname);
  const isSellerRoute = location.pathname.startsWith('/shop/');
  const isAffiliateRoute = location.pathname.startsWith('/affiliate/');

  const useIndependentCart = isStorefrontHost; // subdomain storefronts keep independent cart
  const addToCart = useIndependentCart ? sellerCart.addToCart : cart.addToCart;

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('business_products')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setProduct(data as BusinessProduct);

        // Best-effort view count from product_views
        try {
          const { count } = await supabase
            .from('product_views' as any)
            .select('*', { count: 'exact', head: true })
            .eq('product_id', id);
          setViewCount(count || 0);
        } catch {}
      } catch (e: any) {
        toast({ title: 'Not found', description: 'Product could not be loaded', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, toast]);

  const discountPercent = useMemo(() => {
    if (!product?.original_price || !product.price) return 0;
    if (product.original_price <= product.price) return 0;
    return Math.round(((product.original_price - product.price) / product.original_price) * 100);
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      type: 'shop',
      name: product.name,
      price: product.price,
      description: product.description || '',
      image: product.image_url || '/placeholder.svg',
      quantity: 1,
      productId: product.id,
      businessName: '',
    } as any);
    toast({ title: 'Added to cart', description: `${product.name} added to cart` });
  };

  const canonicalUrl = isSellerRoute
    ? `https://flamia.store/shop/${slug || ''}/product/${id}`
    : isAffiliateRoute
    ? `https://flamia.store/affiliate/${slug || ''}/product/${id}`
    : `https://${isStorefrontHost ? window.location.hostname : 'flamia.store'}/product/${id}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found.</p>
          <Button onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{product.name} – Storefront</title>
        <meta name="description" content={product.description || ''} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <div className="container max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-accent mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Image */}
          <div>
            <div className="w-full aspect-square bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-4" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-300" />
                </div>
              )}
            </div>
            {viewCount > 0 && (
              <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                <Eye className="w-4 h-4" /> {viewCount.toLocaleString()} views
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.category && (
              <div>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
            )}

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">UGX {product.price.toLocaleString()}</span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-lg text-gray-500 line-through">UGX {product.original_price.toLocaleString()}</span>
                  {discountPercent > 0 && (
                    <Badge className="bg-orange-500 text-white">Save {discountPercent}%</Badge>
                  )}
                </>
              )}
            </div>

            {product.description && (
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={handleAddToCart} className="bg-gray-900 hover:bg-black text-white">
                <ShoppingCart className="w-4 h-4 mr-2" /> Add to cart
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    toast({ title: 'Link copied' });
                  } catch {}
                }}
              >
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorefrontProductDetail;


