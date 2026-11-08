'use client';

import * as React from 'react';
import { Button } from '@elsesourav/ui';
import { FloatingLabelInput } from '@elsesourav/ui/interior';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export function calculatePasswordStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: '', color: 'bg-zinc-700' };

  let score = 0;
  // Baseline length check
  if (pass.length >= 8) score += 1;
  // Length >= 12 bonus
  if (pass.length >= 12) score += 1;
  // Mixed character types (letters + numbers)
  if (/[a-zA-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
  // High complexity (symbols or uppercase + lowercase + numbers)
  if (
    /[^A-Za-z0-9]/.test(pass) ||
    (/[a-z]/.test(pass) && /[A-Z]/.test(pass) && /[0-9]/.test(pass))
  ) {
    score += 1;
  }

  // Friendly non-red progression (no red to prevent user anxiety)
  if (score <= 1) return { score: 1, label: 'Basic', color: 'bg-slate-400 dark:bg-zinc-400' };
  if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500 dark:bg-amber-400' };
  if (score === 3) return { score: 3, label: 'Good', color: 'bg-indigo-500 dark:bg-indigo-400' };
  return { score: 4, label: 'Strong', color: 'bg-emerald-500 dark:bg-emerald-400' };
}

export interface SignUpStep2SecurityProps {
  displayName: string;
  username: string;
  email: string;
  setEmail: (val: string) => void;
  emailError: string | null;
  touchedEmail: boolean;
  onBlurEmail: () => void;
  password: string;
  setPassword: (val: string) => void;
  passwordError: string | null;
  touchedPassword: boolean;
  onBlurPassword: () => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  confirmPasswordError: string | null;
  touchedConfirmPassword: boolean;
  onBlurConfirmPassword: () => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  honeypot: string;
  setHoneypot: (val: string) => void;
  loading: boolean;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SignUpStep2Security({
  displayName,
  username,
  email,
  setEmail,
  emailError,
  touchedEmail,
  onBlurEmail,
  password,
  setPassword,
  passwordError,
  touchedPassword,
  onBlurPassword,
  confirmPassword,
  setConfirmPassword,
  confirmPasswordError,
  touchedConfirmPassword,
  onBlurConfirmPassword,
  showPassword,
  setShowPassword,
  honeypot,
  setHoneypot,
  loading,
  onBack,
  onSubmit,
}: SignUpStep2SecurityProps) {
  const passwordStrength = calculatePasswordStrength(password);

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* Confirmed Identity Pill */}
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs shrink-0 shadow-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {displayName}
            </p>
            <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 inline shrink-0" />@{username}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline px-2.5 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
        >
          Edit
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">
        {/* Hidden Username field for Password Manager Identity Binding */}
        <input type="hidden" name="username" autoComplete="username" value={username} />

        {/* Anti-Spam Honeypot Trap */}
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
          <label htmlFor="website-hp-2">Website</label>
          <input
            id="website-hp-2"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        {/* 3. Email Address with Instant Client Validation */}
        <FloatingLabelInput
          id="signup-email"
          name="email"
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onBlur={onBlurEmail}
          onChange={(val) => setEmail(val)}
          required
          disabled={loading}
          autoFocus
          icon={<Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500" />}
          error={touchedEmail && emailError ? emailError : undefined}
        />

        {/* 4. Password with Friendly Non-Red Strength Progress Meter */}
        <div className="space-y-1.5">
          <FloatingLabelInput
            id="signup-password"
            name="new-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onBlur={onBlurPassword}
            onChange={(val) => setPassword(val)}
            required
            disabled={loading}
            icon={<Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            error={touchedPassword && passwordError ? passwordError : undefined}
          />

          {/* Dynamic Non-Red Password Strength Progress Bars */}
          {password.length > 0 && (
            <div className="space-y-1 px-0.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
                  <ShieldCheck className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                  Strength:
                </span>
                <span
                  className={
                    passwordStrength.score >= 4
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : passwordStrength.score >= 3
                        ? 'text-indigo-600 dark:text-indigo-300 font-semibold'
                        : passwordStrength.score >= 2
                          ? 'text-amber-600 dark:text-amber-300'
                          : 'text-slate-500 dark:text-zinc-400'
                  }
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((seg) => (
                  <div
                    key={seg}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      passwordStrength.score >= seg
                        ? passwordStrength.color
                        : 'bg-slate-200 dark:bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. Confirm Password with Instant Match Check */}
        <FloatingLabelInput
          id="signup-confirm-password"
          name="confirm-password"
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onBlur={onBlurConfirmPassword}
          onChange={(val) => setConfirmPassword(val)}
          required
          disabled={loading}
          icon={<Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500" />}
          hint={confirmPassword && !confirmPasswordError ? 'Passwords match ✓' : undefined}
          error={
            touchedConfirmPassword && confirmPasswordError ? confirmPasswordError : undefined
          }
        />

        {/* Action Buttons: Back & Final Submit (Single Clean Spinner) */}
        <div className="flex items-center gap-2.5 pt-1.5">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={loading}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            className="w-1/3 text-xs py-2.5 rounded-xl border-slate-900/10 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200"
          >
            Back
          </Button>

          <Button
            type="submit"
            loading={loading}
            loadingText="Creating..."
            className="flex-1 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 active:scale-[0.99]"
          >
            Create Account
          </Button>
        </div>
      </form>
    </div>
  );
}
