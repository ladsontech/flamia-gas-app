import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Order from "./pages/Order";
import { BrandsManager } from "./components/admin/BrandsManager";
import { HotDealsManager } from "./components/admin/HotDealsManager";
import Refill from "./pages/Refill";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Accessories from "./pages/Accessories";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect } from 'react';
import { BottomNav } from "./components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { SessionContextProvider } from '@supabase/auth-helpers-react';

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const showBottomNav = !['/login'].includes(location.pathname);

  useEffect(() => {
    const checkAuthForProtectedRoutes = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const protectedRoutes = ['/dashboard', '/order'];
        const adminRoutes = ['/admin/brands', '/admin/hot-deals', '/admin/accessories'];
        
        // Check if it's an admin route
        if (adminRoutes.some(route => location.pathname.startsWith(route))) {
          const isAdmin = localStorage.getItem('isAdmin') === 'true';
          if (!isAdmin) {
            console.log('Not an admin, redirecting to login');
            navigate('/login');
            return;
          }
          return; // Allow access if admin
        }

        // Check regular user routes
        if (protectedRoutes.includes(location.pathname) && !session) {
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/login');
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAuthForProtectedRoutes();
    });

    checkAuthForProtectedRoutes();

    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname, navigate]);

  return (
    <>
      <div className="min-h-screen md:pl-16 pb-16 md:pb-0">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/order" element={<Order />} />
            <Route path="/admin/brands" element={<BrandsManager />} />
            <Route path="/admin/hot-deals" element={<HotDealsManager />} />
            <Route path="/refill" element={<Refill />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/accessories" element={<Accessories />} />
          </Routes>
        </AnimatePresence>
      </div>
      {showBottomNav && <BottomNav />}
    </>
  );
};

const App = () => {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={supabase}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
};

export default App;