import * as React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@elsesourav/ui';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Create Account | ElseSourav',
  description: 'Join the ElseSourav ecosystem for developer tools and software utilities.',
};

export default function SignUpPage() {
  return (
    <Card className="w-full max-w-md border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 backdrop-blur-xl shadow-2xl rounded-3xl relative overflow-hidden">
      <CardHeader className="text-center pb-3 pt-6 space-y-2">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-medium tracking-wide shadow-sm">
            <Lock className="w-3 h-3 text-indigo-400" />
            <span>End-to-End Encrypted Auth</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">
          Create ElseSourav Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <React.Suspense fallback={<div className="h-64 rounded-2xl bg-zinc-900/30 animate-pulse" />}>
          <SignUpForm />
        </React.Suspense>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-[hsl(var(--border-subtle))] pt-4 pb-5">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Already have an account?{' '}
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
