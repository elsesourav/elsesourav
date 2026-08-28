/**
 * Local-only Privacy-Conscious Recent Searches Manager
 * Never syncs remotely or writes to Firestore.
 */

const STORAGE_KEY = 'elsesourav_recent_searches_v1';
const MAX_RECENT_SEARCHES = 5;

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0
      );
    }
  } catch {
    // Ignore parse errors safely
  }
  return [];
}

export function saveRecentSearch(query: string): string[] {
  if (typeof window === 'undefined') return [];
  const clean = query.trim();
  if (!clean || clean.length < 2) return getRecentSearches();

  try {
    const current = getRecentSearches().filter((q) => q.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...current].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function removeRecentSearch(query: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getRecentSearches();
    const updated = current.filter((q) => q.toLowerCase() !== query.toLowerCase().trim());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors safely
  }
}
