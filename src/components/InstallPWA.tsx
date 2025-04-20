
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const InstallPWA: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the app is already installed
    const isAppInstalled = () => {
      // For iOS Safari
      const standaloneSafari = (window.navigator as any).standalone === true;
      // For other browsers
      const standaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      
      return standaloneSafari || standaloneMode;
    };

    // Don't show install prompt if already installed
    if (isAppInstalled()) {
      return;
    }

    // Show install dialog on first visit or after 7 days
    const checkLastPrompt = () => {
      const lastPrompt = localStorage.getItem('lastInstallPrompt');
      const now = new Date().getTime();
      
      if (!lastPrompt || (now - parseInt(lastPrompt)) > 7 * 24 * 60 * 60 * 1000) {
        // Wait a bit before showing the dialog to not interrupt initial page load experience
        setTimeout(() => {
          setShowInstallDialog(true);
          localStorage.setItem('lastInstallPrompt', now.toString());
        }, 3000);
      }
    };
    
    checkLastPrompt();

    // Capture install prompt for browsers that support it
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault(); // Prevent automatic prompt
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if the app was installed
    window.addEventListener('appinstalled', () => {
      setInstallPrompt(null);
      setShowInstallDialog(false);
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
    if (installPrompt) {
      installPrompt.prompt();
      
      installPrompt.userChoice
        .then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            console.log("User accepted the install prompt");
            toast({
              title: "Installing",
              description: "Installing Flamia app on your device",
              duration: 3000,
            });
          } else {
            console.log("User dismissed the install prompt");
          }
          setInstallPrompt(null);
        })
        .catch(error => console.error('Install prompt error:', error));
    }
    
    // Close the dialog regardless
    setShowInstallDialog(false);
  };

  return (
    <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Install Flamia App</DialogTitle>
          <DialogDescription>
            Install our app for a better experience with offline support and quick access!
          </DialogDescription>
        </DialogHeader>
        
        {installPrompt ? (
          // Show native install button for browsers that support it
          <div className="py-4">
            <p className="mb-4">Install our app on your device for faster access and better experience even when offline.</p>
            <Button className="w-full" onClick={handleInstallClick}>
              Install Now
            </Button>
          </div>
        ) : (
          // iOS Safari Instructions (doesn't support beforeinstallprompt)
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
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowInstallDialog(false)}>Not Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InstallPWA;
