import { z } from "zod";

export const appStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const registerSchema = credentialsSchema.extend({
  name: z.string().min(2).max(120),
});

const createAppBaseSchema = z.object({
  title: z.string().min(3).max(120),
  shortDescription: z.string().min(10).max(300),
  fullDescription: z.string().min(20).max(5000),
  version: z.string().min(1).max(20).default("1.0.0"),
  status: appStatusSchema.default("DRAFT"),
  isPaid: z.coerce.boolean().default(false),
  price: z.coerce.number().min(0).max(999999).default(0),
  categoryId: z.string().cuid(),
});

export const createAppSchema = createAppBaseSchema.superRefine((value, ctx) => {
  if (!value.isPaid && value.price !== 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["price"],
      message: "Price must be 0 when app is free.",
    });
  }

  if (value.isPaid && value.price <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["price"],
      message: "Paid apps must have a price greater than 0.",
    });
  }
});

export const updateAppSchema = createAppBaseSchema
  .partial()
  .superRefine((value, ctx) => {
    if (
      value.isPaid === false &&
      value.price !== undefined &&
      value.price !== 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "Price must be 0 when app is free.",
      });
    }

    if (
      value.isPaid === true &&
      value.price !== undefined &&
      value.price <= 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "Paid apps must have a price greater than 0.",
      });
    }
  });

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  icon: z.string().max(80).optional(),
});

export const publicAppsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  categoryId: z.string().cuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
  sort: z.enum(["latest", "trending"]).default("latest"),
});

export const downloadEventSchema = z.object({
  appId: z.string().cuid(),
  platform: z.enum(["CHROME", "ANDROID", "GITHUB", "WEBSITE", "OTHER"]),
});

export const libraryMutationSchema = z.object({
  appId: z.string().cuid(),
});

export const feedbackCreateSchema = z.object({
  appId: z.string().cuid(),
  message: z.string().min(3).max(2000),
  rating: z.coerce.number().int().min(1).max(5),
});

export const feedbackModerationSchema = z.object({
  feedbackId: z.string().cuid(),
  isHidden: z.coerce.boolean(),
});

export const cloudinarySignSchema = z.object({
  folder: z.string().min(2).max(120).default("apps"),
  timestamp: z.coerce.number().int().positive().optional(),
});

export const storeSectionTypeSchema = z.enum([
  "LATEST",
  "UPCOMING",
  "FEATURED",
]);

export const bannerPlacementSchema = z.enum([
  "HOME_HERO",
  "LATEST",
  "UPCOMING",
]);

const releaseWindowSchema = z
  .object({
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.startsAt && value.endsAt && value.endsAt <= value.startsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "endsAt must be greater than startsAt.",
      });
    }
  });

export const sectionItemCreateSchema = z
  .object({
    appId: z.string().cuid(),
    sectionType: storeSectionTypeSchema,
    orderIndex: z.coerce.number().int().min(0).default(0),
    releaseAt: z.coerce.date().optional(),
  })
  .and(releaseWindowSchema);

export const sectionItemUpdateSchema = z
  .object({
    orderIndex: z.coerce.number().int().min(0).optional(),
    releaseAt: z.coerce.date().optional(),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.startsAt && value.endsAt && value.endsAt <= value.startsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "endsAt must be greater than startsAt.",
      });
    }
  });

export const sectionItemsQuerySchema = z.object({
  sectionType: storeSectionTypeSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
});

export const bannerCreateSchema = z
  .object({
    title: z.string().min(3).max(120),
    imageUrl: z.string().url(),
    linkUrl: z.string().url().nullable().optional(),
    placement: bannerPlacementSchema.default("HOME_HERO"),
    isActive: z.coerce.boolean().default(true),
  })
  .and(releaseWindowSchema);

export const bannerUpdateSchema = z
  .object({
    title: z.string().min(3).max(120).optional(),
    imageUrl: z.string().url().optional(),
    linkUrl: z.string().url().nullable().optional(),
    placement: bannerPlacementSchema.optional(),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
    isActive: z.coerce.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.startsAt && value.endsAt && value.endsAt <= value.startsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "endsAt must be greater than startsAt.",
      });
    }
  });

export const contentStatusSchema = z.enum([
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
]);

export const contentPageCreateSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  title: z.string().min(3).max(180),
  summary: z.string().max(400).optional(),
  body: z.string().min(10),
  seoTitle: z.string().max(180).optional(),
  seoDescription: z.string().max(300).optional(),
  status: contentStatusSchema.default("DRAFT"),
  publishAt: z.coerce.date().optional(),
});

export const contentPageUpdateSchema = contentPageCreateSchema.partial();

const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/);

export const themeConfigCreateSchema = z.object({
  name: z.string().min(2).max(120),
  primaryColor: hexColorSchema,
  secondaryColor: hexColorSchema,
  accentColor: hexColorSchema,
  backgroundColor: hexColorSchema,
  foregroundColor: hexColorSchema,
  fontSans: z.string().min(2).max(120),
  fontHeading: z.string().min(2).max(120),
  headingScale: z.coerce.number().min(0.8).max(1.6).default(1),
  isActive: z.coerce.boolean().default(false),
});

export const themeConfigUpdateSchema = themeConfigCreateSchema.partial();

export type CredentialsInput = z.infer<typeof credentialsSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateAppInput = z.infer<typeof createAppSchema>;
export type UpdateAppInput = z.infer<typeof updateAppSchema>;
export type PublicAppsQuery = z.infer<typeof publicAppsQuerySchema>;
export type DownloadEventInput = z.infer<typeof downloadEventSchema>;
export type LibraryMutationInput = z.infer<typeof libraryMutationSchema>;
export type FeedbackCreateInput = z.infer<typeof feedbackCreateSchema>;
export type FeedbackModerationInput = z.infer<typeof feedbackModerationSchema>;
export type CloudinarySignInput = z.infer<typeof cloudinarySignSchema>;
export type StoreSectionTypeInput = z.infer<typeof storeSectionTypeSchema>;
export type BannerPlacementInput = z.infer<typeof bannerPlacementSchema>;
export type SectionItemCreateInput = z.infer<typeof sectionItemCreateSchema>;
export type SectionItemUpdateInput = z.infer<typeof sectionItemUpdateSchema>;
export type SectionItemsQueryInput = z.infer<typeof sectionItemsQuerySchema>;
export type BannerCreateInput = z.infer<typeof bannerCreateSchema>;
export type BannerUpdateInput = z.infer<typeof bannerUpdateSchema>;
export type ContentPageCreateInput = z.infer<typeof contentPageCreateSchema>;
export type ContentPageUpdateInput = z.infer<typeof contentPageUpdateSchema>;
export type ThemeConfigCreateInput = z.infer<typeof themeConfigCreateSchema>;
export type ThemeConfigUpdateInput = z.infer<typeof themeConfigUpdateSchema>;
