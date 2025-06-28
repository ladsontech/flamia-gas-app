import { Flame, Home, ShoppingBag, RotateCw } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const AppBar = () => {
  const location = useLocation();

  // Desktop navigation items
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/refill', label: 'Refill', icon: RotateCw },
    { path: '/accessories', label: 'Accessories', icon: ShoppingBag },
    { path: '/safety', label: 'Safety', icon: Flame },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img 
            src="/images/icon.png" 
            alt="Flamia" 
            className="w-10 h-10" 
          />
          <span className="text-2xl font-bold text-accent font-serif">
            Flamia
          </span>
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'text-accent bg-accent/10'
                  : 'text-gray-600 hover:text-accent hover:bg-accent/5'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Empty div to maintain layout balance */}
        <div className="w-10"></div>
      </div>
    </header>
  );
};

export default AppBar;