
import { Flame, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import UpdateNotification from "./UpdateNotification";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "./ui/navigation-menu";

const AppBar = () => {
  // State for showing update notification
  const [showUpdateNotice, setShowUpdateNotice] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);

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
    <>
      <div className="fixed top-0 left-0 right-0 z-50 w-full px-3 py-2 bg-white/95 backdrop-blur-sm shadow-sm border-b flex flex-col">
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
      </div>

      {/* Install PWA Dialog */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Install Flamia App</DialogTitle>
            <DialogDescription>
              Install our app for a better experience with offline support and quick access!
            </DialogDescription>
          </DialogHeader>
          
          {/* iOS Safari Instructions */}
          <div className="py-4 space-y-4">
            <div className="flex items-start gap-2">
              <div className="bg-accent rounded-full w-6 h-6 flex items-center justify-center text-white shrink-0">1</div>
              <p>Tap the Share button <span className="px-2 py-1 rounded bg-muted inline-block">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor" />
                </svg>
              </span> at the bottom of your screen</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-accent rounded-full w-6 h-6 flex items-center justify-center text-white shrink-0">2</div>
              <p>Scroll down and tap "Add to Home Screen"</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-accent rounded-full w-6 h-6 flex items-center justify-center text-white shrink-0">3</div>
              <p>Tap "Add" in the top right corner</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInstallDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppBar;
