'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Label, Alert, AlertDescription } from '@elsesourav/ui';
import { FloatingLabelInput } from '@elsesourav/ui/interior';
import {
  Mail,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

import { OtpBoxes } from './OtpBoxes';
import { calculatePasswordStrength } from './SignUpStep2Security';

export function ForgotPasswordForm() {
  // Step: 1 (Email) -> 2 (OTP) -> 3 (New Password) -> 4 (Success)
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [identifier, setIdentifier] = React.useState('');
  const [targetEmail, setTargetEmail] = React.useState('');
  const [resetToken, setResetToken] = React.useState('');
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
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-otp',
          identifier: trimmed,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to dispatch verification code');
        return;
      }

      setTargetEmail(data.email || trimmed);
      setStep(2);
      setOtp('');
      setResendCooldown(45);
    } catch {
      setErrorMessage('An unexpected network error occurred. Please try again.');
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
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-otp',
          email: targetEmail,
          otp,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.resetToken) {
        setErrorMessage(data.error || 'Invalid or expired OTP code. Please try again.');
        return;
      }

      setResetToken(data.resetToken);
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
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-otp',
          identifier: targetEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to resend verification code');
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
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset-password',
          email: targetEmail,
          resetToken,
          newPassword: password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to update password');
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
          <FloatingLabelInput
            id="forgot-email"
            label="Email Address or Username"
            type="text"
            icon={<Mail className="w-4 h-4" />}
            autoComplete="username"
            placeholder="developer@example.com or username"
            value={identifier}
            onChange={(val) => setIdentifier(val)}
            required
            disabled={loading}
            hint="We will dispatch a 6-digit numeric verification code to your email."
          />

          <Button
            type="submit"
            loading={loading}
            loadingText="Sending Code..."
            className="w-full bg-[hsl(var(--primary))] hover:opacity-90 text-white text-sm font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            Send Verification Code
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
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => {
                setStep(1);
                setErrorMessage(null);
              }}
              className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-2 py-1"
            >
              Change
            </Button>
          </div>

          <div className="space-y-2 text-center">
            <Label className="text-xs text-[hsl(var(--foreground))] block">
              Enter 6-Digit Verification Code
            </Label>
            <OtpBoxes value={otp} onChange={setOtp} disabled={loading} />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={() => {
                setStep(1);
                setErrorMessage(null);
              }}
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              Back
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || loading}
              className={`text-[11px] font-medium ${
                resendCooldown > 0
                  ? 'text-[hsl(var(--muted-foreground))] cursor-not-allowed'
                  : 'text-indigo-400 hover:text-indigo-300'
              }`}
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
            </Button>
          </div>

          <Button
            type="submit"
            loading={loading}
            loadingText="Verifying..."
            disabled={otp.length !== 6 || loading}
            className="w-full bg-[hsl(var(--primary))] hover:opacity-90 text-white text-sm font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            Verify Code & Continue
          </Button>
        </form>
      )}

      {/* ── STEP 3: Create New Password ─────────────────────────────────────── */}
      {step === 3 && (
        <form onSubmit={handleUpdatePassword} className="space-y-3.5 animate-fade-in">
          <div>
            <FloatingLabelInput
              id="new-password"
              name="new-password"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(val) => setPassword(val)}
              required
              disabled={loading}
              icon={<Lock className="w-4 h-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Password strength bar */}
            {password.length > 0 && (
              <div className="space-y-1 -mt-2 mb-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
                    <ShieldCheck className="w-3 h-3 text-indigo-400" />
                    Strength:
                  </span>
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
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map((seg) => (
                    <div
                      key={seg}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= seg ? passwordStrength.color : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <FloatingLabelInput
            id="confirm-new-password"
            name="confirm-new-password"
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(val) => setConfirmPassword(val)}
            required
            disabled={loading}
            icon={<Lock className="w-4 h-4" />}
            hint={
              confirmPassword
                ? confirmPassword !== password
                  ? 'Passwords do not match'
                  : 'Passwords match ✓'
                : undefined
            }
            invalid={Boolean(confirmPassword && confirmPassword !== password)}
          />

          <Button
            type="submit"
            loading={loading}
            loadingText="Updating Password..."
            disabled={!password || password !== confirmPassword || loading}
            className="w-full bg-[hsl(var(--primary))] hover:opacity-90 text-white text-sm font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 cursor-pointer mt-2"
          >
            Set New Password
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
              <Button
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full bg-[hsl(var(--primary))] hover:opacity-90 text-white text-sm font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                Sign In to Your Account
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
