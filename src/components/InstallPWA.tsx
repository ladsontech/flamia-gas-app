
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

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
    
    // For iOS Safari - show a toast with installation instructions
    if (isIOSSafari) {
      toast({
        title: "Install on iOS",
        description: "Tap the share button and select 'Add to Home Screen'",
        duration: 5000,
      });
    } else {
      // For other browsers that don't support beforeinstallprompt
      toast({
        title: "Install App",
        description: "Use your browser's menu option to install this app",
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
