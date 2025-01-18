import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

export const AdminAppBar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <Button 
        onClick={handleLogout} 
        variant="ghost" 
        size="sm"
        disabled={isLoading}
      >
        <LogOut className="h-5 w-5 mr-2" />
        {isLoading ? 'Logging out...' : 'Logout'}
      </Button>
    </div>
  );
};