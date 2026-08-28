import { ClientEnv, validateClientEnv } from '../client/env.client';
import { ServerEnv, validateServerEnv } from '../server/env.server';

export interface AppEnvironment {
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  client: ClientEnv;
  server?: ServerEnv;
}

export function initializeEnvironment(
  rawEnv: Record<string, unknown> = process.env,
  isServer = typeof window === 'undefined'
): AppEnvironment {
  const nodeEnv = (rawEnv['NODE_ENV'] as string) || 'development';
  const client = validateClientEnv(rawEnv);
  const server = isServer ? validateServerEnv(rawEnv) : undefined;

  return {
    isProduction: nodeEnv === 'production',
    isDevelopment: nodeEnv === 'development',
    isTest: nodeEnv === 'test',
    client,
    server,
  };
}

export function sanitizeEnvForDisplay(env: Record<string, unknown>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  const secretKeys = [
    'KEY',
    'SECRET',
    'PASSWORD',
    'TOKEN',
    'DATABASE_URL',
    'DIRECT_URL',
    'SERVICE_ROLE',
  ];

  for (const [key, value] of Object.entries(env)) {
    if (typeof value !== 'string') {
      sanitized[key] = String(value);
      continue;
    }

    const isSecret = secretKeys.some((s) => key.toUpperCase().includes(s));
    if (isSecret && value.length > 0) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
