import { z } from 'zod';

export const UserProfileSchema = z.object({
  displayName: z.string().min(2).max(50),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(200).optional(),
  photoUrl: z.string().url().optional(),
});

export const UserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  emailNotifications: z.boolean().default(true),
  reduceMotion: z.boolean().default(false),
  compactView: z.boolean().default(false),
});

export type UserProfileInput = z.infer<typeof UserProfileSchema>;
export type UserPreferencesInput = z.infer<typeof UserPreferencesSchema>;
