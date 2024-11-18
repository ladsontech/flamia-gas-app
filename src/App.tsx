import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Order from "./pages/Order";
import Admin from "./pages/Admin";
import Refill from "./pages/Refill";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { motion, AnimatePresence } from "framer-motion";
import React from 'react';

const App = () => {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/order" element={<Order />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/refill" element={<Refill />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;