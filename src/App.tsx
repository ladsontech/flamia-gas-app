import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Order from "./pages/Order";
import Admin from "./pages/Admin";
import Refill from "./pages/Refill";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Accessories from "./pages/Accessories";
import { motion, AnimatePresence } from "framer-motion";
import React from 'react';
import { BottomNav } from "./components/BottomNav";

const AppContent = () => {
  const location = useLocation();
  const showBottomNav = !['/login', '/admin', '/order'].includes(location.pathname);

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