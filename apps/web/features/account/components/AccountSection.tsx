'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, Badge, Button, Input } from '@elsesourav/ui';
import type { User } from '@elsesourav/types';
import {
  ShieldCheck,
  Mail,
  Calendar,
  Shield,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Check,
  Loader2,
  Trash2,
  AlertTriangle,
  Pencil,
  X,
  KeyRound,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { createAuthBrowserClient } from '@elsesourav/auth';
import {
  sendEmailOtpAction,
  verifyEmailOtpAction,
  scheduleAccountDeletionAction,
  cancelAccountDeletionAction,
} from '../actions/account-actions';

interface AccountSectionProps {
  user: User & { provider?: 'email' | 'google' | 'github' };
}

// ─── 6-Box OTP Input Component ───────────────────────────────────────────────
function OtpInput({
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
          className={`w-9 sm:w-10 h-11 sm:h-12 text-center text-base sm:text-lg font-bold rounded-xl border-2 bg-background text-foreground transition-all outline-none
            ${digits[i] ? 'border-primary text-primary ring-1 ring-primary/20' : 'border-border'}
            focus:border-primary focus:ring-2 focus:ring-primary/20
            disabled:opacity-40 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
}

// ─── Main Account & Security Component ───────────────────────────────────────
export function AccountSection({ user }: AccountSectionProps) {
  const isOAuth = user.provider === 'google' || user.provider === 'github';

  // ── Email state ───────────────────────────────────────────────────────────
  const [isEditingEmail, setIsEditingEmail] = React.useState(false);
  const [emailStep, setEmailStep] = React.useState<'idle' | 'sending' | 'otp' | 'verifying' | 'done'>('idle');
  const [emailOtp, setEmailOtp] = React.useState('');
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = React.useState(user.emailVerified);

  // ── Password state ────────────────────────────────────────────────────────
  const [pwStep, setPwStep] = React.useState<'idle' | 'sending' | 'otp' | 'verifying' | 'form' | 'saving' | 'done'>('idle');
  const [pwOtp, setPwOtp] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [pwError, setPwError] = React.useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = React.useState<string | null>(null);

  // ── Delete state ──────────────────────────────────────────────────────────
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [deleteReason, setDeleteReason] = React.useState('');
  const [typedUsername, setTypedUsername] = React.useState('');
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const targetUsername = user.username || user.email.split('@')[0] || 'user';
  const isUsernameMatched = typedUsername.trim().toLowerCase() === targetUsername.toLowerCase();

  const isPendingDeletion = !!user.scheduledDeletionAt;
  const deletionDate = user.scheduledDeletionAt
    ? new Date(user.scheduledDeletionAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const formattedJoinedDate = React.useMemo(() => {
    try {
      return new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Aug 2026';
    }
  }, [user.createdAt]);

  // ── Email: Send OTP ───────────────────────────────────────────────────────
  const handleSendEmailOtp = async () => {
    setEmailError(null);
    setEmailStep('sending');
    const res = await sendEmailOtpAction();
    if (res.success) {
      setEmailStep('otp');
      setEmailOtp('');
    } else {
      setEmailError(res.error || 'Failed to send OTP code');
      setEmailStep('idle');
    }
  };

  // ── Email: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length !== 6) {
      setEmailError('Please enter the full 6-digit OTP code');
      return;
    }
    setEmailError(null);
    setEmailStep('verifying');
    const res = await verifyEmailOtpAction(emailOtp);
    if (res.success) {
      setIsEmailVerified(true);
      setEmailStep('done');
      setIsEditingEmail(false);
    } else {
      setEmailError(res.error || 'Invalid or expired OTP code');
      setEmailStep('otp');
    }
  };

  // ── Password: Send OTP ────────────────────────────────────────────────────
  const handleSendPwOtp = async () => {
    setPwError(null);
    setPwStep('sending');
    const res = await sendEmailOtpAction();
    if (res.success) {
      setPwStep('otp');
      setPwOtp('');
    } else {
      setPwError(res.error || 'Failed to send OTP code');
      setPwStep('idle');
    }
  };

  // ── Password: Verify OTP ──────────────────────────────────────────────────
  const handleVerifyPwOtp = async () => {
    if (pwOtp.length !== 6) {
      setPwError('Please enter the full 6-digit OTP code');
      return;
    }
    setPwError(null);
    setPwStep('verifying');
    const res = await verifyEmailOtpAction(pwOtp);
    if (res.success) {
      setIsEmailVerified(true); // OTP verified → email is verified as well
      setPwStep('form');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPwError(res.error || 'Invalid or expired OTP code');
      setPwStep('otp');
    }
  };

  // ── Password: Set new password ────────────────────────────────────────────
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (newPassword.length < 8) {
      setPwError('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match');
      return;
    }
    setPwStep('saving');
    try {
      const supabase = createAuthBrowserClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPwError(error.message);
        setPwStep('form');
      } else {
        setPwSuccess('Password updated successfully');
        setPwStep('done');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPwError('An unexpected error occurred. Please try again.');
      setPwStep('form');
    }
  };

  // ── Delete Account ────────────────────────────────────────────────────────
  const handleScheduleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUsernameMatched) return;
    setIsDeletingAccount(true);
    setDeleteError(null);
    const res = await scheduleAccountDeletionAction(deleteReason.trim() || undefined);
    if (res.success) {
      window.location.reload();
    } else {
      setDeleteError(res.error || 'Failed to schedule deletion');
      setIsDeletingAccount(false);
    }
  };

  const handleCancelDelete = async () => {
    setIsDeletingAccount(true);
    const res = await cancelAccountDeletionAction();
    if (res.success) {
      window.location.reload();
    } else {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="bg-card text-card-foreground border-border shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
        <CardHeader className="pb-3 sm:pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                Account &amp; Security
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Manage your credentials, password reset flow, and session security.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="p-4 sm:p-5 space-y-3.5">

          {/* ── 1. Primary Email ──────────────────────────────────────────── */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/20 border border-border/80 space-y-3 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Primary Email</span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5">
                {isEmailVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Verified
                  </span>
                ) : !isOAuth ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                    Unverified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    <Lock className="w-2.5 h-2.5" />
                    {user.provider}
                  </span>
                )}
              </div>
            </div>

            {/* Read-Only State with Action */}
            {!isEditingEmail ? (
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-background/80 border border-border/70">
                <span className="text-xs font-mono text-foreground truncate select-all">
                  {user.email}
                </span>

                {!isOAuth && (
                  <div>
                    {!isEmailVerified ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          setIsEditingEmail(true);
                          setEmailStep('idle');
                          setEmailError(null);
                        }}
                        className="text-xs font-semibold h-7 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-black gap-1 cursor-pointer shadow-sm"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verify Email</span>
                      </Button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingEmail(true);
                          setEmailStep('idle');
                          setEmailError(null);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Change</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Inline OTP Verification Box */
              <div className="p-3.5 rounded-xl bg-background border border-primary/25 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Email Identity Verification
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingEmail(false);
                      setEmailStep('idle');
                      setEmailOtp('');
                      setEmailError(null);
                    }}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {emailError && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-xs text-rose-500">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}

                {emailStep === 'idle' && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      We will dispatch a 6-digit security code to{' '}
                      <span className="text-foreground font-mono font-semibold">{user.email}</span>.
                    </p>
                    <Button
                      type="button"
                      onClick={handleSendEmailOtp}
                      size="sm"
                      className="text-xs font-semibold gap-1.5 h-8 px-3.5 rounded-lg cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Verification Code</span>
                    </Button>
                  </div>
                )}

                {emailStep === 'sending' && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span>Sending code to {user.email}…</span>
                  </div>
                )}

                {(emailStep === 'otp' || emailStep === 'verifying') && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground text-center">
                      Enter the 6-digit code sent to{' '}
                      <span className="font-semibold text-foreground font-mono">{user.email}</span>
                    </p>
                    <OtpInput
                      value={emailOtp}
                      onChange={setEmailOtp}
                      disabled={emailStep === 'verifying'}
                    />
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer transition-colors"
                      >
                        Resend Code
                      </button>
                      <Button
                        type="button"
                        onClick={handleVerifyEmailOtp}
                        disabled={emailOtp.length !== 6 || emailStep === 'verifying'}
                        isLoading={emailStep === 'verifying'}
                        size="sm"
                        className="text-xs font-semibold gap-1.5 h-8 px-3.5 rounded-lg cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Verify Code</span>
                      </Button>
                    </div>
                  </div>
                )}

                {emailStep === 'done' && (
                  <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium py-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Email identity verified successfully!</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 2. Password ───────────────────────────────────────────────── */}
          {!isOAuth && (
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
                ) : pwStep !== 'done' && (
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
                )}
              </div>

              {/* Password Info Row */}
              {pwStep === 'idle' && (
                <div className="flex items-center justify-between text-xs text-muted-foreground p-2.5 rounded-xl bg-background/80 border border-border/70 font-mono">
                  <span>••••••••••••••••</span>
                  <span className="text-[11px] text-muted-foreground font-sans">Protected by OTP</span>
                </div>
              )}

              {/* Inline Password Reset Wizard */}
              {pwStep !== 'idle' && (
                <div className="p-3.5 rounded-xl bg-background border border-primary/25 space-y-3 animate-in fade-in duration-150">
                  {/* Step Breadcrumbs */}
                  {pwStep !== 'done' && (
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-1 border-b border-border/60">
                      {['Send OTP', 'Verify Code', 'New Password'].map((label, i) => {
                        const stepIdx = pwStep === 'sending' || pwStep === 'otp' ? 0 : pwStep === 'verifying' ? 1 : 2;
                        const isDone = i < stepIdx;
                        const isActive = i === stepIdx;
                        return (
                          <div key={label} className="flex items-center gap-1">
                            <span className={`font-semibold ${isActive ? 'text-primary' : isDone ? 'text-emerald-500' : 'text-muted-foreground/50'}`}>
                              {isDone ? '✓' : `${i + 1}.`} {label}
                            </span>
                            {i < 2 && <ChevronRight className="w-3 h-3 text-muted-foreground/30 ml-1" />}
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
                      <span>Sending OTP code to {user.email}…</span>
                    </div>
                  )}

                  {(pwStep === 'otp' || pwStep === 'verifying') && (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground text-center">
                        Enter the 6-digit code sent to{' '}
                        <span className="font-semibold text-foreground font-mono">{user.email}</span>
                      </p>
                      <OtpInput
                        value={pwOtp}
                        onChange={setPwOtp}
                        disabled={pwStep === 'verifying'}
                      />
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={handleSendPwOtp}
                          className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                        >
                          Resend Code
                        </button>
                        <Button
                          type="button"
                          onClick={handleVerifyPwOtp}
                          disabled={pwOtp.length !== 6 || pwStep === 'verifying'}
                          isLoading={pwStep === 'verifying'}
                          size="sm"
                          className="text-xs font-semibold gap-1.5 h-8 px-3.5 rounded-lg cursor-pointer"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {(pwStep === 'form' || pwStep === 'saving') && (
                    <form onSubmit={handleSetPassword} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-foreground">New Password</label>
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
                          <label className="text-[11px] font-semibold text-foreground">Confirm Password</label>
                          <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            className="bg-background border-border text-xs rounded-lg text-foreground h-8 sm:h-9"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/60">
                        <button
                          type="button"
                          onClick={() => { setPwStep('otp'); setPwOtp(''); }}
                          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Back</span>
                        </button>

                        <Button
                          type="submit"
                          disabled={pwStep === 'saving' || !newPassword || !confirmPassword}
                          isLoading={pwStep === 'saving'}
                          size="sm"
                          className="text-xs font-semibold gap-1.5 h-8 px-3.5 rounded-lg cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Save Password</span>
                        </Button>
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
                        onClick={() => { setPwStep('idle'); setPwSuccess(null); }}
                        className="text-muted-foreground hover:text-foreground text-xs underline cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* OAuth notice */}
          {isOAuth && (
            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/80 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-4 h-4 text-primary shrink-0" />
              <span>
                Signed in with {user.provider === 'google' ? 'Google' : 'GitHub'} OAuth. Credentials are managed by your provider.
              </span>
            </div>
          )}

          {/* ── 3. Account Overview & Active Session ───────────────────────── */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/20 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors">
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="font-semibold text-foreground">
                  {user.role === 'ADMIN' ? 'Administrator' : 'Standard Member'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Joined {formattedJoinedDate}</span>
              </div>
            </div>

            <form action="/api/auth/logout" method="POST" className="shrink-0">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="text-xs border-border hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 gap-1.5 rounded-lg cursor-pointer h-7 px-3"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </Button>
            </form>
          </div>

          {/* ── 4. Delete Account ─────────────────────────────────────────── */}
          {isPendingDeletion ? (
            /* 30-day countdown banner */
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <h4 className="text-xs font-semibold text-rose-500">
                    Account Deletion Scheduled
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your account will be permanently deleted on{' '}
                    <span className="font-semibold text-rose-400">
                      {deletionDate}
                    </span>
                    . You can cancel at any time during this 30-day grace period.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelDelete}
                disabled={isDeletingAccount}
                isLoading={isDeletingAccount}
                className="border-rose-500/40 hover:bg-rose-500/10 text-rose-400 text-xs gap-1.5 rounded-lg cursor-pointer h-7 px-3"
              >
                <X className="w-3 h-3" />
                <span>Cancel Deletion</span>
              </Button>
            </div>
          ) : (
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-rose-500">
                  Delete Account
                </h4>
                <p className="text-xs text-muted-foreground">
                  Schedule your account for permanent deletion with a 30-day recovery grace period.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="border-rose-500/30 hover:bg-rose-500/10 text-rose-500 text-xs gap-1.5 shrink-0 rounded-lg cursor-pointer h-7 px-3 self-start sm:self-auto"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Account</span>
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeletingAccount) {
              setIsDeleteModalOpen(false);
              setTypedUsername('');
              setDeleteError(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl sm:rounded-3xl border border-rose-500/40 bg-card p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 id="delete-account-title" className="text-sm font-bold text-foreground">
                  Schedule Account Deletion
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your account enters a <span className="font-semibold text-foreground">30-day grace period</span> before permanent deletion.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleScheduleDelete} className="space-y-3.5 text-xs">
              <div className="space-y-1.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
                <label className="block text-[11px] font-semibold text-rose-300">
                  Type your username <span className="font-mono text-white bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/40">@{targetUsername}</span> to confirm:
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={typedUsername}
                    onChange={(e) => setTypedUsername(e.target.value)}
                    placeholder={targetUsername}
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    className={`bg-background border text-xs rounded-lg text-foreground h-8 sm:h-9 font-mono pr-8 ${
                      isUsernameMatched
                        ? 'border-emerald-500/60 focus:border-emerald-500 ring-1 ring-emerald-500/20'
                        : 'border-border focus:border-rose-500'
                    }`}
                  />
                  {isUsernameMatched && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-foreground text-[11px]">
                  Reason for closure <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Tell us why you are leaving..."
                  className="bg-background border-border text-xs rounded-lg text-foreground h-8 sm:h-9"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isDeletingAccount}
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setTypedUsername('');
                    setDeleteError(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-lg h-8 px-3"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isDeletingAccount || !isUsernameMatched}
                  isLoading={isDeletingAccount}
                  className={`text-xs font-semibold px-3.5 h-8 rounded-lg gap-1.5 shadow-sm transition-all ${
                    isUsernameMatched
                      ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 opacity-60 cursor-not-allowed border border-zinc-700'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeletingAccount ? 'Scheduling…' : 'Schedule Deletion'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
