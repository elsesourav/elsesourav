import { z } from 'zod';

export const AdminSaveCarouselSlideSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title cannot exceed 120 characters'),
  subtitle: z
    .string()
    .trim()
    .max(250, 'Subtitle cannot exceed 250 characters')
    .optional()
    .or(z.literal('')),
  desktopImageUrl: z
    .string()
    .trim()
    .min(1, 'Desktop banner image (21:9) is required')
    .url('Must be a valid image URL'),
  mobileImageUrl: z
    .string()
    .trim()
    .url('Must be a valid image URL')
    .optional()
    .or(z.literal('')),
  targetUrl: z
    .string()
    .trim()
    .min(1, 'Destination target link is required'),
  badgeText: z
    .string()
    .trim()
    .max(50, 'Badge text cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0, 'Sort order must be non-negative').default(0),
  isActive: z.boolean().default(true),
});

export type AdminSaveCarouselSlideInput = z.infer<typeof AdminSaveCarouselSlideSchema>;
