import { Button } from "@/components/ui/button";
import { Grid, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AdminAppBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <span className="font-semibold">Admin Dashboard</span>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/brands')}
            className="flex items-center gap-2"
          >
            <Grid className="h-4 w-4" />
            Brands
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};