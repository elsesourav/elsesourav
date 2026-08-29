'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, Badge, Button } from '@elsesourav/ui';
import type { User } from '@elsesourav/types';
import {
  Shield,
  Key,
  Mail,
  CheckCircle2,
  Lock,
  LogOut,
  Globe,
} from 'lucide-react';

interface SecuritySectionProps {
  user: User;
}

export function SecuritySection({ user }: SecuritySectionProps) {
  return (
    <Card className="rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <CardTitle className="text-base text-zinc-100">Security & Authentication</CardTitle>
        </div>
        <CardDescription className="text-xs text-zinc-400">
          Manage credentials, connected login providers, and active session authentication.
        </CardDescription>
      </CardHeader>

      <div className="p-6 pt-2 space-y-5 max-w-xl">
        {/* Email & Account Status */}
        <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-200">Email Address</span>
            </div>
            {user.status === 'active' && (
              <Badge variant="success" className="text-[10px] bg-emerald-950/60 text-emerald-300 border-emerald-500/30 gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Active Account
              </Badge>
            )}
          </div>
          <p className="text-xs text-zinc-300 font-mono">{user.email}</p>
        </div>

        {/* Password Management */}
        <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-200">Account Password</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Update your account password securely via Supabase Auth.
            </p>
          </div>

          <Link href="/forgot-password">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5 shrink-0"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Reset Password</span>
            </Button>
          </Link>
        </div>

        {/* Connected Auth Providers */}
        <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-200">Authentication Infrastructure</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="info" className="text-xs px-2.5 py-1">
              Supabase Auth Identity
            </Badge>
          </div>
          <p className="text-[11px] text-zinc-500">
            Authentication is securely managed by Supabase Auth with encrypted tokens and session cookies.
          </p>
        </div>

        {/* Active Session Sign Out */}
        <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-zinc-200">Sign Out of Session</div>
            <div className="text-[11px] text-zinc-400">
              Terminate your current authenticated session on this device.
            </div>
          </div>

          <form action="/api/auth/logout" method="POST">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="text-xs border-zinc-800 hover:border-rose-500/50 hover:bg-rose-950/20 text-rose-300 gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}
