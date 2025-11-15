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
    console.log('[InstallButton] Initializing for store:', storeName);
    
    // Check if already installed
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const fullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      // @ts-ignore - webkit specific
      const isIosInstalled = window.navigator.standalone === true;
      
      const installed = standalone || fullscreen || isIosInstalled;
      console.log('[InstallButton] Install check:', { standalone, fullscreen, isIosInstalled, installed });
      setIsInstalled(installed);
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (event: Event) => {
      console.log('[InstallButton] ✅ beforeinstallprompt event received!', event);
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    console.log('[InstallButton] Adding beforeinstallprompt listener...');
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log('[InstallButton] ✅ App installed successfully!');
      setIsInstalled(true);
      setInstallPrompt(null);
      toast.success(`${storeName} app installed successfully!`);
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      console.log('[InstallButton] Cleaning up listeners');
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [storeName]);

  const handleInstall = async () => {
    console.log('[InstallButton] Install button clicked', { 
      hasPrompt: !!installPrompt, 
      isInstalled 
    });
    
    if (!installPrompt) {
      console.log('[InstallButton] No install prompt available');
      
      // Show instructions for iOS or already installed
      if (isInstalled) {
        console.log('[InstallButton] App already installed');
        toast.info('App is already installed!');
      } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        console.log('[InstallButton] iOS device detected');
        toast.info('Tap the Share button and select "Add to Home Screen"', {
          duration: 5000
        });
      } else {
        console.log('[InstallButton] Install not available');
        toast.info('Install option not available. Try using Chrome or Edge browser.');
      }
      return;
    }

    try {
      console.log('[InstallButton] Prompting install...');
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      console.log('[InstallButton] User choice:', choiceResult);

      if (choiceResult.outcome === 'accepted') {
        console.log('[InstallButton] ✅ User accepted install');
        toast.success(`Installing ${storeName} app...`);
        setIsInstalled(true);
      } else {
        console.log('[InstallButton] User dismissed install');
        toast.info('Installation cancelled');
      }

      setInstallPrompt(null);
    } catch (error) {
      console.error('[InstallButton] ❌ Install error:', error);
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

