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
import AdminLogin from "./pages/AdminLogin";
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
  const showBottomNav = !['/login', '/admin', '/admin/login'].includes(location.pathname);

  useEffect(() => {
    const checkAuthForProtectedRoutes = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const protectedRoutes = ['/dashboard', '/order'];
        
        // Check if it's admin route
        if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
          const isAdmin = localStorage.getItem('isAdmin') === 'true';
          if (!isAdmin) {
            console.log('Not an admin, redirecting to admin login');
            navigate('/admin/login');
            return;
          }
          // If we're on any admin route other than the main one, redirect to /admin
          if (location.pathname !== '/admin') {
            navigate('/admin');
          }
          return;
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
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
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