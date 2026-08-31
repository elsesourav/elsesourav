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

// ─── OTP Input (6 separate digit boxes) ───────────────────────────────────────
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
    <div className="flex items-center gap-2 justify-center">
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
          className={`w-10 h-12 text-center text-base font-bold rounded-xl border-2 bg-background text-foreground transition-all outline-none
            ${digits[i] ? 'border-primary text-primary' : 'border-border'}
            focus:border-primary focus:ring-0
            disabled:opacity-40 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function AccountSection({ user }: AccountSectionProps) {
  const isOAuth = user.provider === 'google' || user.provider === 'github';

  // ── Email state ───────────────────────────────────────────────────────────
  const [isEditingEmail, setIsEditingEmail] = React.useState(false);
  const [editEmailValue, setEditEmailValue] = React.useState(user.email || '');
  // emailStep: 'idle' | 'sending' | 'otp' | 'verifying' | 'done'
  const [emailStep, setEmailStep] = React.useState<'idle' | 'sending' | 'otp' | 'verifying' | 'done'>('idle');
  const [emailOtp, setEmailOtp] = React.useState('');
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = React.useState(user.emailVerified);

  // ── Password state ────────────────────────────────────────────────────────
  // pwStep: 'idle' | 'sending' | 'otp' | 'verifying' | 'form' | 'saving' | 'done'
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
      setEmailError(res.error || 'Failed to send OTP');
      setEmailStep('idle');
    }
  };

  // ── Email: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length !== 6) {
      setEmailError('Please enter the full 6-digit OTP');
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
      setEmailError(res.error || 'Invalid or expired OTP');
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
      setPwError(res.error || 'Failed to send OTP');
      setPwStep('idle');
    }
  };

  // ── Password: Verify OTP ──────────────────────────────────────────────────
  const handleVerifyPwOtp = async () => {
    if (pwOtp.length !== 6) {
      setPwError('Please enter the full 6-digit OTP');
      return;
    }
    setPwError(null);
    setPwStep('verifying');
    const res = await verifyEmailOtpAction(pwOtp);
    if (res.success) {
      setIsEmailVerified(true); // OTP verified → email is verified too
      setPwStep('form');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPwError(res.error || 'Invalid or expired OTP');
      setPwStep('otp');
    }
  };

  // ── Password: Set new password ────────────────────────────────────────────
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (newPassword.length < 8) {
      setPwError('Password must be at least 8 characters');
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
        setPwSuccess('Password updated successfully.');
        setPwStep('done');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPwError('An unexpected error occurred.');
      setPwStep('form');
    }
  };

  // ── Delete Account ────────────────────────────────────────────────────────
  const handleScheduleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="w-full space-y-3.5">
      <Card className="bg-card text-card-foreground border-border shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
        <CardHeader className="pb-2.5 sm:pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm sm:text-base font-bold text-foreground">
              Account &amp; Security
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Manage your email credentials, password, and session security.
          </CardDescription>
        </CardHeader>

        <div className="p-4 sm:p-5 pt-1 space-y-3">

          {/* ── 1. Primary Email ──────────────────────────────────────────── */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Primary Email</span>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Verified badge — only show if OTP-verified */}
                {isEmailVerified && (
                  <Badge
                    variant="success"
                    className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 px-2 py-0.5"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                  </Badge>
                )}
                {/* Unverified badge */}
                {!isEmailVerified && !isOAuth && !isEditingEmail && (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 px-2 py-0.5"
                  >
                    <AlertCircle className="w-2.5 h-2.5" /> Unverified
                  </Badge>
                )}
                {/* OAuth badge */}
                {isOAuth && (
                  <Badge
                    variant="info"
                    className="text-[10px] bg-primary/10 text-primary border-primary/30 gap-1 font-mono uppercase px-2 py-0.5"
                  >
                    <Lock className="w-2.5 h-2.5" /> OAuth ({user.provider})
                  </Badge>
                )}
                {/* Edit button (non-OAuth, not currently editing) */}
                {!isOAuth && !isEditingEmail && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingEmail(true);
                      setEmailStep('idle');
                      setEmailOtp('');
                      setEmailError(null);
                    }}
                    className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Edit email"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {/* Cancel edit */}
                {isEditingEmail && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingEmail(false);
                      setEmailStep('idle');
                      setEmailOtp('');
                      setEmailError(null);
                    }}
                    className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Email display (read-only) */}
            {!isEditingEmail && (
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-foreground font-mono bg-background/60 px-3 py-2 rounded-lg border border-border flex-1 truncate">
                  {user.email}
                </p>
                {/* Verify button for unverified non-OAuth users */}
                {!isEmailVerified && !isOAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingEmail(true);
                      setEmailStep('idle');
                    }}
                    className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    Verify →
                  </button>
                )}
              </div>
            )}

            {/* Edit / Verify flow */}
            {isEditingEmail && !isOAuth && (
              <div className="space-y-3">
                {/* Error */}
                {emailError && (
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}

                {/* Step: idle — show current email + send OTP */}
                {emailStep === 'idle' && (
                  <div className="space-y-2.5">
                    <div className="text-[11px] text-muted-foreground leading-relaxed">
                      We'll send a 6-digit code to{' '}
                      <span className="text-foreground font-semibold font-mono">{user.email}</span>{' '}
                      to verify your identity.
                    </div>
                    <Button
                      type="button"
                      onClick={handleSendEmailOtp}
                      size="sm"
                      className="text-xs font-semibold gap-1.5 h-8 px-3 rounded-lg cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Send OTP
                    </Button>
                  </div>
                )}

                {/* Step: sending */}
                {emailStep === 'sending' && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    Sending OTP to {user.email}…
                  </div>
                )}

                {/* Step: otp */}
                {(emailStep === 'otp' || emailStep === 'verifying') && (
                  <div className="space-y-3">
                    <div className="text-[11px] text-muted-foreground">
                      Enter the 6-digit code sent to{' '}
                      <span className="font-semibold text-foreground font-mono">{user.email}</span>
                    </div>
                    <OtpInput
                      value={emailOtp}
                      onChange={setEmailOtp}
                      disabled={emailStep === 'verifying'}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={handleVerifyEmailOtp}
                        disabled={emailOtp.length !== 6 || emailStep === 'verifying'}
                        size="sm"
                        className="text-xs font-semibold gap-1.5 h-8 px-3 rounded-lg cursor-pointer"
                      >
                        {emailStep === 'verifying' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Verifying…
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Verify OTP
                          </>
                        )}
                      </Button>
                      <button
                        type="button"
                        onClick={() => { setEmailStep('idle'); setEmailOtp(''); setEmailError(null); }}
                        className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>
                )}

                {/* Step: done */}
                {emailStep === 'done' && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Email verified successfully!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 2. Password ───────────────────────────────────────────────── */}
          {!isOAuth && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Password</span>
                </div>
                {pwStep === 'idle' && pwSuccess && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <Check className="w-3 h-3" /> Updated
                  </span>
                )}
                {pwStep === 'idle' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSendPwOtp}
                    className="text-xs border-border hover:bg-accent gap-1.5 h-7 px-2.5 rounded-lg cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3" />
                    Change Password
                  </Button>
                )}
                {pwStep !== 'idle' && pwStep !== 'done' && (
                  <button
                    type="button"
                    onClick={() => { setPwStep('idle'); setPwOtp(''); setPwError(null); setPwSuccess(null); setNewPassword(''); setConfirmPassword(''); }}
                    className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Error */}
              {pwError && pwStep !== 'idle' && (
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pwError}</span>
                </div>
              )}

              {/* Step indicator */}
              {(pwStep !== 'idle' && pwStep !== 'done') && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  {['Send OTP', 'Enter OTP', 'New Password'].map((label, i) => {
                    const stepIdx = pwStep === 'sending' || pwStep === 'otp' ? 0 : pwStep === 'verifying' ? 1 : 2;
                    const done = i < stepIdx;
                    const active = i === stepIdx;
                    return (
                      <React.Fragment key={label}>
                        <span className={`font-semibold ${active ? 'text-primary' : done ? 'text-emerald-500' : 'text-muted-foreground/50'}`}>
                          {done ? '✓' : `${i + 1}.`} {label}
                        </span>
                        {i < 2 && <ChevronRight className="w-3 h-3 text-muted-foreground/30" />}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {/* sending OTP */}
              {(pwStep === 'sending') && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  Sending OTP to {user.email}…
                </div>
              )}

              {/* OTP entry */}
              {(pwStep === 'otp' || pwStep === 'verifying') && (
                <div className="space-y-3">
                  <div className="text-[11px] text-muted-foreground">
                    Enter the 6-digit code sent to{' '}
                    <span className="font-semibold text-foreground font-mono">{user.email}</span>
                  </div>
                  <OtpInput
                    value={pwOtp}
                    onChange={setPwOtp}
                    disabled={pwStep === 'verifying'}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={handleVerifyPwOtp}
                      disabled={pwOtp.length !== 6 || pwStep === 'verifying'}
                      size="sm"
                      className="text-xs font-semibold gap-1.5 h-8 px-3 rounded-lg cursor-pointer"
                    >
                      {pwStep === 'verifying' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Verifying…
                        </>
                      ) : (
                        <>
                          Next <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </Button>
                    <button
                      type="button"
                      onClick={() => { setPwStep('idle'); setPwOtp(''); setPwError(null); }}
                      className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              )}

              {/* Password form */}
              {(pwStep === 'form' || pwStep === 'saving') && (
                <form onSubmit={handleSetPassword} className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (min 8 chars)"
                      autoFocus
                      className="bg-background border-border text-xs rounded-lg text-foreground h-8 sm:h-9"
                    />
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="bg-background border-border text-xs rounded-lg text-foreground h-8 sm:h-9"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      disabled={pwStep === 'saving' || !newPassword || !confirmPassword}
                      size="sm"
                      className="text-xs font-semibold gap-1.5 h-8 px-3 rounded-lg cursor-pointer"
                    >
                      {pwStep === 'saving' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          Set Password
                        </>
                      )}
                    </Button>
                    <button
                      type="button"
                      onClick={() => { setPwStep('otp'); setPwOtp(''); setPwError(null); }}
                      className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors flex items-center gap-0.5"
                    >
                      <ChevronLeft className="w-3 h-3" /> Back
                    </button>
                  </div>
                </form>
              )}

              {/* Done */}
              {pwStep === 'done' && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Password updated successfully.
                  <button
                    type="button"
                    onClick={() => { setPwStep('idle'); setPwSuccess(null); }}
                    className="ml-auto text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}

          {/* OAuth password notice */}
          {isOAuth && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-muted/30 border border-border/80 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-4 h-4 text-primary shrink-0" />
              <span>
                Signed in with {user.provider === 'google' ? 'Google' : 'GitHub'} OAuth. Password
                updates are managed by your provider.
              </span>
            </div>
          )}

          {/* ── 3. Account Overview & Active Session ───────────────────────── */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-muted/30 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
                className="text-xs border-border hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 gap-1.5 rounded-lg cursor-pointer h-7 px-2.5"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </Button>
            </form>
          </div>

          {/* ── 4. Delete Account ─────────────────────────────────────────── */}
          {isPendingDeletion ? (
            /* 30-day countdown banner */
            <div className="p-3 sm:p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/30 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <h4 className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                    Account deletion scheduled
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Your account will be permanently deleted on{' '}
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {deletionDate}
                    </span>
                    . You can cancel at any time before then.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelDelete}
                disabled={isDeletingAccount}
                className="border-rose-500/40 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs gap-1.5 rounded-lg cursor-pointer h-7 px-2.5"
              >
                {isDeletingAccount ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <X className="w-3 h-3" />
                )}
                Cancel Deletion
              </Button>
            </div>
          ) : (
            <div className="p-3 sm:p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                  Delete Account
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Schedule your account for permanent deletion after a 30-day grace period.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="border-rose-500/40 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs gap-1.5 shrink-0 rounded-lg cursor-pointer h-7 px-2.5 self-start sm:self-auto"
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
              setDeleteError(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl sm:rounded-3xl border border-rose-500/40 bg-card p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 id="delete-account-title" className="text-sm font-bold text-foreground">
                  Schedule Account Deletion
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your account will be deleted after{' '}
                  <span className="font-semibold text-foreground">30 days</span>. You can cancel
                  anytime by logging in during that period.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleScheduleDelete} className="space-y-3.5 text-xs">
              <div className="space-y-1.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
                <label className="block text-[11px] font-semibold text-rose-300">
                  To confirm, please type your username <span className="font-mono text-white bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/40">@{targetUsername}</span>:
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
                  Reason for closure{' '}
                  <span className="text-muted-foreground font-normal">(optional)</span>
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
                  onClick={() => { setIsDeleteModalOpen(false); setTypedUsername(''); setDeleteError(null); }}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-lg h-8 px-3"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isDeletingAccount || !isUsernameMatched}
                  isLoading={isDeletingAccount}
                  className={`text-xs font-semibold px-3 h-8 rounded-lg gap-1.5 shadow-sm transition-all ${
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
