
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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
  const [isAndroid, setIsAndroid] = useState(false);

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
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      const isIOSWithSafari = isIOS && isSafari;
      setIsIOSSafari(isIOSWithSafari);
      return isIOSWithSafari;
    };

    // Check if on Android
    const detectAndroid = () => {
      const isAndroid = /Android/.test(navigator.userAgent);
      setIsAndroid(isAndroid);
      return isAndroid;
    };

    // Already installed, no need to continue
    if (checkIfInstalled()) {
      return;
    }

    // Check device platforms
    detectIOSSafari();
    detectAndroid();

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
          } else {
            console.log("User dismissed the install prompt");
          }
          setInstallPrompt(null);
        })
        .catch(error => console.error('Install prompt error:', error));
      return;
    }
    
    // For iOS Safari - direct users to use the Safari "Add to Home Screen" feature
    if (isIOSSafari) {
      // Open a small modal or floating message with instructions
      const instructionElement = document.createElement('div');
      instructionElement.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); 
                    background: white; padding: 15px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    max-width: 90%; z-index: 10000; text-align: center;">
          <div style="font-weight: bold; margin-bottom: 8px;">Install on iOS</div>
          <div style="font-size: 14px; margin-bottom: 12px;">Tap the share icon <span style="font-size: 16px;">⎙</span> then select "Add to Home Screen"</div>
          <button id="close-install-instructions" style="background: #FF4D00; color: white; border: none; 
                  padding: 8px 16px; border-radius: 4px; font-weight: 500; cursor: pointer;">Got it</button>
        </div>
      `;
      document.body.appendChild(instructionElement);
      
      document.getElementById('close-install-instructions')?.addEventListener('click', () => {
        document.body.removeChild(instructionElement);
      });
    } else if (isAndroid) {
      // For Android browsers without beforeinstallprompt support
      window.location.href = "intent://flamia.store/#Intent;scheme=https;package=app.lovable.flamia;end";
    } else {
      // For other browsers, show browser menu instructions
      const instructionElement = document.createElement('div');
      instructionElement.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); 
                    background: white; padding: 15px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    max-width: 90%; z-index: 10000; text-align: center;">
          <div style="font-weight: bold; margin-bottom: 8px;">Install App</div>
          <div style="font-size: 14px; margin-bottom: 12px;">Click on the menu in your browser and select "Install App" or "Add to Home Screen"</div>
          <button id="close-install-instructions" style="background: #FF4D00; color: white; border: none; 
                  padding: 8px 16px; border-radius: 4px; font-weight: 500; cursor: pointer;">Got it</button>
        </div>
      `;
      document.body.appendChild(instructionElement);
      
      document.getElementById('close-install-instructions')?.addEventListener('click', () => {
        document.body.removeChild(instructionElement);
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
