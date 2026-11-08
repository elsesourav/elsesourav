'use client';

import * as React from 'react';
import { Button } from '@elsesourav/ui';
import { FloatingLabelInput } from '@elsesourav/ui/interior';
import {
  User,
  AtSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export interface SignUpStep1ProfileProps {
  displayName: string;
  setDisplayName: (val: string) => void;
  displayNameError: string | null;
  touchedDisplayName: boolean;
  onBlurDisplayName: () => void;
  username: string;
  setUsername: (val: string) => void;
  usernameStatus: 'idle' | 'checking' | 'available' | 'unavailable' | 'invalid';
  usernameMessage: string | null;
  verifiedSuggestions: string[];
  onSelectSuggestion: (sug: string) => void;
  honeypot: string;
  setHoneypot: (val: string) => void;
  loading: boolean;
  isStep1Valid: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function SignUpStep1Profile({
  displayName,
  setDisplayName,
  displayNameError,
  touchedDisplayName,
  onBlurDisplayName,
  username,
  setUsername,
  usernameStatus,
  usernameMessage,
  verifiedSuggestions,
  onSelectSuggestion,
  honeypot,
  setHoneypot,
  loading,
  isStep1Valid,
  onSubmit,
}: SignUpStep1ProfileProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3.5 animate-fade-in">
      {/* Anti-Spam Honeypot Trap (Invisible to humans) */}
      <div
        aria-hidden="true"
        style={{
          opacity: 0,
          position: 'absolute',
          top: 0,
          left: 0,
          height: 0,
          width: 0,
          zIndex: -1,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <label htmlFor="website-hp-1">Website</label>
        <input
          id="website-hp-1"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* 1. Name with Instant Client Validation */}
      <FloatingLabelInput
        id="signup-name"
        name="name"
        label="Name"
        type="text"
        autoComplete="name"
        placeholder="Sourav or Alex"
        value={displayName}
        onBlur={onBlurDisplayName}
        onChange={(val) => setDisplayName(val)}
        required
        disabled={loading}
        icon={<User className="w-4 h-4 text-slate-400 dark:text-zinc-500" />}
        error={touchedDisplayName && displayNameError ? displayNameError : undefined}
      />

      {/* 2. Username with Instant Client-Format Check + Debounced Availability */}
      <div className="space-y-1.5">
        <FloatingLabelInput
          id="signup-username"
          name="username"
          label="Username"
          type="text"
          autoComplete="username"
          placeholder="alexsmith"
          value={username}
          onChange={(val) => setUsername(val.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
          required
          disabled={loading}
          icon={<AtSign className="w-4 h-4 text-slate-400 dark:text-zinc-500" />}
          rightElement={
            usernameStatus === 'checking' ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500 dark:text-indigo-400" />
            ) : usernameStatus === 'available' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            ) : usernameStatus === 'unavailable' || usernameStatus === 'invalid' ? (
              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            ) : null
          }
          hint={usernameStatus !== 'idle' ? usernameMessage || undefined : undefined}
          invalid={usernameStatus === 'unavailable' || usernameStatus === 'invalid'}
        />

        {/* 2 Verified Available Suggestions */}
        {verifiedSuggestions.length > 0 && (
          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              {usernameStatus === 'unavailable' ? 'Try available:' : 'Suggested:'}
            </span>
            {verifiedSuggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => onSelectSuggestion(sug)}
                className="inline-flex items-center gap-0.5 text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-2 py-0.5 rounded-lg transition-all border border-indigo-200 dark:border-indigo-500/25 active:scale-95"
              >
                @{sug}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 1 Continue Button */}
      <Button
        type="submit"
        disabled={!isStep1Valid}
        rightIcon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
        className={`w-full text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-md mt-1 ${
          isStep1Valid
            ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/25 active:scale-[0.99]'
            : 'bg-slate-200 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed opacity-70 shadow-none'
        }`}
      >
        Continue
      </Button>
    </form>
  );
}
