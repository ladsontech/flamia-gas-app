import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"

import { BottomNav } from './components/BottomNav';
import AppBar from './components/AppBar';
import UpdateNotification from './components/UpdateNotification';
import { supabase } from './integrations/supabase/client';
import { CartProvider } from '@/contexts/CartContext';
import Admin from './pages/Admin';

import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Account from './pages/Account';
import Orders from './pages/Orders';
import Gadgets from './pages/Gadgets';
// import Foods from './pages/Foods'; // Temporarily hidden
import Home from './pages/Index';
import Order from './pages/Order';
import Refill from './pages/Refill';
import GasSafety from './pages/GasSafety';
import Accessories from './pages/Accessories';
import GadgetDetail from './pages/GadgetDetail';
import ResetPassword from './pages/ResetPassword';
import Delivery from './pages/Delivery';
import Sell from './pages/Sell';
import SellerDashboard from './pages/SellerDashboard';
import SellerStorefront from './pages/SellerStorefront';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';

// SEO Pages
import AlternativeToFumbaaGas from './pages/AlternativeToFumbaaGas';
import BrandNewGasCylindersUganda from './pages/BrandNewGasCylindersUganda';
import CGasUganda from './pages/CGasUganda';
import FastestGasDeliveryKampala from './pages/FastestGasDeliveryKampala';
import GasDeliveryKampala from './pages/GasDeliveryKampala';
import GasDeliveryMukono from './pages/GasDeliveryMukono';
import GasDeliveryUganda from './pages/GasDeliveryUganda';
import GasRefillWakiso from './pages/GasRefillWakiso';
import GasVsFumbaaGas from './pages/GasVsFumbaaGas';
import HassGasUganda from './pages/HassGasUganda';
import OryxGasUganda from './pages/OryxGasUganda';
import SameDayGasDeliveryUganda from './pages/SameDayGasDeliveryUganda';
import ShellGasUganda from './pages/ShellGasUganda';
import StabexGasUganda from './pages/StabexGasUganda';
import TotalGasUganda from './pages/TotalGasUganda';
import UltimateGasUganda from './pages/UltimateGasUganda';
import { useUserRole } from './hooks/useUserRole';
import { GoogleSignUpHandler } from './components/auth/GoogleSignUpHandler';
import InstallPWA from './components/InstallPWA';
import OccasionalSignInPopup from './components/auth/OccasionalSignInPopup';
import { PushNotificationPrompt } from './components/notifications/PushNotificationPrompt';
import { Navigate } from 'react-router-dom';
import { CartButton } from './components/cart/CartButton';
import OnboardingScreen from './components/onboarding/OnboardingScreen';
import { useOnboarding } from './hooks/useOnboarding';

const queryClient = new QueryClient();

function App() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  
  const { isAdmin } = useUserRole();
  const { showOnboarding, loading: onboardingLoading, completeOnboarding } = useOnboarding();
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const isPolicyRoute = path.startsWith('/terms-and-conditions') || path.startsWith('/privacy-policy');

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
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            {showOnboarding && !onboardingLoading && !isPolicyRoute && (
              <OnboardingScreen onComplete={completeOnboarding} />
            )}
            <AppBar />
            <GoogleSignUpHandler />
            <InstallPWA />
            <OccasionalSignInPopup />
            <PushNotificationPrompt />
            <Toaster />
            
            <main className="flex-1 pb-24 md:pb-0">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/gadgets" element={<Gadgets />} />
                {/* <Route path="/foods" element={<Foods />} /> */}
                <Route path="/orders" element={<Orders />} />
                <Route path="/account" element={<Account />} />
                
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/order" element={<Order />} />
                <Route path="/refill" element={<Refill />} />
                <Route path="/gas-safety" element={<GasSafety />} />
                <Route path="/accessories" element={<Accessories />} />
                <Route path="/gadget/:id" element={<GadgetDetail />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/delivery" element={<Delivery />} />
                <Route path="/admin" element={<Admin />} />
              <Route path="/sell" element={<Sell />} />
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/shop/:slug" element={<SellerStorefront />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                
                {/* SEO Pages */}
                <Route path="/alternative-to-fumbaa-gas" element={<AlternativeToFumbaaGas />} />
                <Route path="/brand-new-gas-cylinders-uganda" element={<BrandNewGasCylindersUganda />} />
                <Route path="/c-gas-uganda" element={<CGasUganda />} />
                <Route path="/fastest-gas-delivery-kampala" element={<FastestGasDeliveryKampala />} />
                <Route path="/gas-delivery-kampala" element={<GasDeliveryKampala />} />
                <Route path="/gas-delivery-mukono" element={<GasDeliveryMukono />} />
                <Route path="/gas-delivery-uganda" element={<GasDeliveryUganda />} />
                <Route path="/gas-refill-wakiso" element={<GasRefillWakiso />} />
                <Route path="/gas-vs-fumbaa-gas" element={<GasVsFumbaaGas />} />
                <Route path="/hass-gas-uganda" element={<HassGasUganda />} />
                <Route path="/oryx-gas-uganda" element={<OryxGasUganda />} />
                <Route path="/same-day-gas-delivery-uganda" element={<SameDayGasDeliveryUganda />} />
                <Route path="/shell-gas-uganda" element={<ShellGasUganda />} />
                <Route path="/stabex-gas-uganda" element={<StabexGasUganda />} />
                <Route path="/total-gas-uganda" element={<TotalGasUganda />} />
                <Route path="/ultimate-gas-uganda" element={<UltimateGasUganda />} />
              </Routes>
            </main>

            <BottomNav isAdmin={isAdmin} />
            <CartButton />
            
            {isUpdateAvailable && <UpdateNotification onUpdate={handleUpdate} />}
          </div>
        </Router>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
