
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const AdminNav = ({ onRefresh }: { onRefresh: () => void }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Flamia Admin</h1>
      <div className="flex space-x-2">
        <Button variant="outline" onClick={onRefresh}>
          Refresh
        </Button>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Back to Website
        </Button>
      </div>
    </div>
  );
};
