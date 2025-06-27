import { useLocation } from "react-router-dom";
import { Home, ShoppingBag, Flame, RotateCw, MessageCircle } from "lucide-react";
import { NavItem } from "./navigation/NavItem";

interface BottomNavProps {
  isAdmin: boolean | null;
  user?: any;
}

export const BottomNav = ({ isAdmin }: BottomNavProps) => {
  const location = useLocation();
  const path = location.pathname;

  // Define active states
  const isHomeActive = path === "/";
  const isAccessoriesActive = path === "/accessories";
  const isSafetyActive = path === "/safety";
  const isRefillActive = path === "/refill";

  const handleContactClick = () => {
    window.open('https://wa.me/256789572007', '_blank');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-around bg-background border-t border-border h-16 px-2">
      <NavItem
        to="/"
        icon={Home}
        label="Home"
        isActive={isHomeActive}
      />
      <NavItem
        to="/accessories"
        icon={ShoppingBag}
        label="Accessories"
        isActive={isAccessoriesActive}
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
      ) : (
        <div 
          onClick={handleContactClick}
          className="relative flex flex-col items-center justify-center w-12 h-12 text-muted-foreground transition-colors duration-200 hover:text-flame-middle group cursor-pointer"
        >
          <MessageCircle className="h-3.5 w-3.5 mb-0.5" />
          <span className="text-[10px] leading-none">Contact</span>
        </div>
      )}
    </nav>
  );
};