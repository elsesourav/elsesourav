import type { Timestamp } from '@/types/common.types';

/**
 * Interface representing Firestore native Timestamp object without importing SDK
 */
export interface FirestoreTimestampLike {
  seconds: number;
  nanoseconds: number;
  toMillis?: () => number;
}

/**
 * Standardize any incoming timestamp representation into epoch milliseconds.
 * Ensures consistent domain representation regardless of whether the raw input
 * is a Firestore Timestamp, an ISO string, a JS Date object, or numeric milliseconds.
 */
export function normalizeTimestamp(value: unknown, fallback?: number): Timestamp {
  if (value === null || value === undefined) {
    return fallback !== undefined ? fallback : Date.now();
  }

  // 1. Numeric milliseconds
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    // If value is in seconds (10 digits), convert to ms
    if (value > 0 && value < 10000000000) {
      return value * 1000;
    }
    return value;
  }

  // 2. Firestore Timestamp object with toMillis() or seconds
  if (typeof value === 'object' && value !== null) {
    const tsLike = value as Partial<FirestoreTimestampLike>;
    if (typeof tsLike.toMillis === 'function') {
      return tsLike.toMillis();
    }
    if (typeof tsLike.seconds === 'number') {
      return tsLike.seconds * 1000 + Math.floor((tsLike.nanoseconds || 0) / 1000000);
    }
    if (value instanceof Date) {
      return value.getTime();
    }
  }

  // 3. String representation (ISO 8601, RFC2822, or digit string)
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
      const parsedNum = parseInt(trimmed, 10);
      return normalizeTimestamp(parsedNum, fallback);
    }
    const parsedDate = Date.parse(trimmed);
    if (!isNaN(parsedDate)) {
      return parsedDate;
    }
  }

  return fallback !== undefined ? fallback : Date.now();
}

/**
 * Check whether a value can be converted into a valid non-negative timestamp
 */
export function isValidTimestamp(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') {
    return !isNaN(value) && isFinite(value) && value >= 0;
  }
  if (typeof value === 'object') {
    const tsLike = value as Partial<FirestoreTimestampLike>;
    if (typeof tsLike.toMillis === 'function') return true;
    if (typeof tsLike.seconds === 'number' && tsLike.seconds >= 0) return true;
    if (value instanceof Date) return !isNaN(value.getTime());
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value.trim());
    return !isNaN(parsed);
  }
  return false;
}

/**
 * Format timestamp as ISO string
 */
export function formatIsoTimestamp(timestamp: Timestamp): string {
  return new Date(timestamp).toISOString();
}
