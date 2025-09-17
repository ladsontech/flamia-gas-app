import { Flame, Home, ShoppingBag, Utensils, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { NotificationBell } from "./notifications/NotificationBell";
import { CartButton } from "./cart/CartButton";
const AppBar = () => {
  const location = useLocation();

  // Desktop navigation items - updated to match bottom nav
  const navItems = [{
    path: '/',
    label: 'Home',
    icon: Home
  }, {
    path: '/gadgets',
    label: 'Gadgets',
    icon: ShoppingBag
  }, {
    path: '/gas-safety',
    label: 'Safety',
    icon: Flame
  }, {
    path: '/account',
    label: 'Account',
    icon: User
  }];
  return <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 md:h-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Word Logo */}
        <Link to="/" className="hover:text-accent transition-colors">
          <span className="text-3xl md:text-4xl font-bold text-accent tracking-wide font-serif">
            Flamia
          </span>
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-accent hover:bg-muted/50'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Notifications and Cart */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <CartButton />
          </div>
          <NotificationBell />
        </div>
      </div>
    </header>;
};
export default AppBar;