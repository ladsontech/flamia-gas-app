import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Flame, ArrowRight, Check, Zap, Shield, Clock, Truck, AlertTriangle, Info, Search, Star, Award, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helmet } from "react-helmet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { refillBrands } from "@/components/home/BrandsData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const staticBrands = ["Total", "Taifa", "Stabex", "Shell", "Hass", "Meru", "Ven Gas", "Ola Energy", "Oryx", "Ultimate", "K Gas", "C Gas", "Hashi", "Safe", "Nova", "Mogas"];

const Refill = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter brands based on search term
  const filteredBrands = staticBrands.filter(brand =>
    brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrices = selectedBrand ? refillBrands.filter(brand => brand.brand === selectedBrand).map(brand => {
    const prices = [];
    if (brand.refill_price_3kg) {
      prices.push({
        id: `${brand.id}-3kg`,
        weight: "3KG",
        price: parseInt(brand.refill_price_3kg.replace(/[^0-9]/g, '')),
        description: "Perfect for small households and students",
        features: ["1-2 people", "2-3 weeks usage", "Compact size", "Easy to handle"],
        popular: false,
        savings: "Best for singles"
      });
    }
    if (brand.refill_price_6kg) {
      prices.push({
        id: `${brand.id}-6kg`,
        weight: "6KG",
        price: parseInt(brand.refill_price_6kg.replace(/[^0-9]/g, '')),
        description: "Most popular choice for families",
        features: ["3-5 people", "4-6 weeks usage", "Best value", "Standard size"],
        popular: true,
        savings: "Save 15% vs 3KG"
      });
    }
    if (brand.refill_price_12kg) {
      prices.push({
        id: `${brand.id}-12kg`,
        weight: "12KG",
        price: parseInt(brand.refill_price_12kg.replace(/[^0-9]/g, '')),
        description: "Ideal for large families and restaurants",
        features: ["6+ people", "8-12 weeks usage", "Maximum savings", "Commercial grade"],
        popular: false,
        savings: "Save 25% vs 6KG"
      });
    }
    return prices;
  }).flat() : [];

  // SEO metadata hidden in Helmet
  const pageTitle = "Gas Refill Prices Uganda Today | Best LPG Refill Service Kampala";
  const pageDescription = "Compare today's gas refill prices in Uganda. Best rates for Total, Shell, Oryx, Stabex gas cylinders with free same-day delivery in Kampala, Wakiso, Mukono.";

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
    { icon: Zap, title: "Lightning Fast", desc: "Same-day delivery", color: "text-yellow-600" },
    { icon: Shield, title: "Quality Guaranteed", desc: "Best prices guaranteed", color: "text-green-600" },
    { icon: Truck, title: "Free Delivery", desc: "No delivery charges", color: "text-blue-600" }
  ];

  const safetyTips = [
    {
      title: "Check for Leaks",
      description: "Use soapy water to check connections. Never use a flame to check for leaks.",
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: "Proper Storage",
      description: "Store cylinders upright in well-ventilated areas away from heat sources.",
      icon: Shield,
      color: "text-green-600"
    },
    {
      title: "Regular Maintenance",
      description: "Check regulators and hoses regularly. Replace if damaged or worn.",
      icon: Info,
      color: "text-blue-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      location: "Kampala",
      rating: 5,
      comment: "Best gas refill service in Uganda. Always on time and great prices!"
    },
    {
      name: "John K.",
      location: "Wakiso",
      rating: 5,
      comment: "Free delivery and quality service. Highly recommend Flamia!"
    },
    {
      name: "Grace A.",
      location: "Mukono",
      rating: 5,
      comment: "Professional service and competitive prices. My go-to for gas refills."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="gas refill prices Uganda today, cheap gas refill Kampala, best gas delivery service Uganda, Total gas refill price, Shell gas cylinder refill, Stabex gas refill cost, Hass gas refill Wakiso, affordable gas refill Kampala, LPG refill near me, cooking gas prices Uganda, gas delivery service near me, same day gas delivery, free gas delivery Kampala, gas refill Mukono, gas delivery Entebbe, best gas app Uganda, fastest gas delivery, reliable gas supplier Uganda, gas cylinder refill service, LPG gas prices today, cooking gas delivery, gas refills near me, gas delivery Wakiso, gas refill service Mukono" />
        
        {/* Enhanced Open Graph for better social sharing */}
        <meta property="og:title" content="Gas Refill Uganda - Best Prices | Flamia" />
        <meta property="og:description" content="Best gas refill prices in Uganda. Free same-day delivery in Kampala." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://flamia.store/refill" />
        <meta property="og:image" content="https://flamia.store/images/total 6KG.png" />
        <meta property="og:site_name" content="Flamia Gas Delivery" />
        <meta property="og:locale" content="en_UG" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Gas Refill Uganda - Best Prices | Flamia" />
        <meta name="twitter:description" content="Best gas refill service in Uganda. Free same-day delivery." />
        <meta name="twitter:image" content="https://flamia.store/images/total 6KG.png" />
        
        {/* Local Business Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Flamia Gas Refill Service",
            "description": "Best gas refill service in Uganda with free same-day delivery in Kampala, Wakiso, Mukono.",
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
        {/* Desktop Layout */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main Content - Desktop: 8 columns, Mobile: full width */}
          <div className="lg:col-span-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left mb-8 lg:mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
                <Flame className="w-4 h-4" />
                Best Gas Refill Service
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Gas Refill Prices
                <span className="block text-accent">Uganda Today</span>
              </h1>
              
              <p className="text-lg text-gray-600 max-w-3xl lg:max-w-none mb-6">
                Get your gas cylinder refilled at the best prices in Uganda. 
                Free same-day delivery across Kampala, Wakiso, and Mukono.
              </p>

              {/* Feature Highlights - Desktop: horizontal, Mobile: grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:flex lg:gap-6 gap-4 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                    className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className={`w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center`}>
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                      <p className="text-xs text-gray-600">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Enhanced Brand Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8 lg:mb-12"
            >
              <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <div className="lg:flex lg:items-center lg:gap-6">
                  <div className="lg:flex-1">
                    <Label htmlFor="brand-select" className="text-lg font-semibold mb-2 block text-gray-900">
                      Choose Your Gas Brand
                    </Label>
                    <p className="text-sm text-gray-600 mb-4 lg:mb-0">
                      We offer refills for all major gas brands in Uganda
                    </p>
                  </div>
                  
                  <div className="lg:flex-1 lg:max-w-md space-y-4">
                    {/* Search Input - Desktop only */}
                    <div className="hidden lg:block relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search gas brands..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 border-2 border-gray-200 focus:border-accent"
                      />
                    </div>
                    
                    {/* Enhanced Select Dropdown */}
                    <Select 
                      value={selectedBrand} 
                      onValueChange={setSelectedBrand}
                    >
                      <SelectTrigger 
                        id="brand-select" 
                        className="w-full h-12 text-base border-2 border-gray-200 focus:border-accent transition-colors bg-white"
                      >
                        <SelectValue placeholder="Select your preferred gas brand" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-100 shadow-2xl max-h-[400px] w-full">
                        <div className="p-2 lg:hidden">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              placeholder="Search brands..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 h-8 text-sm"
                            />
                          </div>
                        </div>
                        {filteredBrands.map(brand => (
                          <SelectItem 
                            key={brand} 
                            value={brand} 
                            className="hover:bg-accent/10 py-3 text-base cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                                <Flame className="w-4 h-4 text-accent" />
                              </div>
                              <div>
                                <div className="font-medium">{brand} Gas</div>
                                <div className="text-xs text-gray-500">Available for refill</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                        {filteredBrands.length === 0 && (
                          <div className="p-4 text-center text-gray-500">
                            No brands found matching "{searchTerm}"
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 animate-spin text-accent border-4 border-accent border-t-transparent rounded-full mb-4"></div>
                  <p className="text-lg text-gray-600">Loading gas refill prices...</p>
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
                    {/* Brand Header */}
                    <div className="text-center lg:text-left mb-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        <span className="text-accent">{selectedBrand}</span> Gas Refill Options
                      </h2>
                      <p className="text-gray-600 mb-4">
                        Choose the right size for your needs
                      </p>
                    </div>

                    {/* Refill Options Grid */}
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6"
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
                                  Most Popular
                                </div>
                              </div>
                            )}
                            
                            <Card className={`relative overflow-hidden h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                              item.popular 
                                ? 'border-2 border-accent shadow-xl bg-gradient-to-br from-accent/5 to-white' 
                                : 'border border-gray-200 shadow-lg bg-white hover:border-accent/30'
                            }`}>
                              <div className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                      item.popular ? 'bg-accent/20' : 'bg-gray-100'
                                    }`}>
                                      <Flame className={`w-6 h-6 ${item.popular ? 'text-accent' : 'text-gray-600'}`} />
                                    </div>
                                    <div>
                                      <h3 className="text-xl font-bold text-gray-900">
                                        {selectedBrand} {item.weight}
                                      </h3>
                                      <p className="text-sm text-gray-600">{item.description}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-accent">
                                      UGX {item.price.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-green-600 font-medium">
                                      {item.savings}
                                    </div>
                                  </div>
                                </div>

                                {/* Features */}
                                <div className="grid grid-cols-2 gap-2 mb-6">
                                  {item.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <Check className="w-3 h-3 text-accent flex-shrink-0" />
                                      <span className="text-xs text-gray-700">{feature}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Order Button */}
                                <Button
                                  onClick={() => handleOrder(item.weight, item.price)}
                                  className={`w-full h-11 text-base font-semibold transition-all duration-300 group ${
                                    item.popular
                                      ? 'bg-accent hover:bg-accent/90 text-white shadow-lg hover:shadow-xl'
                                      : 'bg-gray-900 hover:bg-accent text-white'
                                  }`}
                                >
                                  Order {selectedBrand} {item.weight} Refill
                                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 text-sm text-accent">
                          <Clock className="w-4 h-4" />
                          <span>Same-day delivery available across Kampala</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                          <Truck className="w-4 h-4" />
                          <span>Free delivery in Kampala, Wakiso & Mukono</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Sidebar - Desktop only */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-20 space-y-6">
              {/* Gas Safety Tips */}
              <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-semibold text-gray-900">Gas Safety Tips</h3>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  {safetyTips.map((tip, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-gray-200">
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center gap-3">
                          <tip.icon className={`w-4 h-4 ${tip.color}`} />
                          <span className="font-medium text-sm">{tip.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-gray-600 pl-7">
                        {tip.description}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                  <p className="text-xs text-gray-600">
                    Need safety advice? Contact our gas experts at{" "}
                    <a href="https://wa.me/256789572007" className="text-accent font-medium">
                      +256 789 572 007
                    </a>
                  </p>
                </div>
              </Card>

              {/* Customer Testimonials */}
              <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                </div>
                
                <div className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-gray-900">{testimonial.name}</span>
                        <span className="text-xs text-gray-500">{testimonial.location}</span>
                      </div>
                      <p className="text-xs text-gray-600">{testimonial.comment}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick Contact */}
              <Card className="p-6 bg-gradient-to-r from-accent/10 to-blue-50 border-0">
                <div className="text-center">
                  <Award className="w-8 h-8 text-accent mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Need Expert Advice?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get personalized gas refill recommendations from our experts
                  </p>
                  <Button
                    onClick={() => window.open("https://wa.me/256789572007", "_blank")}
                    className="w-full bg-accent hover:bg-accent/90 text-white font-semibold"
                  >
                    Chat with Gas Expert
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile Safety Section */}
        <div className="lg:hidden mt-12">
          <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-gray-900">Gas Safety Tips</h3>
            </div>
            
            <div className="grid gap-4">
              {safetyTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <tip.icon className={`w-5 h-5 ${tip.color} mt-0.5`} />
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-1">{tip.title}</h4>
                    <p className="text-xs text-gray-600">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16"
        >
          <Card className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-accent/10 to-blue-50 border-0">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Need Help? Contact Our Gas Experts
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Our gas experts are here to help you get the best gas refill prices in Uganda.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => window.open("https://wa.me/256789572007", "_blank")}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base font-semibold"
                >
                  WhatsApp: +256 789 572 007
                </Button>
                <div className="text-sm text-gray-600">
                  <p>Available 7:30 AM - 10:00 PM Daily</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Refill;