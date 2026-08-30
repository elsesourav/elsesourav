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

// Username Regex: 4-30 chars, lowercase alphanumeric, underscores, hyphens. Must start & end with letter/number.
export const USERNAME_REGEX = /^[a-z0-9][a-z0-9_-]{2,28}[a-z0-9]$/;

export const UsernameSchema = z
  .string()
  .trim()
  .min(4, 'Username must be at least 4 characters long')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(
    /^[a-z0-9_-]+$/,
    'Username can only contain lowercase letters, numbers, hyphens, and underscores'
  )
  .regex(
    /^[a-z0-9].*[a-z0-9]$/,
    'Username must start and end with a letter or number'
  )
  .refine(
    (val) => !val.includes('__') && !val.includes('--') && !val.includes('_-') && !val.includes('-_'),
    { message: 'Username cannot contain consecutive hyphens or underscores' }
  )
  .refine(
    (val) => !RESERVED_USERNAMES.includes(val.toLowerCase() as (typeof RESERVED_USERNAMES)[number]),
    { message: 'This username is reserved and cannot be claimed' }
  );

// Name Regex: 2-60 chars, letters, spaces, apostrophes, hyphens, periods (strictly no numbers or special symbols)
export const NAME_REGEX = /^[\p{L}\s'.-]{2,60}$/u;
export const FULL_NAME_REGEX = NAME_REGEX;

export const NameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters long')
  .max(60, 'Name cannot exceed 60 characters')
  .regex(
    NAME_REGEX,
    'Name can only contain letters, spaces, hyphens, and apostrophes'
  )
  .refine((val) => !/[0-9]/.test(val), {
    message: 'Name cannot contain numbers',
  });

export const FullNameSchema = NameSchema;

export const UpdateProfileSchema = z.object({
  displayName: FullNameSchema.optional(),
  username: UsernameSchema.optional().or(z.literal('')),
  bio: z.string().max(250, 'Bio cannot exceed 250 characters').optional().or(z.literal('')),
  photoUrl: z.string().optional().or(z.literal('')),
  email: z.string().email('Please enter a valid email address').optional(),
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

export const AdminUpdateUserRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['USER', 'STAFF', 'ADMIN']),
});

export const AdminUpdateUserStatusSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  status: z.enum(['active', 'suspended', 'deleted']),
  reason: z.string().max(300).optional(),
});

export const AdminDeleteUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  reason: z.string().max(300).optional(),
});

export const AdminUserQuerySchema = z.object({
  role: z.enum(['all', 'USER', 'STAFF', 'ADMIN']).optional().default('all'),
  status: z.enum(['all', 'active', 'suspended', 'deleted']).optional().default('all'),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const SyncUserAuthSchema = z.object({
  supabaseAuthId: z.string().min(1, 'Supabase Auth ID is required'),
  email: z.string().email('Please enter a valid email address'),
  displayName: FullNameSchema.optional(),
  username: UsernameSchema.optional(),
  photoUrl: z.string().optional().or(z.literal('')),
});

export const UserProfileSchema = UpdateProfileSchema;
export const UserPreferencesSchema = UpdatePreferencesSchema;

export type SyncUserAuthSchemaInput = z.infer<typeof SyncUserAuthSchema>;
export type UpdateProfileSchemaInput = z.infer<typeof UpdateProfileSchema>;
export type UpdatePreferencesSchemaInput = z.infer<typeof UpdatePreferencesSchema>;
export type DeleteAccountSchemaInput = z.infer<typeof DeleteAccountSchema>;
export type AdminUpdateUserRoleInput = z.infer<typeof AdminUpdateUserRoleSchema>;
export type AdminUpdateUserStatusInput = z.infer<typeof AdminUpdateUserStatusSchema>;
export type AdminUserQueryInput = z.infer<typeof AdminUserQuerySchema>;
