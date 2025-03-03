
import { Flame } from "lucide-react";
import { Link } from "react-router-dom";

const AppBar = () => {
  return (
    <div className="w-full px-3 py-2 bg-white shadow-sm border-b flex items-center justify-between">
      <Link to="/" className="flex items-center gap-1">
        <Flame className="h-4 w-4 text-accent" />
        <span className="font-bold text-2xl sm:text-4xl">Flamia</span>
      </Link>
      <div className="flex items-center gap-3">
        
        
      </div>
    </div>
  );
};

export default AppBar;
