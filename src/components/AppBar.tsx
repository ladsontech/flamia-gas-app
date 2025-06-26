import { Flame, ChevronRight, User, LogOut, Bell, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import UpdateNotification from "./UpdateNotification";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "./ui/navigation-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
const AppBar = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [showUpdateNotice, setShowUpdateNotice] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);
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
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('userRole');
      navigate('/');
      toast({
        title: "Signed out",
        description: "You have been signed out successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Handle dismissing the update notice
  const dismissUpdate = () => {
    setShowUpdateNotice(false);
  };

  // Handle app update
  const handleAppUpdate = () => {
    window.location.reload();
  };
  const getUserDisplayName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Account';
  };
  return <>
      <div className="fixed top-0 left-0 right-0 z-50 w-full px-3 py-2 bg-white/95 backdrop-blur-sm shadow-sm border-b flex flex-col">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5">
            <img src="/images/icon.png" alt="Flamia Logo" className="w-7 h-7 animate-pulse" />
            <span className="font-bold text-2xl sm:text-4xl bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent font-serif tracking-wide">
              Flamia
            </span>
          </Link>

          <div className="flex items-center gap-4">
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
                    
                    <NavigationMenuContent>
                      <div className="p-4 w-[200px]">
                        <div className="flex flex-col gap-2">
                          <Button variant="ghost" size="sm" onClick={() => window.open('https://wa.me/256789572007', '_blank')} className="flex items-center justify-start text-sm">
                            <span>Chat with Expert</span>
                            <ChevronRight className="ml-auto h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center justify-start text-sm">
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

            {/* Mobile Notifications Button - Only visible on mobile when user is authenticated */}
            {user && <Button variant="ghost" size="sm" className="md:hidden">
                <Bell className="h-4 w-4" />
              </Button>}

            {/* Account/Orders Section */}
            {user ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline">Orders</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>}
          </div>
        </div>
        
        {/* Monthly update notification */}
        {showUpdateNotice && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: 'auto'
      }} exit={{
        opacity: 0,
        height: 0
      }} className="w-full mt-2 p-2 bg-accent/10 rounded-md flex items-center justify-between text-sm">
            <p className="text-accent font-medium">
              New gas prices and products available for this month!
            </p>
            <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-accent/20" onClick={dismissUpdate}>
              Dismiss
            </Button>
          </motion.div>}
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
    </>;
};
export default AppBar;