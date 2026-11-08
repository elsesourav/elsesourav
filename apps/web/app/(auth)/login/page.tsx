import * as React from 'react';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '@elsesourav/auth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@elsesourav/ui';
import { LoginForm } from '@/components/auth/LoginForm';
import { ShieldCheck, Shield, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign In | ElseSourav',
  description: 'Sign in to your ElseSourav account to access your software library, apps, and preferences.',
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  // If already authenticated, redirect to appropriate destination
  if (session?.user) {
    if (session.user.role === 'ADMIN' || session.user.role === 'STAFF') {
      redirect('/admin');
    }
    redirect('/account');
  }

  return (
    <Card className="w-full max-w-md border border-slate-900/[0.08] dark:border-white/10 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-2xl shadow-xl shadow-slate-900/5 dark:shadow-black/60 rounded-2xl sm:rounded-3xl relative overflow-hidden">
      <CardHeader className="text-center px-4 sm:px-6 pt-5 sm:pt-6 pb-2 sm:pb-3 space-y-2">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/90 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[11px] font-medium tracking-wide shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Secure Identity Portal</span>
          </div>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Sign In to ElseSourav
        </CardTitle>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Welcome back! Access your software tools and profile.
        </p>
      </CardHeader>

      <CardContent className="px-4 sm:px-6 py-2 sm:py-3">
        <React.Suspense
          fallback={<div className="h-64 rounded-2xl bg-zinc-200/50 dark:bg-zinc-800/30 animate-pulse" />}
        >
          <LoginForm isAdmin={false} defaultRedirect="/account" />
        </React.Suspense>
      </CardContent>

      <CardFooter className="flex flex-col items-center justify-center border-t border-slate-200/80 dark:border-white/[0.06] pt-3.5 sm:pt-4 pb-4 sm:pb-5 px-4 sm:px-6 space-y-2">
        <p className="text-xs text-slate-600 dark:text-zinc-400 text-center">
          Do not have an account?{' '}
          <Link
            href="/signup"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold hover:underline transition-colors"
          >
            Create an account
          </Link>
        </p>

        <div className="w-full pt-2 border-t border-slate-200/60 dark:border-white/[0.04] flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <Link
            href="/"
            className="hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Public Site</span>
          </Link>
          <Link
            href="/admin/login"
            className="text-slate-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 inline-flex items-center gap-1 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Portal →</span>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
