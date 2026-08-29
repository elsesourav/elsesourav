import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { AppError } from '@elsesourav/types';
import type { AdminContext } from '@elsesourav/types';

export async function getAdminContext(): Promise<AdminContext | null> {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session?.user?.id) return null;

  const { role } = session.user;
  if (role !== 'ADMIN' && role !== 'STAFF') return null;

  return {
    id: session.user.id,
    email: session.user.email,
    role,
    displayName: session.user.displayName || 'Admin',
  };
}

export async function requireAdmin(): Promise<AdminContext> {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session?.user) {
    redirect('/login?next=/admin');
  }

  const { role } = session.user;
  if (role !== 'ADMIN' && role !== 'STAFF') {
    throw AppError.forbidden('Access denied: Administrative privileges required');
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role,
    displayName: session.user.displayName || 'Admin',
  };
}
