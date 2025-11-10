import { Flame, ShoppingBag, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { NotificationBell } from "./notifications/NotificationBell";

const AppBar = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      label: 'Gas Services',
      icon: Flame,
      isActive: ['/', '/order', '/refill', '/accessories'].includes(location.pathname)
    },
    {
      path: '/shop',
      label: 'Marketplace',
      icon: ShoppingBag,
      isActive: ['/shop', '/gadgets'].includes(location.pathname) || 
                location.pathname.startsWith('/shop/') || 
                location.pathname.startsWith('/affiliate/')
    },
    {
      path: '/account',
      label: 'Account',
      icon: User,
      isActive: location.pathname === '/account' || location.pathname === '/orders'
    }
  ];

  return <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm outline-none focus:outline-none" style={{ outline: 'none' }}>
      <div className="flex items-center justify-between h-16 md:h-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="hover:text-accent transition-colors outline-none focus:outline-none" style={{ outline: 'none' }}>
          <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 text-transparent bg-clip-text tracking-wide font-serif">
            Flamia
          </span>
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors outline-none focus:outline-none ${
                  item.isActive 
                    ? 'text-orange-600 bg-orange-50 font-medium' 
                    : 'text-muted-foreground hover:text-orange-600 hover:bg-orange-50'
                }`}
                style={{ outline: 'none' }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Notifications */}
        <div className="flex items-center gap-4">
          <NotificationBell />
        </div>
      </div>
    </header>;
};
export default AppBar;