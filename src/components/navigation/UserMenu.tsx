import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const UserMenu = ({ isActive }: { isActive: boolean }) => {
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

  const navItemClass = `
    relative flex flex-col items-center space-y-1 bg-white rounded-full p-2
    ${isActive ? "text-flame-inner font-medium" : "text-muted-foreground"}
    ${isActive ? "after:content-[''] after:absolute after:w-[120%] after:h-[120%] after:rounded-full after:bg-transparent after:-z-10 after:animate-flame" : ""}
    transition-colors duration-200 hover:text-flame-middle
  `;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={navItemClass}>
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
          <DropdownMenuItem onClick={() => navigate('/login')}>
            Login
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};