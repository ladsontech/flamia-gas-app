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
  const {
    toast
  } = useToast();
  const {
    addToCart
  } = useCart();
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
    const description = weight === "3KG" ? "Perfect for small households" : weight === "6KG" ? "Most popular choice for families" : "Ideal for large families";
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
      description: `${selectedBrand} ${weight} refill has been added to your cart.`
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
        originalPrice: 32000,
        // Original price for 3kg - updated to 32,000
        description: "Perfect for small households",
        popular: false,
        savings: "Best for singles",
        logo_url: brand.logo_url
      });
    }
    if (brand.refill_price_6kg) {
      prices.push({
        id: `${brand.id}-6kg`,
        weight: "6KG",
        price: parseInt(brand.refill_price_6kg.replace(/[^0-9]/g, '')),
        originalPrice: 55000,
        // Original price for 6kg
        description: "Most popular choice for families",
        popular: true,
        savings: "Save 15% vs 3KG",
        logo_url: brand.logo_url
      });
    }
    if (brand.refill_price_12kg) {
      prices.push({
        id: `${brand.id}-12kg`,
        weight: "12KG",
        price: parseInt(brand.refill_price_12kg.replace(/[^0-9]/g, '')),
        originalPrice: 115000,
        // Original price for 12kg
        description: "Ideal for large families",
        popular: false,
        savings: "Save 25% vs 6KG",
        logo_url: brand.logo_url
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
  return <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 pt-16">
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
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.4
      }} className="text-center mb-8">
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

        {/* Brand Selection - Unified Grid */}
        <div className="mb-8 md:mb-12">
          <Card className="p-4 md:p-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-r from-accent to-accent/80 rounded-lg flex items-center justify-center">
                <Flame className="w-3 md:w-5 h-3 md:h-5 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Choose Your Gas Brand</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
              {staticBrands.map((brand, index) => {
              const brandData = refillBrands.find(b => b.brand === brand);
              return <motion.div key={brand} initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: index * 0.05,
                duration: 0.3
              }} whileHover={{
                scale: 1.03,
                y: -2
              }} whileTap={{
                scale: 0.97
              }} className={`p-3 md:p-4 rounded-xl border cursor-pointer transition-all duration-300 ${selectedBrand === brand ? 'border-accent bg-accent/10 shadow-lg' : 'border-gray-200 bg-white hover:border-accent/50 hover:shadow-md'}`} onClick={() => handleBrandSelect(brand)}>
                    <div className="text-center">
                      <div className={`w-16 md:w-20 h-16 md:h-20 mx-auto mb-2 md:mb-3 rounded-xl flex items-center justify-center p-2 transition-all duration-300 ${selectedBrand === brand ? 'bg-white' : 'bg-white hover:bg-accent/5'}`}>
                        {brandData?.logo_url ? <img src={brandData.logo_url} alt={`${brand} logo`} className="w-full h-full object-contain" /> : <Flame className={`w-8 md:w-10 h-8 md:h-10 transition-colors duration-300 ${selectedBrand === brand ? 'text-accent' : 'text-gray-600'}`} />}
                      </div>
                      <h4 className="font-semibold text-xs md:text-sm text-gray-900">{brand}</h4>
                      <p className="text-xs text-gray-500">Gas</p>
                      {selectedBrand === brand && <motion.div initial={{
                    scale: 0
                  }} animate={{
                    scale: 1
                  }} className="mt-1 md:mt-2 w-1.5 md:w-2 h-1.5 md:h-2 bg-accent rounded-full mx-auto" />}
                    </div>
                  </motion.div>;
            })}
            </div>
          </Card>
        </div>

        {/* Refill Options - Only show after brand selection */}
        {!isLoading && selectedBrand && filteredPrices.length > 0 && (
          <div ref={refillOptionsRef}>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="p-4 md:p-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                  <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                    <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-r from-accent to-accent/80 rounded-lg flex items-center justify-center">
                      <Flame className="w-3 md:w-5 h-3 md:h-5 text-white" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Select Refill Size</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {filteredPrices.map((option, index) => (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <Card className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl ${
                          option.popular 
                            ? 'border-accent bg-gradient-to-br from-accent/5 to-accent/10' 
                            : 'border-gray-200 hover:border-accent/50'
                        }`}>
                          {option.popular && (
                            <div className="absolute top-0 right-0 bg-accent text-white px-3 py-1 text-xs font-bold flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              POPULAR
                            </div>
                          )}
                          
                          <div className="p-6">
                            {/* Brand Logo */}
                            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white p-2 shadow-md">
                              {option.logo_url ? (
                                <img src={option.logo_url} alt={`${selectedBrand} logo`} className="w-full h-full object-contain" />
                              ) : (
                                <Flame className="w-full h-full text-accent" />
                              )}
                            </div>

                            {/* Weight */}
                            <h3 className="text-2xl font-bold text-center mb-2">{option.weight}</h3>
                            
                            {/* Price */}
                            <div className="text-center mb-3">
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-3xl font-bold text-accent">
                                  {option.price.toLocaleString()} UGX
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 line-through">
                                {option.originalPrice.toLocaleString()} UGX
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 text-center mb-4">{option.description}</p>

                            {/* Savings Badge */}
                            <div className="flex items-center justify-center gap-1 text-xs text-accent font-medium mb-4">
                              <Zap className="w-3 h-3" />
                              {option.savings}
                            </div>

                            {/* Add to Cart Button */}
                            <Button
                              onClick={() => handleAddToCart(option.weight, option.price)}
                              className="w-full bg-accent hover:bg-accent/90 text-white"
                            >
                              Add to Cart
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Contact Section */}
        
      </div>
    </div>;
};
export default Refill;