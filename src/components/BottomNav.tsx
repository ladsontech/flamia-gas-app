
import { useLocation } from "react-router-dom";
import { Home, Package, RotateCw, ShoppingBag, Settings, Flame } from "lucide-react";
import { NavItem } from "./navigation/NavItem";

interface BottomNavProps {
  isAdmin: boolean | null;
}

export const BottomNav = ({ isAdmin }: BottomNavProps) => {
  const location = useLocation();
  const path = location.pathname;

  // Define active states
  const isHomeActive = path === "/";
  const isOrderActive = path === "/order";
  const isRefillActive = path === "/refill";
  const isAccessoriesActive = path === "/accessories";
  const isSafetyActive = path === "/safety";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-background border-t border-border h-16 px-2">
      <NavItem
        to="/"
        icon={Home}
        label="Home"
        isActive={isHomeActive}
      />
      <NavItem
        to="/order"
        icon={Package}
        label="Full Set"
        isActive={isOrderActive}
      />
      <NavItem
        to="/refill"
        icon={RotateCw}
        label="Refill"
        isActive={isRefillActive}
      />
      <NavItem
        to="/accessories"
        icon={ShoppingBag}
        label="Accessories"
        isActive={isAccessoriesActive}
      />
      {isAdmin ? (
        <NavItem
          to="/admin"
          icon={Settings}
          label="Admin"
          isActive={false}
        />
      ) : (
        <NavItem
          to="/safety"
          icon={Flame}
          label="Safety"
          isActive={isSafetyActive}
        />
      )}
    </nav>
  );
};
