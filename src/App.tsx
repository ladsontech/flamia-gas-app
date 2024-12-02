import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Order from "./pages/Order";
import Admin from "./pages/Admin";
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
  const showBottomNav = !['/login', '/admin'].includes(location.pathname);

  useEffect(() => {
    const checkAuthForProtectedRoutes = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const protectedRoutes = ['/dashboard', '/order'];
      
      if (protectedRoutes.includes(location.pathname) && !session) {
        navigate('/login');
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const protectedRoutes = ['/dashboard', '/order'];
      if (protectedRoutes.includes(location.pathname) && !session) {
        navigate('/login');
      }
    });

    checkAuthForProtectedRoutes();

    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname, navigate]);

  return (
    <>
      <div className="min-h-screen pb-16">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/order" element={<Order />} />
            <Route path="/admin" element={<Admin />} />
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