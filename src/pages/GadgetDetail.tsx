
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
  ).slice(0, 6);

  const handleOrder = () => {
    if (!gadget) return;
    
    const productDetailUrl = `${window.location.origin}/gadget/${gadget.id}`;
    const message = `Hello, I'm interested in this product:

*${gadget.name}*

${gadget.description}

Price: ${formatPrice(gadget.price)}

Product Details: ${productDetailUrl}

Please let me know about availability and delivery options.`;

    const whatsappUrl = `https://wa.me/256789572007?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <span className="ml-2 text-gray-600">Loading product...</span>
      </div>
    );
  }

  if (!gadget) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/gadgets')} className="bg-accent hover:bg-accent/90">
            Back to Gadgets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Helmet>
        <title>{gadget.name} - Flamia Gadgets</title>
        <meta name="description" content={gadget.description} />
        <meta name="keywords" content={`${gadget.name}, ${gadget.category}, ${gadget.brand}, gadgets, electronics`} />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/gadgets')}
          className="flex items-center gap-2 text-gray-600 hover:text-accent mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gadgets
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center lg:justify-start"
          >
            <div className="w-80 h-80 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <img
                src={gadget.image_url || '/images/gadget-fallback.jpg'}
                alt={gadget.name}
                className="w-full h-full object-contain p-4"
              />
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Badges */}
            <div className="flex gap-3">
              <Badge 
                className={`text-sm px-4 py-2 ${
                  gadget.condition === 'brand_new' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-500 text-white'
                }`}
              >
                {gadget.condition === 'brand_new' ? 'Brand New' : 'Used'}
              </Badge>
              {!gadget.in_stock && (
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Title and Category */}
            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {gadget.name}
              </h1>
              <p className="text-lg text-accent font-medium">{gadget.category}</p>
              {gadget.brand && (
                <p className="text-gray-600 text-lg">Brand: {gadget.brand}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-accent">
                  {formatPrice(gadget.price)}
                </span>
                {gadget.original_price && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(gadget.original_price)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Description</h3>
              <p className="text-gray-700 leading-relaxed text-lg">{gadget.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                onClick={handleOrder}
                disabled={!gadget.in_stock}
                className="flex-1 bg-accent hover:bg-accent/90 text-white py-4 text-lg font-semibold rounded-xl"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                {gadget.in_stock ? 'Order Now' : 'Out of Stock'}
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                size="lg"
                className="px-6 py-4 rounded-xl"
              >
                <Share2 className="w-5 h-5" />
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
            className="space-y-8"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
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
