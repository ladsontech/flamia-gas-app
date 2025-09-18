import * as React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { NotificationDropdown } from "./NotificationDropdown";
import { useNotifications } from "@/hooks/useNotifications";

export const NotificationBell = () => {
  const [open, setOpen] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);
  
  // Protect against SSR and external script interference
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const initializeComponent = () => {
      requestAnimationFrame(() => {
        setIsClient(true);
        setTimeout(() => setIsReady(true), 50);
      });
    };
    
    initializeComponent();
  }, []);

  // Only use hooks after client-side initialization
  const notificationHookResult = React.useMemo(() => {
    if (!isClient || !isReady) {
      return {
        notifications: [],
        unreadCount: 0,
        markAsRead: () => {},
        clearAll: () => {}
      };
    }
    
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useNotifications();
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return {
        notifications: [],
        unreadCount: 0,
        markAsRead: () => {},
        clearAll: () => {}
      };
    }
  }, [isClient, isReady]);

  const { notifications, unreadCount, markAsRead, clearAll } = notificationHookResult;

  // Don't render until fully initialized
  if (!isClient || !isReady) {
    return (
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 backdrop-blur-md bg-background/80" align="end">
        <NotificationDropdown
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onClearAll={clearAll}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
};