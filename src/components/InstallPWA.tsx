
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

  // Function to directly trigger installation on supported browsers
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
          } else {
            console.log("User dismissed the install prompt");
          }
          setInstallPrompt(null);
        })
        .catch(error => console.error('Install prompt error:', error));
      return;
    }
    
    // Special handling for iOS Safari - try to show "Add to Home" via a hidden iframe
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isIOSWithSafari = isIOS && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isIOSWithSafari) {
      // Since iOS doesn't allow automated add to home screen,
      // create a minimalist instruction that mimics installation
      const addToHomeIframe = document.createElement('div');
      addToHomeIframe.style.position = 'fixed';
      addToHomeIframe.style.top = '0';
      addToHomeIframe.style.left = '0';
      addToHomeIframe.style.width = '100%';
      addToHomeIframe.style.height = '100%';
      addToHomeIframe.style.backgroundColor = 'rgba(0,0,0,0.85)';
      addToHomeIframe.style.zIndex = '9999';
      addToHomeIframe.style.display = 'flex';
      addToHomeIframe.style.flexDirection = 'column';
      addToHomeIframe.style.alignItems = 'center';
      addToHomeIframe.style.justifyContent = 'center';
      addToHomeIframe.style.color = 'white';
      addToHomeIframe.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
      
      const closeButton = document.createElement('button');
      closeButton.innerText = '×';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '20px';
      closeButton.style.right = '20px';
      closeButton.style.fontSize = '24px';
      closeButton.style.color = 'white';
      closeButton.style.background = 'transparent';
      closeButton.style.border = 'none';
      closeButton.style.cursor = 'pointer';
      closeButton.onclick = () => document.body.removeChild(addToHomeIframe);
      
      const title = document.createElement('h2');
      title.innerText = 'Install Flamia Gas App';
      title.style.marginBottom = '15px';
      
      const instructionDiv = document.createElement('div');
      instructionDiv.style.display = 'flex';
      instructionDiv.style.flexDirection = 'column';
      instructionDiv.style.alignItems = 'center';
      instructionDiv.style.maxWidth = '300px';
      instructionDiv.style.textAlign = 'center';
      
      const step1 = document.createElement('p');
      step1.innerHTML = '1. Tap <strong>Share</strong> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>';
      step1.style.marginBottom = '10px';
      
      const step2 = document.createElement('p');
      step2.innerHTML = '2. Scroll down and tap <strong>Add to Home Screen</strong>';
      step2.style.marginBottom = '10px';
      
      const step3 = document.createElement('p');
      step3.innerHTML = '3. Tap <strong>Add</strong> in the top right';
      step3.style.marginBottom = '20px';
      
      instructionDiv.appendChild(step1);
      instructionDiv.appendChild(step2);
      instructionDiv.appendChild(step3);
      
      addToHomeIframe.appendChild(closeButton);
      addToHomeIframe.appendChild(title);
      addToHomeIframe.appendChild(instructionDiv);
      
      document.body.appendChild(addToHomeIframe);
      return;
    }

    // For Android Chrome, try to trigger the install banner
    const isAndroid = /Android/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    
    if (isAndroid && isChrome) {
      // Create a full-screen overlay with instructions
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.color = 'white';
      overlay.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
      
      const closeBtn = document.createElement('button');
      closeBtn.innerText = '×';
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '20px';
      closeBtn.style.right = '20px';
      closeBtn.style.fontSize = '24px';
      closeBtn.style.color = 'white';
      closeBtn.style.background = 'transparent';
      closeBtn.style.border = 'none';
      closeBtn.style.cursor = 'pointer';
      closeBtn.onclick = () => document.body.removeChild(overlay);
      
      const title = document.createElement('h2');
      title.innerText = 'Install Flamia Gas App';
      title.style.marginBottom = '15px';
      
      const instructions = document.createElement('div');
      instructions.style.display = 'flex';
      instructions.style.flexDirection = 'column';
      instructions.style.alignItems = 'center';
      instructions.style.maxWidth = '300px';
      instructions.style.textAlign = 'center';
      
      const step1 = document.createElement('p');
      step1.innerHTML = '1. Tap <strong>⋮</strong> (three dots) in the top right';
      step1.style.marginBottom = '10px';
      
      const step2 = document.createElement('p');
      step2.innerHTML = '2. Tap <strong>Add to Home screen</strong>';
      step2.style.marginBottom = '20px';
      
      instructions.appendChild(step1);
      instructions.appendChild(step2);
      
      overlay.appendChild(closeBtn);
      overlay.appendChild(title);
      overlay.appendChild(instructions);
      
      document.body.appendChild(overlay);
      return;
    }

    // Generic fallback for other browsers
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.color = 'white';
    overlay.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    
    const closeButton = document.createElement('button');
    closeButton.innerText = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '20px';
    closeButton.style.right = '20px';
    closeButton.style.fontSize = '24px';
    closeButton.style.color = 'white';
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => document.body.removeChild(overlay);
    
    const title = document.createElement('h2');
    title.innerText = 'Install Flamia Gas App';
    title.style.marginBottom = '15px';
    
    const message = document.createElement('p');
    message.innerText = 'Use your browser\'s "Add to Home Screen" option from the menu to install this app';
    message.style.maxWidth = '300px';
    message.style.textAlign = 'center';
    
    overlay.appendChild(closeButton);
    overlay.appendChild(title);
    overlay.appendChild(message);
    
    document.body.appendChild(overlay);
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
