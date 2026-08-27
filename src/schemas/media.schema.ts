import { z } from 'zod';

export const appMediaTypeSchema = z.enum([
  'icon',
  'hero',
  'screenshot',
  'video',
  'social',
  'gallery',
  'other',
]);

export const createAppMediaSchema = z
  .object({
    appId: z.string().min(1, 'App ID is required'),
    type: appMediaTypeSchema,
    url: z
      .string()
      .url('Invalid media URL')
      .refine(
        (val) => val.startsWith('https://') || val.startsWith('http://'),
        'Media URL must use http or https protocol'
      ),
    altText: z.string().default(''),
    title: z.string().max(100, 'Title cannot exceed 100 characters').optional(),
    width: z.number().int().positive('Width must be a positive integer').optional(),
    height: z.number().int().positive('Height must be a positive integer').optional(),
    orderIndex: z.number().int().default(0),
    isPrimary: z.boolean().default(false),
    isDecorative: z.boolean().default(false),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.isDecorative) {
        return true;
      }
      return typeof data.altText === 'string' && data.altText.trim().length > 0;
    },
    {
      message: 'Alt text is required for accessibility unless image is marked decorative',
      path: ['altText'],
    }
  );

export const updateAppMediaSchema = z
  .object({
    appId: z.string().min(1).optional(),
    type: appMediaTypeSchema.optional(),
    url: z
      .string()
      .url('Invalid media URL')
      .refine(
        (val) => val.startsWith('https://') || val.startsWith('http://'),
        'Media URL must use http or https protocol'
      )
      .optional(),
    altText: z.string().optional(),
    title: z.string().max(100).optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    orderIndex: z.number().int().optional(),
    isPrimary: z.boolean().optional(),
    isDecorative: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.isDecorative === true) {
        return true;
      }
      if (data.altText !== undefined && data.isDecorative === false) {
        return data.altText.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Alt text is required for accessibility unless image is marked decorative',
      path: ['altText'],
    }
  );

export const reorderMediaSchema = z.object({
  mediaIds: z.array(z.string().min(1)).min(1, 'At least one media ID is required for reordering'),
});
