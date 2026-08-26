import { useContext } from 'react';
import { AuthContext } from '@/app/auth-context';
import type { AuthContextValue } from '@/types/auth.types';

/**
 * Custom hook to consume the application's authentication context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
