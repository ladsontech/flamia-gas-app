
import { useLocation } from "react-router-dom";
import { Home, ShoppingBag, User, RotateCw, Utensils } from "lucide-react";
import { NavItem } from "./navigation/NavItem";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BottomNavProps {
  isAdmin: boolean | null;
  user?: any;
}

export const BottomNav = ({ isAdmin, user }: BottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getItemCount } = useCart();
  const path = location.pathname;
  const itemCount = getItemCount();

  // Define active states
  const isHomeActive = path === "/";
  const isGadgetsActive = path === "/gadgets";
  // const isFoodsActive = path === "/foods"; // Temporarily hidden
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
        {/* Cart Button for Mobile */}
        {itemCount > 0 && (
          <Button
            onClick={() => navigate('/order')}
            variant="ghost"
            className="flex flex-col items-center justify-center p-2 h-auto min-h-12 relative"
          >
            <div className="relative mb-1">
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
              <Badge className="absolute -top-2 -right-2 bg-accent text-white text-xs w-4 h-4 flex items-center justify-center p-0 text-[10px]">
                {itemCount}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">Cart</span>
          </Button>
        )}
        {/* Foods section temporarily hidden */}
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
