import { AppError } from '@elsesourav/types';

export class AuthError extends AppError {
  constructor(message: string, details?: unknown) {
    super('AUTHENTICATION_ERROR', message, {
      status: 401,
      cause: details,
    });
    this.name = 'AuthError';
  }

  static fromSupabase(error: { message: string; status?: number } | null): AuthError {
    if (!error) {
      return new AuthError('An unknown authentication error occurred');
    }

    const msg = error.message.toLowerCase();

    if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
      return new AuthError('Invalid email or password. Please try again.');
    }
    if (msg.includes('email not confirmed') || msg.includes('email not verified')) {
      return new AuthError('Please verify your email address before signing in.');
    }
    if (msg.includes('user already registered') || msg.includes('email address already in use')) {
      return new AuthError('An account with this email address already exists.');
    }
    if (msg.includes('password should be at least')) {
      return new AuthError('Password does not meet minimum security requirements.');
    }
    if (
      msg.includes('jwt expired') ||
      msg.includes('session expired') ||
      msg.includes('auth session missing')
    ) {
      return new AuthError('Your session has expired. Please sign in again.');
    }
    if (msg.includes('rate limit') || msg.includes('too many requests')) {
      return new AuthError('Too many sign-in attempts. Please try again in a few minutes.');
    }

    return new AuthError(
      'Authentication failed. Please check your credentials and try again.',
      error
    );
  }
}
