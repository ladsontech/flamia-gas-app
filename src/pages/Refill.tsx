
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppBar from "@/components/AppBar";
import { Flame, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helmet } from "react-helmet";
import { Label } from "@/components/ui/label";
import { refillBrands } from "@/components/home/BrandsData";

const staticBrands = [
  "Total", 
  "Taifa", 
  "Stabex", 
  "Shell", 
  "Hass", 
  "Meru", 
  "Ven Gas", 
  "Ola Energy", 
  "Oryx", 
  "Ultimate", 
  "K Gas", 
  "C Gas", 
  "Hashi",
  "Safe",
  "Nova"
];

const staticRefillPrices = [
  {
    id: "1",
    brand: "Total",
    weight: "3KG",
    price: 28000,
    description: "Total 3KG Gas Refill - Ideal for small households and students"
  },
  {
    id: "2",
    brand: "Total",
    weight: "6KG",
    price: 45000,
    description: "Total 6KG Gas Refill - free delivery in Kampala"
  },
  {
    id: "3",
    brand: "Total",
    weight: "12KG",
    price: 95000,
    description: "Total 12KG Gas Refill - Perfect for restaurants and large families"
  },
  
  {
    id: "4",
    brand: "Taifa",
    weight: "3KG",
    price: 28000,
    description: "Taifa 3KG Gas Refill - Budget-friendly option for students"
  },
  {
    id: "5",
    brand: "Taifa",
    weight: "6KG",
    price: 45000,
    description: "Taifa 6KG Gas Refill - Reliable cooking gas supplier in Uganda"
  },
  {
    id: "6",
    brand: "Taifa",
    weight: "12KG",
    price: 95000,
    description: "Taifa 12KG Gas Refill - Ideal for large families and businesses"
  },
  
  {
    id: "7",
    brand: "Stabex",
    weight: "6KG",
    price: 45000,
    description: "Stabex 6KG Gas Refill - Affordable LPG with delivery in Uganda"
  },
  {
    id: "8",
    brand: "Stabex",
    weight: "12KG",
    price: 95000,
    description: "Stabex 12KG Gas Refill - Most reliable gas service in Kampala"
  },
  
  {
    id: "9",
    brand: "Shell",
    weight: "6KG",
    price: 45000,
    description: "Shell 6KG Gas Refill - Best gas supplier in Uganda with free delivery"
  },
  {
    id: "10",
    brand: "Shell",
    weight: "12KG",
    price: 95000,
    description: "Shell 12KG Gas Refill - Premium quality LPG for commercial use"
  },
  
  {
    id: "11",
    brand: "Hass",
    weight: "6KG",
    price: 45000,
    description: "Hass 6KG Gas Refill - Cheap cooking gas with free delivery in Uganda"
  },
  {
    id: "12",
    brand: "Hass",
    weight: "12KG",
    price: 95000,
    description: "Hass 12KG Gas Refill - Best value LPG in Uganda"
  },
  
  {
    id: "13",
    brand: "Meru",
    weight: "6KG",
    price: 45000,
    description: "Meru 6KG Gas Refill - Quality cooking gas for homes in Uganda"
  },
  {
    id: "14",
    brand: "Meru",
    weight: "12KG",
    price: 95000,
    description: "Meru 12KG Gas Refill - Best for restaurants and large households"
  },
  
  {
    id: "15",
    brand: "Ven Gas",
    weight: "6KG",
    price: 45000,
    description: "Ven Gas 6KG Refill - Reliable cooking gas with free delivery"
  },
  {
    id: "16",
    brand: "Ven Gas",
    weight: "12KG",
    price: 95000,
    description: "Ven Gas 12KG Refill - Premium cooking gas for commercial use"
  },
  
  {
    id: "17",
    brand: "Ola Energy",
    weight: "6KG",
    price: 45000,
    description: "Ola Energy 6KG Gas Refill - Premium cooking gas for homes"
  },
  {
    id: "18",
    brand: "Ola Energy",
    weight: "12KG",
    price: 95000,
    description: "Ola Energy 12KG Gas Refill - High-quality LPG for commercial use"
  },
  
  {
    id: "19",
    brand: "Oryx",
    weight: "6KG",
    price: 45000,
    description: "Oryx 6KG Gas Refill - Fast delivery in Kampala and Wakiso"
  },
  {
    id: "20",
    brand: "Oryx",
    weight: "12KG",
    price: 95000,
    description: "Oryx 12KG Gas Refill - Best for hotels and large households"
  },
  
  {
    id: "21",
    brand: "Ultimate",
    weight: "6KG",
    price: 45000,
    description: "Ultimate 6KG Gas Refill - Reliable cooking gas for Ugandan homes"
  },
  {
    id: "22",
    brand: "Ultimate",
    weight: "12KG",
    price: 95000,
    description: "Ultimate 12KG Gas Refill - Perfect for commercial kitchens"
  },
  
  {
    id: "23",
    brand: "K Gas",
    weight: "6KG",
    price: 45000,
    description: "K Gas 6KG Refill - Affordable cooking gas with delivery"
  },
  {
    id: "24",
    brand: "K Gas",
    weight: "12KG",
    price: 95000,
    description: "K Gas 12KG Refill - Ideal for restaurants and large families"
  },
  
  {
    id: "25",
    brand: "C Gas",
    weight: "6KG",
    price: 45000,
    description: "C Gas 6KG Refill - Quality cooking gas with free delivery"
  },
  {
    id: "26",
    brand: "C Gas",
    weight: "12KG",
    price: 95000,
    description: "C Gas 12KG Refill - Perfect for commercial use and large homes"
  },
  
  {
    id: "27",
    brand: "Hashi",
    weight: "6KG",
    price: 45000,
    description: "Hashi 6KG Refill - Affordable cooking gas with free delivery"
  },
  {
    id: "28",
    brand: "Hashi",
    weight: "12KG",
    price: 95000,
    description: "Hashi Gas 12KG Refill - Ideal for large families and businesses"
  },
  {
    id: "29",
    brand: "Safe",
    weight: "6KG",
    price: 45000,
    description: "Safe Gas 6KG Refill - Best for students and small families"
  },
  {
    id: "30",
    brand: "Safe",
    weight: "12KG",
    price: 95000,
    description: "free delivery within K'la"
  },
  {
    id: "31",
    brand: "Nova",
    weight: "3KG",
    price: 28000,
    description: "Free delivery within K'la"
  },
  {
    id: "32",
    brand: "Nova",
    weight: "6KG",
    price: 45000,
    description: "free delivery within K'la"
  },
  {
    id: "33",
    brand: "Nova",
    weight: "12KG",
    price: 95000,
    description: "Free Delivery within K'la"
  }
];

const Refill = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [allBrandsLoaded, setAllBrandsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setAllBrandsLoaded(true);
    }, 50);

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

  const filteredBrands = staticBrands;
  const filteredPrices = selectedBrand ? staticRefillPrices.filter(price => price.brand === selectedBrand) : [];

  const pageTitle = "Gas Refill Prices Uganda | Cheapest LPG Refill Services in Kampala";
  const pageDescription = "Compare today's gas refill prices in Uganda. Best rates for Total, Shell, Oryx, Stabex, and Hass gas cylinders with free delivery in Kampala, Wakiso, Mukono and Entebbe.";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/40 to-white flex flex-col">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="gas refill prices Uganda, cheap cooking gas, LPG refill near me, Stabex gas refill price, Total gas refill, Shell gas cylinder refill, Hass gas refill Wakiso, affordable gas refill Kampala, best gas refill service Uganda" />
        <link rel="canonical" href="https://flamia.store/refill" />
      </Helmet>
      
      <AppBar />
      
      <div className="container px-2 sm:px-4 py-4 sm:py-6 flex-grow pt-16">
        <div className="text-center mb-6 sm:mb-8">
          <div className="mb-6 max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
              Compare Gas Refill Prices
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Choose your preferred brand and cylinder size for best rates in Uganda.
            </p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center text-accent font-medium p-3 bg-accent/10 rounded-xl mb-6 max-w-md mx-auto shadow-sm border border-accent/20"
          >
            <span>Free Delivery on All Gas Refills in Kampala!</span>
          </motion.div>

          <div className="max-w-md mx-auto mb-6 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-sm border border-gray-100">
            <Label htmlFor="brand-select" className="text-sm font-medium mb-1.5 block text-left">
              Select Gas Brand
            </Label>
            {allBrandsLoaded && (
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger id="brand-select" className="w-full bg-white/90 backdrop-blur-sm border-accent/20 h-12 shadow-sm">
                  <SelectValue placeholder="Select gas brand" />
                </SelectTrigger>
                <SelectContent className="bg-white border-accent/20 shadow-lg overflow-y-auto z-50 max-h-[400px]">
                  {filteredBrands.map(brand => (
                    <SelectItem key={brand} value={brand} className="hover:bg-accent/10 py-3">
                      {brand} Gas
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 animate-spin text-accent border-2 border-accent border-t-transparent rounded-full"></div>
              <p className="mt-4 text-sm text-muted-foreground">Loading gas refill prices...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {selectedBrand && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <h2 className="text-xl font-semibold mb-4 text-center">
                  Available Refill Options for <span className="text-accent">{selectedBrand}</span>
                </h2>
              </motion.div>
            )}
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredPrices.length > 0 ? (
                filteredPrices.map((item) => (
                  <motion.div 
                    key={item.id} 
                    variants={itemVariants}
                    className="h-full"
                  >
                    <Card className="relative overflow-hidden p-5 sm:p-6 hover:shadow-lg transition-all duration-300 h-full flex flex-col border-accent/10">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-white opacity-50" />
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                            <Flame className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
                          </div>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center">{item.weight} Refill</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 flex-grow text-center">
                          {item.description}
                        </p>
                        
                        <div className="p-4 sm:p-5 bg-gradient-to-r from-accent/5 to-white rounded-lg mt-auto border border-accent/10 shadow-sm">
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <ul className="text-xs space-y-1.5">
                              <li className="flex items-center gap-1.5">
                                <Check size={14} className="text-accent" />
                                <span>Same-day delivery</span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                <Check size={14} className="text-accent" />
                                <span>Quality guaranteed</span>
                              </li>
                            </ul>
                          </div>
                          
                          <p className="font-bold text-accent text-lg sm:text-xl mb-3 text-center">
                            UGX {item.price.toLocaleString()}
                          </p>
                          <Button 
                            onClick={() => handleOrder(item.weight, item.price)} 
                            className="w-full group text-sm py-2 bg-accent hover:bg-accent/90"
                          >
                            Order Refill Now
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : selectedBrand ? (
                <motion.div 
                  variants={itemVariants}
                  className="col-span-full text-center py-8"
                >
                  <p className="text-muted-foreground">No gas refill prices available for this brand currently.</p>
                </motion.div>
              ) : (
                <motion.div 
                  variants={itemVariants}
                  className="col-span-full text-center py-8"
                >
                  <div className="p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm max-w-xl mx-auto">
                    <h3 className="text-lg font-medium mb-3">Select a Brand to View Prices</h3>
                    <p className="text-muted-foreground text-sm">
                      Choose your preferred gas brand from the dropdown menu above to see available refill options and prices.
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Refill;
