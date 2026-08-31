'use client';

import * as React from 'react';
import Link from 'next/link';
import { Input, Button, Label, Alert, AlertDescription } from '@elsesourav/ui';
import { createAuthBrowserClient, AuthError } from '@elsesourav/auth';
import {
  Mail,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

function calculatePasswordStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: '', color: 'bg-zinc-700' };

  let score = 0;
  if (pass.length >= 8) score += 1;
  if (pass.length >= 12) score += 1;
  if (/[a-zA-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
  if (
    /[^A-Za-z0-9]/.test(pass) ||
    (/[a-z]/.test(pass) && /[A-Z]/.test(pass) && /[0-9]/.test(pass))
  ) {
    score += 1;
  }

  if (score <= 1) return { score: 1, label: 'Basic', color: 'bg-zinc-400' };
  if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-400' };
  if (score === 3) return { score: 3, label: 'Good', color: 'bg-indigo-400' };
  return { score: 4, label: 'Strong', color: 'bg-emerald-400' };
}

// ─── 6-Box OTP Input ────────────────────────────────────────────────────────
function OtpBoxes({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  const handleKey = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        inputsRef.current[index - 1]?.focus();
      } else {
        const next = [...digits];
        next[index] = '';
        onChange(next.join('').trimEnd());
      }
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    const joined = next.join('');
    onChange(joined);
    if (char && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text) {
      onChange(text.padEnd(6, ''));
      const focusIdx = Math.min(text.length, 5);
      inputsRef.current[focusIdx]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex items-center gap-2 justify-center py-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className={`w-10 h-12 text-center text-lg font-bold rounded-xl border-2 bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))] transition-all outline-none
            ${digits[i] ? 'border-indigo-500 text-indigo-400 ring-1 ring-indigo-500/20' : 'border-[hsl(var(--input))]'}
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25
            disabled:opacity-40 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
}

export function ForgotPasswordForm() {
  // Step: 1 (Email) -> 2 (OTP) -> 3 (New Password) -> 4 (Success)
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [identifier, setIdentifier] = React.useState('');
  const [targetEmail, setTargetEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  // Feedback states
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = React.useState(0);

  // Countdown timer for OTP resend
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // ── Step 1: Send OTP to Email ──────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your email address or username');
      return;
    }

    try {
      setLoading(true);
      let emailToSend = trimmed;

      // Resolve username to email if needed
      if (!trimmed.includes('@')) {
        const resolveRes = await fetch('/api/auth/resolve-identifier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: trimmed }),
        });

        if (!resolveRes.ok) {
          const resData = await resolveRes.json();
          setErrorMessage(
            resData.error || `No account found with username "@${trimmed}"`
          );
          setLoading(false);
          return;
        }

        const resolveData = await resolveRes.json();
        if (!resolveData.email) {
          setErrorMessage(`No account found with username "@${trimmed}"`);
          setLoading(false);
          return;
        }

        emailToSend = resolveData.email;
      }

      setTargetEmail(emailToSend);

      const supabase = createAuthBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: emailToSend,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        const translated = AuthError.fromSupabase(error);
        setErrorMessage(translated.message);
        setLoading(false);
        return;
      }

      setStep(2);
      setOtp('');
      setResendCooldown(45);
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      const supabase = createAuthBrowserClient();
      const { error } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token: otp,
        type: 'email',
      });

      if (error) {
        const translated = AuthError.fromSupabase(error);
        setErrorMessage(translated.message || 'Invalid or expired OTP code. Please try again.');
        setLoading(false);
        return;
      }

      setStep(3);
    } catch {
      setErrorMessage('Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Resend OTP ─────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMessage(null);

    try {
      setLoading(true);
      const supabase = createAuthBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setResendCooldown(45);
        setOtp('');
      }
    } catch {
      setErrorMessage('Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Update Password ────────────────────────────────────────────────
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const supabase = createAuthBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        const translated = AuthError.fromSupabase(error);
        setErrorMessage(translated.message);
        setLoading(false);
        return;
      }

      setStep(4);
    } catch {
      setErrorMessage('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(password);

  return (
    <div className="space-y-4 w-full">
      {errorMessage && (
        <Alert variant="error" className="bg-red-950/40 border-red-800/60 text-red-300 text-xs">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* ── Minimal Step Progress Indicator ─────────────────────────────────── */}
      {step < 4 && (
        <div className="flex items-center justify-between pt-1 px-0.5 pb-2 border-b border-[hsl(var(--border-subtle))]">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                step === 1
                  ? 'bg-indigo-400 animate-pulse'
                  : step === 2
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-emerald-400'
              }`}
            />
            <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
              {step === 1
                ? '1. Enter Account'
                : step === 2
                  ? '2. Verify OTP Code'
                  : '3. Create New Password'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-[hsl(var(--muted-foreground))]">
              {step}/3
            </span>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 w-4 rounded-full transition-all duration-300 ${
                  s < step
                    ? 'bg-emerald-400'
                    : s === step
                      ? 'bg-indigo-500 shadow-sm shadow-indigo-500/50'
                      : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 1: Email / Username Entry ──────────────────────────────────── */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4 animate-fade-in">
          <div className="space-y-1.5">
            <Label
              htmlFor="forgot-email"
              required
              className="text-xs text-[hsl(var(--foreground))]"
            >
              Email Address or Username
            </Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[hsl(var(--muted-foreground))] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="forgot-email"
                type="text"
                autoComplete="username"
                placeholder="developer@example.com or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={loading}
                autoFocus
                className="pl-9 bg-[hsl(var(--surface-subtle))] border-[hsl(var(--input))] text-[hsl(var(--foreground))] text-sm focus:border-indigo-500 rounded-xl"
              />
            </div>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
              We will send a 6-digit verification OTP to your account email.
            </p>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full bg-[hsl(var(--primary))] hover:opacity-90 text-white text-sm font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <span>{loading ? 'Sending Code...' : 'Send Verification Code'}</span>
          </Button>
        </form>
      )}

      {/* ── STEP 2: 6-Digit OTP Verification ─────────────────────────────────── */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
          <div className="p-3 rounded-2xl bg-[hsl(var(--surface-subtle))] border border-indigo-500/20 flex items-center justify-between">
            <div className="min-w-0 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Code sent to</p>
                <p className="text-xs font-mono font-semibold text-[hsl(var(--foreground))] truncate">
                  {targetEmail}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErrorMessage(null);
              }}
              className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 hover:underline px-2 py-1 rounded-md hover:bg-indigo-500/10 transition-colors"
            >
              Change
            </button>
          </div>

          <div className="space-y-2 text-center">
            <Label className="text-xs text-[hsl(var(--foreground))] block">
              Enter 6-Digit OTP Code
            </Label>
            <OtpBoxes value={otp} onChange={setOtp} disabled={loading} />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErrorMessage(null);
              }}
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || loading}
              className={`text-[11px] font-medium transition-colors ${
                resendCooldown > 0
                  ? 'text-[hsl(var(--muted-foreground))] cursor-not-allowed'
                  : 'text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer'
              }`}
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            disabled={otp.length !== 6 || loading}
            className="w-full bg-[hsl(var(--primary))] hover:opacity-90 text-white text-sm font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <span>{loading ? 'Verifying...' : 'Verify Code & Continue'}</span>
          </Button>
        </form>
      )}

      {/* ── STEP 3: Create New Password ─────────────────────────────────────── */}
      {step === 3 && (
        <form onSubmit={handleUpdatePassword} className="space-y-3.5 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="new-password"
                required
                className="text-xs text-[hsl(var(--foreground))]"
              >
                New Password
              </Label>
              {password.length > 0 && (
                <span className="text-[10px] font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  <span
                    className={
                      passwordStrength.score >= 4
                        ? 'text-emerald-400 font-semibold'
                        : passwordStrength.score >= 3
                          ? 'text-indigo-300 font-semibold'
                          : passwordStrength.score >= 2
                            ? 'text-amber-300'
                            : 'text-zinc-400'
                    }
                  >
                    {passwordStrength.label}
                  </span>
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[hsl(var(--muted-foreground))] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="new-password"
                name="new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoFocus
                className="pl-9 pr-10 bg-[hsl(var(--surface-subtle))] border-[hsl(var(--input))] text-[hsl(var(--foreground))] text-sm focus:border-indigo-500 rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength bar */}
            {password.length > 0 && (
              <div className="grid grid-cols-4 gap-1 pt-0.5">
                {[1, 2, 3, 4].map((seg) => (
                  <div
                    key={seg}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      passwordStrength.score >= seg ? passwordStrength.color : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="confirm-new-password"
                required
                className="text-xs text-[hsl(var(--foreground))]"
              >
                Confirm New Password
              </Label>
              {confirmPassword && (
                <span
                  className={`text-[11px] font-medium flex items-center gap-1 ${
                    confirmPassword !== password ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {confirmPassword !== password ? 'Passwords do not match' : 'Match ✓'}
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[hsl(var(--muted-foreground))] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="confirm-new-password"
                name="confirm-new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="pl-9 bg-[hsl(var(--surface-subtle))] border-[hsl(var(--input))] text-[hsl(var(--foreground))] text-sm focus:border-indigo-500 rounded-xl"
              />
            </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            disabled={!password || password !== confirmPassword || loading}
            className="w-full bg-[hsl(var(--primary))] hover:opacity-90 text-white text-sm font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 cursor-pointer mt-2"
          >
            <span>{loading ? 'Updating Password...' : 'Set New Password'}</span>
          </Button>
        </form>
      )}

      {/* ── STEP 4: Success Screen ──────────────────────────────────────────── */}
      {step === 4 && (
        <div className="space-y-4 animate-fade-in text-center py-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-[hsl(var(--foreground))]">
              Password Reset Successfully!
            </h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed max-w-xs mx-auto">
              Your password has been updated. You can now sign in to your ElseSourav account with
              your new password.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/login">
              <Button className="w-full bg-[hsl(var(--primary))] hover:opacity-90 text-white text-sm font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 gap-2 cursor-pointer">
                <span>Sign In to Your Account</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
