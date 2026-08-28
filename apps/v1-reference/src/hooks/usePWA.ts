import { useState, useEffect, useCallback } from 'react';
import { pwaService } from '@/services/pwa.service';

export interface UsePWAResult {
  readonly updateAvailable: boolean;
  readonly isInstallable: boolean;
  readonly isStandalone: boolean;
  readonly applyUpdate: () => void;
  readonly promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  readonly checkForUpdates: () => void;
  readonly dismissUpdate: () => void;
}

export function usePWA(): UsePWAResult {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(() => pwaService.hasUpdate());
  const [isInstallable, setIsInstallable] = useState<boolean>(() => pwaService.isInstallable());
  const [isStandalone, setIsStandalone] = useState<boolean>(() => pwaService.isStandalone());

  useEffect(() => {
    setIsStandalone(pwaService.isStandalone());

    const unsubscribeUpdate = pwaService.onUpdateAvailable(() => {
      setUpdateAvailable(true);
    });

    const unsubscribeInstall = pwaService.onInstallableChange((canInstall) => {
      setIsInstallable(canInstall);
    });

    return () => {
      unsubscribeUpdate();
      unsubscribeInstall();
    };
  }, []);

  const applyUpdate = useCallback(() => {
    pwaService.applyUpdate();
  }, []);

  const promptInstall = useCallback(async () => {
    return pwaService.promptInstall();
  }, []);

  const checkForUpdates = useCallback(() => {
    pwaService.checkForUpdates();
  }, []);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  return {
    updateAvailable,
    isInstallable,
    isStandalone,
    applyUpdate,
    promptInstall,
    checkForUpdates,
    dismissUpdate,
  };
}
