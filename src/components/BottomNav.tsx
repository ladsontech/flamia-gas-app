
import { useLocation } from "react-router-dom";
import { Home, ShoppingBag, User, RotateCw, Utensils } from "lucide-react";
import { NavItem } from "./navigation/NavItem";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BottomNavProps {
  isAdmin: boolean | null;
  user?: any;
}

export const BottomNav = ({ isAdmin, user }: BottomNavProps) => {
  const location = useLocation();
  const path = location.pathname;
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const phoneVerified = localStorage.getItem('phoneVerified');
      setIsAuthenticated(!!(user || phoneVerified));
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const phoneVerified = localStorage.getItem('phoneVerified');
      setIsAuthenticated(!!(session?.user || phoneVerified));
    });

    return () => subscription.unsubscribe();
  }, []);

  // Define active states
  const isSignInActive = path === "/signin" || path === "/signup";
  const isHomeActive = path === "/" || path === "/home";
  const isGadgetsActive = path === "/gadgets";
  const isAccountActive = path === "/account" || isSignInActive;

  // Determine account navigation
  const accountPath = "/account";
  const accountLabel = isAuthenticated ? "Account" : "Sign In";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        <NavItem
          to="/"
          icon={Home}
          label="Home"
          isActive={isHomeActive}
        />
        <NavItem
          to="/gadgets"
          icon={ShoppingBag}
          label="Gadgets"
          isActive={isGadgetsActive}
        />
        {/* Foods section temporarily hidden */}
        <NavItem
          to={accountPath}
          icon={User}
          label={accountLabel}
          isActive={isAccountActive}
        />
      </div>
    </nav>
  );
};
