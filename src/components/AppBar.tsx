import { Flame, Home, ShoppingBag, User, Package, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { NotificationBell } from "./notifications/NotificationBell";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const AppBar = () => {
  const location = useLocation();

  const isGasServicesActive = ['/', '/order', '/refill', '/accessories'].includes(location.pathname);
  const isMarketplaceActive = ['/shop', '/gadgets'].includes(location.pathname) || location.pathname.startsWith('/shop/') || location.pathname.startsWith('/affiliate/');
  const isSafetyActive = location.pathname === '/gas-safety';
  const isAccountActive = location.pathname === '/account' || location.pathname === '/orders';

  return <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm outline-none focus:outline-none" style={{ outline: 'none' }}>
      <div className="flex items-center justify-between h-16 md:h-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="hover:text-accent transition-colors outline-none focus:outline-none" style={{ outline: 'none' }}>
          <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 text-transparent bg-clip-text tracking-wide font-serif">
            Flamia
          </span>
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-2">
          <NavigationMenu>
            <NavigationMenuList>
              {/* Gas Services Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={isGasServicesActive ? 'text-orange-600 bg-orange-50' : ''}>
                  <Flame className="w-4 h-4 mr-2" />
                  Gas Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-orange-50 hover:text-orange-600 focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Gas Cylinders</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Browse and order gas cylinders from top brands
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/order"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-orange-50 hover:text-orange-600 focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Order Gas</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Place a new gas cylinder order
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/refill"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-orange-50 hover:text-orange-600 focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Refill Service</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Refill your existing gas cylinder
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/accessories"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-orange-50 hover:text-orange-600 focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Accessories</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Gas stoves, regulators, and more
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Marketplace Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={isMarketplaceActive ? 'text-orange-600 bg-orange-50' : ''}>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Marketplace
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/shop"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-orange-50 hover:text-orange-600 focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">All Products</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Browse all marketplace products
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/gadgets"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-orange-50 hover:text-orange-600 focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Electronics & Gadgets</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Phones, laptops, and tech accessories
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Safety */}
              <NavigationMenuItem>
                <Link
                  to="/gas-safety"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors outline-none focus:outline-none ${
                    isSafetyActive 
                      ? 'text-orange-600 bg-orange-50' 
                      : 'text-muted-foreground hover:text-orange-600 hover:bg-orange-50'
                  }`}
                  style={{ outline: 'none' }}
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Safety</span>
                </Link>
              </NavigationMenuItem>

              {/* Account */}
              <NavigationMenuItem>
                <Link
                  to="/account"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors outline-none focus:outline-none ${
                    isAccountActive 
                      ? 'text-orange-600 bg-orange-50' 
                      : 'text-muted-foreground hover:text-orange-600 hover:bg-orange-50'
                  }`}
                  style={{ outline: 'none' }}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Account</span>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Notifications */}
        <div className="flex items-center gap-4">
          <NotificationBell />
        </div>
      </div>
    </header>;
};
export default AppBar;