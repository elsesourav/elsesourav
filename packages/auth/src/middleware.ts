import type { UserRole } from '@elsesourav/types';

export function isAuthorizedRole(userRole: UserRole, requiredRole: UserRole): boolean {
  if (userRole === 'ADMIN') return true;
  if (userRole === 'CREATOR' && requiredRole !== 'ADMIN') return true;
  return userRole === requiredRole;
}
