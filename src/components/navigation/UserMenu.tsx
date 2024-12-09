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
    relative flex flex-col items-center justify-center w-12 h-12
    ${isActive ? "text-flame-inner font-medium" : "text-muted-foreground"}
    ${isActive ? "after:content-[''] after:absolute after:w-[140%] after:h-[140%] after:rounded-full after:bg-transparent after:-z-10 after:animate-flame" : ""}
    transition-colors duration-200 hover:text-flame-middle group
  `;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={navItemClass}>
        <User className="h-4 w-4 mb-0.5" />
        <span className="text-[10px] leading-none">Account</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-100">
        {userName ? (
          <>
            <div className="px-2 py-3 text-center border-b border-gray-100 mb-2">
              <h3 className="font-medium text-lg text-foreground">{userName}</h3>
              <p className="text-sm text-muted-foreground">Manage your account</p>
            </div>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/admin/brands')} className="py-2">
                  Manage Brands
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/admin/hot-deals')} className="py-2">
                  Manage Hot Deals
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/admin/accessories')} className="py-2">
                  Manage Accessories
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="py-2 text-red-500 hover:text-red-600 hover:bg-red-50">
              Logout
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={() => navigate('/login')} className="py-2">
            Login
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};