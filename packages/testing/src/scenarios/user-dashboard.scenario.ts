import type {
  User,
  UserLibraryItem,
  NotificationItem,
  SupportTicketListItem,
  App,
} from '@elsesourav/types';
import { fixtureStandardUser, fixtureMinimalUser } from '../fixtures/users.fixtures';
import { fixtureUserLibraryItems } from '../fixtures/library.fixtures';
import { fixtureNotificationsList } from '../fixtures/notifications.fixtures';
import { fixtureSupportTicketListItems } from '../fixtures/support.fixtures';
import { fixturePublishedApps } from '../fixtures/apps.fixtures';

export interface UserDashboardScenarioData {
  readonly user: User;
  readonly libraryItems: readonly (UserLibraryItem & { app: App })[];
  readonly notifications: readonly NotificationItem[];
  readonly unreadNotificationCount: number;
  readonly supportTickets: readonly SupportTicketListItem[];
}

export function createEmptyUserDashboardScenario(): UserDashboardScenarioData {
  return {
    user: fixtureMinimalUser,
    libraryItems: [],
    notifications: [],
    unreadNotificationCount: 0,
    supportTickets: [],
  };
}

export function createActiveUserDashboardScenario(): UserDashboardScenarioData {
  const fallbackApp: App = fixturePublishedApps[0] as App;
  const libraryWithApps: (UserLibraryItem & { app: App })[] = fixtureUserLibraryItems.map(
    (item, index) => {
      const app: App = fixturePublishedApps[index] ?? fallbackApp;
      return {
        ...item,
        app,
      };
    }
  );

  const unreadCount = fixtureNotificationsList.filter((n) => !n.isRead).length;

  return {
    user: fixtureStandardUser,
    libraryItems: libraryWithApps,
    notifications: fixtureNotificationsList,
    unreadNotificationCount: unreadCount,
    supportTickets: fixtureSupportTicketListItems,
  };
}
