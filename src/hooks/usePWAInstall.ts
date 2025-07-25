import { useState, useEffect } from 'react';

// Define the interface for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface CustomNavigator extends Navigator {
  standalone?: boolean;
}

export const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if the app is already installed
    window.addEventListener('appinstalled', () => {
      setIsPWAInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    });
    
    // Detect if the app is running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as CustomNavigator).standalone) {
      setIsPWAInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => {
        setIsPWAInstalled(true);
      });
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsPWAInstalled(true);
    } else {
      console.log('User dismissed the install prompt');
    }
    setInstallPrompt(null);
    setIsInstallable(false);
  };

  return { isInstallable, isPWAInstalled, handleInstallClick };
}; 