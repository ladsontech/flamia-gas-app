
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

  useEffect(() => {
    const isAppInstalled = () => {
      return window.matchMedia('(display-mode: standalone)').matches;
    };

    if (isAppInstalled()) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setShowInstallDialog(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
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
        toast.success("Installing Flamia app");
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
          <DialogTitle>Install Flamia App</DialogTitle>
          <DialogDescription>
            Install our app for a better experience with offline support and quick access!
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
