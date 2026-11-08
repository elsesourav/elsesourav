import * as React from 'react';

export type UsernameStatus = 'idle' | 'checking' | 'available' | 'invalid' | 'taken';

export function useUsernameAvailability(currentUsername: string, candidateUsername: string, isEditing: boolean) {
  const [status, setStatus] = React.useState<UsernameStatus>('idle');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isEditing) {
      setStatus('idle');
      setError(null);
      return;
    }

    const trimmed = candidateUsername.trim().toLowerCase();

    if (!trimmed || trimmed === (currentUsername || '').toLowerCase()) {
      setStatus('idle');
      setError(null);
      return;
    }

    if (trimmed.length < 4) {
      setStatus('invalid');
      setError('Username must be at least 4 characters long');
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(trimmed)) {
      setStatus('invalid');
      setError('Only lowercase letters, numbers, hyphens, and underscores allowed');
      return;
    }

    setStatus('checking');
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (data.available) {
          setStatus('available');
          setError(null);
        } else {
          setStatus('taken');
          setError(data.error || 'Username is already taken');
        }
      } catch {
        setStatus('idle');
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [candidateUsername, isEditing, currentUsername]);

  return { status, error, setStatus, setError };
}
