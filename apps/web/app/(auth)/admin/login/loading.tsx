import * as React from 'react';
import { Card, CardHeader, CardContent } from '@elsesourav/ui';

export default function AdminLoginLoading() {
  return (
    <Card className="w-full max-w-md border border-slate-900/[0.08] dark:border-white/10 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-2xl shadow-xl rounded-2xl sm:rounded-3xl p-6 space-y-4">
      <CardHeader className="space-y-2 text-center p-0">
        <div className="h-6 w-32 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
        <div className="h-8 w-48 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-3 p-0 pt-4">
        <div className="h-12 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
        <div className="h-12 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
        <div className="h-11 w-full bg-indigo-500/20 rounded-xl animate-pulse" />
      </CardContent>
    </Card>
  );
}
