'use client';

import * as React from 'react';
import type { User } from '@elsesourav/types';
import { Mail, Shield, Key, Calendar, Copy, Check } from 'lucide-react';

interface ProfileMetadataGridProps {
  user: User;
  joinedDate: string;
}

export function ProfileMetadataGrid({ user, joinedDate }: ProfileMetadataGridProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField((curr) => (curr === field ? null : curr));
    }, 2000);
  };

  const tiles = [
    {
      label: 'Primary Email',
      value: user.email,
      icon: Mail,
      iconBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      hoverBorder: 'hover:border-indigo-500/40',
      copyField: 'email',
    },
    {
      label: 'Account Permissions',
      value: `${user.role} Authorization`,
      icon: Shield,
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      hoverBorder: 'hover:border-amber-500/40',
      copyField: null,
    },
    {
      label: 'Supabase Authentication ID',
      value: user.supabaseAuthId || user.id,
      icon: Key,
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      hoverBorder: 'hover:border-emerald-500/40',
      copyField: 'authId',
      mono: true,
    },
    {
      label: 'Member Since',
      value: joinedDate,
      icon: Calendar,
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      hoverBorder: 'hover:border-cyan-500/40',
      copyField: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <div
            key={tile.label}
            className={`p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 shadow-sm transition-colors ${tile.hoverBorder}`}
          >
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${tile.iconBg}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{tile.label}</span>
              </span>
              {tile.copyField && (
                <button
                  type="button"
                  onClick={() => handleCopy(tile.value, tile.copyField!)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-md hover:bg-zinc-800/60 cursor-pointer"
                  title={`Copy ${tile.label.toLowerCase()}`}
                >
                  {copiedField === tile.copyField ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
            <p className={`font-semibold text-zinc-100 ${tile.mono ? 'text-xs font-mono text-zinc-300 truncate' : 'text-sm'}`}>
              {tile.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
