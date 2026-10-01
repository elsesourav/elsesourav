'use client';

import * as React from 'react';
import { createAuthBrowserClient } from '@elsesourav/auth';
import { Button, Input } from '@elsesourav/ui';
import {
  Lock,
  Check,
  KeyRound,
  X,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { OtpInput } from '@/components/interior/OtpInput';
import { PasswordStrength } from '@/components/interior/PasswordStrength';
import { LoadingButton } from '@/components/interior/LoadingButton';
import { sendEmailOtpAction, verifyEmailOtpAction } from '../actions/account-actions';

interface AccountPasswordCardProps {
  email: string;
  onEmailVerified?: () => void;
}

export function AccountPasswordCard({ email, onEmailVerified }: AccountPasswordCardProps) {
  const [pwStep, setPwStep] = React.useState<
    'idle' | 'sending' | 'otp' | 'verifying' | 'form' | 'saving' | 'done'
  >('idle');
  const [pwOtp, setPwOtp] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [pwError, setPwError] = React.useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = React.useState<string | null>(null);

  const handleSendPwOtp = async () => {
    setPwError(null);
    setPwStep('sending');
    const res = await sendEmailOtpAction('PASSWORD_RESET');
    if (res.success) {
      setPwStep('otp');
      setPwOtp('');
    } else {
      setPwError(res.error || 'Failed to send OTP code');
      setPwStep('idle');
    }
  };

  const handleVerifyPwOtp = async () => {
    if (pwOtp.length !== 6) {
      setPwError('Please enter the full 6-digit OTP code');
      throw new Error('Please enter the full 6-digit OTP code');
    }
    setPwError(null);
    setPwStep('verifying');
    const res = await verifyEmailOtpAction(pwOtp, 'PASSWORD_RESET');
    if (res.success) {
      onEmailVerified?.();
      setPwStep('form');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPwError(res.error || 'Invalid or expired OTP code');
      setPwStep('otp');
      throw new Error(res.error || 'Invalid or expired OTP code');
    }
  };

  const handleSetPassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setPwError(null);
    if (newPassword.length < 8) {
      setPwError('Password must be at least 8 characters long');
      throw new Error('Password must be at least 8 characters long');
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match');
      throw new Error('Passwords do not match');
    }
    setPwStep('saving');
    try {
      const supabase = createAuthBrowserClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPwError(error.message);
        setPwStep('form');
        throw new Error(error.message);
      } else {
        setPwSuccess('Password updated successfully');
        setPwStep('done');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setPwError(msg);
      setPwStep('form');
      throw err;
    }
  };

  return (
    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/20 border border-border/80 space-y-3 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Password</span>
        </div>

        {pwStep === 'idle' && pwSuccess && (
          <span className="text-[11px] text-emerald-500 flex items-center gap-1 font-medium">
            <Check className="w-3 h-3" /> Updated
          </span>
        )}

        {pwStep === 'idle' ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSendPwOtp}
            className="text-xs border-border hover:bg-accent gap-1.5 h-7 px-3 rounded-lg cursor-pointer"
          >
            <KeyRound className="w-3 h-3" />
            <span>Change Password</span>
          </Button>
        ) : (
          pwStep !== 'done' && (
            <button
              type="button"
              onClick={() => {
                setPwStep('idle');
                setPwOtp('');
                setPwError(null);
                setPwSuccess(null);
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )
        )}
      </div>

      {pwStep === 'idle' && (
        <div className="flex items-center justify-between text-xs text-muted-foreground p-2.5 rounded-xl bg-background/80 border border-border/70 font-mono">
          <span>••••••••••••••••</span>
          <span className="text-[11px] text-muted-foreground font-sans">
            Protected by OTP
          </span>
        </div>
      )}

      {pwStep !== 'idle' && (
        <div className="p-3.5 rounded-xl bg-background border border-primary/25 space-y-3 animate-in fade-in duration-150">
          {pwStep !== 'done' && (
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-1 border-b border-border/60">
              {['Send OTP', 'Verify Code', 'New Password'].map((label, i) => {
                const stepIdx =
                  pwStep === 'sending' || pwStep === 'otp'
                    ? 0
                    : pwStep === 'verifying'
                      ? 1
                      : 2;
                const isDone = i < stepIdx;
                const isActive = i === stepIdx;
                return (
                  <div key={label} className="flex items-center gap-1">
                    <span
                      className={`font-semibold ${isActive ? 'text-primary' : isDone ? 'text-emerald-500' : 'text-muted-foreground/50'}`}
                    >
                      {isDone ? '✓' : `${i + 1}.`} {label}
                    </span>
                    {i < 2 && (
                      <ChevronRight className="w-3 h-3 text-muted-foreground/30 ml-1" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {pwError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-xs text-rose-500">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{pwError}</span>
            </div>
          )}

          {pwStep === 'sending' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Sending OTP code to {email}…</span>
            </div>
          )}

          {(pwStep === 'otp' || pwStep === 'verifying') && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit code sent to{' '}
                <span className="font-semibold text-foreground font-mono">
                  {email}
                </span>
              </p>
              <div className="flex justify-center py-1">
                <OtpInput
                  value={pwOtp}
                  onChange={setPwOtp}
                  disabled={pwStep === 'verifying'}
                  status={pwError ? 'error' : 'idle'}
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleSendPwOtp}
                  className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                >
                  Resend Code
                </button>
                <LoadingButton
                  onAction={handleVerifyPwOtp}
                  disabled={pwOtp.length !== 6 || pwStep === 'verifying'}
                  pendingLabel="Verifying..."
                  successLabel="Verified"
                  errorLabel="Failed"
                  className="text-xs font-semibold h-8 px-3.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Next
                </LoadingButton>
              </div>
            </div>
          )}

          {(pwStep === 'form' || pwStep === 'saving') && (
            <form onSubmit={handleSetPassword} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    autoFocus
                    className="bg-background border-border text-xs rounded-lg text-foreground h-8 sm:h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="bg-background border-border text-xs rounded-lg text-foreground h-8 sm:h-9"
                  />
                </div>
              </div>

              {newPassword && (
                <div className="pt-0.5">
                  <PasswordStrength
                    value={newPassword}
                    showRules={false}
                    className="text-xs"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setPwStep('otp');
                    setPwOtp('');
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <LoadingButton
                  onAction={handleSetPassword}
                  disabled={pwStep === 'saving' || !newPassword || !confirmPassword}
                  pendingLabel="Saving..."
                  successLabel="Saved"
                  errorLabel="Failed"
                  className="text-xs font-semibold h-8 px-3.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Password
                </LoadingButton>
              </div>
            </form>
          )}

          {pwStep === 'done' && (
            <div className="flex items-center justify-between text-xs text-emerald-500 font-medium py-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Password updated successfully!
              </span>
              <button
                type="button"
                onClick={() => {
                  setPwStep('idle');
                  setPwSuccess(null);
                }}
                className="text-muted-foreground hover:text-foreground text-xs underline cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
