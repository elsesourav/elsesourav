import * as React from 'react';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '@elsesourav/auth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@elsesourav/ui';
import { LoginForm } from '@/components/auth/LoginForm';
import { ShieldCheck, ShieldAlert, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Portal Sign In | ElseSourav',
  description: 'Authorized administrative sign-in portal for ElseSourav control, systems, and telemetry management.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  // If already authenticated as an administrator or staff member, proceed to admin dashboard
  if (session?.user && (session.user.role === 'ADMIN' || session.user.role === 'STAFF')) {
    redirect('/admin');
  }

  return (
    <Card className="w-full max-w-md border border-amber-500/25 dark:border-amber-500/30 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-2xl shadow-2xl shadow-amber-500/5 dark:shadow-black/70 rounded-2xl sm:rounded-3xl relative overflow-hidden">
      {/* Top security accent line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500" />

      <CardHeader className="text-center px-4 sm:px-6 pt-6 pb-2 sm:pb-3 space-y-2">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-[11px] font-semibold tracking-wide shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Admin Control Portal</span>
          </div>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Admin Sign In
        </CardTitle>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
          Elevated administrative credentials required to access system management.
        </p>
      </CardHeader>

      <CardContent className="px-4 sm:px-6 py-2 sm:py-3">
        <React.Suspense
          fallback={<div className="h-64 rounded-2xl bg-zinc-200/50 dark:bg-zinc-800/30 animate-pulse" />}
        >
          <LoginForm isAdmin={true} defaultRedirect="/admin" />
        </React.Suspense>
      </CardContent>

      <CardFooter className="flex flex-col items-center justify-center border-t border-slate-200/80 dark:border-white/[0.06] pt-3.5 sm:pt-4 pb-4 sm:pb-5 px-4 sm:px-6 space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] text-amber-700/80 dark:text-amber-400/80">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Restricted operational portal. All access attempts logged.</span>
        </div>

        <div className="w-full pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <Link
            href="/"
            className="hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Public Site</span>
          </Link>
          <Link
            href="/login"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium hover:underline transition-colors"
          >
            User Sign In →
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
