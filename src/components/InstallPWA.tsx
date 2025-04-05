
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
    
    // Special handling for iOS Safari
    if (isIOSSafari) {
      showIOSInstallInstructions();
      return;
    }

    // For Android browsers and others that don't trigger beforeinstallprompt
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isAndroid) {
      showAndroidInstallInstructions();
    } else {
      // Generic fallback for other browsers
      showGenericInstallInstructions();
    }
  };

  // Function to display iOS install instructions
  const showIOSInstallInstructions = () => {
    const modalContainer = document.createElement('div');
    modalContainer.className = 'ios-install-modal';
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0,0,0,0.85)';
    modalContainer.style.zIndex = '9999';
    modalContainer.style.display = 'flex';
    modalContainer.style.flexDirection = 'column';
    modalContainer.style.alignItems = 'center';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.padding = '20px';
    
    const content = document.createElement('div');
    content.style.backgroundColor = 'white';
    content.style.borderRadius = '12px';
    content.style.padding = '20px';
    content.style.maxWidth = '350px';
    content.style.textAlign = 'center';
    content.style.position = 'relative';
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '15px';
    closeButton.style.fontSize = '24px';
    closeButton.style.border = 'none';
    closeButton.style.background = 'transparent';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#666';
    closeButton.onclick = () => document.body.removeChild(modalContainer);
    
    const title = document.createElement('h3');
    title.textContent = 'Install Flamia Gas App';
    title.style.fontSize = '18px';
    title.style.color = '#333';
    title.style.margin = '0 0 15px 0';
    title.style.fontWeight = 'bold';
    
    const steps = document.createElement('div');
    steps.style.textAlign = 'left';
    
    const step1 = document.createElement('div');
    step1.style.margin = '15px 0';
    step1.style.display = 'flex';
    step1.style.alignItems = 'flex-start';
    
    const step1Number = document.createElement('div');
    step1Number.textContent = '1';
    step1Number.style.backgroundColor = '#FF4D00';
    step1Number.style.color = 'white';
    step1Number.style.width = '24px';
    step1Number.style.height = '24px';
    step1Number.style.borderRadius = '50%';
    step1Number.style.display = 'flex';
    step1Number.style.alignItems = 'center';
    step1Number.style.justifyContent = 'center';
    step1Number.style.marginRight = '10px';
    step1Number.style.flexShrink = '0';
    
    const step1Text = document.createElement('div');
    step1Text.innerHTML = 'Tap the <b>Share</b> button <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-left:5px"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg> at the bottom of the screen';
    
    step1.appendChild(step1Number);
    step1.appendChild(step1Text);
    
    const step2 = document.createElement('div');
    step2.style.margin = '15px 0';
    step2.style.display = 'flex';
    step2.style.alignItems = 'flex-start';
    
    const step2Number = document.createElement('div');
    step2Number.textContent = '2';
    step2Number.style.backgroundColor = '#FF4D00';
    step2Number.style.color = 'white';
    step2Number.style.width = '24px';
    step2Number.style.height = '24px';
    step2Number.style.borderRadius = '50%';
    step2Number.style.display = 'flex';
    step2Number.style.alignItems = 'center';
    step2Number.style.justifyContent = 'center';
    step2Number.style.marginRight = '10px';
    step2Number.style.flexShrink = '0';
    
    const step2Text = document.createElement('div');
    step2Text.innerHTML = 'Scroll down and tap <b>Add to Home Screen</b>';
    
    step2.appendChild(step2Number);
    step2.appendChild(step2Text);
    
    const step3 = document.createElement('div');
    step3.style.margin = '15px 0';
    step3.style.display = 'flex';
    step3.style.alignItems = 'flex-start';
    
    const step3Number = document.createElement('div');
    step3Number.textContent = '3';
    step3Number.style.backgroundColor = '#FF4D00';
    step3Number.style.color = 'white';
    step3Number.style.width = '24px';
    step3Number.style.height = '24px';
    step3Number.style.borderRadius = '50%';
    step3Number.style.display = 'flex';
    step3Number.style.alignItems = 'center';
    step3Number.style.justifyContent = 'center';
    step3Number.style.marginRight = '10px';
    step3Number.style.flexShrink = '0';
    
    const step3Text = document.createElement('div');
    step3Text.innerHTML = 'Tap <b>Add</b> in the top right corner';
    
    step3.appendChild(step3Number);
    step3.appendChild(step3Text);
    
    const note = document.createElement('p');
    note.textContent = 'Once installed, you can access the app from your home screen even when offline.';
    note.style.fontSize = '12px';
    note.style.color = '#666';
    note.style.marginTop = '15px';
    
    // Assemble the modal
    steps.appendChild(step1);
    steps.appendChild(step2);
    steps.appendChild(step3);
    
    content.appendChild(closeButton);
    content.appendChild(title);
    content.appendChild(steps);
    content.appendChild(note);
    
    modalContainer.appendChild(content);
    document.body.appendChild(modalContainer);
  };

  // Function to display Android install instructions
  const showAndroidInstallInstructions = () => {
    const modalContainer = document.createElement('div');
    modalContainer.className = 'android-install-modal';
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0,0,0,0.85)';
    modalContainer.style.zIndex = '9999';
    modalContainer.style.display = 'flex';
    modalContainer.style.alignItems = 'center';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.padding = '20px';
    
    const content = document.createElement('div');
    content.style.backgroundColor = 'white';
    content.style.borderRadius = '12px';
    content.style.padding = '20px';
    content.style.maxWidth = '350px';
    content.style.textAlign = 'center';
    content.style.position = 'relative';
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '15px';
    closeButton.style.fontSize = '24px';
    closeButton.style.border = 'none';
    closeButton.style.background = 'transparent';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#666';
    closeButton.onclick = () => document.body.removeChild(modalContainer);
    
    const title = document.createElement('h3');
    title.textContent = 'Install Flamia Gas App';
    title.style.fontSize = '18px';
    title.style.color = '#333';
    title.style.margin = '0 0 15px 0';
    title.style.fontWeight = 'bold';
    
    const steps = document.createElement('div');
    steps.style.textAlign = 'left';
    
    const step1 = document.createElement('div');
    step1.style.margin = '15px 0';
    step1.style.display = 'flex';
    step1.style.alignItems = 'flex-start';
    
    const step1Number = document.createElement('div');
    step1Number.textContent = '1';
    step1Number.style.backgroundColor = '#FF4D00';
    step1Number.style.color = 'white';
    step1Number.style.width = '24px';
    step1Number.style.height = '24px';
    step1Number.style.borderRadius = '50%';
    step1Number.style.display = 'flex';
    step1Number.style.alignItems = 'center';
    step1Number.style.justifyContent = 'center';
    step1Number.style.marginRight = '10px';
    step1Number.style.flexShrink = '0';
    
    const step1Text = document.createElement('div');
    step1Text.innerHTML = 'Tap the menu button <b>⋮</b> in the top right corner';
    
    step1.appendChild(step1Number);
    step1.appendChild(step1Text);
    
    const step2 = document.createElement('div');
    step2.style.margin = '15px 0';
    step2.style.display = 'flex';
    step2.style.alignItems = 'flex-start';
    
    const step2Number = document.createElement('div');
    step2Number.textContent = '2';
    step2Number.style.backgroundColor = '#FF4D00';
    step2Number.style.color = 'white';
    step2Number.style.width = '24px';
    step2Number.style.height = '24px';
    step2Number.style.borderRadius = '50%';
    step2Number.style.display = 'flex';
    step2Number.style.alignItems = 'center';
    step2Number.style.justifyContent = 'center';
    step2Number.style.marginRight = '10px';
    step2Number.style.flexShrink = '0';
    
    const step2Text = document.createElement('div');
    step2Text.innerHTML = 'Select <b>Install app</b> or <b>Add to Home screen</b>';
    
    step2.appendChild(step2Number);
    step2.appendChild(step2Text);
    
    const note = document.createElement('p');
    note.textContent = 'Once installed, you can access the app from your home screen even when offline.';
    note.style.fontSize = '12px';
    note.style.color = '#666';
    note.style.marginTop = '15px';
    
    // Assemble the modal
    steps.appendChild(step1);
    steps.appendChild(step2);
    
    content.appendChild(closeButton);
    content.appendChild(title);
    content.appendChild(steps);
    content.appendChild(note);
    
    modalContainer.appendChild(content);
    document.body.appendChild(modalContainer);
  };

  // Function to display generic install instructions
  const showGenericInstallInstructions = () => {
    const modalContainer = document.createElement('div');
    modalContainer.className = 'generic-install-modal';
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0,0,0,0.85)';
    modalContainer.style.zIndex = '9999';
    modalContainer.style.display = 'flex';
    modalContainer.style.alignItems = 'center';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.padding = '20px';
    
    const content = document.createElement('div');
    content.style.backgroundColor = 'white';
    content.style.borderRadius = '12px';
    content.style.padding = '20px';
    content.style.maxWidth = '350px';
    content.style.textAlign = 'center';
    content.style.position = 'relative';
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '15px';
    closeButton.style.fontSize = '24px';
    closeButton.style.border = 'none';
    closeButton.style.background = 'transparent';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#666';
    closeButton.onclick = () => document.body.removeChild(modalContainer);
    
    const title = document.createElement('h3');
    title.textContent = 'Install Flamia Gas App';
    title.style.fontSize = '18px';
    title.style.color = '#333';
    title.style.margin = '0 0 15px 0';
    title.style.fontWeight = 'bold';
    
    const message = document.createElement('p');
    message.textContent = 'Use your browser\'s menu to find the "Add to Home Screen" or "Install" option to download this app to your device.';
    message.style.margin = '10px 0';
    
    const note = document.createElement('p');
    note.textContent = 'Once installed, you can access the app from your home screen even when offline.';
    note.style.fontSize = '12px';
    note.style.color = '#666';
    note.style.marginTop = '15px';
    
    content.appendChild(closeButton);
    content.appendChild(title);
    content.appendChild(message);
    content.appendChild(note);
    
    modalContainer.appendChild(content);
    document.body.appendChild(modalContainer);
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
