import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useMarketplaceProducts, MarketplaceProduct } from '@/hooks/useMarketplaceProducts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Share2, Star, Package, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { trackProductView, getProductViewCount } from '@/services/productViewsService';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { categories, loading } = useMarketplaceProducts();
  const { addToCart } = useCart();
  const [viewCount, setViewCount] = useState<number>(0);

  // Find product across all categories
  const product = categories
    .flatMap(cat => cat.products)
    .find(p => p.id === id);

  // Find related products (same category, different product)
  const relatedProducts = product
    ? categories
        .find(cat => cat.products.some(p => p.id === product.id))
        ?.products.filter(p => p.id !== product.id)
        .slice(0, 8) || []
    : [];

  const canonicalUrl = `https://flamia.store/product/${id}`;

  // Track product view when component mounts and load view count
  useEffect(() => {
    if (product) {
      const productType = product.source === 'flamia' ? 'gadget' : 'business_product';
      trackProductView(product.id, productType);
      getProductViewCount(product.id).then(count => setViewCount(count));
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      type: 'shop',
      name: product.name,
      quantity: 1,
      price: product.price,
      description: product.description,
      businessName: product.source === 'flamia' ? 'Flamia' : product.shop_name || '',
      productId: product.id,
      image: product.image_url,
    });

    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    });

    navigate('/order');
  };

  const handleShare = async () => {
    if (!product) return;
    
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "Product link copied to clipboard",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Product - Flamia Marketplace</title>
          <link rel="canonical" href={canonicalUrl} />
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
            <span className="text-gray-600">Loading product...</span>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Helmet>
          <title>Product Not Found - Flamia Marketplace</title>
          <link rel="canonical" href={canonicalUrl} />
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/shop')} className="bg-orange-500 hover:bg-orange-600 text-white">
              Back to Shop
            </Button>
          </div>
        </div>
      </>
    );
  }

  const discountPercent = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <>
      <Helmet>
        <title>{product.name} - Flamia Marketplace | {product.category}</title>
        <meta name="description" content={product.description || `${product.name} available at Flamia Marketplace. ${product.source === 'flamia' ? 'Direct from Flamia' : `From ${product.shop_name}`}.`} />
        <meta name="keywords" content={`${product.name}, ${product.category}, marketplace Uganda, ${product.source === 'flamia' ? 'Flamia gadgets' : 'seller products'}`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${product.name} - Flamia Marketplace`} />
        <meta property="og:description" content={product.description || `${product.name} available at Flamia Marketplace`} />
        <meta property="og:image" content={product.image_url || ''} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl pt-20 sm:pt-24">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-4 sm:mb-6 lg:mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </motion.button>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-12 mb-8 lg:mb-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-1"
          >
            <div className="w-full max-w-sm mx-auto lg:max-w-none h-64 sm:h-80 lg:h-96 xl:h-[28rem] bg-white rounded-xl lg:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain p-3 lg:p-4"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <Package className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="space-y-4 sm:space-y-6">
              {/* Product Title & Badges */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {product.featured && (
                      <Badge className="bg-orange-500 text-white border-0">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        New
                      </Badge>
                    )}
                    {product.source === 'seller' && product.shop_name && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {product.shop_name}
                      </Badge>
                    )}
                    {product.source === 'flamia' && (
                      <Badge className="bg-orange-500 text-white border-0">
                        Flamia
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <p className="text-sm sm:text-base text-gray-500">
                    Category: <span className="font-medium text-gray-700">{product.category}</span>
                  </p>
                  {viewCount > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>{viewCount.toLocaleString()} {viewCount === 1 ? 'view' : 'views'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Section */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Price</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-bold text-orange-600">
                        UGX {product.price.toLocaleString()}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <>
                          <span className="text-lg sm:text-xl text-gray-500 line-through">
                            UGX {product.original_price.toLocaleString()}
                          </span>
                          {discountPercent > 0 && (
                            <Badge className="bg-orange-500 text-white">
                              Save {discountPercent}%
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-12 sm:h-14 text-base sm:text-lg font-semibold"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="sm:w-auto border-gray-300 hover:bg-gray-50"
                  size="lg"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Source</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">
                    {product.source === 'flamia' ? 'Flamia Direct' : product.shop_name || 'Seller'}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Availability</p>
                  <p className="text-sm sm:text-base font-medium text-green-600">
                    {product.is_available !== false ? 'In Stock' : 'Out of Stock'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 lg:mt-16"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {relatedProducts.map(relatedProduct => (
                <ProductCard
                  key={relatedProduct.id}
                  id={relatedProduct.id}
                  name={relatedProduct.name}
                  description={relatedProduct.description}
                  price={relatedProduct.price}
                  originalPrice={relatedProduct.original_price}
                  imageUrl={relatedProduct.image_url}
                  featured={relatedProduct.featured}
                  shopName={relatedProduct.shop_name}
                  source={relatedProduct.source}
                  viewCount={relatedProduct.viewCount}
                  onAddToCart={() => {
                    addToCart({
                      type: 'shop',
                      name: relatedProduct.name,
                      quantity: 1,
                      price: relatedProduct.price,
                      description: relatedProduct.description,
                      businessName: relatedProduct.source === 'flamia' ? 'Flamia' : relatedProduct.shop_name || '',
                      productId: relatedProduct.id,
                      image: relatedProduct.image_url,
                    });
                    toast({
                      title: 'Added to Cart',
                      description: `${relatedProduct.name} has been added to your cart.`,
                    });
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default ProductDetail;

