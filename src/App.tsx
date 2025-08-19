import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Order from './pages/Order';
import Orders from './pages/Orders';
import Refill from './pages/Refill';
import Accessories from './pages/Accessories';
import Gadgets from './pages/Gadgets';
import GadgetDetail from './pages/GadgetDetail';
import Foods from './pages/Foods';
import GasSafety from './pages/GasSafety';
import Admin from './pages/Admin';
import DeliveryLogin from './pages/DeliveryLogin';
import Delivery from './pages/Delivery';
import Account from './pages/Account';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import UpdateNotification from './components/UpdateNotification';
import OnlineStatusMonitor from './components/OnlineStatusMonitor';
import DeepLinkHandler from './components/DeepLinkHandler';
import ShareTargetHandler from './components/ShareTargetHandler';
import { ToastProvider } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { QueryClient } from '@tanstack/react-query';

function App() {
  return (
    <QueryClient>
      <ToastProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/order" element={<Order />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/refill" element={<Refill />} />
            <Route path="/accessories" element={<Accessories />} />
            <Route path="/gadgets" element={<Gadgets />} />
            <Route path="/gadget/:id" element={<GadgetDetail />} />
            <Route path="/foods" element={<Foods />} />
            <Route path="/safety" element={<GasSafety />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/delivery-login" element={<DeliveryLogin />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/account" element={<Account />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
          <UpdateNotification />
          <OnlineStatusMonitor />
          <DeepLinkHandler />
          <ShareTargetHandler />
        </BrowserRouter>
      </ToastProvider>
    </QueryClient>
  );
}

export default App;
