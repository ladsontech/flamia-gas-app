import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Flame, ArrowRight, Check, Star, Crown, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet";
import { refillBrands } from "@/components/home/BrandsData";
import { BackButton } from "@/components/BackButton";
import { useCart } from "@/contexts/CartContext";

const staticBrands = ["Total", "Taifa", "Stabex", "Shell", "Hass", "Meru", "Ven Gas", "Ola Energy", "Oryx", "Ultimate", "K Gas", "C Gas", "Hashi", "Safe", "Nova", "Mogas", "Star"];

const Refill = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const refillOptionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to refill options when a brand is selected
  useEffect(() => {
    if (selectedBrand && refillOptionsRef.current) {
      const timer = setTimeout(() => {
        refillOptionsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300); // Small delay to allow animation to start
      return () => clearTimeout(timer);
    }
  }, [selectedBrand]);

  const handleAddToCart = (weight: string, price: number) => {
    if (!selectedBrand) {
      toast({
        title: "Please select a brand",
        description: "You need to select a gas brand before proceeding",
        variant: "destructive"
      });
      return;
    }

    const description = weight === "3KG" ? "Perfect for small households" :
                       weight === "6KG" ? "Most popular choice for families" :
                       "Ideal for large families";

    addToCart({
      type: 'refill',
      brand: selectedBrand,
      size: weight,
      name: `${selectedBrand} ${weight} Refill`,
      quantity: 1,
      price: price,
      description: description,
      image: `/images/${selectedBrand.toLowerCase()}.png`
    });
    
    toast({
      title: "Added to Cart!",
      description: `${selectedBrand} ${weight} refill has been added to your cart.`,
    });
  };

  // Get prices for the selected brand with original prices for strike-through
  const filteredPrices = selectedBrand ? refillBrands.filter(brand => brand.brand === selectedBrand).map(brand => {
    const prices = [];
    if (brand.refill_price_3kg) {
      prices.push({
        id: `${brand.id}-3kg`,
        weight: "3KG",
        price: parseInt(brand.refill_price_3kg.replace(/[^0-9]/g, '')),
        originalPrice: 32000, // Original price for 3kg - updated to 32,000
        description: "Perfect for small households",
        popular: false,
        savings: "Best for singles"
      });
    }
    if (brand.refill_price_6kg) {
      prices.push({
        id: `${brand.id}-6kg`,
        weight: "6KG",
        price: parseInt(brand.refill_price_6kg.replace(/[^0-9]/g, '')),
        originalPrice: 55000, // Original price for 6kg
        description: "Most popular choice for families",
        popular: true,
        savings: "Save 15% vs 3KG"
      });
    }
    if (brand.refill_price_12kg) {
      prices.push({
        id: `${brand.id}-12kg`,
        weight: "12KG",
        price: parseInt(brand.refill_price_12kg.replace(/[^0-9]/g, '')),
        originalPrice: 115000, // Original price for 12kg
        description: "Ideal for large families",
        popular: false,
        savings: "Save 25% vs 6KG"
      });
    }
    return prices;
  }).flat() : [];

  // Popular brands for priority display
  const popularBrands = ["Total", "Shell", "Stabex", "Hass", "Oryx"];
  const otherBrands = staticBrands.filter(brand => !popularBrands.includes(brand));

  // Handle brand selection
  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 pt-16">
      <Helmet>
        <title>Gas Refill Prices Uganda Today | Best LPG Refill Service Kampala</title>
        <meta name="description" content="Compare today's gas refill prices in Uganda. Best rates for Total, Shell, Oryx, Stabex gas cylinders with free same-day delivery in Kampala, Wakiso, Mukono." />
        <meta name="keywords" content="gas refill prices Uganda today, cheap gas refill Kampala, best gas delivery service Uganda, Total gas refill price, Shell gas cylinder refill, Stabex gas refill cost, Hass gas refill Wakiso, affordable gas refill Kampala, LPG refill near me" />
        <link rel="canonical" href="https://flamia.store/refill" />
      </Helmet>
      
      <div className="container px-4 md:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <BackButton />

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            <Flame className="w-4 h-4" />
            Gas Refill Service
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Select Your Gas Brand
          </h1>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose your preferred gas brand to see the best refill prices in Uganda
          </p>
        </motion.div>

        {/* Brand Selection - Desktop Style for All Devices */}
        <div className="mb-8 md:mb-12">
          <Card className="p-4 md:p-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            {/* Popular Brands Section */}
            <div className="mb-6 md:mb-10">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Crown className="w-3 md:w-5 h-3 md:h-5 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Popular Brands</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-6">
                {popularBrands.map((brand, index) => (
                  <motion.div
                    key={brand}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative p-3 md:p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedBrand === brand
                        ? 'border-accent bg-gradient-to-br from-accent/10 to-accent/5 shadow-xl shadow-accent/20'
                        : 'border-gray-200 bg-white hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10'
                    }`}
                    onClick={() => handleBrandSelect(brand)}
                  >
                    {/* Popular Badge */}
                    <div className="absolute -top-1 md:-top-2 -right-1 md:-right-2 w-4 md:w-6 h-4 md:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Star className="w-2 md:w-3 h-2 md:h-3 text-white fill-current" />
                    </div>
                    
                    <div className="text-center">
                      <div className={`w-10 md:w-16 h-10 md:h-16 mx-auto mb-2 md:mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        selectedBrand === brand 
                          ? 'bg-accent/20 shadow-lg' 
                          : 'bg-gray-100 group-hover:bg-accent/10'
                      }`}>
                        <Flame className={`w-5 md:w-8 h-5 md:h-8 transition-colors duration-300 ${
                          selectedBrand === brand ? 'text-accent' : 'text-gray-600'
                        }`} />
                      </div>
                      <h3 className="font-bold text-sm md:text-lg text-gray-900 mb-1">{brand}</h3>
                      <p className="text-xs md:text-sm text-gray-500">Premium Gas</p>
                      {selectedBrand === brand && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-2 md:mt-3 w-1.5 md:w-2 h-1.5 md:h-2 bg-accent rounded-full mx-auto"
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* All Other Brands Section */}
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-3 md:w-5 h-3 md:h-5 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">All Brands</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-4">
                {otherBrands.map((brand, index) => (
                  <motion.div
                    key={brand}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index + 5) * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`p-2 md:p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      selectedBrand === brand
                        ? 'border-accent bg-accent/10 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-accent/50 hover:shadow-md'
                    }`}
                    onClick={() => handleBrandSelect(brand)}
                  >
                    <div className="text-center">
                      <div className={`w-8 md:w-12 h-8 md:h-12 mx-auto mb-2 md:mb-3 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        selectedBrand === brand 
                          ? 'bg-accent/20' 
                          : 'bg-gray-100 hover:bg-accent/10'
                      }`}>
                        <Flame className={`w-4 md:w-6 h-4 md:h-6 transition-colors duration-300 ${
                          selectedBrand === brand ? 'text-accent' : 'text-gray-600'
                        }`} />
                      </div>
                      <h4 className="font-semibold text-xs md:text-sm text-gray-900">{brand}</h4>
                      <p className="text-xs text-gray-500">Gas</p>
                      {selectedBrand === brand && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-1 md:mt-2 w-1 md:w-1.5 h-1 md:h-1.5 bg-accent rounded-full mx-auto"
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Refill Options - Only show after brand selection */}
        {!isLoading && (
          <div ref={refillOptionsRef}>
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
                  <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      <span className="text-accent">{selectedBrand}</span> Gas Refill Options
                    </h2>
                    <p className="text-gray-600">
                      Choose the right size for your needs
                    </p>
                  </div>

                  {/* Refill Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
                    {filteredPrices.length > 0 ? (
                      filteredPrices.map((item, index) => (
                        <motion.div 
                          key={item.id} 
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="relative"
                        >
                          {item.popular && (
                            <div className="absolute -top-2 md:-top-3 left-1/2 transform -translate-x-1/2 z-10">
                              <div className="bg-accent text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold flex items-center gap-1">
                                <Star className="w-2 md:w-3 h-2 md:h-3 fill-current" />
                                Most Popular
                              </div>
                            </div>
                          )}
                          
                          <Card className={`relative overflow-hidden h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                            item.popular 
                              ? 'border-2 border-accent shadow-xl bg-gradient-to-br from-accent/5 to-white' 
                              : 'border border-gray-200 shadow-lg bg-white hover:border-accent/30'
                          }`}>
                            <div className="p-4 md:p-6">
                              {/* Header */}
                              <div className="flex items-start justify-between mb-3 md:mb-4">
                                <div className="flex items-center gap-2 md:gap-3">
                                  <div className={`w-8 md:w-12 h-8 md:h-12 rounded-xl flex items-center justify-center ${
                                    item.popular ? 'bg-accent/20' : 'bg-gray-100'
                                  }`}>
                                    <Flame className={`w-4 md:w-6 h-4 md:h-6 ${item.popular ? 'text-accent' : 'text-gray-600'}`} />
                                  </div>
                                  <div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900">
                                      {selectedBrand} {item.weight}
                                    </h3>
                                    <p className="text-xs md:text-sm text-gray-600">{item.description}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Clean Price Display */}
                              <div className="text-center mb-4 md:mb-6">
                                <div className="text-2xl md:text-3xl font-bold text-accent">
                                  UGX {item.price.toLocaleString()}
                                </div>
                              </div>

                              {/* Features */}
                              <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
                                <Check className="w-3 md:w-4 h-3 md:h-4 text-accent" />
                                <span className="text-xs md:text-sm text-gray-700">Free delivery included</span>
                              </div>

                              {/* Order Button */}
                              <Button
                                onClick={() => handleAddToCart(item.weight, item.price)}
                                className={`w-full h-10 md:h-11 text-sm md:text-base font-semibold transition-all duration-300 group ${
                                  item.popular
                                    ? 'bg-accent hover:bg-accent/90 text-white shadow-lg hover:shadow-xl'
                                    : 'bg-gray-900 hover:bg-accent text-white'
                                }`}
                              >
                                Add to Cart
                                <ArrowRight className="ml-2 h-3 md:h-4 w-3 md:w-4 transition-transform group-hover:translate-x-1" />
                              </Button>
                            </div>
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12 md:py-16">
                        <div className="max-w-md mx-auto">
                          <div className="w-12 md:w-16 h-12 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Flame className="w-6 md:w-8 h-6 md:h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                            {selectedBrand} Gas Refill Coming Soon
                          </h3>
                          <p className="text-sm md:text-base text-gray-600">
                            {selectedBrand} gas refill prices are currently being updated. Please try another brand or contact us directly.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="no-brand"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-12 md:py-16"
                >
                  <Card className="max-w-lg mx-auto p-6 md:p-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                    <div className="w-16 md:w-20 h-16 md:h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                      <Flame className="w-8 md:w-10 h-8 md:h-10 text-accent" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                      Select Your Gas Brand Above
                    </h3>
                    <p className="text-sm md:text-base text-gray-600">
                      Choose your preferred gas brand to view the best refill prices in Uganda.
                    </p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12 md:mt-16"
        >
          <Card className="max-w-4xl mx-auto p-6 md:p-8 bg-gradient-to-r from-accent/10 to-blue-50 border-0">
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                Need Help? Contact Our Gas Experts
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 max-w-2xl mx-auto">
                Our gas experts are here to help you get the best gas refill prices in Uganda.
              </p>
            <Button
              onClick={() => navigate("/order")}
              className="bg-accent hover:bg-accent/90 text-white px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold"
            >
              Place Order
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Refill;
