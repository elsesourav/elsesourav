'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, Alert, AlertDescription, Separator } from '@elsesourav/ui';
import { FloatingLabelInput } from '@elsesourav/ui/interior';
import { createAuthBrowserClient, sanitizeRedirectUrl, AuthError } from '@elsesourav/auth';
import { OAuthButtons } from './OAuthButtons';
import { Eye, EyeOff, Lock, UserCheck } from 'lucide-react';

export interface LoginFormProps {
  isAdmin?: boolean;
  defaultRedirect?: string;
}

export function LoginForm({ isAdmin = false, defaultRedirect }: LoginFormProps = {}) {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || searchParams.get('redirect');
  const fallbackRedirect = defaultRedirect || (isAdmin ? '/admin' : '/');
  const safeRedirect = sanitizeRedirectUrl(next, fallbackRedirect);

  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const oauthError = searchParams.get('error');
  React.useEffect(() => {
    if (oauthError) {
      if (oauthError === 'oauth_exchange_failed') {
        setErrorMessage(
          'Failed to complete social sign-in. Please try again or sign in with your email/username.'
        );
      } else if (oauthError === 'access_denied') {
        setErrorMessage('Social sign-in was canceled.');
      } else {
        setErrorMessage(decodeURIComponent(oauthError));
      }
    }
  }, [oauthError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setErrorMessage('Please enter your email address or username');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      let targetEmail = trimmedIdentifier;

      // If user entered a username instead of email, resolve email from database
      if (!trimmedIdentifier.includes('@')) {
        const resolveRes = await fetch('/api/auth/resolve-identifier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: trimmedIdentifier }),
        });

        if (!resolveRes.ok) {
          const resData = await resolveRes.json();
          setErrorMessage(
            resData.error || `No account found with username "@${trimmedIdentifier}"`
          );
          setLoading(false);
          return;
        }

        const resolveData = await resolveRes.json();
        if (!resolveData.email) {
          setErrorMessage(`No account found with username "@${trimmedIdentifier}"`);
          setLoading(false);
          return;
        }

        targetEmail = resolveData.email;
      }

      const supabase = createAuthBrowserClient();
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (error) {
        const translated = AuthError.fromSupabase(error);
        setErrorMessage(translated.message);
        setLoading(false);
        return;
      }

      if (authData?.user) {
        try {
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              supabaseAuthId: authData.user.id,
              email: authData.user.email || targetEmail,
              displayName:
                authData.user.user_metadata?.full_name ||
                authData.user.user_metadata?.name ||
                authData.user.email?.split('@')[0],
              username:
                authData.user.user_metadata?.username || authData.user.user_metadata?.user_name,
            }),
          });
        } catch {
          // Non-blocking sync fallback
        }
      }

      window.location.href = safeRedirect;
    } catch {
      setErrorMessage('An unexpected authentication error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full">
      {errorMessage && (
        <Alert variant="error" className="text-xs">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {!isAdmin && (
        <>
          <OAuthButtons redirectTo={safeRedirect} onError={(msg) => setErrorMessage(msg)} />

          <div className="relative flex items-center justify-center my-1">
            <Separator className="bg-slate-200/80 dark:bg-white/10" />
            <span className="absolute bg-white dark:bg-zinc-900 px-3 text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider select-none">
              Or continue with
            </span>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
        <FloatingLabelInput
          id="login-identifier"
          name="identifier"
          label={isAdmin ? 'Admin Email or Username' : 'Email Address or Username'}
          type="text"
          autoComplete="username"
          placeholder={isAdmin ? 'admin@elsesourav.com' : 'you@example.com or username'}
          value={identifier}
          onChange={(val) => setIdentifier(val)}
          required
          disabled={loading}
          icon={<UserCheck className="w-4 h-4" />}
        />

        <div>
          <FloatingLabelInput
            id="login-password"
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(val) => setPassword(val)}
            required
            disabled={loading}
            icon={<Lock className="w-4 h-4" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <div className="flex justify-end -mt-2 mb-1">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors py-0.5"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          loadingText="Signing in..."
          className="w-full text-xs sm:text-sm font-semibold py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/25 active:scale-[0.98] transition-all"
        >
          {isAdmin ? 'Sign In to Admin Portal' : 'Sign In to ElseSourav'}
        </Button>
      </form>
    </div>
  );
}
