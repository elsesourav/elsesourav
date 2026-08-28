import { z } from 'zod';
import { isValidSemver } from '@/utils/semver';

export const appVersionStatusSchema = z.enum(['draft', 'published', 'archived']);

export const createAppVersionSchema = z.object({
  appId: z.string().min(1, 'App ID is required'),
  version: z
    .string()
    .min(1, 'Version is required')
    .refine(isValidSemver, 'Version must follow Semantic Versioning (e.g., 1.0.0, 2.1.0-beta.1)'),
  title: z.string().min(1, 'Release title is required').max(100),
  summary: z.string().min(1, 'Summary is required').max(250),
  releaseNotes: z.string().min(1, 'Release notes are required'),
  highlights: z.array(z.string()).default([]),
  releaseDate: z.number().default(() => Date.now()),
  status: appVersionStatusSchema.default('published'),
  isCurrent: z.boolean().default(false),
  minOsVersion: z.string().optional(),
  downloadUrl: z.string().url('Invalid download URL').or(z.literal('')).optional(),
  fileSize: z.string().optional(),
});

export const updateAppVersionSchema = createAppVersionSchema.partial();
