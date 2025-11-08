import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Share2, Package, Eye, Loader2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useSellerCart } from '@/contexts/SellerCartContext';
import { ProductCard } from '@/components/shop/ProductCard';
import { trackProductView, getProductViewCount } from '@/services/productViewsService';
import { WhatsAppCheckoutButton } from '@/components/checkout/WhatsAppCheckoutButton';
import type { SellerShop } from '@/types/seller';

interface BusinessProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  original_price?: number | null;
  image_url?: string | null;
  category?: string | null;
  is_available?: boolean | null;
  is_featured?: boolean | null;
  business_id?: string | null;
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
  const [relatedProducts, setRelatedProducts] = useState<BusinessProduct[]>([]);
  const [shop, setShop] = useState<SellerShop | null>(null);
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
        const productData = data as BusinessProduct;
        setProduct(productData);

        // Track view and get count
        trackProductView(id, 'business_product');
        const count = await getProductViewCount(id);
        setViewCount(count);

        // Load seller shop info if on seller storefront
        if (slug && (isSellerRoute || isStorefrontHost)) {
          const { data: shopData } = await supabase
            .from('seller_shops')
            .select('*')
            .eq('shop_slug', slug)
            .single();
          
          if (shopData) {
            setShop(shopData as SellerShop);
          }
        }

        // Load related products (same category or same business)
        if (productData.business_id || productData.category) {
          const { data: related } = await supabase
            .from('business_products')
            .select('*')
            .neq('id', id)
            .eq('is_available', true)
            .or(`business_id.eq.${productData.business_id},category.eq.${productData.category}`)
            .limit(8);
          
          setRelatedProducts((related || []) as BusinessProduct[]);
        }
      } catch (e: any) {
        toast({ title: 'Not found', description: 'Product could not be loaded', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, slug, isSellerRoute, isStorefrontHost, toast]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Loading product...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(-1)} className="bg-orange-500 hover:bg-orange-600">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Helmet>
        <title>{product.name} – Storefront</title>
        <meta name="description" content={product.description || ''} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <div className="container max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-4 sm:mb-6 lg:mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12 mb-8 lg:mb-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-1"
          >
            <div className="w-full aspect-square bg-white rounded-xl lg:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain p-3 lg:p-4"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-300" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-4 sm:space-y-6 lg:space-y-8"
          >
            {/* Badges */}
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              {product.is_featured && (
                <Badge className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 bg-orange-500 text-white">
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 fill-current" />
                  Featured
                </Badge>
              )}
              {product.category && (
                <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
                  {product.category}
                </Badge>
              )}
            </div>

            {/* Title and View Count */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              {viewCount > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Eye className="w-4 h-4" />
                  <span>{viewCount.toLocaleString()} {viewCount === 1 ? 'view' : 'views'}</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-orange-500">
                  UGX {product.price.toLocaleString()}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <>
                    <span className="text-lg sm:text-xl lg:text-2xl text-gray-500 line-through">
                      UGX {product.original_price.toLocaleString()}
                    </span>
                    {discountPercent > 0 && (
                      <Badge className="bg-orange-500 text-white text-xs sm:text-sm">
                        Save {discountPercent}%
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">Description</h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg xl:text-xl">
                  {product.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6">
              {/* Show WhatsApp checkout for seller subdomains with WhatsApp enabled */}
              {shop && shop.whatsapp_number && (shop.checkout_type === 'whatsapp' || shop.checkout_type === 'both') && (
                <WhatsAppCheckoutButton
                  productId={product.id}
                  productName={product.name}
                  productPrice={product.price}
                  quantity={1}
                  whatsappNumber={shop.whatsapp_number}
                  shopId={shop.id}
                  shopName={shop.shop_name}
                  productImage={product.image_url || undefined}
                  className="w-full py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg font-semibold rounded-lg sm:rounded-xl"
                />
              )}
              
              {/* Show Flamia cart checkout if not WhatsApp-only */}
              {(!shop || shop.checkout_type !== 'whatsapp') && (
                <div className="flex gap-3 sm:gap-4">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg font-semibold rounded-lg sm:rounded-xl"
                    size="lg"
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                    Add to Cart
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(window.location.href);
                        toast({ title: 'Link copied' });
                      } catch {}
                    }}
                    variant="outline"
                    size="lg"
                    className="px-4 sm:px-6 py-3 sm:py-4 lg:py-5 rounded-lg sm:rounded-xl"
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              )}
              
              {/* Show both options when checkout_type is 'both' */}
              {shop && shop.checkout_type === 'both' && (
                <div className="text-center text-sm text-gray-500">
                  or
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 sm:space-y-6 lg:space-y-8"
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="h-full"
                >
                  <ProductCard
                    id={relatedProduct.id}
                    name={relatedProduct.name}
                    description={relatedProduct.description || undefined}
                    price={relatedProduct.price}
                    originalPrice={relatedProduct.original_price || undefined}
                    imageUrl={relatedProduct.image_url || undefined}
                    featured={relatedProduct.is_featured || undefined}
                    onAddToCart={() => {
                      addToCart({
                        type: 'shop',
                        name: relatedProduct.name,
                        price: relatedProduct.price,
                        description: relatedProduct.description || '',
                        image: relatedProduct.image_url || '/placeholder.svg',
                        quantity: 1,
                        productId: relatedProduct.id,
                        businessName: '',
                      } as any);
                      toast({ title: 'Added to cart', description: `${relatedProduct.name} added to cart` });
                    }}
                    detailsHref={isSellerRoute 
                      ? `/shop/${slug}/product/${relatedProduct.id}`
                      : isAffiliateRoute
                      ? `/affiliate/${slug}/product/${relatedProduct.id}`
                      : `/product/${relatedProduct.id}`
                    }
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StorefrontProductDetail;


