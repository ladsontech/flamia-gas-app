import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route, useLocation, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import Index from "./pages/Index";
import Order from "./pages/Order";
import Orders from "./pages/Orders";
import Refill from "./pages/Refill";
import Accessories from "./pages/Accessories";
import Gadgets from "./pages/Gadgets";
import GasSafety from "./pages/GasSafety";
import Delivery from "./pages/Delivery";
import DeliveryLogin from "./pages/DeliveryLogin";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from 'react';
import PlaceScreen from "./components/PlaceScreen";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import { OnlineStatusMonitor } from "./components/OnlineStatusMonitor";
import ShareTargetHandler from "./components/ShareTargetHandler";
import UpdateNotification from './components/UpdateNotification';
import InstallPWA from './components/InstallPWA';
import TestingHelper from "./components/TestingHelper";
import DeepLinkHandler from "./components/DeepLinkHandler";
import { supabase } from '@/integrations/supabase/client';
import AppBar from "./components/AppBar";
import { BottomNav } from "./components/BottomNav";

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">Please refresh the page to try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(false);
  const [user, setUser] = useState<any>(null);
  const [showPlaceScreen, setShowPlaceScreen] = useState(true);
  const [showShareHandler, setShowShareHandler] = useState(false);

  // Handle service worker updates
  const handleUpdate = () => {
    window.location.reload();
  };

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    setIsAdmin(userRole === 'admin');
  }, []);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Check if this is a share target navigation
    const source = searchParams.get("source");
    if (source === "share-target") {
      setShowShareHandler(true);
    }
  }, [searchParams]);

  // Determine which pages should show bottom nav (mobile only)
  const showBottomNav = !showPlaceScreen && !['/admin', '/login', '/delivery', '/delivery-login'].includes(location.pathname);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPlaceScreen(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <>
      <Helmet>
        <title>Flamia - Gas Delivery Service</title>
        <meta name="description" content="Quick and reliable gas delivery service. Order gas cylinders and accessories with fast delivery to your doorstep." />
        <meta name="keywords" content="gas delivery, gas cylinders, cooking gas, LPG, gas accessories, gas safety" />
        <meta property="og:title" content="Flamia - Gas Delivery Service" />
        <meta property="og:description" content="Quick and reliable gas delivery service. Order gas cylinders and accessories with fast delivery to your doorstep." />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#FF4D00" />
        <link rel="canonical" href={window.location.href} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>

      {/* Deep Link Handler */}
      <DeepLinkHandler />

      {showPlaceScreen && <PlaceScreen />}

      {/* Share Target Handler */}
      {showShareHandler && <ShareTargetHandler />}

      {/* PWA Updates and Installation */}
      <UpdateNotification onUpdate={handleUpdate} />
      <InstallPWA />

      {/* Online/Offline Status Monitor */}
      <OnlineStatusMonitor />

      {/* Fixed AppBar - Always visible */}
      <AppBar />

      {/* Main Content Area with proper spacing */}
      <main className="pt-14 pb-16 md:pb-0 min-h-screen">
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
            <Route path="/orders" element={
              <motion.div 
                variants={pageVariants} 
                initial="initial" 
                animate="animate" 
                exit="exit" 
                transition={{ duration: 0.2 }}
              >
                <Orders />
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
            <Route path="/gadgets" element={
              <motion.div 
                variants={pageVariants} 
                initial="initial" 
                animate="animate" 
                exit="exit" 
                transition={{ duration: 0.2 }}
              >
                <Gadgets />
              </motion.div>
            } />
            <Route path="/safety" element={
              <motion.div 
                variants={pageVariants} 
                initial="initial" 
                animate="animate" 
                exit="exit" 
                transition={{ duration: 0.2 }}
              >
                <GasSafety />
              </motion.div>
            } />
            <Route path="/delivery" element={
              <motion.div 
                variants={pageVariants} 
                initial="initial" 
                animate="animate" 
                exit="exit" 
                transition={{ duration: 0.2 }}
              >
                <Delivery />
              </motion.div>
            } />
            <Route path="/delivery-login" element={
              <motion.div 
                variants={pageVariants} 
                initial="initial" 
                animate="animate" 
                exit="exit" 
                transition={{ duration: 0.2 }}
              >
                <DeliveryLogin />
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
      </main>

      {/* Bottom Navigation - Mobile only */}
      {showBottomNav && (
        <div className="md:hidden">
          <BottomNav isAdmin={isAdmin} user={user} />
        </div>
      )}
      
      {/* Testing Helper */}
      <TestingHelper />
      
      {/* Toast components */}
      <Toaster />
      <Sonner />
    </>
  );
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        retry: 3,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        networkMode: 'always'
      }
    }
  }));

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider delayDuration={0} skipDelayDuration={500}>
            <AppContent />
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;