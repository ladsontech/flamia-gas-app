
import { Flame } from "lucide-react";
import { Link } from "react-router-dom";

const AppBar = () => {
  return (
    <div className="w-full px-4 py-3 bg-white shadow-sm border-b flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-accent" />
        <span className="font-bold text-lg">Flamia</span>
      </Link>
      <div className="flex items-center gap-3">
        <Link to="/order" className="text-sm text-muted-foreground hover:text-accent transition-colors">
          Order
        </Link>
        <Link to="/refill" className="text-sm text-muted-foreground hover:text-accent transition-colors">
          Refill
        </Link>
      </div>
    </div>
  );
};

export default AppBar;
