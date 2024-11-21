import { Home, ShoppingBag, RefreshCw, Store } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const BottomNav = () => {
  const location = useLocation();

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

      <Link
        to="/accessories"
        className={`flex flex-col items-center ${
          location.pathname === "/accessories" ? "text-accent" : "text-gray-500"
        }`}
      >
        <Store className="h-6 w-6" />
        <span className="text-xs mt-1">Accessories</span>
      </Link>
    </div>
  );
};