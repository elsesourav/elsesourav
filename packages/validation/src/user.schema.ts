import { z } from 'zod';

export const RESERVED_USERNAMES = [
  'admin',
  'administrator',
  'api',
  'auth',
  'dashboard',
  'help',
  'login',
  'logout',
  'root',
  'settings',
  'signup',
  'staff',
  'support',
  'system',
] as const;

export const UsernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters long')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, hyphens, and underscores')
  .refine(
    (val) => !RESERVED_USERNAMES.includes(val.toLowerCase() as (typeof RESERVED_USERNAMES)[number]),
    { message: 'This username is reserved and cannot be claimed' }
  );

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50).optional(),
  username: UsernameSchema.optional(),
  bio: z.string().max(250, 'Bio cannot exceed 250 characters').optional(),
  photoUrl: z.string().url('Please enter a valid photo URL').optional(),
});

export const UpdatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  emailNotifications: z.boolean().optional(),
  reduceMotion: z.boolean().optional(),
  compactView: z.boolean().optional(),
  language: z.string().max(10).optional(),
});

export const DeleteAccountSchema = z.object({
  confirmation: z.literal('DELETE MY ACCOUNT', {
    errorMap: () => ({ message: 'Please type "DELETE MY ACCOUNT" exactly to confirm closure' }),
  }),
  reason: z.string().max(500).optional(),
});

export const UserProfileSchema = UpdateProfileSchema;
export const UserPreferencesSchema = UpdatePreferencesSchema;

export type UpdateProfileSchemaInput = z.infer<typeof UpdateProfileSchema>;
export type UpdatePreferencesSchemaInput = z.infer<typeof UpdatePreferencesSchema>;
export type DeleteAccountSchemaInput = z.infer<typeof DeleteAccountSchema>;
