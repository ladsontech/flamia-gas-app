import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { BottomNav } from './components/BottomNav';
import AppBar from './components/AppBar';
import UpdateNotification from './components/UpdateNotification';
import { supabase } from './integrations/supabase/client';
import Admin from './pages/Admin';
import Login from './pages/Login';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Account from './pages/Account';
import Orders from './pages/Orders';
import Gadgets from './pages/Gadgets';
import Foods from './pages/Foods';
import Home from './pages/Index';
import Order from './pages/Order';
import Refill from './pages/Refill';
import GasSafety from './pages/GasSafety';
import Accessories from './pages/Accessories';
import GadgetDetail from './pages/GadgetDetail';
import ResetPassword from './pages/ResetPassword';
import DeliveryLogin from './pages/DeliveryLogin';
import Delivery from './pages/Delivery';
import { useUserRole } from './hooks/useUserRole';

const queryClient = new QueryClient();

function App() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    const checkForUpdates = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          setIsUpdateAvailable(true);
        });
      }
    };

    checkForUpdates();
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.update();
        }
      });
    }
    window.location.reload();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <AppBar />
          <Toaster />
          
          <main className="flex-1 pb-24 md:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gadgets" element={<Gadgets />} />
              <Route path="/foods" element={<Foods />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/account" element={<Account />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/order" element={<Order />} />
              <Route path="/refill" element={<Refill />} />
              <Route path="/gas-safety" element={<GasSafety />} />
              <Route path="/accessories" element={<Accessories />} />
              <Route path="/gadget/:id" element={<GadgetDetail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/delivery-login" element={<DeliveryLogin />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>

          <BottomNav isAdmin={isAdmin} />
          
          {isUpdateAvailable && <UpdateNotification onUpdate={handleUpdate} />}
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
