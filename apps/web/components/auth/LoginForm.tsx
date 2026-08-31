'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Button, Label, Alert, AlertDescription, Separator } from '@elsesourav/ui';
import { createAuthBrowserClient, sanitizeRedirectUrl, AuthError } from '@elsesourav/auth';
import { OAuthButtons } from './OAuthButtons';
import { Eye, EyeOff, Lock, UserCheck, Loader2 } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const safeRedirect = sanitizeRedirectUrl(next, '/');

  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

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
          setErrorMessage(resData.error || `No account found with username "@${trimmedIdentifier}"`);
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
                authData.user.user_metadata?.username ||
                authData.user.user_metadata?.user_name,
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
    <div className="space-y-6 w-full">
      {errorMessage && (
        <Alert variant="error" className="bg-red-950/40 border-red-800/60 text-red-300 text-xs">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <OAuthButtons redirectTo={safeRedirect} onError={(msg) => setErrorMessage(msg)} />

      <div className="relative flex items-center justify-center">
        <Separator className="bg-[hsl(var(--border))]" />
        <span className="absolute bg-[hsl(var(--surface-overlay))] px-3 text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
          Or continue with
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="login-identifier" required className="text-xs text-[hsl(var(--foreground))]">
            Email Address or Username
          </Label>
          <div className="relative">
            <UserCheck className="w-4 h-4 text-[hsl(var(--muted-foreground))] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              id="login-identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              placeholder="you@example.com or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={loading}
              className="pl-9 bg-[hsl(var(--surface-subtle))] border-[hsl(var(--input))] text-[hsl(var(--foreground))] text-sm focus:border-indigo-500 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" required className="text-xs text-[hsl(var(--foreground))]">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-[hsl(var(--muted-foreground))] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="pl-9 pr-10 bg-[hsl(var(--surface-subtle))] border-[hsl(var(--input))] text-[hsl(var(--foreground))] text-sm focus:border-indigo-500 rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={loading}
          className="w-full bg-[hsl(var(--primary))] hover:opacity-90 text-white text-sm font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In to ElseSourav</span>
          )}
        </Button>
      </form>
    </div>
  );
}
