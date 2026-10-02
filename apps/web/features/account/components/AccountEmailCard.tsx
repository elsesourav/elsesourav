'use client';

import * as React from 'react';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Lock,
  ShieldCheck,
  Pencil,
  Sparkles,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@elsesourav/ui';
import { LoadingButton } from '@/components/interior/LoadingButton';
import { OtpInput } from '@/components/interior/OtpInput';
import StatusMark from '@/components/micro/StatusMark';
import { sendEmailOtpAction, verifyEmailOtpAction } from '../actions/account-actions';

interface AccountEmailCardProps {
  email: string;
  initialVerified: boolean;
  isOAuth: boolean;
  provider?: 'email' | 'google' | 'github';
}

export function AccountEmailCard({
  email,
  initialVerified,
  isOAuth,
  provider,
}: AccountEmailCardProps) {
  const [isEditingEmail, setIsEditingEmail] = React.useState(false);
  const [emailStep, setEmailStep] = React.useState<
    'idle' | 'sending' | 'otp' | 'verifying' | 'done'
  >('idle');
  const [emailOtp, setEmailOtp] = React.useState('');
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = React.useState(initialVerified);

  const handleSendEmailOtp = async () => {
    setEmailError(null);
    setEmailStep('sending');
    const res = await sendEmailOtpAction('EMAIL_VERIFY');
    if (res.success) {
      setEmailStep('otp');
      setEmailOtp('');
    } else {
      setEmailError(res.error || 'Failed to send OTP code');
      setEmailStep('idle');
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length !== 6) {
      setEmailError('Please enter the full 6-digit OTP code');
      throw new Error('Please enter the full 6-digit OTP code');
    }
    setEmailError(null);
    setEmailStep('verifying');
    const res = await verifyEmailOtpAction(emailOtp, 'EMAIL_VERIFY');
    if (res.success) {
      setIsEmailVerified(true);
      setEmailStep('done');
      setIsEditingEmail(false);
    } else {
      setEmailError(res.error || 'Invalid or expired OTP code');
      setEmailStep('otp');
      throw new Error(res.error || 'Invalid or expired OTP code');
    }
  };

  return (
    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/20 border border-border/80 space-y-3 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Primary Email</span>
        </div>

        <div className="flex items-center gap-1.5">
          {isEmailVerified ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <StatusMark status="done" size={13} strokeWidth={2} doneColor="#34d399" />
              Verified
            </span>
          ) : !isOAuth ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              <StatusMark
                status={
                  emailStep === 'sending' || emailStep === 'verifying' ? 'running' : 'pending'
                }
                size={13}
                strokeWidth={2}
                color="#f59e0b"
              />
              {emailStep === 'sending' || emailStep === 'verifying' ? 'Verifying…' : 'Unverified'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              <Lock className="w-2.5 h-2.5" />
              {provider}
            </span>
          )}
        </div>
      </div>

      {!isEditingEmail ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-background/80 border border-border/70">
          <span className="text-xs font-mono text-foreground truncate select-all min-w-0">
            {email}
          </span>

          {!isOAuth && (
            <div className="shrink-0 flex items-center justify-end">
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
                <span className="text-foreground font-mono font-semibold">{email}</span>.
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
              <span>Sending code to {email}…</span>
            </div>
          )}

          {(emailStep === 'otp' || emailStep === 'verifying') && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit code sent to{' '}
                <span className="font-semibold text-foreground font-mono">{email}</span>
              </p>
              <div className="flex justify-center py-1">
                <OtpInput
                  value={emailOtp}
                  onChange={setEmailOtp}
                  disabled={emailStep === 'verifying'}
                  status={emailError ? 'error' : 'idle'}
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer transition-colors"
                >
                  Resend Code
                </button>
                <LoadingButton
                  onAction={handleVerifyEmailOtp}
                  disabled={emailOtp.length !== 6 || emailStep === 'verifying'}
                  pendingLabel="Verifying..."
                  successLabel="Verified"
                  errorLabel="Failed"
                  className="text-xs font-semibold h-8 px-3.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Verify Code
                </LoadingButton>
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
  );
}
