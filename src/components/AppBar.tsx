

import { Flame, Home, ShoppingBag, Utensils, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const AppBar = () => {
  const location = useLocation();

  // Desktop navigation items - updated to match bottom nav
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/gadgets', label: 'Gadgets', icon: ShoppingBag },
    { path: '/foods', label: 'Foods', icon: Utensils },
    { path: '/gas-safety', label: 'Safety', icon: Flame },
    { path: '/account', label: 'Account', icon: User },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 md:h-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Word Logo */}
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <span className="text-3xl md:text-4xl font-bold text-accent tracking-wide font-serif">
            Flamia
          </span>
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                location.pathname === item.path
                  ? 'text-accent bg-accent/10'
                  : 'text-gray-600 hover:text-accent hover:bg-accent/5'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Empty div to maintain layout balance */}
        <div className="w-10 md:w-12"></div>
      </div>
    </header>
  );
};

export default AppBar;

