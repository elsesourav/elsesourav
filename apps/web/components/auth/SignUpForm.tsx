'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createAuthBrowserClient, AuthError } from '@elsesourav/auth';
import { SignUpSchema, NAME_REGEX, USERNAME_REGEX, EMAIL_REGEX } from '@elsesourav/validation';
import { OAuthButtons } from './OAuthButtons';
import { SignUpStep1Profile } from './SignUpStep1Profile';
import { SignUpStep2Security } from './SignUpStep2Security';
import { AlertCircle } from 'lucide-react';

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Multi-step progressive disclosure state (1 = Profile, 2 = Security)
  const [step, setStep] = React.useState<1 | 2>(1);

  // Form Fields
  const [displayName, setDisplayName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const oauthError = searchParams.get('error');
  React.useEffect(() => {
    if (oauthError) {
      if (oauthError === 'oauth_exchange_failed') {
        setErrorMessage(
          'Failed to complete social sign-up. Please try again or create an account below.'
        );
      } else if (oauthError === 'access_denied') {
        setErrorMessage('Social sign-up was canceled.');
      } else {
        setErrorMessage(decodeURIComponent(oauthError));
      }
    }
  }, [oauthError]);

  // Field touch states (for clean inline validation)
  const [touched, setTouched] = React.useState({
    displayName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Live username validation & debounce states
  const [usernameStatus, setUsernameStatus] = React.useState<
    'idle' | 'checking' | 'available' | 'unavailable' | 'invalid'
  >('idle');
  const [usernameMessage, setUsernameMessage] = React.useState<string | null>(null);

  // Verified suggestions (2 available suggestions from backend)
  const [verifiedSuggestions, setVerifiedSuggestions] = React.useState<string[]>([]);

  // Spam & bot protection mechanisms
  const [honeypot, setHoneypot] = React.useState('');
  const formMountTimeRef = React.useRef<number>(Date.now());
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const suggestionAbortRef = React.useRef<AbortController | null>(null);

  // Client-Side Pre-Validation Logic
  const displayNameError = React.useMemo(() => {
    const trimmed = displayName.trim();
    if (!trimmed) return null;
    if (/[0-9]/.test(trimmed)) return 'Numbers are not allowed in name';
    if (!NAME_REGEX.test(trimmed)) return 'Letters, spaces, hyphens, and apostrophes only';
    if (trimmed.length < 2) return 'Min 2 characters required';
    if (trimmed.length > 60) return 'Max 60 characters allowed';
    return null;
  }, [displayName]);

  const emailError = React.useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed) return null;
    if (!EMAIL_REGEX.test(trimmed)) return 'Enter a valid email (e.g. you@example.com)';
    return null;
  }, [email]);

  const passwordError = React.useMemo(() => {
    if (!password) return null;
    if (password.length < 8) return 'Min 8 characters required';
    if (password.length > 128) return 'Max 128 characters allowed';
    return null;
  }, [password]);

  const confirmPasswordError = React.useMemo(() => {
    if (!confirmPassword) return null;
    if (confirmPassword !== password) return 'Passwords do not match';
    return null;
  }, [confirmPassword, password]);

  // Fetch 2 verified available suggestions when Name is valid
  React.useEffect(() => {
    if (suggestionAbortRef.current) {
      suggestionAbortRef.current.abort();
      suggestionAbortRef.current = null;
    }

    const trimmedName = displayName.trim();
    if (trimmedName.length < 2 || displayNameError !== null) {
      setVerifiedSuggestions([]);
      return;
    }

    const controller = new AbortController();
    suggestionAbortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/users/check-username?name=${encodeURIComponent(trimmedName)}`,
          {
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.suggestions)) {
            setVerifiedSuggestions(data.suggestions.slice(0, 2));
          }
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          // Non-critical fallback
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [displayName, displayNameError]);

  // Live debounced username validation with instant client pre-check
  React.useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const trimmed = username.trim().toLowerCase();

    if (!trimmed) {
      setUsernameStatus('idle');
      setUsernameMessage(null);
      return;
    }

    if (trimmed.length < 4) {
      setUsernameStatus('invalid');
      setUsernameMessage('Min 4 characters');
      return;
    }

    if (trimmed.length > 30) {
      setUsernameStatus('invalid');
      setUsernameMessage('Max 30 characters');
      return;
    }

    if (!USERNAME_REGEX.test(trimmed)) {
      setUsernameStatus('invalid');
      setUsernameMessage('Must start & end with letter/number (4-30 chars)');
      return;
    }

    if (
      trimmed.includes('__') ||
      trimmed.includes('--') ||
      trimmed.includes('_-') ||
      trimmed.includes('-_')
    ) {
      setUsernameStatus('invalid');
      setUsernameMessage('No consecutive special characters');
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('Checking availability...');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const nameParam = displayName.trim()
          ? `&name=${encodeURIComponent(displayName.trim())}`
          : '';
        const res = await fetch(
          `/api/users/check-username?username=${encodeURIComponent(trimmed)}${nameParam}`,
          {
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setUsernameStatus('unavailable');
          setUsernameMessage(data.error || 'Unavailable');
          return;
        }

        if (data.available) {
          setUsernameStatus('available');
          setUsernameMessage(`@${trimmed} is available!`);
        } else {
          setUsernameStatus('unavailable');
          setUsernameMessage(data.error || `@${trimmed} is taken`);
          if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
            setVerifiedSuggestions(data.suggestions.slice(0, 2));
          }
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          setUsernameStatus('invalid');
          setUsernameMessage('Error checking handle');
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [username, displayName]);

  const handleContinueToCredentials = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setTouched((prev) => ({ ...prev, displayName: true }));

    const trimmedName = displayName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Please enter your name (minimum 2 characters)');
      return;
    }

    if (displayNameError) {
      setErrorMessage(displayNameError);
      return;
    }

    if (usernameStatus !== 'available') {
      setErrorMessage(usernameMessage || 'Please pick an available username');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setTouched({
      displayName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (honeypot.trim().length > 0) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        router.push('/');
      }, 800);
      return;
    }

    if (Date.now() - formMountTimeRef.current < 400) {
      setErrorMessage('Form submitted too quickly. Please try again.');
      return;
    }

    if (displayNameError) {
      setErrorMessage(displayNameError);
      setStep(1);
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (emailError || !EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    if (confirmPassword !== password) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    const normalizedUsername = username.trim().toLowerCase();

    const validationResult = SignUpSchema.safeParse({
      email: trimmedEmail,
      password,
      displayName: displayName.trim(),
      username: normalizedUsername,
    });

    if (!validationResult.success) {
      setErrorMessage(validationResult.error.issues[0]?.message || 'Please check your input');
      return;
    }

    if (usernameStatus === 'unavailable' || usernameStatus === 'invalid') {
      setErrorMessage(usernameMessage || 'Please choose an available username');
      setStep(1);
      return;
    }

    try {
      setLoading(true);
      const supabase = createAuthBrowserClient();

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: displayName.trim(),
            username: normalizedUsername,
            user_name: normalizedUsername,
          },
        },
      });

      if (error) {
        const translated = AuthError.fromSupabase(error);
        setErrorMessage(translated.message);
        setLoading(false);
        return;
      }

      if (data.user?.id) {
        try {
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              supabaseAuthId: data.user.id,
              email: trimmedEmail,
              displayName: displayName.trim(),
              username: normalizedUsername,
            }),
          });
        } catch {
          // Non-blocking fallback
        }
      }

      if (!data.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (!signInError && signInData?.session) {
          window.location.href = '/';
          return;
        }
      }

      window.location.href = '/';
    } catch {
      setErrorMessage('An unexpected error occurred during account creation.');
      setLoading(false);
    }
  };

  const isStep1Valid =
    displayName.trim().length >= 2 && displayNameError === null && usernameStatus === 'available';

  return (
    <div className="space-y-4 w-full">
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-950 dark:text-rose-100 text-xs flex items-start gap-2.5 font-medium leading-relaxed shadow-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* OAuth Fast Entry */}
      <OAuthButtons redirectTo="/" onError={(msg) => setErrorMessage(msg)} />

      {/* Seamless High-Contrast Divider */}
      <div className="relative flex items-center justify-center my-3 sm:my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-900/[0.08] dark:border-white/10" />
        </div>
        <span className="relative bg-white dark:bg-zinc-900 px-3 text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
          Or sign up with username
        </span>
      </div>

      {/* Minimal Step Indicator */}
      <div className="flex items-center justify-between pt-0.5 px-0.5">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              step === 1 ? 'bg-indigo-600 dark:bg-indigo-400 animate-pulse' : 'bg-emerald-500 dark:bg-emerald-400'
            }`}
          />
          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
            {step === 1 ? '1. Profile Details' : '2. Security & Password'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
            {step}/2
          </span>
          <div
            className={`h-1 w-5 rounded-full transition-all duration-300 ${
              step === 1 ? 'bg-indigo-600 dark:bg-indigo-500 shadow-sm shadow-indigo-500/50' : 'bg-emerald-500 dark:bg-emerald-400'
            }`}
          />
          <div
            className={`h-1 w-5 rounded-full transition-all duration-300 ${
              step === 2 ? 'bg-indigo-600 dark:bg-indigo-500 shadow-sm shadow-indigo-500/50' : 'bg-slate-200 dark:bg-zinc-800'
            }`}
          />
        </div>
      </div>

      {step === 1 && (
        <SignUpStep1Profile
          displayName={displayName}
          setDisplayName={setDisplayName}
          displayNameError={displayNameError}
          touchedDisplayName={touched.displayName}
          onBlurDisplayName={() => setTouched((prev) => ({ ...prev, displayName: true }))}
          username={username}
          setUsername={setUsername}
          usernameStatus={usernameStatus}
          usernameMessage={usernameMessage}
          verifiedSuggestions={verifiedSuggestions}
          onSelectSuggestion={(sug) => setUsername(sug)}
          honeypot={honeypot}
          setHoneypot={setHoneypot}
          loading={loading}
          isStep1Valid={isStep1Valid}
          onSubmit={handleContinueToCredentials}
        />
      )}

      {step === 2 && (
        <SignUpStep2Security
          displayName={displayName}
          username={username}
          email={email}
          setEmail={setEmail}
          emailError={emailError}
          touchedEmail={touched.email}
          onBlurEmail={() => setTouched((prev) => ({ ...prev, email: true }))}
          password={password}
          setPassword={setPassword}
          passwordError={passwordError}
          touchedPassword={touched.password}
          onBlurPassword={() => setTouched((prev) => ({ ...prev, password: true }))}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          confirmPasswordError={confirmPasswordError}
          touchedConfirmPassword={touched.confirmPassword}
          onBlurConfirmPassword={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          honeypot={honeypot}
          setHoneypot={setHoneypot}
          loading={loading}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
