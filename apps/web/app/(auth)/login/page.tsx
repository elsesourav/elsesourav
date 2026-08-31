import * as React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@elsesourav/ui';
import { LoginForm } from '@/components/auth/LoginForm';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign In | ElseSourav',
  description: 'Access your ElseSourav account, developer tools, and personal software library.',
};

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 backdrop-blur-xl shadow-2xl rounded-3xl relative overflow-hidden">
      <CardHeader className="text-center pb-3 pt-6 space-y-2">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-medium tracking-wide shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Secure Identity Portal</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">
          Sign In to ElseSourav
        </CardTitle>
      </CardHeader>
      <CardContent>
        <React.Suspense
          fallback={<div className="h-64 rounded-2xl bg-zinc-900/30 animate-pulse" />}
        >
          <LoginForm />
        </React.Suspense>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-[hsl(var(--border-subtle))] pt-4 pb-5">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Do not have an account?{' '}
          <Link
            href="/signup"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium hover:underline"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
