import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useGadgets } from '@/hooks/useGadgets';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, Share2, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import GadgetCard from '@/components/gadgets/GadgetCard';
import { Loader2 } from 'lucide-react';

const GadgetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { gadgets, loading } = useGadgets();

  const gadget = gadgets.find(g => g.id === id);
  const relatedGadgets = gadgets.filter(g => 
    g.id !== id && 
    (g.category === gadget?.category || g.brand === gadget?.brand)
  ).slice(0, 8);

  const canonicalUrl = `https://flamia.store/gadget/${id}`;

  const handleOrder = () => {
    navigate("/order?type=gadget");
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: gadget?.name,
          text: gadget?.description,
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
          <title>Loading Product - Flamia Gadgets</title>
          <link rel="canonical" href={canonicalUrl} />
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <span className="ml-2 text-gray-600">Loading product...</span>
        </div>
      </>
    );
  }

  if (!gadget) {
    return (
      <>
        <Helmet>
          <title>Product Not Found - Flamia Gadgets</title>
          <link rel="canonical" href={canonicalUrl} />
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/gadgets')} className="bg-accent hover:bg-accent/90">
              Back to Gadgets
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Helmet>
        <title>{gadget.name} - Flamia Gadgets Uganda | Best Price Electronics</title>
        <meta name="description" content={`${gadget.description} - Order ${gadget.name} with fast delivery in Uganda. Price: UGX ${gadget.price.toLocaleString()}`} />
        <meta name="keywords" content={`${gadget.name}, ${gadget.category}, ${gadget.brand}, gadgets Uganda, electronics Kampala`} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${gadget.name} - Flamia Gadgets`} />
        <meta property="og:description" content={gadget.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:image" content={gadget.image_url || '/images/gadget-fallback.jpg'} />
        
        {/* Product Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": gadget.name,
            "description": gadget.description,
            "image": gadget.image_url,
            "brand": gadget.brand,
            "category": gadget.category,
            "offers": {
              "@type": "Offer",
              "price": gadget.price,
              "priceCurrency": "UGX",
              "availability": gadget.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
          })}
        </script>
        
        {/* SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
      </Helmet>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/gadgets')}
          className="flex items-center gap-2 text-gray-600 hover:text-accent mb-4 sm:mb-6 lg:mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gadgets
        </motion.button>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-12 mb-8 lg:mb-12">
          {/* Product Image - Mobile: full width, Desktop: 1/3 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-1"
          >
            <div className="w-full max-w-sm mx-auto lg:max-w-none h-64 sm:h-80 lg:h-96 xl:h-[28rem] bg-white rounded-xl lg:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <img
                src={gadget.image_url || '/images/gadget-fallback.jpg'}
                alt={gadget.name}
                className="w-full h-full object-contain p-3 lg:p-4"
              />
            </div>
          </motion.div>

          {/* Product Info - Mobile: full width, Desktop: 2/3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8"
          >
            {/* Badges */}
            <div className="flex gap-2 sm:gap-3">
              <Badge 
                className={`text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 ${
                  gadget.condition === 'brand_new' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-500 text-white'
                }`}
              >
                {gadget.condition === 'brand_new' ? 'Brand New' : 'Used'}
              </Badge>
              {!gadget.in_stock && (
                <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Title and Category */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                {gadget.name}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-accent font-medium">{gadget.category}</p>
              {gadget.brand && (
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Brand: {gadget.brand}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-accent">
                  {formatPrice(gadget.price)}
                </span>
                {gadget.original_price && (
                  <span className="text-lg sm:text-xl lg:text-2xl text-gray-500 line-through">
                    {formatPrice(gadget.original_price)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">Description</h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg xl:text-xl">{gadget.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 sm:gap-4 pt-4 sm:pt-6">
              <Button
                onClick={handleOrder}
                disabled={!gadget.in_stock}
                className="flex-1 bg-accent hover:bg-accent/90 text-white py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg font-semibold rounded-lg sm:rounded-xl"
                size="lg"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                {gadget.in_stock ? 'Order Now' : 'Out of Stock'}
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                size="lg"
                className="px-4 sm:px-6 py-3 sm:py-4 lg:py-5 rounded-lg sm:rounded-xl"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedGadgets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 sm:space-y-6 lg:space-y-8"
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4 lg:gap-6">
              {relatedGadgets.map((relatedGadget, index) => (
                <motion.div
                  key={relatedGadget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="h-full"
                >
                  <GadgetCard gadget={relatedGadget} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GadgetDetail;
