import type { AppMetadata } from '@/types';

export const appConfig: AppMetadata = {
  name: 'ElseSourav',
  version: '0.1.0',
  status: 'ready',
  environment: import.meta.env.DEV ? 'development' : 'production',
};
