import { useLocation } from "react-router-dom";
import { Home, RefreshCw, Package, ShoppingBag } from "lucide-react";
import { NavItem } from "./navigation/NavItem";
import { UserMenu } from "./navigation/UserMenu";

export const BottomNav = () => {
  const location = useLocation();
  const showBottomNav = !['/login'].includes(location.pathname);

  if (!showBottomNav) return null;

  return (
    <nav className="fixed md:top-1/2 md:-translate-y-1/2 bottom-0 left-0 md:h-auto h-16 bg-background border-t md:border-t-0 md:border-r border-border md:w-16 w-full px-4 flex md:flex-col items-center justify-around md:py-8 md:space-y-8 z-50">
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
        label="Accessories"
        isActive={location.pathname === "/accessories"}
      />
      <UserMenu isActive={location.pathname === "/account"} />
    </nav>
  );
};