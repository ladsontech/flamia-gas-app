import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, RefreshCw, Package, User, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('display_name, role')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        setUserName(userData?.display_name || session.user.email);
        setIsAdmin(userData?.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUserName(null);
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/');
      window.location.reload();
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const getNavItemClass = (isActive: boolean) => `
    relative flex flex-col items-center space-y-1 bg-white rounded-full p-2
    ${isActive ? "text-flame-inner font-medium" : "text-muted-foreground"}
    ${isActive ? "after:content-[''] after:absolute after:w-[120%] after:h-[120%] after:rounded-full after:bg-transparent after:-z-10 after:animate-flame" : ""}
    transition-colors duration-200 hover:text-flame-middle
  `;

  return (
    <nav className="fixed md:top-1/2 md:-translate-y-1/2 bottom-0 left-0 md:h-auto h-16 bg-background border-t md:border-t-0 md:border-r border-border md:w-16 w-full px-4 flex md:flex-col items-center justify-around md:py-8 md:space-y-8 z-50">
      <Link
        to="/"
        className={getNavItemClass(location.pathname === "/")}
      >
        <Home className="h-5 w-5" />
        <span className="text-xs">Home</span>
      </Link>
      <Link
        to="/refill"
        className={getNavItemClass(location.pathname === "/refill")}
      >
        <RefreshCw className="h-5 w-5" />
        <span className="text-xs">Refill</span>
      </Link>
      <Link
        to="/dashboard"
        className={getNavItemClass(location.pathname === "/dashboard")}
      >
        <Package className="h-5 w-5" />
        <span className="text-xs">My Orders</span>
      </Link>
      <Link
        to="/accessories"
        className={getNavItemClass(location.pathname === "/accessories")}
      >
        <ShoppingBag className="h-5 w-5" />
        <span className="text-xs">Accessories</span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger className={getNavItemClass(location.pathname === "/account")}>
          <User className="h-5 w-5" />
          <span className="text-xs">Account</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {userName ? (
            <>
              <DropdownMenuItem className="text-sm font-medium">
                {userName}
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin/brands')}>
                    Manage Brands
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/hot-deals')}>
                    Manage Hot Deals
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/accessories')}>
                    Manage Accessories
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
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