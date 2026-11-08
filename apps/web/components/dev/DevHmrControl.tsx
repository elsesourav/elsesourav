/**
 * Development-only HMR & Fast Refresh Controller.
 *
 * Allows developers to opt into a manual-reload workflow:
 *   Edit code -> Save -> No browser auto-refresh / No CPU churn -> Press ⌘+R to view.
 *
 * Activated via:
 * 1. CLI / npm script: NEXT_PUBLIC_DISABLE_HMR=true pnpm dev
 * 2. URL parameter: http://localhost:3000?no-hmr
 * 3. Browser Console: window.disableHMR() (sets localStorage flag and reloads)
 *
 * In production builds, this component returns null and adds 0 bytes to the bundle.
 */
export function DevHmrControl() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const isEnvDisabled = process.env.NEXT_PUBLIC_DISABLE_HMR === 'true';

  const scriptContent = `
(function() {
  try {
    var envDisabled = ${isEnvDisabled ? 'true' : 'false'};
    var urlParams = new URLSearchParams(window.location.search);
    var paramDisabled = urlParams.has('no-hmr');
    var localDisabled = window.localStorage && window.localStorage.getItem('disable-hmr') === 'true';
    var isManualMode = envDisabled || paramDisabled || localDisabled;

    // Helper functions exposed to developer console
    window.disableHMR = function() {
      if (window.localStorage) {
        window.localStorage.setItem('disable-hmr', 'true');
        console.log('%c[HMR Disabled]%c Manual reload mode activated. Reloading...', 'color: #f59e0b; font-weight: bold;', 'color: inherit;');
        window.location.reload();
      }
    };

    window.enableHMR = function() {
      if (window.localStorage) {
        window.localStorage.removeItem('disable-hmr');
        console.log('%c[HMR Enabled]%c Automatic Fast Refresh activated. Reloading...', 'color: #10b981; font-weight: bold;', 'color: inherit;');
        window.location.reload();
      }
    };

    if (isManualMode) {
      console.info(
        '%c[Manual Dev Mode Active]%c Fast Refresh & HMR disabled.\\nEdit freely; press ⌘ + R when ready to reload.\\nRun window.enableHMR() in console to re-enable HMR.',
        'background: #1e293b; color: #38bdf8; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'color: inherit;'
      );

      // Intercept EventSource (used by Next.js Webpack HMR)
      var OrigEventSource = window.EventSource;
      if (OrigEventSource) {
        window.EventSource = function(url, config) {
          if (typeof url === 'string' && (url.includes('webpack-hmr') || url.includes('-hmr'))) {
            return {
              close: function() {},
              addEventListener: function() {},
              removeEventListener: function() {},
              onerror: null,
              onmessage: null,
              onopen: null,
              readyState: 0,
            };
          }
          return new OrigEventSource(url, config);
        };
      }

      // Intercept WebSocket (used by Turbopack HMR)
      var OrigWebSocket = window.WebSocket;
      if (OrigWebSocket) {
        window.WebSocket = function(url, protocols) {
          if (typeof url === 'string' && (url.includes('turbopack-hmr') || url.includes('-hmr') || url.includes('_next'))) {
            return {
              close: function() {},
              send: function() {},
              addEventListener: function() {},
              removeEventListener: function() {},
              readyState: 3,
            };
          }
          return new OrigWebSocket(url, protocols);
        };
      }
    }
  } catch (err) {
    // Fail silently in development
  }
})();
  `;

  return <script dangerouslySetInnerHTML={{ __html: scriptContent }} suppressHydrationWarning />;
}
