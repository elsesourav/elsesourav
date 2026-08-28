'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Button, Label, Alert, AlertDescription, Separator } from '@elsesourav/ui';
import { createAuthBrowserClient, sanitizeRedirectUrl, AuthError } from '@elsesourav/auth';
import { LoginSchema } from '@elsesourav/validation';
import { OAuthButtons } from './OAuthButtons';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const safeRedirect = sanitizeRedirectUrl(next, '/');

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validationResult = LoginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      setErrorMessage(validationResult.error.issues[0]?.message || 'Please check your input');
      return;
    }

    try {
      setLoading(true);
      const supabase = createAuthBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const translated = AuthError.fromSupabase(error);
        setErrorMessage(translated.message);
        setLoading(false);
        return;
      }

      router.push(safeRedirect);
      router.refresh();
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
        <Separator className="bg-zinc-800" />
        <span className="absolute bg-zinc-950 px-3 text-xs text-zinc-500 uppercase tracking-wider">
          Or continue with
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="login-email" required className="text-xs text-zinc-300">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="pl-9 bg-zinc-900/60 border-zinc-800 text-zinc-100 text-sm focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" required className="text-xs text-zinc-300">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="pl-9 pr-10 bg-zinc-900/60 border-zinc-800 text-zinc-100 text-sm focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 shadow-lg shadow-indigo-600/20"
        >
          Sign In to ElseSourav
        </Button>
      </form>
    </div>
  );
}
