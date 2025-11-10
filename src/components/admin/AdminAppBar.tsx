
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface AdminAppBarProps {
  onLogout: () => void;
}

const AdminAppBar = ({ onLogout }: AdminAppBarProps) => {
  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b shadow-sm px-3 py-2 sm:px-4 sm:py-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-base sm:text-xl font-semibold truncate">Admin Dashboard</h1>
        <Button 
          onClick={onLogout} 
          variant="ghost" 
          size="sm"
          className="h-8"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminAppBar;
