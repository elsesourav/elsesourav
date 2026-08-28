export type PWAUpdateListener = () => void;
export type PWAInstallListener = (canInstall: boolean) => void;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export class PWAService {
  private registration: ServiceWorkerRegistration | null = null;
  private updateListeners = new Set<PWAUpdateListener>();
  private installListeners = new Set<PWAInstallListener>();
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isUpdatePending = false;

  constructor() {
    this.initInstallPromptListener();
  }

  /**
   * Registers the service worker in browser environments
   */
  public register(): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Only register service worker in production or when explicitly enabled
    if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_SW === 'true') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            this.registration = reg;
            this.listenForUpdates(reg);
          })
          .catch((err) => {
            console.warn('[PWA] Service worker registration failed:', err);
          });
      });
    }
  }

  /**
   * Manually check for service worker updates
   */
  public checkForUpdates(): void {
    if (this.registration) {
      this.registration.update().catch((err) => {
        console.warn('[PWA] Check for updates failed:', err);
      });
    }
  }

  /**
   * Tells the waiting service worker to skip waiting and activate
   */
  public applyUpdate(): void {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // When controller changes, reload the window to use the new version
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }

  /**
   * Triggers the native browser install prompt
   */
  public async promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!this.deferredPrompt) {
      return 'unavailable';
    }

    try {
      await this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      this.notifyInstallListeners(false);
      return choice.outcome;
    } catch {
      return 'unavailable';
    }
  }

  /**
   * Returns whether the application is running in standalone PWA mode
   */
  public isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((navigator as unknown as { standalone?: boolean }).standalone)
    );
  }

  public isInstallable(): boolean {
    return Boolean(this.deferredPrompt);
  }

  public hasUpdate(): boolean {
    return this.isUpdatePending;
  }

  public onUpdateAvailable(listener: PWAUpdateListener): () => void {
    this.updateListeners.add(listener);
    if (this.isUpdatePending) {
      listener();
    }
    return () => {
      this.updateListeners.delete(listener);
    };
  }

  public onInstallableChange(listener: PWAInstallListener): () => void {
    this.installListeners.add(listener);
    listener(Boolean(this.deferredPrompt));
    return () => {
      this.installListeners.delete(listener);
    };
  }

  private listenForUpdates(reg: ServiceWorkerRegistration): void {
    // 1. If a worker is already waiting, trigger update immediately
    if (reg.waiting) {
      this.isUpdatePending = true;
      this.notifyUpdateListeners();
      return;
    }

    // 2. Listen for new workers being installed
    reg.addEventListener('updatefound', () => {
      const installingWorker = reg.installing;
      if (!installingWorker) return;

      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version is installed and waiting
          this.isUpdatePending = true;
          this.notifyUpdateListeners();
        }
      });
    });
  }

  private initInstallPromptListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.notifyInstallListeners(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.notifyInstallListeners(false);
    });
  }

  private notifyUpdateListeners(): void {
    this.updateListeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.warn('[PWA] Error in update listener:', e);
      }
    });
  }

  private notifyInstallListeners(canInstall: boolean): void {
    this.installListeners.forEach((listener) => {
      try {
        listener(canInstall);
      } catch (e) {
        console.warn('[PWA] Error in install listener:', e);
      }
    });
  }
}

export const pwaService = new PWAService();
