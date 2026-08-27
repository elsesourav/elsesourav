import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { KeyRound, AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { forgotPasswordSchema } from '@/schemas/auth.schema';
import './AuthPage.css';

export const ForgotPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { sendPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // SEO & Robots
  useEffect(() => {
    document.title = 'Reset Your Password | ElseSourav';

    let metaTag = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const created = !metaTag;
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'robots';
      document.head.appendChild(metaTag);
    }
    const previousContent = metaTag.content;
    metaTag.content = 'noindex, nofollow';

    return () => {
      if (created && metaTag && metaTag.parentNode) {
        metaTag.parentNode.removeChild(metaTag);
      } else if (metaTag) {
        metaTag.content = previousContent || '';
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldError(null);

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setFieldError(validation.error.flatten().fieldErrors.email?.[0] || 'Invalid email');
      return;
    }

    setIsSubmitting(true);

    const result = await sendPasswordReset({ email: email.trim() });

    setIsSubmitting(false);

    // Privacy-conscious: Always show success state unless network error, preventing account enumeration
    if (result.success) {
      setSubmittedEmail(email.trim());
      setIsSuccess(true);
    } else if (result.error.code === 'NETWORK_ERROR') {
      setErrorMessage(result.error.message);
    } else {
      // Even if user-not-found, treat as success from UI to prevent user enumeration
      setSubmittedEmail(email.trim());
      setIsSuccess(true);
    }
  };

  const loginLink = `${ROUTES.LOGIN}${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect') || '')}` : ''}`;

  return (
    <main className="auth-page" aria-labelledby="forgot-password-title">
      <div className="auth-card">
        {isSuccess ? (
          <div className="auth-state-card">
            <div
              className="auth-state-icon-wrapper auth-state-icon-wrapper--info"
              aria-hidden="true"
            >
              <Mail size={28} />
            </div>
            <h1 id="forgot-password-title" className="auth-title">
              Check Your Inbox
            </h1>
            <p className="auth-subtitle">
              If an account is associated with this email, we have dispatched password reset
              instructions:
            </p>
            <div className="auth-state-email-badge">{submittedEmail}</div>
            <p className="auth-subtitle" style={{ fontSize: 'var(--font-size-xs)' }}>
              Follow the instructions in the email to recover your account. If you do not see the
              email within a few minutes, please check your spam folder.
            </p>

            <div className="auth-state-actions">
              <Link to={loginLink}>
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<ArrowLeft size={16} />}
                  style={{ width: '100%' }}
                >
                  Back to Sign In
                </Button>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="auth-link auth-cooldown-text"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: 'var(--space-2)',
                }}
              >
                Try a different email address
              </button>
            </div>
          </div>
        ) : (
          <>
            <header className="auth-header">
              <div className="auth-logo-badge" aria-hidden="true">
                <KeyRound size={24} />
              </div>
              <h1 id="forgot-password-title" className="auth-title">
                Reset Password
              </h1>
              <p className="auth-subtitle">
                Enter your registered email address and we&apos;ll send you instructions to reset
                your password.
              </p>
            </header>

            {errorMessage && (
              <div className="auth-error-alert" role="alert">
                <AlertCircle size={18} aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-form__group">
                <label htmlFor="forgot-email" className="auth-label">
                  Email Address
                </label>
                <Input
                  id="forgot-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  isInvalid={Boolean(fieldError)}
                  autoFocus
                  required
                />
                {fieldError && (
                  <span className="auth-field-error" role="alert">
                    {fieldError}
                  </span>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                style={{ width: '100%', marginTop: 'var(--space-2)' }}
              >
                {isSubmitting ? 'Sending Instructions...' : 'Send Reset Instructions'}
              </Button>
            </form>

            <footer className="auth-footer">
              <Link
                to={loginLink}
                className="auth-link"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowLeft size={14} aria-hidden="true" />
                <span>Back to Sign In</span>
              </Link>
            </footer>
          </>
        )}
      </div>
    </main>
  );
};
