import { AppError } from './errors';
import type { FirebaseError } from 'firebase/app';

/**
 * Maps Firebase Auth SDK errors to structured AppError instances
 */
export function mapFirebaseAuthError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const fbError = error as Partial<FirebaseError>;
  const code = fbError?.code || '';
  const message = fbError?.message || '';

  switch (code) {
    case 'auth/invalid-email':
      return AppError.badRequest('The email address provided is invalid.', 'email');
    case 'auth/user-disabled':
      return AppError.forbidden('This user account has been suspended or disabled.');
    case 'auth/user-not-found':
      return AppError.notFound('Account', 'email');
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return AppError.unauthorized('Invalid email or password. Please verify your credentials.');
    case 'auth/email-already-in-use':
      return new AppError('CONFLICT', 'An account with this email address already exists.', {
        field: 'email',
        cause: error,
      });
    case 'auth/weak-password':
      return AppError.validation(
        'Password is too weak. Please use at least 6 characters.',
        'password'
      );
    case 'auth/too-many-requests':
      return AppError.forbidden('Too many failed attempts. Please try again in a few minutes.');
    case 'auth/popup-closed-by-user':
      return AppError.badRequest('Sign-in cancelled: popup was closed before completion.');
    case 'auth/popup-blocked':
      return AppError.badRequest('Sign-in popup was blocked by browser. Please enable popups.');
    case 'auth/network-request-failed':
      return AppError.network(
        'Network error during authentication. Please check your connection.',
        error
      );
    case 'auth/requires-recent-login':
      return AppError.unauthorized(
        'This sensitive action requires recent authentication. Please sign in again.'
      );
    case 'auth/expired-action-code':
      return AppError.badRequest('This verification or password reset link has expired.');
    case 'auth/invalid-action-code':
      return AppError.badRequest('This link is invalid or has already been used.');
    default:
      return AppError.internal(
        message
          ? `Authentication error: ${message}`
          : 'An unexpected authentication error occurred.',
        error
      );
  }
}
