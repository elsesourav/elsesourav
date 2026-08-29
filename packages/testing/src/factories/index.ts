import { resetUserFactoryCounter } from './user.factory';
import { resetAppFactoryCounter } from './app.factory';
import { resetBlogFactoryCounter } from './blog.factory';
import { resetHelpFactoryCounter } from './help.factory';
import { resetSupportFactoryCounter } from './support.factory';
import { resetLibraryFactoryCounter } from './library.factory';
import { resetNotificationFactoryCounter } from './notification.factory';
import { resetMediaFactoryCounter } from './media.factory';
import { resetAuditFactoryCounter } from './audit.factory';

export * from './user.factory';
export * from './app.factory';
export * from './blog.factory';
export * from './help.factory';
export * from './support.factory';
export * from './library.factory';
export * from './notification.factory';
export * from './media.factory';
export * from './audit.factory';

export function resetAllFactoryCounters(): void {
  resetUserFactoryCounter();
  resetAppFactoryCounter();
  resetBlogFactoryCounter();
  resetHelpFactoryCounter();
  resetSupportFactoryCounter();
  resetLibraryFactoryCounter();
  resetNotificationFactoryCounter();
  resetMediaFactoryCounter();
  resetAuditFactoryCounter();
}
