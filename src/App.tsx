import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Order from "./pages/Order";
import Refill from "./pages/Refill";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Accessories from "./pages/Accessories";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from 'react';
import { BottomNav } from "./components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useToast } from "./components/ui/use-toast";

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const showBottomNav = !['/login'].includes(location.pathname);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const protectedRoutes = ['/dashboard', '/order'];
        
        if (!session) {
          if (protectedRoutes.includes(location.pathname)) {
            navigate('/login');
          }
          setIsAdmin(false);
          return;
        }

        // Get user role from users table using maybeSingle()
        const { data: userData, error } = await supabase
          .from('users')
          .select('admin')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user role:', error);
          toast({
            title: "Error",
            description: "Failed to fetch user role. Please try again.",
            variant: "destructive",
          });
          setIsAdmin(false);
          return;
        }

        // Handle case where user data might not exist
        if (!userData) {
          console.warn('No user data found');
          setIsAdmin(false);
          return;
        }

        const adminStatus = userData.admin === 'admin';
        setIsAdmin(adminStatus);

        // Handle routing based on admin status
        if (adminStatus) {
          if (location.pathname !== '/dashboard' && location.pathname !== '/login') {
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        toast({
          title: "Error",
          description: "Authentication check failed. Please try again.",
          variant: "destructive",
        });
        setIsAdmin(false);
        navigate('/login');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

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
            <Route path="/refill" element={<Refill />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/accessories" element={<Accessories />} />
          </Routes>
        </AnimatePresence>
      </div>
      {showBottomNav && <BottomNav isAdmin={isAdmin} />}
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