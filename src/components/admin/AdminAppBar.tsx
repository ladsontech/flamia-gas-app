
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface AdminAppBarProps {
  onLogout: () => void;
}

const AdminAppBar = ({ onLogout }: AdminAppBarProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <Button 
        onClick={onLogout} 
        variant="ghost" 
        size="sm"
      >
        <LogOut className="h-5 w-5 mr-2" />
        Logout
      </Button>
    </div>
  );
};

export default AdminAppBar;
