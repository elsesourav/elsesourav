'use client';

import * as React from 'react';
import { Button, Spinner } from '@elsesourav/ui';
import { createAuthBrowserClient, signInWithOAuth } from '@elsesourav/auth';

interface OAuthButtonsProps {
  redirectTo?: string;
  onError?: (message: string) => void;
}

export function OAuthButtons({ redirectTo, onError }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = React.useState<'google' | 'github' | null>(null);

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      setLoadingProvider(provider);
      const supabase = createAuthBrowserClient();
      const { url, error } = await signInWithOAuth(supabase, {
        provider,
        redirectTo: redirectTo || '/',
      });

      if (error) {
        onError?.(error.message);
        setLoadingProvider(null);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch {
      onError?.(`Failed to sign in with ${provider}. Please try again.`);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        disabled={loadingProvider !== null}
        onClick={() => handleOAuth('google')}
        className="w-full border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-medium py-2.5"
      >
        {loadingProvider === 'google' ? (
          <Spinner className="w-4 h-4 mr-2" />
        ) : (
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.56 0 2.97.55 4.08 1.45l3.05-3.05C17.27 1.72 14.81 1 12 1 7.37 1 3.4 3.65 1.48 7.5l3.66 2.84C6.01 7.39 8.75 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.16-1.99 3.71-4.93 3.71-8.7z"
            />
            <path
              fill="#FBBC05"
              d="M5.14 14.66c-.24-.7-.37-1.45-.37-2.22s.13-1.52.37-2.22L1.48 7.38C.54 9.27 0 11.37 0 13.6c0 2.23.54 4.33 1.48 6.22l3.66-2.84z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.72-2.45 1.15-4.22 1.15-3.25 0-5.99-2.39-6.86-5.34L1.48 15.86C3.4 20.35 7.37 23 12 23z"
            />
          </svg>
        )}
        Google
      </Button>

      <Button
        type="button"
        variant="outline"
        disabled={loadingProvider !== null}
        onClick={() => handleOAuth('github')}
        className="w-full border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-medium py-2.5"
      >
        {loadingProvider === 'github' ? (
          <Spinner className="w-4 h-4 mr-2" />
        ) : (
          <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        )}
        GitHub
      </Button>
    </div>
  );
}
