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
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <nav className="fixed md:top-1/2 md:-translate-y-1/2 bottom-0 left-0 md:h-auto h-16 bg-background border-t md:border-t-0 md:border-r border-border md:w-16 w-full px-4 flex md:flex-col items-center justify-around md:py-8 md:space-y-8 z-50">
      <Link
        to="/"
        className={`flex flex-col items-center space-y-1 ${
          location.pathname === "/" ? "text-accent font-medium" : "text-muted-foreground"
        }`}
      >
        <Home className="h-5 w-5" />
        <span className="text-xs">Home</span>
      </Link>
      <Link
        to="/refill"
        className={`flex flex-col items-center space-y-1 ${
          location.pathname === "/refill" ? "text-accent font-medium" : "text-muted-foreground"
        }`}
      >
        <RefreshCw className="h-5 w-5" />
        <span className="text-xs">Refill</span>
      </Link>
      <Link
        to="/dashboard"
        className={`flex flex-col items-center space-y-1 ${
          location.pathname === "/dashboard" ? "text-accent font-medium" : "text-muted-foreground"
        }`}
      >
        <Package className="h-5 w-5" />
        <span className="text-xs">My Orders</span>
      </Link>
      <Link
        to="/accessories"
        className={`flex flex-col items-center space-y-1 ${
          location.pathname === "/accessories" ? "text-accent font-medium" : "text-muted-foreground"
        }`}
      >
        <ShoppingBag className="h-5 w-5" />
        <span className="text-xs">Accessories</span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger className={`flex flex-col items-center space-y-1 ${
          location.pathname === "/settings" ? "text-accent font-medium" : "text-muted-foreground"
        }`}>
          <Settings className="h-5 w-5" />
          <span className="text-xs">Settings</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {userEmail ? (
            <>
              <DropdownMenuItem className="text-sm text-muted-foreground">
                {userEmail}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={handleLogin}>
              Login
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};