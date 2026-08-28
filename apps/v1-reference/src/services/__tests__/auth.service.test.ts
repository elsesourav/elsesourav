import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirebaseAuthService, mapFirebaseUser, deriveUserProfile } from '../auth.service';
import { isOk, isErr } from '@/lib/result';
import type { User as FirebaseUser, Auth } from 'firebase/auth';

// Mock Firebase Auth SDK functions
vi.mock('firebase/auth', () => {
  class MockGoogleAuthProvider {
    setCustomParameters = vi.fn();
  }

  return {
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    sendEmailVerification: vi.fn(),
    updateProfile: vi.fn(),
    onAuthStateChanged: vi.fn(),
    GoogleAuthProvider: MockGoogleAuthProvider,
  };
});

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth';

describe('AuthService & Domain Mapping', () => {
  const mockFirebaseUser = {
    uid: 'test-user-123',
    email: 'dev@elsesourav.com',
    emailVerified: true,
    displayName: 'Sourav Developer',
    photoURL: 'https://elsesourav.com/avatar.png',
    isAnonymous: false,
    providerData: [{ providerId: 'password' }],
    metadata: {
      creationTime: '2026-01-01T00:00:00.000Z',
      lastSignInTime: '2026-08-26T12:00:00.000Z',
    },
  } as unknown as FirebaseUser;

  let mockAuth: Auth;
  let authService: FirebaseAuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth = {
      currentUser: mockFirebaseUser,
    } as unknown as Auth;
    authService = new FirebaseAuthService(() => mockAuth);
  });

  describe('mapFirebaseUser & deriveUserProfile', () => {
    it('correctly transforms Firebase User into AuthUser domain model', () => {
      const authUser = mapFirebaseUser(mockFirebaseUser);
      expect(authUser).not.toBeNull();
      expect(authUser?.uid).toBe('test-user-123');
      expect(authUser?.email).toBe('dev@elsesourav.com');
      expect(authUser?.emailVerified).toBe(true);
      expect(authUser?.displayName).toBe('Sourav Developer');
      expect(authUser?.photoURL).toBe('https://elsesourav.com/avatar.png');
    });

    it('returns null when mapping null user', () => {
      expect(mapFirebaseUser(null)).toBeNull();
    });

    it('derives application user profile with default user role', () => {
      const authUser = mapFirebaseUser(mockFirebaseUser)!;
      const user = deriveUserProfile(authUser);

      expect(user.id).toBe('test-user-123');
      expect(user.email).toBe('dev@elsesourav.com');
      expect(user.role).toBe('user');
      expect(user.status).toBe('active');
    });

    it('derives application user profile with explicit admin role', () => {
      const authUser = mapFirebaseUser(mockFirebaseUser)!;
      const user = deriveUserProfile(authUser, 'admin');

      expect(user.role).toBe('admin');
    });
  });

  describe('Authentication Actions', () => {
    it('signs in with email and password successfully', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({
        user: mockFirebaseUser,
      } as never);

      const result = await authService.signIn({
        email: 'dev@elsesourav.com',
        password: 'SecurePassword123!',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.uid).toBe('test-user-123');
        expect(result.data.email).toBe('dev@elsesourav.com');
      }
    });

    it('maps Firebase Auth error codes into structured AppError on failed sign in', async () => {
      const firebaseError = {
        code: 'auth/invalid-credential',
        message: 'Invalid credentials',
      };
      vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(firebaseError);

      const result = await authService.signIn({
        email: 'dev@elsesourav.com',
        password: 'WrongPassword',
      });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe('UNAUTHORIZED');
        expect(result.error.message).toContain('Invalid email or password');
      }
    });

    it('signs up new user with email, password, and display name', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({
        user: mockFirebaseUser,
      } as never);

      const result = await authService.signUp({
        email: 'newuser@elsesourav.com',
        password: 'StrongPassword123!',
        displayName: 'New Dev',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.uid).toBe('test-user-123');
      }
    });

    it('signs in with Google popup successfully', async () => {
      vi.mocked(signInWithPopup).mockResolvedValueOnce({
        user: mockFirebaseUser,
      } as never);

      const result = await authService.signInWithGoogle();
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.email).toBe('dev@elsesourav.com');
      }
    });

    it('signs out successfully', async () => {
      vi.mocked(signOut).mockResolvedValueOnce(undefined);

      const result = await authService.signOut();
      expect(isOk(result)).toBe(true);
      expect(signOut).toHaveBeenCalled();
    });

    it('sends password reset email', async () => {
      vi.mocked(sendPasswordResetEmail).mockResolvedValueOnce(undefined);

      const result = await authService.sendPasswordReset({ email: 'dev@elsesourav.com' });
      expect(isOk(result)).toBe(true);
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(mockAuth, 'dev@elsesourav.com');
    });

    it('sends verification email to current user', async () => {
      vi.mocked(sendEmailVerification).mockResolvedValueOnce(undefined);

      const result = await authService.sendVerificationEmail();
      expect(isOk(result)).toBe(true);
      expect(sendEmailVerification).toHaveBeenCalledWith(mockFirebaseUser);
    });

    it('subscribes to onAuthStateChanged and invokes callback with mapped user', () => {
      let registeredCallback: ((u: FirebaseUser | null) => void) | undefined;
      vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth, cb) => {
        registeredCallback = cb as (u: FirebaseUser | null) => void;
        return vi.fn();
      });

      const userCallback = vi.fn();
      authService.onAuthStateChanged(userCallback);

      expect(registeredCallback).toBeDefined();
      registeredCallback!(mockFirebaseUser);
      expect(userCallback).toHaveBeenCalledWith(expect.objectContaining({ uid: 'test-user-123' }));
    });
  });
});
