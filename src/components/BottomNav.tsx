import { useLocation } from "react-router-dom";
import { Home, RefreshCw, Package, ShoppingBag } from "lucide-react";
import { NavItem } from "./navigation/NavItem";
import { UserMenu } from "./navigation/UserMenu";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const BottomNav = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const showBottomNav = !['/login'].includes(location.pathname);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('admin')
          .eq('id', session.user.id)
          .maybeSingle();
        
        setIsAdmin(userData?.admin === 'admin');
      }
    };

    checkUserRole();
  }, []);

  if (!showBottomNav) return null;

  // Admin users only see the dashboard nav item
  if (isAdmin) {
    return (
      <nav className="fixed md:top-1/2 md:-translate-y-1/2 bottom-0 left-0 md:h-auto h-14 bg-background border-t md:border-t-0 md:border-r border-border md:w-14 w-full px-2 flex md:flex-col items-center justify-around md:py-8 md:space-y-6 z-50">
        <NavItem
          to="/dashboard"
          icon={Package}
          label="Orders"
          isActive={location.pathname === "/dashboard"}
        />
        <UserMenu isActive={location.pathname === "/account"} />
      </nav>
    );
  }

  return (
    <nav className="fixed md:top-1/2 md:-translate-y-1/2 bottom-0 left-0 md:h-auto h-14 bg-background border-t md:border-t-0 md:border-r border-border md:w-14 w-full px-2 flex md:flex-col items-center justify-around md:py-8 md:space-y-6 z-50">
      <NavItem
        to="/"
        icon={Home}
        label="Home"
        isActive={location.pathname === "/"}
      />
      <NavItem
        to="/refill"
        icon={RefreshCw}
        label="Refill"
        isActive={location.pathname === "/refill"}
      />
      <NavItem
        to="/dashboard"
        icon={Package}
        label="My Orders"
        isActive={location.pathname === "/dashboard"}
      />
      <NavItem
        to="/accessories"
        icon={ShoppingBag}
        label="Shop"
        isActive={location.pathname === "/accessories"}
      />
      <UserMenu isActive={location.pathname === "/account"} />
    </nav>
  );
};