
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
import PlaceScreen from "./components/PlaceScreen";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

const AppContent = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(false);
  const [showPlaceScreen, setShowPlaceScreen] = useState(true);

  // Check for admin status on mount
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    setIsAdmin(userRole === 'admin');
  }, []);

  // Hide bottom nav when place screen is showing or on admin/login routes
  const showBottomNav = !showPlaceScreen && 
    !['/admin', '/login'].includes(location.pathname);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPlaceScreen(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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

      {showPlaceScreen && <PlaceScreen />}

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
              <Route path="/admin" element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <Admin />
                </motion.div>
              } />
              <Route path="/login" element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <Login />
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
