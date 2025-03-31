
import { useEffect, useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { Wifi, WifiOff } from "lucide-react";

export function OnlineStatusMonitor() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Listen to the offline event
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Some features may be limited until connection is restored.",
        variant: "destructive",
        action: (
          <WifiOff className="h-5 w-5" />
        ),
      });
    };

    // Listen to the online event
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're back online",
        description: "All features are now available.",
        variant: "default",
        action: (
          <Wifi className="h-5 w-5" />
        ),
      });
    };

    // Add event listeners
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Also listen to our custom events from the service worker
    const handleAppStatus = (event: CustomEvent<{ isOnline: boolean }>) => {
      setIsOnline(event.detail.isOnline);
    };
    
    document.addEventListener('app-status', handleAppStatus as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('app-status', handleAppStatus as EventListener);
    };
  }, []);

  return null; // This component doesn't render anything, it just handles the online/offline status
}
