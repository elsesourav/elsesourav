import { createContext } from 'react';
import type { AuthContextValue } from '@/types/auth.types';

export const initialAuthContextValue: AuthContextValue = {
  authUser: null,
  user: null,
  role: 'user',
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  error: null,
  signIn: async () => {
    throw new Error('AuthProvider not mounted');
  },
  signUp: async () => {
    throw new Error('AuthProvider not mounted');
  },
  signInWithGoogle: async () => {
    throw new Error('AuthProvider not mounted');
  },
  signOut: async () => {
    throw new Error('AuthProvider not mounted');
  },
  sendPasswordReset: async () => {
    throw new Error('AuthProvider not mounted');
  },
  sendVerificationEmail: async () => {
    throw new Error('AuthProvider not mounted');
  },
  clearError: () => {},
};

export const AuthContext = createContext<AuthContextValue>(initialAuthContextValue);
