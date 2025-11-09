import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"

import { BottomNav } from './components/BottomNav';
import AppBar from './components/AppBar';
import UpdateNotification from './components/UpdateNotification';
import { LoadingIndicator } from './components/LoadingIndicator';
import { supabase } from './integrations/supabase/client';
import { CartProvider } from '@/contexts/CartContext';
import { SellerCartProvider } from '@/contexts/SellerCartContext';
import Admin from './pages/Admin';

import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Account from './pages/Account';
import Orders from './pages/Orders';
import Gadgets from './pages/Gadgets';
// import Foods from './pages/Foods'; // Temporarily hidden
import Shop from './pages/Shop';
import Home from './pages/Index';
import Order from './pages/Order';
import Refill from './pages/Refill';
import GasSafety from './pages/GasSafety';
import Accessories from './pages/Accessories';
import GadgetDetail from './pages/GadgetDetail';
import ProductDetail from './pages/ProductDetail';
import ResetPassword from './pages/ResetPassword';
import Delivery from './pages/Delivery';
import StudentGasDelivery from './pages/StudentGasDelivery';
import Sell from './pages/Sell';
import SellerOptions from './pages/SellerOptions';
import SellerDashboard from './pages/SellerDashboard';
import SellerStorefront from './pages/SellerStorefront';
import StorefrontProductDetail from './pages/StorefrontProductDetail';
import AffiliateDashboard from './pages/AffiliateDashboard';
import AffiliateStorefront from './pages/AffiliateStorefront';
import AuthCallback from './pages/AuthCallback';
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
import { DataPrefetcher } from './components/DataPrefetcher';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: false, // Don't refetch on reconnect
      retry: 1, // Only retry once on failure
    },
  },
});

const AppContent = () => {
  const location = useLocation();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { showOnboarding, loading: onboardingLoading, completeOnboarding } = useOnboarding();
  
  const isPolicyRoute = location.pathname.startsWith('/terms-and-conditions') || location.pathname.startsWith('/privacy-policy');
  const subdomainMatch = typeof window !== 'undefined' ? window.location.hostname.match(/^([a-z0-9-]+)\.flamia\.store$/i) : null;
  const isStorefrontHost = !!subdomainMatch;
  // Only treat subdomain visits as storefronts, not /shop/slug routes from main store
  const isStorefront = isStorefrontHost;
  
  // Routes that don't need loading screen (no redirects)
  const isHomeRoute = location.pathname === '/' || location.pathname === '/home';
  const shouldShowLoading = !isStorefront && !isPolicyRoute && !isHomeRoute && roleLoading;

  // Show loading screen only for routes that might redirect (not home page)
  if (shouldShowLoading) {
    return <LoadingIndicator fullScreen message="Loading your experience..." />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!isStorefront && showOnboarding && !onboardingLoading && !isPolicyRoute && (
        <OnboardingScreen onComplete={completeOnboarding} />
      )}
      {!isStorefront && <AppBar />}
      {!isStorefront && <GoogleSignUpHandler />}
      {!isStorefront && <InstallPWA />}
      {!isStorefront && <OccasionalSignInPopup />}
      {!isStorefront && <PushNotificationPrompt />}
      {!isStorefront && <DataPrefetcher />}
      <Toaster />
      
      <main className={isStorefront ? "flex-1" : "flex-1 pb-24 md:pb-0"}>
        <Routes>
          {isStorefrontHost ? (
            <>
              <Route path="/product/:id" element={<StorefrontProductDetail />} />
              <Route path="*" element={<SellerStorefront />} />
            </>
          ) : (
            <>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/gadgets" element={<Gadgets />} />
          {/* <Route path="/foods" element={<Foods />} /> */}
          <Route path="/orders" element={<Orders />} />
          <Route path="/account" element={<Account />} />
          
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/order" element={<Order />} />
          <Route path="/refill" element={<Refill />} />
          <Route path="/gas-safety" element={<GasSafety />} />
          <Route path="/accessories" element={<Accessories />} />
          {/* <Route path="/student-gas-delivery" element={<StudentGasDelivery />} /> */}
          <Route path="/gadget/:id" element={<GadgetDetail />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/admin" element={<Admin />} />
        <Route path="/seller-options" element={<SellerOptions />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/shop/:slug" element={<SellerStorefront />} />
          <Route path="/shop/:slug/product/:id" element={<StorefrontProductDetail />} />
        <Route path="/affiliate/dashboard" element={<AffiliateDashboard />} />
          <Route path="/affiliate/:slug" element={<AffiliateStorefront />} />
          <Route path="/affiliate/:slug/product/:id" element={<StorefrontProductDetail />} />
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
            </>
          )}
        </Routes>
      </main>

      {!isStorefront && <BottomNav isAdmin={isAdmin} />}
      {!isStorefront && <CartButton />}
    </div>
  );
};

function App() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

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
      <SellerCartProvider>
        <CartProvider>
          <Router>
            <AppContent />
            {isUpdateAvailable && <UpdateNotification onUpdate={handleUpdate} />}
          </Router>
        </CartProvider>
      </SellerCartProvider>
    </QueryClientProvider>
  );
}

export default App;
