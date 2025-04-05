
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

  useEffect(() => {
    // Check if the app is already installed as a PWA
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as SafariNavigator).standalone === true;
      setIsInstalled(isStandalone);
      console.log("PWA installed status:", isStandalone);
      return isStandalone;
    };

    // Check if on iOS Safari
    const detectIOSSafari = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isIOSWithSafari = isIOS && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      setIsIOSSafari(isIOSWithSafari);
      return isIOSWithSafari;
    };

    // Already installed, no need to continue
    if (checkIfInstalled()) {
      return;
    }

    // Check if it's iOS Safari
    detectIOSSafari();

    // Capture install prompt for other browsers
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
      toast({
        title: "App installed successfully",
        description: "Thank you for installing our app!",
      });
      console.log('PWA was installed successfully');
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Function to handle installation based on browser
  const handleInstallClick = () => {
    // For browsers that support the beforeinstallprompt event (Chrome, Edge, etc.)
    if (installPrompt) {
      installPrompt.prompt();
      
      installPrompt.userChoice
        .then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            console.log("User accepted the install prompt");
            toast({
              title: "Installation started",
              description: "The app is being installed to your device",
            });
          } else {
            console.log("User dismissed the install prompt");
            toast({
              title: "Installation cancelled",
              description: "You can install the app later if you change your mind",
            });
          }
          setInstallPrompt(null);
        })
        .catch(error => console.error('Install prompt error:', error));
      return;
    }
    
    // For iOS Safari and other browsers that don't support beforeinstallprompt
    if (isIOSSafari) {
      toast({
        title: "Installation instructions",
        description: "On iOS, tap the share button and select 'Add to Home Screen'",
        duration: 5000,
      });
    } else {
      toast({
        title: "Installation instructions",
        description: "Use your browser menu to find 'Add to Home Screen' or 'Install App'",
        duration: 5000,
      });
    }
  };

  // Don't show if already installed as PWA
  if (isInstalled) return null;
  
  return (
    <Button 
      className="flex items-center gap-2 bg-accent hover:bg-accent/90 transition-all shadow-md" 
      onClick={handleInstallClick}
    >
      <Download className="h-4 w-4" />
      Install App
    </Button>
  );
};

export default InstallPWA;
