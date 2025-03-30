
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
  const [isInstallable, setIsInstallable] = useState(true); // Default to true to show button

  useEffect(() => {
    // Check if the app is already installed as a PWA
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as SafariNavigator).standalone === true;
      setIsInstalled(isStandalone);
      console.log("PWA installed status:", isStandalone);
      return isStandalone;
    };

    // Check if PWA is supported
    const checkIfInstallable = () => {
      // If on iOS Safari, PWA is always technically installable
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isIOSWithSafari = isIOS && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      
      // For iOS, we'll show a custom install button with instructions
      if (isIOSWithSafari) {
        console.log("iOS Safari detected, showing install instructions");
        return true;
      }

      // For other browsers, we show the button anyway
      console.log("Browser supports installation:", 'BeforeInstallPromptEvent' in window);
      return true; // Always return true to show the button
    };

    // Check installed state first
    if (checkIfInstalled()) {
      // Already installed, no need to continue
      return;
    }

    // Check if installable and set state
    setIsInstallable(checkIfInstallable());

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

  const handleInstallClick = () => {
    // For browsers that support the beforeinstallprompt event
    if (installPrompt) {
      // Trigger the install prompt immediately
      installPrompt.prompt();
      
      // Track user's choice
      installPrompt.userChoice
        .then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            console.log("User accepted the install prompt");
            toast({
              title: "Installing app...",
              description: "Adding Flamia Gas to your home screen",
              duration: 3000,
            });
          } else {
            console.log("User dismissed the install prompt");
          }
          setInstallPrompt(null);
        })
        .catch(error => console.error('Install prompt error:', error));
      return;
    }
    
    // Special handling for iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isIOSWithSafari = isIOS && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isIOSWithSafari) {
      // Show clear instructions with visual cues for iOS
      toast({
        title: "Add to Home Screen",
        description: "1. Tap the Share button at the bottom of your screen\n2. Scroll and tap 'Add to Home Screen'\n3. Tap 'Add' to confirm",
        duration: 8000,
      });
      return;
    }

    // For other browsers without direct install support
    // Check if it might be an Android device
    const isAndroid = /Android/.test(navigator.userAgent);
    if (isAndroid) {
      toast({
        title: "Install this app",
        description: "Open in Chrome and tap 'Add to Home Screen' from the menu (three dots)",
        duration: 5000,
      });
      return;
    }

    // Generic fallback for other browsers
    toast({
      title: "Install this app",
      description: "Use your browser's 'Add to Home Screen' or 'Install' option from the menu",
      duration: 5000,
    });
  };

  // Don't show if already installed as PWA
  if (isInstalled) return null;
  
  // Always show install button for web users
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
