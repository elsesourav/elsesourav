'use client';

import * as React from 'react';
import type { User } from '@elsesourav/types';
import { Card, Badge, Button } from '@elsesourav/ui';
import {
  Mail,
  Shield,
  Calendar,
  Key,
  CheckCircle,
  Settings,
  User as UserIcon,
  Lock,
  LifeBuoy,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface ProfileDetailsCardProps {
  user: User;
  joinedDate: string;
}

export function ProfileDetailsCard({ user, joinedDate }: ProfileDetailsCardProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField((curr) => (curr === field ? null : curr));
    }, 2000);
  };

  return (
    <Card className="p-6 sm:p-8 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-2xl space-y-6 shadow-2xl relative overflow-hidden transition-all">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Profile Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-zinc-800/70 relative z-10">
        <div className="flex items-center gap-4">
          <div className="group relative w-18 h-18 rounded-2xl bg-zinc-900 border border-indigo-500/30 flex items-center justify-center text-2xl font-bold text-indigo-400 overflow-hidden shrink-0 shadow-lg shadow-indigo-950/50 ring-2 ring-indigo-500/20 transition-transform duration-300 group-hover:scale-105">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.displayName || 'Avatar'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <span>{user.displayName?.slice(0, 2).toUpperCase() || 'U'}</span>
            )}
          </div>

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {user.displayName || 'ElseSourav Member'}
              </h2>
              {user.username && (
                <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                  @{user.username}
                </span>
              )}
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                  user.role === 'ADMIN'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}
              >
                {user.role}
              </span>
              {user.status === 'active' && (
                <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  <CheckCircle className="w-3 h-3" /> Active
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">{user.email}</p>
            {user.bio ? (
              <p className="text-xs text-zinc-300 pt-1 leading-relaxed max-w-xl">{user.bio}</p>
            ) : (
              <p className="text-xs text-zinc-500 italic pt-1">
                No bio added yet. Click &quot;Edit Profile&quot; to add one.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Account Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs relative z-10">
        {/* Email */}
        <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 space-y-1.5 shadow-sm hover:border-zinc-700 transition-colors group relative">
          <div className="text-zinc-500 flex items-center justify-between font-medium">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> Primary Email
            </span>
            <button
              type="button"
              onClick={() => handleCopy(user.email, 'email')}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-md hover:bg-zinc-800/60 cursor-pointer"
              title="Copy email"
            >
              {copiedField === 'email' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <div className="text-zinc-200 font-semibold">{user.email}</div>
        </div>

        {/* Role */}
        <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 space-y-1.5 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="text-zinc-500 flex items-center gap-1.5 font-medium">
            <Shield className="w-3.5 h-3.5 text-amber-400" /> Account Permissions
          </div>
          <div className="text-zinc-200 font-semibold">{user.role} Authorization</div>
        </div>

        {/* Supabase Auth ID */}
        <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 space-y-1.5 shadow-sm hover:border-zinc-700 transition-colors group relative">
          <div className="text-zinc-500 flex items-center justify-between font-medium">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-400" /> Supabase Authentication ID
            </span>
            <button
              type="button"
              onClick={() => handleCopy(user.supabaseAuthId || user.id, 'authId')}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-md hover:bg-zinc-800/60 cursor-pointer"
              title="Copy Auth ID"
            >
              {copiedField === 'authId' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <div className="text-zinc-300 font-mono text-[11px] truncate">
            {user.supabaseAuthId || user.id}
          </div>
        </div>

        {/* Member Since */}
        <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 space-y-1.5 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="text-zinc-500 flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Member Since
          </div>
          <div className="text-zinc-200 font-semibold">{joinedDate}</div>
        </div>
      </div>

      {/* Quick Hub Navigation Cards */}
      <div className="pt-2 border-t border-zinc-800/70 grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
        <Link
          href="/settings?tab=profile"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 hover:bg-zinc-800/50 hover:border-indigo-500/40 active:scale-98 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                Edit Profile
              </p>
              <p className="text-[10px] text-zinc-500">Avatar, name, username</p>
            </div>
          </div>
          <span className="text-xs text-indigo-400 font-medium group-hover:translate-x-1 transition-transform">
            &rarr;
          </span>
        </Link>

        <Link
          href="/settings?tab=security"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 hover:bg-zinc-800/50 hover:border-indigo-500/40 active:scale-98 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                Password & Security
              </p>
              <p className="text-[10px] text-zinc-500">Update login password</p>
            </div>
          </div>
          <span className="text-xs text-indigo-400 font-medium group-hover:translate-x-1 transition-transform">
            &rarr;
          </span>
        </Link>

        <Link
          href="/support/tickets"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 hover:bg-zinc-800/50 hover:border-indigo-500/40 active:scale-98 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                Help & Support
              </p>
              <p className="text-[10px] text-zinc-500">Tickets & assistance</p>
            </div>
          </div>
          <span className="text-xs text-indigo-400 font-medium group-hover:translate-x-1 transition-transform">
            &rarr;
          </span>
        </Link>
      </div>
    </Card>
  );
}
