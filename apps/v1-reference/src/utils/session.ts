/**
 * Privacy-conscious Anonymous Session Identifier Utility
 * Generates an ephemeral random session ID stored in sessionStorage (no IP or device tracking)
 */

const SESSION_STORAGE_KEY = 'elsesourav_analytics_sid';

export function getAnonymousSessionId(): string {
  if (typeof window === 'undefined') {
    return 'server_session';
  }

  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const newId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, newId);
    return newId;
  } catch {
    return `sess_fallback_${Math.random().toString(36).slice(2, 10)}`;
  }
}
