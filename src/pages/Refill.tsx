import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Flame, ArrowRight, Truck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
  "Hashi"
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
  }
];

const Refill = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

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

  const filteredPrices = selectedBrand ? staticRefillPrices.filter(price => price.brand === selectedBrand) : [];

  const pageTitle = "Gas Refill Prices Uganda | Cheapest LPG Refill Services in Kampala";
  const pageDescription = "Compare today's gas refill prices in Uganda. Best rates for Total, Shell, Oryx, Stabex, and Hass gas cylinders with free delivery in Kampala, Wakiso, Mukono and Entebbe.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white flex flex-col">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="gas refill prices Uganda, cheap cooking gas, LPG refill near me, Stabex gas refill price, Total gas refill, Shell gas cylinder refill, Hass gas refill Wakiso, affordable gas refill Kampala, best gas refill service Uganda" />
        <link rel="canonical" href="https://flamia.store/refill" />
      </Helmet>
      
      <div className="container px-2 sm:px-4 py-4 sm:py-6 flex-grow">
        <div className="flex justify-between items-center mb-4">
          <BackButton />
        </div>
        
        <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="text-center mb-6 sm:mb-8">
          
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Compare gas refill prices in Uganda. Choose your preferred brand and cylinder size for best rates.
          </p>
          
          <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2
          }} className="flex items-center justify-center gap-2 text-accent font-medium p-2 bg-accent/10 rounded-full mb-6 max-w-xs mx-auto">
            <Truck className="w-4 h-4" />
            <span>Free Delivery on All Gas Refills in Kampala!</span>
          </motion.div>

          <div className="max-w-xs mx-auto mb-6">
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-full bg-white/90 backdrop-blur-sm border-accent/20 h-12 shadow-sm">
                <SelectValue placeholder="Select gas brand" />
              </SelectTrigger>
              <SelectContent className="bg-white border-accent/20 shadow-lg overflow-y-auto z-50" position="popper" style={{
                maxHeight: 'min(65vh, 600px)',
                minHeight: '300px'
              }}>
                {staticBrands.map(brand => (
                  <SelectItem key={brand} value={brand} className="hover:bg-accent/10 py-3">
                    {brand} Gas
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 animate-spin text-accent border-2 border-accent border-t-transparent rounded-full"></div>
              <p className="mt-4 text-sm text-muted-foreground">Loading gas refill prices...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {filteredPrices.length > 0 ? (
                filteredPrices.map((item, index) => (
                  <motion.div 
                    key={item.id} 
                    initial={{
                      opacity: 0,
                      y: 20
                    }} 
                    animate={{
                      opacity: 1,
                      y: 0
                    }} 
                    transition={{
                      duration: 0.3,
                      delay: index * 0.1
                    }} 
                    whileHover={{
                      scale: 1.02
                    }} 
                    className="h-full"
                  >
                    <Card className="relative overflow-hidden p-4 sm:p-5 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 opacity-20" />
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-center mb-3 sm:mb-4">
                          <Flame className="w-7 h-7 sm:w-9 sm:h-9 text-accent" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-2">{item.weight} Refill</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 flex-grow">
                          {item.description}
                        </p>
                        
                        <div className="p-3 sm:p-4 bg-accent/5 rounded-lg mt-auto">
                          <p className="font-bold text-accent text-lg sm:text-xl mb-3">
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
                  initial={{
                    opacity: 0
                  }} 
                  animate={{
                    opacity: 1
                  }} 
                  className="col-span-full text-center py-8"
                >
                  <p className="text-muted-foreground">No gas refill prices available for this brand currently.</p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{
                    opacity: 0
                  }} 
                  animate={{
                    opacity: 1
                  }} 
                  className="col-span-full text-center py-8"
                >
                </motion.div>
              )}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Refill;
