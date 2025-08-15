
import { useLocation } from "react-router-dom";
import { Home, ShoppingBag, User, RotateCw, Utensils } from "lucide-react";
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
  const isGadgetsActive = path === "/gadgets";
  const isFoodsActive = path === "/foods";
  const isAccountActive = path === "/account";

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
        <NavItem
          to="/foods"
          icon={Utensils}
          label="Foods"
          isActive={isFoodsActive}
        />
        <NavItem
          to="/account"
          icon={User}
          label="Account"
          isActive={isAccountActive}
        />
      </div>
    </nav>
  );
};
