import { Home, ShoppingBag, RefreshCw, UserRound, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
      return;
    }
    navigate("/login");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-around items-center">
      <Link
        to="/"
        className={`flex flex-col items-center ${
          location.pathname === "/" ? "text-accent" : "text-gray-500"
        }`}
      >
        <Home className="h-6 w-6" />
        <span className="text-xs mt-1">Home</span>
      </Link>

      <Link
        to="/refill"
        className={`flex flex-col items-center ${
          location.pathname === "/refill" ? "text-accent" : "text-gray-500"
        }`}
      >
        <RefreshCw className="h-6 w-6" />
        <span className="text-xs mt-1">Refill</span>
      </Link>

      <Link
        to="/dashboard"
        className={`flex flex-col items-center ${
          location.pathname === "/dashboard" ? "text-accent" : "text-gray-500"
        }`}
      >
        <ShoppingBag className="h-6 w-6" />
        <span className="text-xs mt-1">My Orders</span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`flex flex-col items-center ${
              location.pathname === "/account" ? "text-accent" : "text-gray-500"
            }`}
          >
            <UserRound className="h-6 w-6" />
            <span className="text-xs mt-1">Account</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};