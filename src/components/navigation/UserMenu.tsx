import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

interface UserMenuProps {
  isActive: boolean;
  isAdmin: boolean | null;
}

export const UserMenu = ({ isActive }: UserMenuProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('display_name')
            .eq('id', session.user.id)
            .maybeSingle();
        
          if (error) {
            console.error('Error fetching user data:', error);
            toast({
              title: "Error",
              description: "Failed to fetch user data",
              variant: "destructive",
            });
            return;
          }

          setUserName(userData?.display_name || session.user.email);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setUserName(null);
      }
    };

    checkAuth();
  }, [toast]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/');
      window.location.reload();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 hover:bg-accent/10 rounded-full transition-colors">
        <MoreVertical className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-100">
        {userName ? (
          <>
            <div className="px-2 py-3 text-center border-b border-gray-100 mb-2">
              <h3 className="font-medium text-lg text-foreground">{userName}</h3>
            </div>
            
            <DropdownMenuItem onClick={() => navigate('/dashboard')} className="py-2">
              My Orders
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/order')} className="py-2">
              Place Order
            </DropdownMenuItem>
            
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