
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

// Define a type for the Safari-specific navigator property
interface SafariNavigator extends Navigator {
  standalone?: boolean;
}

const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [showIOSDialog, setShowIOSDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the app is already installed as a PWA
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as SafariNavigator).standalone === true;
      setIsInstalled(isStandalone);
      return isStandalone;
    };

    // Already installed, no need to continue
    if (checkIfInstalled()) {
      return;
    }

    // Detect browser environment
    const detectBrowserEnvironment = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      setIsIOSSafari(isIOS && isSafari);
    };

    detectBrowserEnvironment();

    // Capture install prompt for browsers that support it
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault(); // Prevent automatic prompt
      setInstallPrompt(event as BeforeInstallPromptEvent); // Save the event for later use
      console.log('Install prompt captured and ready');
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if the app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      console.log('PWA was installed successfully');
      toast({
        title: "Success!",
        description: "App was installed successfully",
        duration: 3000,
      });
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [toast]);

  // Function to handle installation
  const handleInstallClick = () => {
    // For browsers that support the beforeinstallprompt event (Chrome, Edge, etc.)
    if (installPrompt) {
      installPrompt.prompt();
      
      installPrompt.userChoice
        .then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            console.log("User accepted the install prompt");
          } else {
            console.log("User dismissed the install prompt");
          }
          setInstallPrompt(null);
        })
        .catch(error => console.error('Install prompt error:', error));
      return;
    }
    
    // For iOS Safari - show detailed installation instructions in a dialog
    if (isIOSSafari) {
      setShowIOSDialog(true);
      return;
    }

    // For other browsers without beforeinstallprompt support
    // Try to use the display-mode media query to check if the browser supports installation
    if ('standalone' in window.navigator || window.matchMedia('(display-mode: standalone)').matches) {
      toast({
        title: "Installation",
        description: "Your browser doesn't support automatic installation. Please install from your browser menu.",
        duration: 5000,
      });
    } else {
      // For browsers where we can directly open the manifest
      try {
        const manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = '/manifest.json';
        document.head.appendChild(manifestLink);
        
        toast({
          title: "Installing",
          description: "Attempting to install the app...",
          duration: 3000,
        });
      } catch (err) {
        console.error('Error triggering install:', err);
        toast({
          title: "Installation",
          description: "Please add to home screen using your browser menu",
          duration: 5000,
        });
      }
    }
  };

  // Don't show if already installed as PWA
  if (isInstalled) return null;
  
  return (
    <>
      <Button 
        className="flex items-center gap-2 bg-accent hover:bg-accent/90 transition-all shadow-md" 
        onClick={handleInstallClick}
      >
        <Download className="h-4 w-4" />
        Install App
      </Button>

      {/* iOS Safari Installation Dialog */}
      <Dialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Install on iOS</DialogTitle>
            <DialogDescription>
              Follow these steps to add this app to your home screen:
            </DialogDescription>
          </DialogHeader>
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
            <Button variant="outline" onClick={() => setShowIOSDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallPWA;
