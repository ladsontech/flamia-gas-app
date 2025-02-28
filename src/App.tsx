
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import Index from "./pages/Index";
import Order from "./pages/Order";
import Refill from "./pages/Refill";
import Accessories from "./pages/Accessories";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, Suspense } from 'react';
import { BottomNav } from "./components/BottomNav";
import { supabase } from "./integrations/supabase/client";
import InstallPWA from "./components/InstallPWA";

const AppContent = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(false);
  const [showPlaceScreen, setShowPlaceScreen] = useState(true);
  const [hasPwaUpdate, setHasPwaUpdate] = useState(false);

  // Hide bottom nav when place screen is showing
  const showBottomNav = !showPlaceScreen;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPlaceScreen(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Check for service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // When the service worker controllerchange event fires, we know the new service worker has taken control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker activated');
        setHasPwaUpdate(true);
      });
    }
  }, []);

  // Function to reload app when new version is available
  const handleAppUpdate = () => {
    window.location.reload();
  };

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 3,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -3,
    },
  };

  return (
    <>
      <Helmet>
        <title>Flamia - Gas Delivery Service</title>
        <meta name="description" content="Quick and reliable gas delivery service. Order gas cylinders and accessories with fast delivery to your doorstep." />
        <meta name="keywords" content="gas delivery, gas cylinders, cooking gas, LPG, gas accessories" />
        <meta property="og:title" content="Flamia - Gas Delivery Service" />
        <meta property="og:description" content="Quick and reliable gas delivery service. Order gas cylinders and accessories with fast delivery to your doorstep." />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#FF4D00" />
        <link rel="canonical" href={window.location.href} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>

      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <InstallPWA />
      </div>

      {hasPwaUpdate && (
        <div className="fixed bottom-20 left-0 right-0 mx-auto w-max z-50">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2"
            onClick={handleAppUpdate}
          >
            <span>New version available!</span>
            <button className="bg-white text-accent text-xs px-2 py-1 rounded-full font-medium">
              Update now
            </button>
          </motion.div>
        </div>
      )}

      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      }>
        <div className="min-h-screen md:pl-16 pb-16 md:pb-0">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <Index />
                </motion.div>
              } />
              <Route path="/order" element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <Order />
                </motion.div>
              } />
              <Route path="/refill" element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <Refill />
                </motion.div>
              } />
              <Route path="/accessories" element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <Accessories />
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>
        </div>
        {showBottomNav && <BottomNav isAdmin={isAdmin} />}
      </Suspense>
    </>
  );
};

const App = () => {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours (replacing cacheTime)
        retry: 3,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        networkMode: 'always'
      },
    },
  }));

  // Prefetch initial data
  React.useEffect(() => {
    const prefetchInitialData = async () => {
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ['hotDeals'],
          queryFn: async () => {
            const { data } = await supabase
              .from('hot_deals')
              .select('*')
              .order('created_at', { ascending: false });
            return data;
          },
        }),
        queryClient.prefetchQuery({
          queryKey: ['brands'],
          queryFn: async () => {
            const { data } = await supabase
              .from('brands')
              .select('*')
              .order('brand', { ascending: true });
            return data;
          },
        }),
      ]);
    };

    prefetchInitialData();
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
