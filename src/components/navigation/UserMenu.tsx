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
  const [isLoading, setIsLoading] = useState(false);

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
    try {
      setIsLoading(true);
      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session, just redirect to login
        navigate('/login');
        return;
      }

      // Proceed with logout
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Logged out successfully",
      });

      // Force a page reload to clear any stale state
      window.location.href = '/';
    } catch (error: any) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to log out. Please try again.",
        variant: "destructive",
      });
      
      // If we get a session not found error, force reload anyway
      if (error.message?.includes('session_not_found')) {
        window.location.href = '/';
      }
    } finally {
      setIsLoading(false);
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
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="py-2 text-red-500 hover:text-red-600 hover:bg-red-50"
              disabled={isLoading}
            >
              {isLoading ? 'Logging out...' : 'Logout'}
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