
import React, { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";

interface AppVersion {
  version: string;
  buildDate: string;
  features: string[];
}

interface UpdateNotificationProps {
  onUpdate: () => void;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onUpdate }) => {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<AppVersion | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  
  useEffect(() => {
    // Check if the app is running in standalone mode (installed PWA)
    const checkIfInstalled = () => {
      // For iOS Safari
      const standaloneSafari = (window.navigator as any).standalone === true;
      // For other browsers
      const standaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      
      setIsStandalone(standaloneSafari || standaloneMode);
    };
    
    // Check when component mounts
    checkIfInstalled();
    
    // Listen for messages from the service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'APP_UPDATED' && isStandalone) {
        setUpdateInfo(event.data.version);
        setShowUpdateDialog(true);
        
        // Also show a toast for less intrusive notification
        toast({
          title: "New update available!",
          description: "Click to refresh and get the latest features.",
          action: (
            <Button variant="outline" size="sm" onClick={onUpdate}>
              Update
            </Button>
          ),
        });
      }
    };

    // Register the listener
    navigator.serviceWorker.addEventListener('message', handleMessage);

    // When this component mounts, check if we need to show the update notification
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller && isStandalone) {
      // Query the service worker for version info
      navigator.serviceWorker.controller.postMessage({
        type: 'GET_VERSION'
      });
    }

    // Clean up
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [onUpdate, isStandalone]);

  // Handle dismissing the update notice
  const dismissUpdate = () => {
    setShowUpdateDialog(false);
  };

  // Handle updating the app
  const handleUpdate = () => {
    dismissUpdate();
    onUpdate();
  };

  // Only show notifications if app is installed as PWA
  if (!isStandalone || !showUpdateDialog || !updateInfo) return null;

  return (
    <>
      {/* Floating notification for mobile */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-20 left-0 right-0 mx-auto w-max z-50 md:hidden"
      >
        <div 
          className="bg-accent text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2"
          onClick={handleUpdate}
        >
          <span>New version available!</span>
          <button className="bg-white text-accent text-xs px-2 py-1 rounded-full font-medium">
            Update now
          </button>
        </div>
      </motion.div>

      {/* Dialog for desktop and more detailed information */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Update Available</DialogTitle>
            <DialogDescription>
              Version {updateInfo.version} includes new features and improvements
            </DialogDescription>
          </DialogHeader>

          {updateInfo.features && updateInfo.features.length > 0 && (
            <div className="py-4">
              <h4 className="text-sm font-medium mb-2">What's new:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {updateInfo.features.map((feature, index) => (
                  <li key={index} className="text-sm">{feature}</li>
                ))}
              </ul>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={dismissUpdate}>Later</Button>
            <Button className="bg-accent hover:bg-accent/90" onClick={handleUpdate}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdateNotification;
