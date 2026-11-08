import * as React from 'react';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@elsesourav/ui';
import { LoginForm } from '@/components/auth/LoginForm';
import { ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Sign In | ElseSourav',
  description: 'Authorized administrative sign-in portal for ElseSourav control and systems management.',
};

export default async function LoginPage() {
  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || '';
  const hostname = (host.split(':')[0] || '').toLowerCase();

  // If accessed on the main public site, redirect to admin subdomain login
  if (hostname === 'elsesourav.com' || hostname === 'www.elsesourav.com') {
    redirect('https://admin.elsesourav.com/login');
  }

  return (
    <Card className="w-full max-w-md border border-slate-900/[0.08] dark:border-white/10 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-2xl shadow-xl shadow-slate-900/5 dark:shadow-black/60 rounded-2xl sm:rounded-3xl relative overflow-hidden">
      <CardHeader className="text-center px-4 sm:px-6 pt-5 sm:pt-6 pb-2 sm:pb-3 space-y-2">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/90 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[11px] font-medium tracking-wide shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Admin Control Portal</span>
          </div>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Admin Sign In
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 py-2 sm:py-3">
        <React.Suspense
          fallback={<div className="h-64 rounded-2xl bg-zinc-200/50 dark:bg-zinc-800/30 animate-pulse" />}
        >
          <LoginForm />
        </React.Suspense>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center border-t border-slate-200/80 dark:border-white/[0.06] pt-3.5 sm:pt-4 pb-4 sm:pb-5 px-4 sm:px-6 space-y-1.5">
        <p className="text-xs text-slate-500 dark:text-zinc-400 text-center">
          Authorized administrative access only.
        </p>
        <a
          href="https://elsesourav.com"
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium hover:underline transition-colors"
        >
          Return to public website
        </a>
      </CardFooter>
    </Card>
  );
}
