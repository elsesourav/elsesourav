import { z } from 'zod';

export const userRoleSchema = z.enum(['user', 'admin']);

export const userStatusSchema = z.enum(['active', 'suspended', 'deleted', 'pending']);

export const userPreferencesSchema = z.object({
  theme: z.enum(['system', 'dark', 'light']).default('system'),
  emailNotifications: z.boolean().default(true),
  reduceMotion: z.boolean().default(false),
  compactView: z.boolean().default(false),
  language: z.string().min(2).max(10).optional(),
});

export const createUserProfileSchema = z.object({
  id: z.string().min(1, 'User UID is required'),
  email: z.string().email('Invalid email address'),
  displayName: z.string().min(1, 'Display name is required').max(100),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(
      /^[a-z0-9_.-]+$/,
      'Username must only contain lowercase alphanumeric characters, underscores, hyphens, and periods'
    )
    .optional(),
  photoUrl: z.string().url('Invalid photo URL').optional(),
  bio: z.string().max(300, 'Bio must not exceed 300 characters').optional(),
  role: userRoleSchema.default('user'),
  status: userStatusSchema.default('active'),
  preferences: userPreferencesSchema.default({
    theme: 'system',
    emailNotifications: true,
    reduceMotion: false,
    compactView: false,
  }),
});

/**
 * User-editable profile fields
 * Note: Role, status, createdAt, and deletedAt are strictly excluded from client updates
 */
export const updateUserProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name cannot be empty').max(100).optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(
      /^[a-z0-9_.-]+$/,
      'Username must only contain lowercase alphanumeric characters, underscores, hyphens, and periods'
    )
    .optional(),
  bio: z.string().max(300, 'Bio must not exceed 300 characters').optional(),
  photoUrl: z.string().url('Invalid photo URL').or(z.literal('')).optional(),
});

export const updateUserPreferencesSchema = userPreferencesSchema.partial();
