import { useLocation } from "react-router-dom";
import { Home, ShoppingBag, Flame, RotateCw, Package } from "lucide-react";
import { NavItem } from "./navigation/NavItem";

interface BottomNavProps {
  isAdmin: boolean | null;
  user?: any;
}

export const BottomNav = ({ isAdmin, user }: BottomNavProps) => {
  const location = useLocation();
  const path = location.pathname;

  // Define active states
  const isHomeActive = path === "/";
  const isAccessoriesActive = path === "/accessories";
  const isSafetyActive = path === "/safety";
  const isRefillActive = path === "/refill";
  const isOrdersActive = path === "/orders";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
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
          isActive={path === "/gadgets"}
        />
        <NavItem
          to="/refill"
          icon={RotateCw}
          label="Refill"
          isActive={isRefillActive}
        />
        {isAdmin ? (
          <NavItem
            to="/admin"
            icon={Flame}
            label="Admin"
            isActive={false}
          />
        ) : user ? (
          <NavItem
            to="/orders"
            icon={Package}
            label="Orders"
            isActive={isOrdersActive}
          />
        ) : (
          <NavItem
            to="/safety"
            icon={Flame}
            label="Safety"
            isActive={isSafetyActive}
          />
        )}
      </div>
    </nav>
  );
};