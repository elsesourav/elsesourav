import type { AppMetadata, Environment } from '@/types/system.types';
import { APP_NAME, APP_TAGLINE } from '@/constants';

const getEnvironment = (): Environment => {
  if (import.meta.env.MODE === 'test') return 'test';
  if (import.meta.env.PROD) return 'production';
  return 'development';
};

export const appConfig: AppMetadata = {
  name: APP_NAME,
  tagline: APP_TAGLINE,
  version: '0.1.0',
  status: 'ready',
  environment: getEnvironment(),
};
