import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { usePWA } from '@/hooks/usePWA';
import './PWAStatusBanner.css';

export interface PWAStatusBannerProps {
  readonly showOfflineBar?: boolean;
  readonly showUpdateToast?: boolean;
}

export const PWAStatusBanner: React.FC<PWAStatusBannerProps> = ({
  showOfflineBar = true,
  showUpdateToast = true,
}) => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const { updateAvailable, applyUpdate, dismissUpdate } = usePWA();
  const [showReconnected, setShowReconnected] = useState(false);

  // When returning online after being offline, show transient recovery badge for 3.5 seconds
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [isOnline, wasOffline]);

  return (
    <>
      {/* 1. Offline Network Alert Bar */}
      {showOfflineBar && !isOnline && (
        <div
          className="pwa-network-bar pwa-network-bar--offline"
          role="status"
          aria-live="polite"
        >
          <span className="pwa-network-bar__icon" aria-hidden="true">
            <WifiOff size={16} />
          </span>
          <span>
            You are currently offline. Viewing cached shell; dynamic updates require an internet
            connection.
          </span>
        </div>
      )}

      {/* 2. Reconnected Transient Confirmation Bar */}
      {showOfflineBar && isOnline && showReconnected && (
        <div
          className="pwa-network-bar pwa-network-bar--online"
          role="status"
          aria-live="polite"
        >
          <span className="pwa-network-bar__icon" aria-hidden="true">
            <Wifi size={16} />
          </span>
          <span>Internet connection restored. Live synchronization active.</span>
        </div>
      )}

      {/* 3. Non-Disruptive PWA Update Available Toast */}
      {showUpdateToast && updateAvailable && (
        <aside
          className="pwa-update-toast"
          role="alert"
          aria-label="Application Update Available"
        >
          <div className="pwa-update-toast__icon" aria-hidden="true">
            <Sparkles size={20} />
          </div>
          <div className="pwa-update-toast__content">
            <h4 className="pwa-update-toast__title">Update Available</h4>
            <p className="pwa-update-toast__message">
              A new version of ElseSourav is ready with the latest performance and feature updates.
            </p>
            <div className="pwa-update-toast__actions">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<RefreshCw size={14} />}
                onClick={applyUpdate}
              >
                Update Now
              </Button>
              <Button variant="ghost" size="sm" onClick={dismissUpdate}>
                Dismiss
              </Button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
};
