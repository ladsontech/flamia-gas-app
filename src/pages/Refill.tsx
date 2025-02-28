
import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Flame, ArrowRight, Truck, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import Footer from "@/components/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface RefillPrice {
  id: string;
  brand: string;
  weight: string;
  price: number;
}

const Refill = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [brands, setBrands] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Use React Query for data fetching and caching
  const { 
    data: refillPrices = [], 
    isLoading, 
    isError, 
    refetch,
    error 
  } = useQuery({
    queryKey: ['refillPrices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('refill_prices')
        .select('*')
        .order('brand', { ascending: true });
      
      if (error) throw error;
      
      // Extract unique brands
      const uniqueBrands = [...new Set(data?.map(item => item.brand) || [])];
      setBrands(uniqueBrands);
      
      return data as RefillPrice[];
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep unused data for 30 minutes
  });

  // Function to manually trigger a background sync
  const syncData = useCallback(async () => {
    try {
      setIsSyncing(true);
      await refetch();
      toast({
        title: "Data synchronized",
        description: "Refill prices have been updated",
      });
    } catch (err) {
      console.error('Error syncing data:', err);
      toast({
        title: "Sync failed",
        description: "Could not update refill prices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [refetch, toast]);

  useEffect(() => {
    // Register a background sync for when the user is offline and comes back online
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        // Register a background sync
        registration.sync.register('sync-refill-prices')
          .then(() => {
            console.log('Background sync registered for refill prices');
          })
          .catch((err) => {
            console.error('Background sync registration failed:', err);
          });
      });
    }
    
    // Setup online/offline event listeners
    const handleOnline = () => {
      console.log('Device is online, syncing data...');
      syncData();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncData]);

  const handleOrder = (weight: string, price: number) => {
    if (!selectedBrand) {
      toast({
        title: "Please select a brand",
        description: "You need to select a gas brand before proceeding",
        variant: "destructive",
      });
      return;
    }
    navigate(`/order?type=refill&size=${weight}&price=${price}&brand=${selectedBrand}`);
  };

  // Filter prices based on selected brand
  const filteredPrices = selectedBrand
    ? refillPrices.filter(price => price.brand === selectedBrand)
    : [];

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary to-white py-4 sm:py-6 flex flex-col items-center justify-center">
        <div className="text-destructive text-center mb-4">
          <p className="text-lg font-semibold">Error loading refill prices</p>
          <p className="text-sm text-muted-foreground">{(error as Error)?.message || "Please try again later"}</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white flex flex-col">
      <div className="container px-2 sm:px-4 py-4 sm:py-6 flex-grow">
        <div className="flex justify-between items-center">
          <BackButton />
          
          {/* Sync button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={syncData} 
            disabled={isLoading || isSyncing}
            className="relative"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-1 sr-only sm:not-sr-only">Refresh</span>
          </Button>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Gas Refill Prices</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Choose your preferred gas cylinder size and brand
          </p>
          
          {/* Free Delivery Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 text-accent font-medium p-2 bg-accent/10 rounded-full mb-6 max-w-xs mx-auto"
          >
            <Truck className="w-4 h-4" />
            <span>Free Delivery on All Orders!</span>
          </motion.div>

          <div className="max-w-xs mx-auto mb-6">
            <Select
              value={selectedBrand}
              onValueChange={setSelectedBrand}
            >
              <SelectTrigger className="w-full bg-white/90 backdrop-blur-sm border-accent/20 h-12 shadow-sm">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent 
                className="bg-white border-accent/20 shadow-lg overflow-y-auto z-50"
                position="popper"
                style={{
                  maxHeight: 'min(65vh, 600px)',
                  minHeight: '300px'
                }}
              >
                {brands.map((brand) => (
                  <SelectItem 
                    key={brand} 
                    value={brand}
                    className="hover:bg-accent/10 py-3"
                  >
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="mt-4 text-sm text-muted-foreground">Loading refill prices...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {filteredPrices.length > 0 ? (
                filteredPrices.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="h-full"
                  >
                    <Card className="relative overflow-hidden p-4 sm:p-5 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 opacity-20" />
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-center mb-3 sm:mb-4">
                          <Flame className="w-7 h-7 sm:w-9 sm:h-9 text-accent" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-2">{item.weight}</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 flex-grow">
                          {item.weight === '3KG' ? 'Perfect for small households and portable stoves' : 
                          item.weight === '6KG' ? 'Ideal for medium-sized families and regular cooking' : 
                          'Best for large families or commercial use'}
                        </p>
                        
                        <div className="p-3 sm:p-4 bg-accent/5 rounded-lg mt-auto">
                          <p className="font-bold text-accent text-lg sm:text-xl mb-3">
                            UGX {item.price.toLocaleString()}
                          </p>
                          <Button
                            onClick={() => handleOrder(item.weight, item.price)}
                            className="w-full group text-sm py-2 bg-accent hover:bg-accent/90"
                          >
                            Order Refill
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : selectedBrand ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-8"
                >
                  <p className="text-muted-foreground">No refill prices available for this brand.</p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-8"
                >
                  <p className="text-muted-foreground">Please select a brand to view refill prices.</p>
                </motion.div>
              )}
            </div>
          </AnimatePresence>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Refill;
