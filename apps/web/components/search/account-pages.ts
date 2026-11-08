import type { GlobalSearchResult } from '@elsesourav/types';

/**
 * Static account and settings pages for fast contextual search navigation.
 */
export const ACCOUNT_PAGES: readonly GlobalSearchResult[] = [
  {
    type: 'page',
    title: 'Account',
    description: 'View and manage your personal account overview.',
    url: '/account',
  },
  {
    type: 'page',
    title: 'Settings',
    description: 'Manage username, email, display name, and preferences.',
    url: '/account?tab=settings',
  },
  {
    type: 'page',
    title: 'Security',
    description: 'Update password, credentials, and account security.',
    url: '/account?tab=security',
  },
  {
    type: 'page',
    title: 'Notifications',
    description: 'Activity alerts, emails, and notification preferences.',
    url: '/notifications',
  },
  {
    type: 'page',
    title: 'Library',
    description: 'Saved apps, bookmarks, and starred items.',
    url: '/library',
  },
  {
    type: 'page',
    title: 'Dashboard',
    description: 'Personal overview, statistics, and quick actions.',
    url: '/dashboard',
  },
  {
    type: 'page',
    title: 'Help & Support',
    description: 'Submit support tickets and get assistance.',
    url: '/support/tickets',
  },
];

/**
 * Search account pages by matching query against title and description.
 */
export function searchAccountPages(query: string): GlobalSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ACCOUNT_PAGES.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
  );
}
