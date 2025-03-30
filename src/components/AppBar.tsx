
import { Flame, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import InstallPWA from "./InstallPWA";
import UpdateNotification from "./UpdateNotification";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "./ui/navigation-menu";

const AppBar = () => {
  // State for showing update notification
  const [showUpdateNotice, setShowUpdateNotice] = useState(false);

  useEffect(() => {
    // Check if we should show monthly update notification
    const checkMonthlyUpdate = () => {
      const lastUpdateCheck = localStorage.getItem('lastUpdateCheck');
      const currentDate = new Date().toISOString().slice(0, 7); // Get current year-month
      
      if (!lastUpdateCheck || lastUpdateCheck !== currentDate) {
        // New month or first visit
        setShowUpdateNotice(true);
        localStorage.setItem('lastUpdateCheck', currentDate);
      }
    };
    
    // Check after a short delay to ensure page is loaded
    const timer = setTimeout(() => {
      checkMonthlyUpdate();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle dismissing the update notice
  const dismissUpdate = () => {
    setShowUpdateNotice(false);
  };

  // Handle app update
  const handleAppUpdate = () => {
    window.location.reload();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full px-3 py-2 bg-white shadow-sm border-b flex flex-col">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5">
          <Flame className="h-7 w-7 text-accent animate-pulse" />
          <span className="font-bold text-2xl sm:text-4xl bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent font-serif tracking-wide">
            Flamia
          </span>
        </Link>

        {/* Desktop Navigation - Only visible on md and up screens */}
        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/refill">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Refill
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/accessories">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Accessories
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/safety">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Safety
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Help</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="p-4 w-[200px]">
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => window.open('https://wa.me/256789572007', '_blank')}
                        className="flex items-center justify-start text-sm"
                      >
                        <span>Chat with Expert</span>
                        <ChevronRight className="ml-auto h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center justify-start text-sm"
                      >
                        <span>FAQs</span>
                        <ChevronRight className="ml-auto h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Always show install button in header for non-installed users */}
        <div className="flex items-center gap-3">
          <InstallPWA />
        </div>
      </div>
      
      {/* Monthly update notification */}
      {showUpdateNotice && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="w-full mt-2 p-2 bg-accent/10 rounded-md flex items-center justify-between text-sm"
        >
          <p className="text-accent font-medium">
            New gas prices and products available for this month!
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 hover:bg-accent/20"
            onClick={dismissUpdate}
          >
            Dismiss
          </Button>
        </motion.div>
      )}

      {/* Add the update notification component */}
      <UpdateNotification onUpdate={handleAppUpdate} />
    </div>
  );
};

export default AppBar;
