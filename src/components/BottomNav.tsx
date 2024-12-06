import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, RefreshCw, Package, User, ShoppingBag } from "lucide-react";
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
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('display_name')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        // If we got user data, use it, otherwise fallback to email
        setUserName(userData?.display_name || session.user.email);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      // Fallback to null if there's an error
      setUserName(null);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/');
      window.location.reload(); // Force reload to clear any cached states
    }
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
          location.pathname === "/account" ? "text-accent font-medium" : "text-muted-foreground"
        }`}>
          <User className="h-5 w-5" />
          <span className="text-xs">Account</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {userName ? (
            <>
              <DropdownMenuItem className="text-sm font-medium">
                {userName}
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