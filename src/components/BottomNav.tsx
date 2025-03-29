
import { useLocation } from "react-router-dom";
import { Package, RefreshCw, ShoppingBag } from "lucide-react";
import { NavItem } from "./navigation/NavItem";

interface BottomNavProps {
  isAdmin: boolean | null;
}

export const BottomNav = ({ isAdmin }: BottomNavProps) => {
  const location = useLocation();
  const showBottomNav = !['/login', '/admin'].includes(location.pathname);

  if (!showBottomNav) return null;

  return (
    <nav className="fixed md:top-1/2 md:-translate-y-1/2 bottom-0 left-0 md:h-auto h-14 bg-background border-t md:border-t-0 md:border-r border-border md:w-14 w-full px-2 flex md:flex-col items-center justify-around md:py-8 md:space-y-6 z-50">
      <NavItem
        to="/"
        icon={Package}
        label="Full Set"
        isActive={location.pathname === "/"}
      />
      <NavItem
        to="/refill"
        icon={RefreshCw}
        label="Refill"
        isActive={location.pathname === "/refill"}
      />
      <NavItem
        to="/accessories"
        icon={ShoppingBag}
        label="Accessories"
        isActive={location.pathname === "/accessories"}
      />
    </nav>
  );
};
