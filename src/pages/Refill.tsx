import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Flame, ArrowRight, Check, Zap, Shield, Clock, Star, Truck, MapPin, Phone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helmet } from "react-helmet";
import { Label } from "@/components/ui/label";
import { refillBrands } from "@/components/home/BrandsData";

const staticBrands = ["Total", "Taifa", "Stabex", "Shell", "Hass", "Meru", "Ven Gas", "Ola Energy", "Oryx", "Ultimate", "K Gas", "C Gas", "Hashi", "Safe", "Nova", "Mogas"];

const Refill = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleOrder = (weight: string, price: number) => {
    if (!selectedBrand) {
      toast({
        title: "Please select a brand",
        description: "You need to select a gas brand before proceeding",
        variant: "destructive"
      });
      return;
    }
    navigate(`/order?type=refill&size=${weight}&price=${price}&brand=${selectedBrand}`);
  };

  const filteredPrices = selectedBrand ? refillBrands.filter(brand => brand.brand === selectedBrand).map(brand => {
    const prices = [];
    if (brand.refill_price_3kg) {
      prices.push({
        id: `${brand.id}-3kg`,
        weight: "3KG",
        price: parseInt(brand.refill_price_3kg.replace(/[^0-9]/g, '')),
        description: "Perfect for small households and students",
        features: ["1-2 people", "2-3 weeks usage", "Compact size", "Cheaper than Fumbaa gas"],
        popular: false
      });
    }
    if (brand.refill_price_6kg) {
      prices.push({
        id: `${brand.id}-6kg`,
        weight: "6KG",
        price: parseInt(brand.refill_price_6kg.replace(/[^0-9]/g, '')),
        description: "Most popular choice for families - Better than Jumia gas prices",
        features: ["3-5 people", "4-6 weeks usage", "Best value vs Kweli shop", "Faster than Fumbaa delivery"],
        popular: true
      });
    }
    if (brand.refill_price_12kg) {
      prices.push({
        id: `${brand.id}-12kg`,
        weight: "12KG",
        price: parseInt(brand.refill_price_12kg.replace(/[^0-9]/g, '')),
        description: "Ideal for large families and restaurants",
        features: ["6+ people", "8-12 weeks usage", "Maximum savings vs Jiji prices", "Commercial grade quality"],
        popular: false
      });
    }
    return prices;
  }).flat() : [];

  // Enhanced SEO with competitor keywords
  const pageTitle = "Gas Refill Prices Uganda Today | Cheaper than Fumbaa, Jumia & Kweli Shop | Best LPG Refill Service Kampala";
  const pageDescription = "Compare today's gas refill prices in Uganda. Cheaper than Fumbaa gas, Jumia gas delivery, Kweli shop & Jiji. Best rates for Total, Shell, Oryx, Stabex gas cylinders with free same-day delivery in Kampala, Wakiso, Mukono. Alternative to Fumbaa gas delivery service.";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const features = [
    { icon: Zap, title: "Faster than Fumbaa", desc: "Same-day delivery vs 2-3 days" },
    { icon: Shield, title: "Cheaper than Jumia", desc: "Best prices guaranteed" },
    { icon: Truck, title: "Better than Kweli Shop", desc: "Free delivery + quality service" }
  ];

  const competitorComparisons = [
    {
      competitor: "Fumbaa Gas",
      advantages: ["Faster delivery (same-day vs 2-3 days)", "Better customer service", "More reliable", "Cheaper prices"]
    },
    {
      competitor: "Jumia Gas Delivery",
      advantages: ["Lower prices", "Free delivery", "Better quality control", "Faster response time"]
    },
    {
      competitor: "Kweli Shop Gas",
      advantages: ["More brands available", "Better pricing", "Faster delivery", "Superior service"]
    },
    {
      competitor: "Jiji Gas Sellers",
      advantages: ["Verified suppliers only", "Fixed pricing", "Quality guarantee", "Professional service"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="gas refill prices Uganda today, Fumbaa gas alternative, Jumia gas delivery alternative, Kweli shop gas prices, Jiji gas sellers, cheap gas refill Kampala, best gas delivery service Uganda, Total gas refill price, Shell gas cylinder refill, Stabex gas refill cost, Hass gas refill Wakiso, affordable gas refill Kampala, LPG refill near me, cooking gas prices Uganda, gas delivery service near me, same day gas delivery, free gas delivery Kampala, gas refill Mukono, gas delivery Entebbe, best gas app Uganda, fastest gas delivery, reliable gas supplier Uganda, gas cylinder refill service, LPG gas prices today, cooking gas delivery, gas refills near me, gas delivery Wakiso, gas refill service Mukono" />
        
        {/* Enhanced Open Graph for better social sharing */}
        <meta property="og:title" content="Gas Refill Uganda - Cheaper than Fumbaa, Jumia & Kweli Shop | Flamia" />
        <meta property="og:description" content="Best gas refill prices in Uganda. Faster than Fumbaa, cheaper than Jumia, better than Kweli shop. Free same-day delivery in Kampala." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://flamia.store/refill" />
        <meta property="og:image" content="https://flamia.store/images/total 6KG.png" />
        <meta property="og:site_name" content="Flamia Gas Delivery" />
        <meta property="og:locale" content="en_UG" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Gas Refill Uganda - Better than Fumbaa & Jumia | Flamia" />
        <meta name="twitter:description" content="Best gas refill service in Uganda. Cheaper than Fumbaa gas, faster than Jumia delivery. Free same-day delivery." />
        <meta name="twitter:image" content="https://flamia.store/images/total 6KG.png" />
        
        {/* Local Business Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Flamia Gas Refill Service - Alternative to Fumbaa & Jumia",
            "description": "Best gas refill service in Uganda. Cheaper than Fumbaa gas, faster than Jumia delivery, better than Kweli shop prices.",
            "url": "https://flamia.store/refill",
            "telephone": "+256789572007",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "UG",
              "addressRegion": "Kampala"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "0.347596",
              "longitude": "32.582520"
            },
            "areaServed": ["Kampala", "Wakiso", "Mukono", "Entebbe"],
            "serviceType": "Gas Cylinder Refill Service",
            "priceRange": "UGX 28,000 - UGX 95,000",
            "openingHours": "Mo-Su 07:30-22:00"
          })}
        </script>
        
        <link rel="canonical" href="https://flamia.store/refill" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="geo.region" content="UG" />
        <meta name="geo.placename" content="Kampala" />
      </Helmet>
      
      <div className="container px-4 md:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        {/* Enhanced Hero Section with Competitor Keywords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 lg:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            <Flame className="w-4 h-4" />
            #1 Alternative to Fumbaa Gas
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Best Gas Refill Service in Uganda
            <span className="block text-accent">Cheaper than Fumbaa, Jumia & Kweli Shop</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Get your gas cylinder refilled at the best prices in Uganda. Faster delivery than Fumbaa gas, 
            cheaper than Jumia gas delivery, and better service than Kweli shop. Free same-day delivery across Kampala, Wakiso, and Mukono.
          </p>

          {/* Competitor Comparison Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-accent" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-600">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Why Choose Us Over Competitors */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Why Choose Flamia Over Other Gas Delivery Services?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {competitorComparisons.map((comp, index) => (
                <div key={index} className="text-left">
                  <h3 className="font-semibold text-accent mb-2">vs {comp.competitor}</h3>
                  <ul className="space-y-1">
                    {comp.advantages.map((advantage, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{advantage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Brand Selection with SEO Keywords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-md mx-auto mb-8 lg:mb-12"
        >
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <Label htmlFor="brand-select" className="text-base font-semibold mb-4 block text-center text-gray-900">
              Choose Your Gas Brand - All Major Brands Available
            </Label>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Total, Shell, Stabex, Hass, Oryx gas refills - Better prices than Fumbaa, Jumia & Kweli shop
            </p>
            <Select 
              value={selectedBrand} 
              onValueChange={setSelectedBrand}
            >
              <SelectTrigger 
                id="brand-select" 
                className="w-full h-12 text-base border-2 border-gray-200 focus:border-accent transition-colors"
              >
                <SelectValue placeholder="Select your preferred gas brand (Total, Shell, Stabex, etc.)" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-100 shadow-xl max-h-[300px]">
                {staticBrands.map(brand => (
                  <SelectItem 
                    key={brand} 
                    value={brand} 
                    className="hover:bg-accent/10 py-3 text-base"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                        <Flame className="w-4 h-4 text-accent" />
                      </div>
                      {brand} Gas Refill - Best Prices in Uganda
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 animate-spin text-accent border-4 border-accent border-t-transparent rounded-full mb-4"></div>
              <p className="text-lg text-gray-600">Loading best gas refill prices in Uganda...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {selectedBrand ? (
              <motion.div
                key="selected-brand"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                {/* Enhanced Brand Header with SEO */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    <span className="text-accent">{selectedBrand}</span> Gas Refill Prices Uganda Today
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Best {selectedBrand} gas refill prices in Uganda - Cheaper than Fumbaa gas, Jumia delivery & Kweli shop
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-600">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">✓ Cheaper than Fumbaa</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">✓ Faster than Jumia</span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">✓ Better than Kweli Shop</span>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">✓ More reliable than Jiji</span>
                  </div>
                </div>

                {/* Enhanced Refill Options Grid with SEO */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredPrices.length > 0 ? (
                    filteredPrices.map((item, index) => (
                      <motion.div 
                        key={item.id} 
                        variants={itemVariants}
                        className="relative"
                      >
                        {item.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                            <div className="bg-accent text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              Most Popular vs Fumbaa
                            </div>
                          </div>
                        )}
                        
                        <Card className={`relative overflow-hidden h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                          item.popular 
                            ? 'border-2 border-accent shadow-xl bg-gradient-to-br from-accent/5 to-white' 
                            : 'border border-gray-200 shadow-lg bg-white hover:border-accent/30'
                        }`}>
                          <div className="p-6 lg:p-8">
                            {/* Icon */}
                            <div className="flex items-center justify-center mb-6">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                                item.popular ? 'bg-accent/20' : 'bg-gray-100'
                              }`}>
                                <Flame className={`w-8 h-8 ${item.popular ? 'text-accent' : 'text-gray-600'}`} />
                              </div>
                            </div>

                            {/* Enhanced Title & Description with SEO */}
                            <div className="text-center mb-6">
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {selectedBrand} {item.weight} Gas Refill
                              </h3>
                              <p className="text-gray-600 text-sm mb-2">
                                {item.description}
                              </p>
                              <p className="text-xs text-accent font-medium">
                                Best {item.weight} gas refill price in Uganda
                              </p>
                            </div>

                            {/* Enhanced Features with Competitor Comparisons */}
                            <div className="space-y-3 mb-6">
                              {item.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{feature}</span>
                                </div>
                              ))}
                            </div>

                            {/* Enhanced Price with Competitor Comparison */}
                            <div className="text-center mb-6">
                              <div className="text-3xl font-bold text-accent mb-1">
                                UGX {item.price.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500 mb-2">
                                Free delivery included - No hidden charges
                              </div>
                              <div className="text-xs text-green-600 font-medium">
                                Save UGX 5,000+ vs Fumbaa gas prices
                              </div>
                            </div>

                            {/* Enhanced Order Button */}
                            <Button
                              onClick={() => handleOrder(item.weight, item.price)}
                              className={`w-full h-12 text-base font-semibold transition-all duration-300 group ${
                                item.popular
                                  ? 'bg-accent hover:bg-accent/90 text-white shadow-lg hover:shadow-xl'
                                  : 'bg-gray-900 hover:bg-accent text-white'
                              }`}
                            >
                              Order {selectedBrand} {item.weight} Refill Now
                              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      variants={itemVariants} 
                      className="col-span-full text-center py-16"
                    >
                      <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Flame className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {selectedBrand} Gas Refill Coming Soon
                        </h3>
                        <p className="text-gray-600">
                          {selectedBrand} gas refill prices are currently being updated. Please try another brand or contact us directly.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="no-brand"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center py-16"
              >
                <Card className="max-w-lg mx-auto p-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Flame className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Select Your Gas Brand for Best Prices
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Choose your preferred gas brand from the dropdown above to view the best refill prices in Uganda. 
                    We guarantee cheaper prices than Fumbaa gas, Jumia delivery, and Kweli shop.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-accent mb-4">
                    <Clock className="w-4 h-4" />
                    <span>Same-day delivery available across Kampala</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                    <MapPin className="w-4 h-4" />
                    <span>Free delivery in Kampala, Wakiso & Mukono</span>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Enhanced Service Areas Section with Local SEO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 mb-8"
        >
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border-0">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Gas Refill Service Areas - Better Coverage than Fumbaa & Jumia
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                "Kampala Gas Refill",
                "Wakiso Gas Delivery", 
                "Mukono Gas Refill",
                "Entebbe Gas Service"
              ].map((area, index) => (
                <div key={index} className="p-3 bg-white rounded-lg shadow-sm">
                  <MapPin className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">{area}</p>
                  <p className="text-xs text-gray-600">Free same-day delivery</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Enhanced Bottom CTA Section with Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <Card className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-accent/10 to-blue-50 border-0">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Help? Contact Uganda's Best Gas Delivery Service
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our gas experts are here to help you get the best gas refill prices in Uganda. 
              We're faster than Fumbaa gas, cheaper than Jumia delivery, and more reliable than Kweli shop.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Button
                onClick={() => window.open("https://wa.me/256789572007", "_blank")}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base font-semibold flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                WhatsApp: +256 789 572 007
              </Button>
              <div className="text-sm text-gray-600">
                <p>Available 7:30 AM - 10:00 PM Daily</p>
                <p>Faster response than Fumbaa customer service</p>
              </div>
            </div>
            
            {/* Final SEO Keywords Section */}
            <div className="text-xs text-gray-500 max-w-3xl mx-auto leading-relaxed">
              <p className="mb-2">
                <strong>Popular searches:</strong> gas refill prices Uganda, Fumbaa gas alternative, Jumia gas delivery alternative, 
                Kweli shop gas prices, Jiji gas sellers, cheap gas refill Kampala, best gas delivery service Uganda, 
                Total gas refill, Shell gas refill, Stabex gas refill, Hass gas refill
              </p>
              <p>
                <strong>Service areas:</strong> Gas delivery Kampala, gas refill Wakiso, gas delivery Mukono, 
                gas refill Entebbe, cooking gas delivery Uganda, LPG refill service, same day gas delivery
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Refill;