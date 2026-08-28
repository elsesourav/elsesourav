'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Label, Alert, AlertDescription, Separator } from '@elsesourav/ui';
import { createAuthBrowserClient, AuthError } from '@elsesourav/auth';
import { SignUpSchema } from '@elsesourav/validation';
import { OAuthButtons } from './OAuthButtons';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

export function SignUpForm() {
  const router = useRouter();

  const [displayName, setDisplayName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    const validationResult = SignUpSchema.safeParse({ email, password, displayName });
    if (!validationResult.success) {
      setErrorMessage(validationResult.error.issues[0]?.message || 'Please check your input');
      return;
    }

    try {
      setLoading(true);
      const supabase = createAuthBrowserClient();
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: displayName.trim(),
          },
        },
      });

      if (error) {
        const translated = AuthError.fromSupabase(error);
        setErrorMessage(translated.message);
        setLoading(false);
        return;
      }

      router.push('/verify');
    } catch {
      setErrorMessage('An unexpected error occurred during account creation.');
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

      <OAuthButtons redirectTo="/" onError={(msg) => setErrorMessage(msg)} />

      <div className="relative flex items-center justify-center">
        <Separator className="bg-zinc-800" />
        <span className="absolute bg-zinc-950 px-3 text-xs text-zinc-500 uppercase tracking-wider">
          Or sign up with email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="signup-name" required className="text-xs text-zinc-300">
            Full Name
          </Label>
          <div className="relative">
            <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              id="signup-name"
              type="text"
              placeholder="Alex Smith"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={loading}
              className="pl-9 bg-zinc-900/60 border-zinc-800 text-zinc-100 text-sm focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-email" required className="text-xs text-zinc-300">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              id="signup-email"
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
          <Label htmlFor="signup-password" required className="text-xs text-zinc-300">
            Password
          </Label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
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

        <div className="space-y-1.5">
          <Label htmlFor="signup-confirm-password" required className="text-xs text-zinc-300">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              id="signup-confirm-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="pl-9 bg-zinc-900/60 border-zinc-800 text-zinc-100 text-sm focus:border-indigo-500"
            />
          </div>
        </div>

        <Button
          type="submit"
          isLoading={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 shadow-lg shadow-indigo-600/20"
        >
          Create ElseSourav Account
        </Button>
      </form>
    </div>
  );
}
