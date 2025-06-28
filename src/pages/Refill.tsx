import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Flame, ArrowRight, Check, Search, Star, Crown, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helmet } from "react-helmet";
import { Input } from "@/components/ui/input";
import { refillBrands } from "@/components/home/BrandsData";

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
    }, 100);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <Helmet>
        <title>Gas Refill Prices Uganda Today | Best LPG Refill Service Kampala</title>
        <meta name="description" content="Compare today's gas refill prices in Uganda. Best rates for Total, Shell, Oryx, Stabex gas cylinders with free same-day delivery in Kampala, Wakiso, Mukono." />
        <meta name="keywords" content="gas refill prices Uganda today, cheap gas refill Kampala, best gas delivery service Uganda, Total gas refill price, Shell gas cylinder refill, Stabex gas refill cost, Hass gas refill Wakiso, affordable gas refill Kampala, LPG refill near me" />
        <link rel="canonical" href="https://flamia.store/refill" />
      </Helmet>
      
      <div className="container px-4 md:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
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

        {/* Mobile: Dropdown Selection */}
        <div className="lg:hidden mb-8">
          <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search gas brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-2 border-gray-200 focus:border-accent"
                />
              </div>
              
              {/* Enhanced Select Dropdown - Full Height */}
              <Select 
                value={selectedBrand} 
                onValueChange={setSelectedBrand}
              >
                <SelectTrigger className="w-full h-12 text-base border-2 border-gray-200 focus:border-accent transition-colors bg-white">
                  <SelectValue placeholder="Select your gas brand" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-white border-2 border-gray-100 shadow-2xl w-full"
                  style={{
                    maxHeight: 'calc(100vh - 200px)',
                    height: 'auto'
                  }}
                >
                  <div className="max-h-full overflow-y-auto">
                    {filteredBrands.map(brand => (
                      <SelectItem 
                        key={brand} 
                        value={brand} 
                        className="hover:bg-accent/10 py-4 text-base cursor-pointer border-b border-gray-50 last:border-b-0"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Flame className="w-5 h-5 text-accent" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{brand} Gas</div>
                            <div className="text-sm text-gray-500">Available for refill</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                    {filteredBrands.length === 0 && (
                      <div className="p-6 text-center text-gray-500">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="font-medium">No brands found</p>
                        <p className="text-sm">Try searching for "{searchTerm}"</p>
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>

        {/* Desktop: Brand Grid Display */}
        <div className="hidden lg:block mb-12">
          <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            {/* Popular Brands Section */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Popular Brands</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-5 gap-6">
                {popularBrands.map((brand, index) => (
                  <motion.div
                    key={brand}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedBrand === brand
                        ? 'border-accent bg-gradient-to-br from-accent/10 to-accent/5 shadow-xl shadow-accent/20'
                        : 'border-gray-200 bg-white hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10'
                    }`}
                    onClick={() => setSelectedBrand(brand)}
                  >
                    {/* Popular Badge */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-white fill-current" />
                    </div>
                    
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        selectedBrand === brand 
                          ? 'bg-accent/20 shadow-lg' 
                          : 'bg-gray-100 group-hover:bg-accent/10'
                      }`}>
                        <Flame className={`w-8 h-8 transition-colors duration-300 ${
                          selectedBrand === brand ? 'text-accent' : 'text-gray-600'
                        }`} />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{brand}</h3>
                      <p className="text-sm text-gray-500">Premium Gas</p>
                      {selectedBrand === brand && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-3 w-2 h-2 bg-accent rounded-full mx-auto"
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* All Other Brands Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">All Brands</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-6 gap-4">
                {otherBrands.map((brand, index) => (
                  <motion.div
                    key={brand}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index + 5) * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      selectedBrand === brand
                        ? 'border-accent bg-accent/10 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-accent/50 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedBrand(brand)}
                  >
                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        selectedBrand === brand 
                          ? 'bg-accent/20' 
                          : 'bg-gray-100 hover:bg-accent/10'
                      }`}>
                        <Flame className={`w-6 h-6 transition-colors duration-300 ${
                          selectedBrand === brand ? 'text-accent' : 'text-gray-600'
                        }`} />
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900">{brand}</h4>
                      <p className="text-xs text-gray-500">Gas</p>
                      {selectedBrand === brand && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-2 w-1.5 h-1.5 bg-accent rounded-full mx-auto"
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
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    <span className="text-accent">{selectedBrand}</span> Gas Refill Options
                  </h2>
                  <p className="text-gray-600">
                    Choose the right size for your needs
                  </p>
                </div>

                {/* Refill Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
                            </div>

                            {/* Price */}
                            <div className="text-center mb-6">
                              <div className="text-3xl font-bold text-accent mb-1">
                                UGX {item.price.toLocaleString()}
                              </div>
                              <div className="text-xs text-green-600 font-medium">
                                {item.savings}
                              </div>
                            </div>

                            {/* Features */}
                            <div className="flex items-center justify-center gap-2 mb-6">
                              <Check className="w-4 h-4 text-accent" />
                              <span className="text-sm text-gray-700">Free delivery included</span>
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
                    <div className="col-span-full text-center py-16">
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
                className="text-center py-16"
              >
                <Card className="max-w-lg mx-auto p-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Flame className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Select Your Gas Brand Above
                  </h3>
                  <p className="text-gray-600">
                    Choose your preferred gas brand to view the best refill prices in Uganda.
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        )}

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
              <Button
                onClick={() => window.open("https://wa.me/256789572007", "_blank")}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base font-semibold"
              >
                WhatsApp: +256 789 572 007
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Refill;