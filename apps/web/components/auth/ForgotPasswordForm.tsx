'use client';

import * as React from 'react';
import { Input, Button, Label, Alert, AlertDescription } from '@elsesourav/ui';
import { Mail, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ForgotPasswordForm() {
  const [identifier, setIdentifier] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your email address or username');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(
          data.message ||
            'If an account exists, a password reset link has been dispatched to your email.'
        );
        setIdentifier('');
      } else {
        setErrorMessage(data.error || 'Failed to dispatch reset email. Please try again.');
      }
    } catch {
      setErrorMessage('An unexpected network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {successMessage ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-emerald-200">Reset Email Dispatched</p>
              <p className="leading-relaxed">{successMessage}</p>
              <p className="text-[11px] text-emerald-400/80 pt-1">
                Please check your inbox (and spam folder) for the password reset instructions from{' '}
                <strong>elsesourav.auth@gmail.com</strong>.
              </p>
            </div>
          </div>

          <Link href="/login">
            <Button
              variant="outline"
              className="w-full text-xs border-zinc-800 text-zinc-300 gap-1.5 rounded-xl"
            >
              <span>Return to Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <Alert variant="error" className="bg-red-950/40 border-red-800/60 text-red-300 text-xs">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="forgot-email"
              required
              className="text-xs text-[hsl(var(--foreground))]"
            >
              Email Address or Username
            </Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[hsl(var(--muted-foreground))] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="forgot-email"
                type="text"
                placeholder="developer@example.com or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={loading}
                className="pl-9 bg-[hsl(var(--surface-subtle))] border-[hsl(var(--input))] text-[hsl(var(--foreground))] text-sm focus:border-indigo-500 rounded-xl"
              />
            </div>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
              We will send a secure password reset link to your account email.
            </p>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full bg-[hsl(var(--primary))] hover:opacity-90 text-white text-sm font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <span>Send Reset Instructions</span>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
