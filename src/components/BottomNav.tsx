import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, RefreshCw, Package, Settings, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUserEmail(session.user.email);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleAccountClick = () => {
    if (!userEmail) {
      navigate('/login');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 px-4 flex items-center justify-around">
      <Link
        to="/"
        className={`flex flex-col items-center space-y-1 ${
          location.pathname === "/" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Home className="h-5 w-5" />
        <span className="text-xs">Home</span>
      </Link>
      <Link
        to="/refill"
        className={`flex flex-col items-center space-y-1 ${
          location.pathname === "/refill" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <RefreshCw className="h-5 w-5" />
        <span className="text-xs">Refill</span>
      </Link>
      <Link
        to="/dashboard"
        className={`flex flex-col items-center space-y-1 ${
          location.pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Package className="h-5 w-5" />
        <span className="text-xs">My Orders</span>
      </Link>
      <Link
        to="/accessories"
        className={`flex flex-col items-center space-y-1 ${
          location.pathname === "/accessories" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <ShoppingBag className="h-5 w-5" />
        <span className="text-xs">Accessories</span>
      </Link>
      {userEmail ? (
        <button
          onClick={handleLogout}
          className="flex flex-col items-center space-y-1 text-muted-foreground"
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs">Logout</span>
        </button>
      ) : (
        <button
          onClick={handleAccountClick}
          className="flex flex-col items-center space-y-1 text-muted-foreground"
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs">Login</span>
        </button>
      )}
    </nav>
  );
};