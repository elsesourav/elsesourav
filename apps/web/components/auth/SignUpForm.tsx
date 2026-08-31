'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Label, Alert, AlertDescription, Separator } from '@elsesourav/ui';
import { createAuthBrowserClient, AuthError } from '@elsesourav/auth';
import {
  SignUpSchema,
  NAME_REGEX,
  USERNAME_REGEX,
  EMAIL_REGEX,
} from '@elsesourav/validation';
import { OAuthButtons } from './OAuthButtons';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AtSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

function calculatePasswordStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: '', color: 'bg-zinc-700' };

  let score = 0;
  // Baseline length check
  if (pass.length >= 8) score += 1;
  // Length >= 12 bonus
  if (pass.length >= 12) score += 1;
  // Mixed character types (letters + numbers)
  if (/[a-zA-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
  // High complexity (symbols or uppercase + lowercase + numbers)
  if (
    /[^A-Za-z0-9]/.test(pass) ||
    (/[a-z]/.test(pass) && /[A-Z]/.test(pass) && /[0-9]/.test(pass))
  ) {
    score += 1;
  }

  // Friendly non-red progression (no red to prevent user confusion)
  if (score <= 1) return { score: 1, label: 'Basic', color: 'bg-zinc-400' };
  if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-400' };
  if (score === 3) return { score: 3, label: 'Good', color: 'bg-indigo-400' };
  return { score: 4, label: 'Strong', color: 'bg-emerald-400' };
}

export function SignUpForm() {
  const router = useRouter();

  // Multi-step progressive disclosure state (1 = Identity, 2 = Credentials)
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

  // ========================================================
  // Client-Side Instant Pre-Validation Logic (Zero Server Load)
  // ========================================================

  // 1. Name Client Validation (Single word or full name)
  const displayNameError = React.useMemo(() => {
    const trimmed = displayName.trim();
    if (!trimmed) return null;
    if (/[0-9]/.test(trimmed)) return 'Numbers are not allowed in name';
    if (!NAME_REGEX.test(trimmed)) return 'Letters, spaces, hyphens, and apostrophes only';
    if (trimmed.length < 2) return 'Min 2 characters required';
    if (trimmed.length > 60) return 'Max 60 characters allowed';
    return null;
  }, [displayName]);

  // 2. Email Client Validation
  const emailError = React.useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed) return null;
    if (!EMAIL_REGEX.test(trimmed)) return 'Enter a valid email (e.g. you@example.com)';
    return null;
  }, [email]);

  // 3. Password Client Validation (Any password accepted as long as length >= 8)
  const passwordError = React.useMemo(() => {
    if (!password) return null;
    if (password.length < 8) return 'Min 8 characters required';
    if (password.length > 128) return 'Max 128 characters allowed';
    return null;
  }, [password]);

  // 4. Confirm Password Match Validation
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

    // Client-Side Instant Rule 1: Length
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

    // Client-Side Instant Rule 2: Allowed Characters & Boundary Check
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

    // All Client-Side Rules Passed: Dispatch Debounced Server Check
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

  // Advance from Step 1 (Identity) to Step 2 (Credentials)
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

  // Select a suggestion
  const handleSelectSuggestion = (sug: string) => {
    setUsername(sug);
  };

  // Submit complete signup form on Step 2
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setTouched({
      displayName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // 1. Anti-spam honeypot detection
    if (honeypot.trim().length > 0) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        router.push('/');
      }, 800);
      return;
    }

    // 2. Anti-bot timing protection (< 400ms submissions)
    if (Date.now() - formMountTimeRef.current < 400) {
      setErrorMessage('Form submitted too quickly. Please try again.');
      return;
    }

    // Instant Client Pre-Checks before sending to Server
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

    // Strict schema parse
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

      // 3. Supabase signup (No email verification barrier)
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

      // 4. Synchronize user profile into database with safety checks
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
          // Graceful fallback for non-blocking local sync
        }
      }

      // 5. Attempt instant login if session was not returned immediately
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

      // 6. Direct entry without email verification barrier
      window.location.href = '/';
    } catch {
      setErrorMessage('An unexpected error occurred during account creation.');
      setLoading(false);
    }
  };

  const isStep1Valid =
    displayName.trim().length >= 2 &&
    displayNameError === null &&
    usernameStatus === 'available';

  const passwordStrength = calculatePasswordStrength(password);

  return (
    <div className="space-y-4 w-full">
      {errorMessage && (
        <Alert variant="error" className="bg-red-950/40 border-red-800/60 text-red-300 text-xs">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* OAuth Fast Entry */}
      <OAuthButtons redirectTo="/" onError={(msg) => setErrorMessage(msg)} />

      {/* Divider */}
      <div className="relative flex items-center justify-center my-1">
        <Separator className="bg-[hsl(var(--border))]" />
        <span className="absolute bg-[hsl(var(--surface-overlay))] px-3 text-[11px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
          Or sign up with username
        </span>
      </div>

      {/* Minimal Step Indicator Placed Directly After Divider */}
      <div className="flex items-center justify-between pt-1 px-0.5">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              step === 1 ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400'
            }`}
          />
          <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
            {step === 1 ? '1. Profile Details' : '2. Security & Password'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-[hsl(var(--muted-foreground))]">
            {step}/2
          </span>
          <div
            className={`h-1 w-5 rounded-full transition-all duration-300 ${
              step === 1 ? 'bg-indigo-500 shadow-sm shadow-indigo-500/50' : 'bg-emerald-400'
            }`}
          />
          <div
            className={`h-1 w-5 rounded-full transition-all duration-300 ${
              step === 2
                ? 'bg-indigo-500 shadow-sm shadow-indigo-500/50'
                : 'bg-zinc-800'
            }`}
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* STEP 1: IDENTITY (Name & Live Checked Username) */}
      {/* ======================================================== */}
      {step === 1 && (
        <form onSubmit={handleContinueToCredentials} className="space-y-3.5 animate-fade-in">
          {/* Anti-Spam Honeypot Trap (Invisible to humans) */}
          <div
            aria-hidden="true"
            style={{
              opacity: 0,
              position: 'absolute',
              top: 0,
              left: 0,
              height: 0,
              width: 0,
              zIndex: -1,
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          >
            <label htmlFor="website-hp-1">Website</label>
            <input
              id="website-hp-1"
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* 1. Name with Instant Client Validation */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="signup-name"
                required
                className="text-xs text-[hsl(var(--foreground))]"
              >
                Name
              </Label>
              {displayNameError && touched.displayName && (
                <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-400 inline" />
                  {displayNameError}
                </span>
              )}
            </div>
            <div className="relative">
              <User className="w-4 h-4 text-[hsl(var(--muted-foreground))] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Sourav or Alex"
                value={displayName}
                onBlur={() => setTouched((prev) => ({ ...prev, displayName: true }))}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                disabled={loading}
                className={`pl-9 bg-[hsl(var(--surface-subtle))] border-[hsl(var(--input))] text-[hsl(var(--foreground))] text-sm focus:border-indigo-500 rounded-xl transition-colors ${
                  displayNameError && touched.displayName
                    ? 'border-rose-500/60 bg-rose-950/10 focus:border-rose-500'
                    : ''
                }`}
              />
            </div>
          </div>

          {/* 2. Username with Instant Client-Format Check + Debounced Availability */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="signup-username"
                required
                className="text-xs text-[hsl(var(--foreground))]"
              >
                Username
              </Label>
              {usernameStatus !== 'idle' && (
                <span
                  className={`text-[11px] font-medium flex items-center gap-1 ${
                    usernameStatus === 'available'
                      ? 'text-emerald-400 font-semibold'
                      : usernameStatus === 'checking'
                        ? 'text-indigo-400'
                        : 'text-rose-400'
                  }`}
                >
                  {usernameStatus === 'checking' && <Loader2 className="w-3 h-3 animate-spin" />}
                  {usernameStatus === 'available' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  {usernameStatus === 'unavailable' && (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  {usernameStatus === 'invalid' && (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  {usernameMessage}
                </span>
              )}
            </div>
            <div className="relative">
              <AtSign className="w-4 h-4 text-[hsl(var(--muted-foreground))] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="signup-username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="alexsmith"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                }
                required
                disabled={loading}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className={`pl-9 pr-9 bg-[hsl(var(--surface-subtle))] border-[hsl(var(--input))] text-[hsl(var(--foreground))] text-sm rounded-xl focus:border-indigo-500 transition-all ${
                  usernameStatus === 'available'
                    ? 'border-emerald-500/60 bg-emerald-950/10 focus:border-emerald-500 ring-1 ring-emerald-500/20'
                    : usernameStatus === 'unavailable' || usernameStatus === 'invalid'
                      ? 'border-rose-500/60 bg-rose-950/10 focus:border-rose-500'
                      : ''
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                {usernameStatus === 'checking' && (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                )}
                {usernameStatus === 'available' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                {(usernameStatus === 'unavailable' || usernameStatus === 'invalid') && (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>
            </div>

            {/* 2 Verified Available Suggestions */}
            {verifiedSuggestions.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                <span className="text-[11px] text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                  {usernameStatus === 'unavailable' ? 'Try available:' : 'Suggested:'}
                </span>
                {verifiedSuggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug)}
                    className="inline-flex items-center gap-0.5 text-[11px] font-mono text-indigo-400 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded-lg transition-all border border-indigo-500/25 active:scale-95"
                  >
                    @{sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 1 Continue Button */}
          <Button
            type="submit"
            disabled={!isStep1Valid}
            className={`w-full text-white text-sm font-medium py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all mt-1 ${
              isStep1Valid
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/25 cursor-pointer active:scale-[0.99]'
                : 'bg-zinc-800 text-zinc-400 opacity-60 cursor-not-allowed'
            }`}
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </form>
      )}

      {/* ======================================================== */}
      {/* STEP 2: CREDENTIALS (Email & Password) */}
      {/* ======================================================== */}
      {step === 2 && (
        <div className="space-y-3.5 animate-fade-in">
          {/* Confirmed Identity Pill */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[hsl(var(--surface-subtle))] border border-indigo-500/20 shadow-inner">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0 shadow-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[hsl(var(--foreground))] truncate">
                  {displayName}
                </p>
                <p className="text-[11px] font-mono text-emerald-400 truncate flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 inline shrink-0" />
                  @{username}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 hover:underline px-2 py-0.5 rounded-md hover:bg-indigo-500/10 transition-colors"
            >
              Edit
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Hidden Username field for Password Manager Identity Binding */}
            <input type="hidden" name="username" autoComplete="username" value={username} />

            {/* Anti-Spam Honeypot Trap */}
            <div
              aria-hidden="true"
              style={{
                opacity: 0,
                position: 'absolute',
                top: 0,
                left: 0,
                height: 0,
                width: 0,
                zIndex: -1,
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            >
              <label htmlFor="website-hp-2">Website</label>
              <input
                id="website-hp-2"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* 3. Email Address with Instant Client Validation */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="signup-email"
                  required
                  className="text-xs text-[hsl(var(--foreground))]"
                >
                  Email Address
                </Label>
                {emailError && touched.email && (
                  <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-400 inline" />
                    {emailError}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-[hsl(var(--muted-foreground))] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                  className={`pl-9 bg-[hsl(var(--surface-subtle))] border-[hsl(var(--input))] text-[hsl(var(--foreground))] text-sm focus:border-indigo-500 rounded-xl transition-colors ${
                    emailError && touched.email
                      ? 'border-rose-500/60 bg-rose-950/10 focus:border-rose-500'
                      : ''
                  }`}
                />
              </div>
            </div>

            {/* 4. Password with Friendly Non-Red Strength Progress Meter */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="signup-password"
                  required
                  className="text-xs text-[hsl(var(--foreground))]"
                >
                  Password
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
                  id="signup-password"
                  name="new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className={`pl-9 pr-10 bg-[hsl(var(--surface-subtle))] border-[hsl(var(--input))] text-[hsl(var(--foreground))] text-sm focus:border-indigo-500 rounded-xl transition-colors ${
                    passwordError && touched.password
                      ? 'border-rose-500/60 bg-rose-950/10 focus:border-rose-500'
                      : ''
                  }`}
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

              {/* Dynamic Non-Red Password Strength Progress Bars */}
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
              {passwordError && touched.password && (
                <p className="text-[11px] text-rose-400 pt-0.5">{passwordError}</p>
              )}
            </div>

            {/* 5. Confirm Password with Instant Match Check */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="signup-confirm-password"
                  required
                  className="text-xs text-[hsl(var(--foreground))]"
                >
                  Confirm Password
                </Label>
                {confirmPassword && (
                  <span
                    className={`text-[11px] font-medium flex items-center gap-1 ${
                      confirmPasswordError ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {confirmPasswordError ? (
                      <>
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                        {confirmPasswordError}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Match
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[hsl(var(--muted-foreground))] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="signup-confirm-password"
                  name="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className={`pl-9 bg-[hsl(var(--surface-subtle))] border-[hsl(var(--input))] text-[hsl(var(--foreground))] text-sm focus:border-indigo-500 rounded-xl transition-colors ${
                    confirmPasswordError && touched.confirmPassword
                      ? 'border-rose-500/60 bg-rose-950/10 focus:border-rose-500'
                      : ''
                  }`}
                />
              </div>
            </div>

            {/* Action Buttons: Back & Final Submit (Single Clean Spinner) */}
            <div className="flex items-center gap-2.5 pt-1.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={loading}
                className="w-1/3 border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-subtle))] text-xs text-[hsl(var(--foreground))] py-2.5 rounded-xl flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>

              <Button
                type="submit"
                isLoading={loading}
                className="flex-1 bg-[hsl(var(--primary))] hover:opacity-90 text-white text-sm font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20"
              >
                <span>{loading ? 'Creating...' : 'Create Account'}</span>
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
