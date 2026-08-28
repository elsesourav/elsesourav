import { AppError } from './errors';
import { mapFirebaseAuthError } from './auth-errors';
import type { FirebaseError } from 'firebase/app';

/**
 * Standard Firestore error codes mapping
 */
const FIRESTORE_CODE_MAP: Record<
  string,
  {
    code:
      | 'FORBIDDEN'
      | 'NETWORK_ERROR'
      | 'TIMEOUT'
      | 'UNAUTHORIZED'
      | 'NOT_FOUND'
      | 'CONFLICT'
      | 'VALIDATION_ERROR'
      | 'INTERNAL_ERROR';
    message: string;
    isRetryable: boolean;
  }
> = {
  // Permission & Auth
  'permission-denied': {
    code: 'FORBIDDEN',
    message: 'You do not have permission to access this resource or perform this action.',
    isRetryable: false,
  },
  unauthenticated: {
    code: 'UNAUTHORIZED',
    message: 'Your session has expired or requires authentication. Please sign in again.',
    isRetryable: false,
  },
  // Network & Availability (Transient)
  unavailable: {
    code: 'NETWORK_ERROR',
    message:
      'The network connection is temporarily unavailable. Please check your connection and try again.',
    isRetryable: true,
  },
  'deadline-exceeded': {
    code: 'TIMEOUT',
    message: 'The request took too long to complete. Please try again.',
    isRetryable: true,
  },
  // Resource states
  'not-found': {
    code: 'NOT_FOUND',
    message: 'The requested resource was not found.',
    isRetryable: false,
  },
  'already-exists': {
    code: 'CONFLICT',
    message: 'This resource already exists.',
    isRetryable: false,
  },
  'resource-exhausted': {
    code: 'FORBIDDEN',
    message: 'System limits or quotas exceeded. Please try again in a few moments.',
    isRetryable: false,
  },
  // Validation / Arguments
  'invalid-argument': {
    code: 'VALIDATION_ERROR',
    message: 'Invalid request data provided.',
    isRetryable: false,
  },
  'failed-precondition': {
    code: 'VALIDATION_ERROR',
    message: 'The operation could not be completed in the current system state.',
    isRetryable: false,
  },
  cancelled: {
    code: 'INTERNAL_ERROR',
    message: 'The operation was cancelled.',
    isRetryable: false,
  },
};

/**
 * Maps Firestore SDK / gRPC errors to standardized AppError instances
 */
export function mapFirestoreError(error: unknown, action?: string): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const fbError = error as Partial<FirebaseError> & { code?: string | number; message?: string };
  const rawCode = fbError?.code ? String(fbError.code).toLowerCase() : '';
  const rawMessage = fbError?.message ? String(fbError.message) : '';
  const lowerMsg = rawMessage.toLowerCase();

  // 1. Check direct Firestore error code (e.g. "permission-denied", "unavailable")
  // Or numeric gRPC codes (7 = PERMISSION_DENIED, 14 = UNAVAILABLE, 4 = DEADLINE_EXCEEDED, 5 = NOT_FOUND, 16 = UNAUTHENTICATED)
  let matchedConfig = FIRESTORE_CODE_MAP[rawCode];

  if (!matchedConfig) {
    if (
      rawCode === '7' ||
      lowerMsg.includes('permission') ||
      lowerMsg.includes('insufficient permissions')
    ) {
      matchedConfig = FIRESTORE_CODE_MAP['permission-denied'];
    } else if (
      rawCode === '14' ||
      lowerMsg.includes('unavailable') ||
      lowerMsg.includes('network disconnected') ||
      lowerMsg.includes('offline') ||
      lowerMsg.includes('failed to get document because the client is offline')
    ) {
      matchedConfig = FIRESTORE_CODE_MAP['unavailable'];
    } else if (
      rawCode === '4' ||
      lowerMsg.includes('deadline_exceeded') ||
      lowerMsg.includes('deadline exceeded') ||
      lowerMsg.includes('timeout')
    ) {
      matchedConfig = FIRESTORE_CODE_MAP['deadline-exceeded'];
    } else if (
      rawCode === '5' ||
      lowerMsg.includes('not_found') ||
      lowerMsg.includes('not found') ||
      lowerMsg.includes('target id not found')
    ) {
      matchedConfig = FIRESTORE_CODE_MAP['not-found'];
    } else if (rawCode === '16' || lowerMsg.includes('unauthenticated')) {
      matchedConfig = FIRESTORE_CODE_MAP['unauthenticated'];
    }
  }

  if (matchedConfig) {
    return new AppError(matchedConfig.code, matchedConfig.message, {
      cause: error,
      isRetryable: matchedConfig.isRetryable,
    });
  }

  // 2. Check general network failure strings
  if (isNetworkError(error)) {
    return AppError.network(
      'Network connection failure. Please check your internet connection.',
      error
    );
  }

  // 3. Fallback to sanitized internal error with contextual action
  const fallbackMessage = action
    ? `Unable to ${action}. Please try again later.`
    : 'A database operation could not be completed. Please try again.';

  return AppError.internal(fallbackMessage, error);
}

/**
 * Universal error normalizer: converts any unknown error, Firestore error,
 * Auth error, or standard Error into a strongly-typed AppError.
 */
export function normalizeError(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred'
): AppError {
  if (error instanceof AppError) {
    return error;
  }

  // Auth error
  const fbError = error as Partial<FirebaseError>;
  if (fbError?.code && String(fbError.code).startsWith('auth/')) {
    return mapFirebaseAuthError(error);
  }

  // Firestore error
  if (
    fbError?.code &&
    (String(fbError.code).includes('firestore') ||
      String(fbError.code) in FIRESTORE_CODE_MAP ||
      typeof fbError.code === 'number')
  ) {
    return mapFirestoreError(error);
  }

  // Network offline
  if (isNetworkError(error)) {
    return AppError.network(
      'Network connection unavailable. Please check your connection.',
      error
    );
  }

  // Standard JS Error
  if (error instanceof Error) {
    // Avoid leaking raw FirebaseError string prefix
    if (error.name === 'FirebaseError' || error.message.includes('FirebaseError:')) {
      return mapFirestoreError(error);
    }
    return AppError.internal(error.message || fallbackMessage, error);
  }

  // String or unknown
  if (typeof error === 'string') {
    return AppError.internal(error);
  }

  return AppError.internal(fallbackMessage, error);
}

/**
 * Checks if an error is a transient network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT' || error.isRetryable;
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }

  const str = String(error instanceof Error ? error.message : error).toLowerCase();
  return (
    str.includes('network') ||
    str.includes('offline') ||
    str.includes('failed to fetch') ||
    str.includes('unavailable') ||
    str.includes('load failed') ||
    str.includes('timeout') ||
    str.includes('disconnected')
  );
}

/**
 * Checks if an error is an access/permission error (403/401)
 */
export function isPermissionError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.code === 'FORBIDDEN' || error.code === 'UNAUTHORIZED';
  }
  const str = String(error instanceof Error ? error.message : error).toLowerCase();
  return (
    str.includes('permission') ||
    str.includes('unauthorized') ||
    str.includes('forbidden') ||
    str.includes('access denied')
  );
}

/**
 * Checks if an error is a 404 Not Found error
 */
export function isNotFoundError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.code === 'NOT_FOUND';
  }
  const str = String(error instanceof Error ? error.message : error).toLowerCase();
  return str.includes('not found') || str.includes('not-found');
}

/**
 * Determines whether an error is safe to retry
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isRetryable;
  }
  return isNetworkError(error);
}

/**
 * Extracts a clear, user-friendly, non-technical message suitable for alerts and toasts
 */
export function getUserFriendlyErrorMessage(
  error: unknown,
  defaultFallback = 'Something went wrong. Please try again.'
): string {
  if (!error) return defaultFallback;

  if (error instanceof AppError) {
    return error.message;
  }

  const normalized = normalizeError(error, defaultFallback);
  return normalized.message;
}

export { mapFirebaseAuthError };
