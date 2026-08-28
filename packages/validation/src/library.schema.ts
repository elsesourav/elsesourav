import { z } from 'zod';

export const SaveAppSchema = z.object({
  appId: z.string().min(1, 'App ID is required'),
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  customNotes: z.string().max(500, 'Custom notes cannot exceed 500 characters').optional(),
});

export const LibraryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  isFavorite: z.boolean().optional(),
});

export type SaveAppSchemaInput = z.infer<typeof SaveAppSchema>;
export type LibraryQuerySchemaInput = z.infer<typeof LibraryQuerySchema>;
