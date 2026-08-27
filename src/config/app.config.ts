import type { AppMetadata, Environment } from '@/types/system.types';
import { APP_NAME, APP_TAGLINE } from '@/constants';

const getEnvironment = (): Environment => {
  if (import.meta.env.MODE === 'test') return 'test';
  if (import.meta.env.PROD) return 'production';
  return 'development';
};

declare const __APP_VERSION__: string | undefined;

export const appConfig: AppMetadata = {
  name: APP_NAME,
  tagline: APP_TAGLINE,
  version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.1.0',
  status: 'ready',
  environment: getEnvironment(),
};
