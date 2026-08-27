import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  MailCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Button, Input, SEO } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { signUpSchema } from '@/schemas/auth.schema';
import { getSafeRedirectUrl } from '@/utils/redirect';
import './AuthPage.css';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, sendVerificationEmail, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    termsAccepted?: string;
  }>({});

  // Verification Screen State
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const rawRedirect = searchParams.get('redirect') || ROUTES.LIBRARY;
  const safeRedirect = getSafeRedirectUrl(rawRedirect, ROUTES.LIBRARY);

  // Redirect if already authenticated prior to entering registration form
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading && !isRegistered) {
      navigate(safeRedirect, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, isRegistered, navigate, safeRedirect]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const validation = signUpSchema.safeParse({
      displayName,
      email,
      password,
      confirmPassword,
      termsAccepted,
    });

    if (!validation.success) {
      const flattened = validation.error.flatten().fieldErrors;
      setFieldErrors({
        displayName: flattened.displayName?.[0],
        email: flattened.email?.[0],
        password: flattened.password?.[0],
        confirmPassword: flattened.confirmPassword?.[0],
        termsAccepted: flattened.termsAccepted?.[0],
      });
      return;
    }

    setIsSubmitting(true);

    const result = await signUp({
      email: email.trim(),
      password,
      displayName: displayName.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      setRegisteredEmail(email.trim());
      setIsRegistered(true);
      setResendCooldown(60); // 60 second cooldown

      // Asynchronously trigger verification email
      sendVerificationEmail().catch(() => {
        // Handled silently or on explicit user resend
      });
    } else {
      setErrorMessage(result.error.message);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setResendSuccess(false);

    const res = await sendVerificationEmail();

    setIsResending(false);

    if (res.success) {
      setResendSuccess(true);
      setResendCooldown(60);
    } else {
      setErrorMessage(res.error.message);
    }
  };

  // Render Verification State after registration
  if (isRegistered) {
    return (
      <main className="auth-page" aria-labelledby="verification-title">
        <SEO title="Verify Email" noIndex />
        <div className="auth-card">
          <div className="auth-state-card">
            <div
              className="auth-state-icon-wrapper auth-state-icon-wrapper--success"
              aria-hidden="true"
            >
              <MailCheck size={28} />
            </div>
            <h1 id="verification-title" className="auth-title">
              Account Created!
            </h1>
            <p className="auth-subtitle">
              We&apos;ve sent a verification link to your email address:
            </p>
            <div className="auth-state-email-badge">{registeredEmail}</div>
            <p className="auth-subtitle" style={{ fontSize: 'var(--font-size-xs)' }}>
              Please check your inbox and spam folder. Verifying your email helps protect your
              account and enables all features.
            </p>

            {resendSuccess && (
              <div
                className="auth-error-alert"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderColor: 'rgba(34, 197, 94, 0.25)',
                  color: 'var(--color-success-400)',
                  marginTop: 'var(--space-4)',
                }}
                role="status"
              >
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>Verification email sent successfully!</span>
              </div>
            )}

            {errorMessage && (
              <div
                className="auth-error-alert"
                role="alert"
                style={{ marginTop: 'var(--space-4)' }}
              >
                <AlertCircle size={16} aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="auth-state-actions">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate(safeRedirect, { replace: true })}
                rightIcon={<ArrowRight size={16} />}
                style={{ width: '100%' }}
              >
                Continue to Library
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleResendVerification}
                isLoading={isResending}
                disabled={resendCooldown > 0 || isResending}
                style={{ width: '100%' }}
              >
                {resendCooldown > 0
                  ? `Resend Email in ${resendCooldown}s`
                  : 'Resend Verification Email'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page" aria-labelledby="signup-title">
      <SEO
        title="Create an Account"
        description="Create your ElseSourav developer account to access your personal app library."
        canonicalPath="/signup"
        noIndex
      />
      <div className="auth-card">
        <header className="auth-header">
          <div className="auth-logo-badge" aria-hidden="true">
            <UserPlus size={24} />
          </div>
          <h1 id="signup-title" className="auth-title">
            Create an Account
          </h1>
          <p className="auth-subtitle">
            Join the developer ecosystem to bookmark software, write reviews, and track issues.
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
            <label htmlFor="signup-name" className="auth-label">
              Display Name
            </label>
            <Input
              id="signup-name"
              type="text"
              name="displayName"
              autoComplete="name"
              placeholder="e.g. Sourav Mukherjee"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isSubmitting}
              isInvalid={Boolean(fieldErrors.displayName)}
              autoFocus
              required
            />
            {fieldErrors.displayName && (
              <span className="auth-field-error" role="alert">
                {fieldErrors.displayName}
              </span>
            )}
          </div>

          <div className="auth-form__group">
            <label htmlFor="signup-email" className="auth-label">
              Email Address
            </label>
            <Input
              id="signup-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              isInvalid={Boolean(fieldErrors.email)}
              required
            />
            {fieldErrors.email && (
              <span className="auth-field-error" role="alert">
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className="auth-form__group">
            <label htmlFor="signup-password" className="auth-label">
              Password (min. 6 characters)
            </label>
            <div className="auth-input-wrapper">
              <Input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                isInvalid={Boolean(fieldErrors.password)}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff size={16} aria-hidden="true" />
                ) : (
                  <Eye size={16} aria-hidden="true" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="auth-field-error" role="alert">
                {fieldErrors.password}
              </span>
            )}
          </div>

          <div className="auth-form__group">
            <label htmlFor="signup-confirm-password" className="auth-label">
              Confirm Password
            </label>
            <div className="auth-input-wrapper">
              <Input
                id="signup-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                isInvalid={Boolean(fieldErrors.confirmPassword)}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                tabIndex={0}
              >
                {showConfirmPassword ? (
                  <EyeOff size={16} aria-hidden="true" />
                ) : (
                  <Eye size={16} aria-hidden="true" />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <span className="auth-field-error" role="alert">
                {fieldErrors.confirmPassword}
              </span>
            )}
          </div>

          <div className="auth-terms-group">
            <input
              id="signup-terms"
              type="checkbox"
              className="auth-terms-checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              disabled={isSubmitting}
              required
            />
            <label htmlFor="signup-terms">
              I agree to the{' '}
              <Link to={ROUTES.TERMS} target="_blank" className="auth-link">
                Terms of Service
              </Link>{' '}
              and acknowledge the{' '}
              <Link to={ROUTES.PRIVACY} target="_blank" className="auth-link">
                Privacy Policy
              </Link>
              .
            </label>
          </div>
          {fieldErrors.termsAccepted && (
            <span className="auth-field-error" role="alert">
              {fieldErrors.termsAccepted}
            </span>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <footer className="auth-footer">
          <span>Already have an account? </span>
          <Link
            to={`${ROUTES.LOGIN}${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect') || '')}` : ''}`}
            className="auth-link"
          >
            Sign In
          </Link>
        </footer>
      </div>
    </main>
  );
};
