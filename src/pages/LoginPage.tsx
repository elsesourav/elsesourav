import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button, Input, SEO } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { loginSchema } from '@/schemas/auth.schema';
import { getSafeRedirectUrl } from '@/utils/redirect';
import './AuthPage.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { signIn, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Determine return URL safely
  const rawRedirect =
    searchParams.get('redirect') ||
    (location.state as { from?: { pathname?: string; search?: string } } | null)?.from?.pathname ||
    ROUTES.LIBRARY;
  const safeRedirect = getSafeRedirectUrl(rawRedirect, ROUTES.LIBRARY);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      navigate(safeRedirect, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate, safeRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const flattened = validation.error.flatten().fieldErrors;
      setFieldErrors({
        email: flattened.email?.[0],
        password: flattened.password?.[0],
      });
      return;
    }

    setIsSubmitting(true);

    const result = await signIn({
      email: email.trim(),
      password,
    });

    setIsSubmitting(false);

    if (result.success) {
      navigate(safeRedirect, { replace: true });
    } else {
      setErrorMessage(result.error.message);
    }
  };

  return (
    <main className="auth-page" aria-labelledby="login-title">
      <SEO
        title="Sign In"
        description="Sign in to your ElseSourav account to manage your applications and library."
        canonicalPath="/login"
        noIndex
      />
      <div className="auth-card">
        <header className="auth-header">
          <div className="auth-logo-badge" aria-hidden="true">
            <LogIn size={24} />
          </div>
          <h1 id="login-title" className="auth-title">
            Sign In to ElseSourav
          </h1>
          <p className="auth-subtitle">
            Access your personal library, manage tickets, and sync preferences.
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
            <label htmlFor="login-email" className="auth-label">
              Email Address
            </label>
            <Input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              isInvalid={Boolean(fieldErrors.email)}
              autoFocus
              required
            />
            {fieldErrors.email && (
              <span className="auth-field-error" role="alert">
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className="auth-form__group">
            <div className="auth-label">
              <label htmlFor="login-password">Password</label>
              <Link
                to={`${ROUTES.FORGOT_PASSWORD}${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect') || '')}` : ''}`}
                className="auth-link"
              >
                Forgot password?
              </Link>
            </div>
            <div className="auth-input-wrapper">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
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

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <footer className="auth-footer">
          <span>Don&apos;t have an account? </span>
          <Link
            to={`${ROUTES.SIGNUP}${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect') || '')}` : ''}`}
            className="auth-link"
          >
            Create an Account
          </Link>
        </footer>
      </div>
    </main>
  );
};
