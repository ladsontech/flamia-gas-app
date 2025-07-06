
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Order from "./pages/Order";
import Refill from "./pages/Refill";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Orders from "./pages/Orders";
import Delivery from "./pages/Delivery";
import DeliveryLogin from "./pages/DeliveryLogin";
import Gadgets from "./pages/Gadgets";
import GadgetDetail from "./pages/GadgetDetail";
import Accessories from "./pages/Accessories";
import GasSafety from "./pages/GasSafety";
import AppBar from "./components/AppBar";
import { BottomNav } from "./components/BottomNav";
import DeepLinkHandler from "./components/DeepLinkHandler";
import ShareTargetHandler from "./components/ShareTargetHandler";
import InstallPWA from "./components/InstallPWA";
import { OnlineStatusMonitor } from "./components/OnlineStatusMonitor";
import UpdateNotification from "./components/UpdateNotification";
import TestingHelper from "./components/TestingHelper";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <AppBar />
            <main className="pb-16 md:pb-0">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/order" element={<Order />} />
                <Route path="/refill" element={<Refill />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/delivery" element={<Delivery />} />
                <Route path="/delivery-login" element={<DeliveryLogin />} />
                <Route path="/gadgets" element={<Gadgets />} />
                <Route path="/gadget/:id" element={<GadgetDetail />} />
                <Route path="/accessories" element={<Accessories />} />
                <Route path="/gas-safety" element={<GasSafety />} />
                <Route path="/safety" element={<GasSafety />} />
              </Routes>
            </main>
            <BottomNav isAdmin={null} />
            <DeepLinkHandler />
            <ShareTargetHandler />
            <InstallPWA />
            <OnlineStatusMonitor />
            <UpdateNotification onUpdate={handleUpdate} />
            <TestingHelper />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
