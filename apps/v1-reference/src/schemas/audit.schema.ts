import { z } from 'zod';

const FORBIDDEN_METADATA_KEYS = new Set([
  'password',
  'token',
  'secret',
  'credential',
  'apiKey',
  'auth',
  'authorization',
  'accessToken',
  'refreshToken',
  'privateKey',
]);

/**
 * Sanitizes metadata to strictly strip sensitive information
 */
export function sanitizeAuditMetadata(
  metadata?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!metadata || typeof metadata !== 'object') return undefined;

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = Array.from(FORBIDDEN_METADATA_KEYS).some((forbidden) =>
      lowerKey.includes(forbidden.toLowerCase())
    );

    if (!isSensitive) {
      if (value !== undefined && typeof value !== 'function' && typeof value !== 'symbol') {
        sanitized[key] = value;
      }
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

export const createAuditLogSchema = z.object({
  actorUserId: z.string().min(1, 'Actor user ID is required'),
  actorEmail: z.string().email().optional(),
  action: z.string().min(1, 'Action type is required'),
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().min(1, 'Entity ID is required'),
  metadata: z.record(z.string(), z.unknown()).optional(),
  ipAddress: z.string().optional(),
});

export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>;
