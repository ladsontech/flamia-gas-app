import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface InstallButtonProps {
  storeName: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showText?: boolean;
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export const InstallButton: React.FC<InstallButtonProps> = ({
  storeName,
  className = '',
  variant = 'default',
  size = 'default',
  showText = true
}) => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const fullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      // @ts-ignore - webkit specific
      const isIosInstalled = window.navigator.standalone === true;
      
      setIsInstalled(standalone || fullscreen || isIosInstalled);
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      toast.success(`${storeName} app installed successfully!`);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [storeName]);

  const handleInstall = async () => {
    if (!installPrompt) {
      // Show instructions for iOS or already installed
      if (isInstalled) {
        toast.info('App is already installed!');
      } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        toast.info('Tap the Share button and select "Add to Home Screen"', {
          duration: 5000
        });
      } else {
        toast.info('Install option not available. Try using Chrome or Edge browser.');
      }
      return;
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        toast.success(`Installing ${storeName} app...`);
        setIsInstalled(true);
      } else {
        toast.info('Installation cancelled');
      }

      setInstallPrompt(null);
    } catch (error) {
      console.error('Install error:', error);
      toast.error('Failed to install app');
    }
  };

  if (isInstalled) {
    return (
      <Button
        variant="outline"
        size={size}
        className={`${className} cursor-default opacity-75`}
        disabled
      >
        <CheckCircle2 className="w-4 h-4 mr-2" />
        {showText && 'App Installed'}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleInstall}
      className={className}
    >
      <Download className="w-4 h-4 mr-2" />
      {showText && 'Install App'}
    </Button>
  );
};

