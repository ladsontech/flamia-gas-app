
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [appName, setAppName] = useState("Flamia");
  const [appDescription, setAppDescription] = useState("Install our app for a better experience with offline support and quick access!");

  useEffect(() => {
    const isAppInstalled = () => {
      return window.matchMedia('(display-mode: standalone)').matches;
    };

    if (isAppInstalled()) {
      return;
    }

    // Update app name and description from manifest
    const updateAppInfo = () => {
      const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (manifestLink?.href) {
        fetch(manifestLink.href)
          .then(response => response.json())
          .then(manifest => {
            if (manifest.name) {
              setAppName(manifest.short_name || manifest.name);
            }
            if (manifest.description) {
              setAppDescription(`Install ${manifest.short_name || manifest.name} for a better experience with offline support and quick access!`);
            }
          })
          .catch(() => {
            // Keep defaults if fetch fails
          });
      }
    };

    updateAppInfo();
    // Update when manifest might change
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
          updateAppInfo();
        }
      });
    });

    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      observer.observe(manifestLink, { attributes: true });
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      updateAppInfo(); // Update app info when prompt is triggered
      setShowInstallDialog(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      observer.disconnect();
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        toast.success(`Installing ${appName} app`);
      }
      
      setInstallPrompt(null);
    } catch (error) {
      console.error('Install error:', error);
      toast.error("Installation failed");
    }
    
    setShowInstallDialog(false);
  };

  if (!installPrompt) return null;

  return (
    <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Install {appName} App</DialogTitle>
          <DialogDescription>
            {appDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setShowInstallDialog(false)}>
            Not Now
          </Button>
          <Button onClick={handleInstallClick}>
            Install
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallPWA;
