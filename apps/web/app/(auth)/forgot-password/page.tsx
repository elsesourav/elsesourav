import * as React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@elsesourav/ui';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | ElseSourav',
  description: 'Reset your ElseSourav account password securely.',
};

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-md border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-md shadow-2xl rounded-3xl">
      <CardHeader className="text-center pb-2 pt-6 space-y-2">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-medium tracking-wide shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>Account Recovery</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">
          Reset Password
        </CardTitle>
        <CardDescription className="text-[hsl(var(--muted-foreground))] text-xs">
          Verify your email identity with an OTP code to set a new password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <React.Suspense
          fallback={<div className="h-48 rounded-2xl bg-zinc-900/30 animate-pulse" />}
        >
          <ForgotPasswordForm />
        </React.Suspense>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-[hsl(var(--border-subtle))] pt-4">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Remember your password?{' '}
          <Link
            href="/login"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium hover:underline"
          >
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
