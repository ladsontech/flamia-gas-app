
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Capture install prompt for browsers that support it
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault(); // Prevent automatic prompt
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if the app was installed
    window.addEventListener('appinstalled', () => {
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
    }
  };
  
  // Expose the installation handler to parent components
  return { handleInstallClick, hasInstallPrompt: !!installPrompt };
};

export default InstallPWA;
