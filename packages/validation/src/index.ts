import { z } from "zod";

export const appStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);
export const linkPlatformSchema = z.enum([
  "CHROME",
  "ANDROID",
  "GITHUB",
  "WEBSITE",
  "OTHER",
]);

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
  isFeatured: z.coerce.boolean().default(false),
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
  tag: z.string().trim().max(60).optional(),
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  featured: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value ? value === "true" : undefined)),
  sort: z
    .enum([
      "latest",
      "trending",
      "popular",
      "mostViewed",
      "mostDownloaded",
      "topRated",
    ])
    .default("latest"),
});

export const downloadEventSchema = z.object({
  appId: z.string().cuid(),
  platform: linkPlatformSchema,
});

const appLinkBaseSchema = z.object({
  platform: linkPlatformSchema,
  downloadUrl: z.string().url(),
  sourceCodeUrl: z.string().url().nullable().optional(),
});

export const appLinkCreateSchema = appLinkBaseSchema;

export const appLinkUpdateSchema = appLinkBaseSchema
  .partial()
  .refine(
    (value) =>
      value.platform !== undefined ||
      value.downloadUrl !== undefined ||
      value.sourceCodeUrl !== undefined,
    {
      message: "At least one link field must be provided.",
    },
  );

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

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9-]+$/);

export const sliderTypeSchema = z.enum(["HERO", "FEATURED", "PROMO"]);

const homeSliderBaseSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional(),
  type: sliderTypeSchema.default("HERO"),
  imageUrl: z.string().url().nullable().optional(),
  linkUrl: z.string().url().nullable().optional(),
  appId: z.string().cuid().nullable().optional(),
  orderIndex: z.coerce.number().int().min(0).default(0),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  isActive: z.coerce.boolean().default(true),
});

export const homeSliderCreateSchema = homeSliderBaseSchema.superRefine(
  (value, ctx) => {
    if (value.startsAt && value.endsAt && value.endsAt <= value.startsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "endsAt must be greater than startsAt.",
      });
    }
  },
);

export const homeSliderUpdateSchema = homeSliderBaseSchema
  .partial()
  .superRefine((value, ctx) => {
    if (value.startsAt && value.endsAt && value.endsAt <= value.startsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "endsAt must be greater than startsAt.",
      });
    }
  });

export const appTagCreateSchema = z.object({
  name: z.string().min(2).max(60),
  slug: slugSchema.optional(),
});

export const appTagUpdateSchema = appTagCreateSchema.partial();

export const appTagAssignmentSchema = z.object({
  tagIds: z.array(z.string().cuid()).max(25).default([]),
});

export const appViewTrackSchema = z.object({
  appId: z.string().cuid(),
  sessionId: z.string().min(8).max(120).optional(),
  source: z.string().min(2).max(80).optional(),
});

export const appStatsRecomputeSchema = z.object({
  appId: z.string().cuid().optional(),
  date: z.coerce.date().optional(),
});

export const recentlyViewedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const userThemeModeSchema = z.enum(["system", "light", "dark"]);

export const userSettingsUpdateSchema = z
  .object({
    themeMode: userThemeModeSchema.optional(),
    customTheme: z.record(z.string().max(200)).nullable().optional(),
    emailNotifications: z.coerce.boolean().optional(),
    marketingEmails: z.coerce.boolean().optional(),
  })
  .refine(
    (value) =>
      value.themeMode !== undefined ||
      value.customTheme !== undefined ||
      value.emailNotifications !== undefined ||
      value.marketingEmails !== undefined,
    {
      message: "At least one setting field must be provided.",
    },
  );

export const userDeletionScheduleSchema = z.object({
  confirm: z.literal(true),
  delayDays: z.coerce.number().int().min(7).max(30).default(14),
});

export const profilePageCreateSchema = z.object({
  slug: slugSchema.default("main"),
  fullName: z.string().min(2).max(120),
  headline: z.string().max(180).optional(),
  shortBio: z.string().max(300).optional(),
  bioMarkdown: z.string().min(20),
  experienceMarkdown: z.string().optional(),
  skills: z.array(z.string().min(1).max(80)).max(100).optional(),
  tools: z.array(z.string().min(1).max(80)).max(100).optional(),
  contactEmail: z.string().email().optional(),
  location: z.string().max(160).optional(),
  websiteUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  resumeUrl: z.string().url().optional(),
  avatarUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
  isActive: z.coerce.boolean().default(true),
});

export const profilePageUpdateSchema = profilePageCreateSchema.partial();

export const blogPostStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const blogTagCreateSchema = z.object({
  name: z.string().min(2).max(80),
  slug: slugSchema.optional(),
});

export const blogTagUpdateSchema = blogTagCreateSchema.partial();

export const blogPostCreateSchema = z.object({
  slug: slugSchema,
  title: z.string().min(3).max(180),
  excerpt: z.string().max(500).optional(),
  contentMarkdown: z.string().min(20),
  status: blogPostStatusSchema.default("DRAFT"),
  publishAt: z.coerce.date().optional(),
  tagIds: z.array(z.string().cuid()).max(25).default([]),
});

export const blogPostUpdateSchema = blogPostCreateSchema.partial();

export const blogCommentCreateSchema = z.object({
  content: z.string().min(2).max(5000),
  authorName: z.string().min(2).max(120).optional(),
  authorEmail: z.string().email().optional(),
});

export const blogCommentModerationSchema = z.object({
  isApproved: z.coerce.boolean(),
});

export const helpArticleStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const helpCategoryCreateSchema = z.object({
  name: z.string().min(2).max(120),
  slug: slugSchema,
  description: z.string().max(300).optional(),
  orderIndex: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const helpCategoryUpdateSchema = helpCategoryCreateSchema.partial();

export const helpArticleCreateSchema = z.object({
  categoryId: z.string().cuid().optional(),
  slug: slugSchema,
  title: z.string().min(3).max(180),
  summary: z.string().max(500).optional(),
  contentMarkdown: z.string().min(20),
  status: helpArticleStatusSchema.default("DRAFT"),
  isFeatured: z.coerce.boolean().default(false),
  publishAt: z.coerce.date().optional(),
});

export const helpArticleUpdateSchema = helpArticleCreateSchema.partial();

export const testimonialCreateSchema = z.object({
  authorName: z.string().min(2).max(120),
  authorRole: z.string().max(160).optional(),
  company: z.string().max(160).optional(),
  avatarUrl: z.string().url().optional(),
  quoteMarkdown: z.string().min(10),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  sourceUrl: z.string().url().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isFeatured: z.coerce.boolean().default(true),
  isActive: z.coerce.boolean().default(true),
});

export const testimonialUpdateSchema = testimonialCreateSchema.partial();

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
  darkPrimaryColor: hexColorSchema,
  darkSecondaryColor: hexColorSchema,
  darkAccentColor: hexColorSchema,
  darkBackgroundColor: hexColorSchema,
  darkForegroundColor: hexColorSchema,
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
export type SliderTypeInput = z.infer<typeof sliderTypeSchema>;
export type HomeSliderCreateInput = z.infer<typeof homeSliderCreateSchema>;
export type HomeSliderUpdateInput = z.infer<typeof homeSliderUpdateSchema>;
export type AppTagCreateInput = z.infer<typeof appTagCreateSchema>;
export type AppTagUpdateInput = z.infer<typeof appTagUpdateSchema>;
export type AppTagAssignmentInput = z.infer<typeof appTagAssignmentSchema>;
export type AppViewTrackInput = z.infer<typeof appViewTrackSchema>;
export type AppStatsRecomputeInput = z.infer<typeof appStatsRecomputeSchema>;
export type RecentlyViewedQueryInput = z.infer<
  typeof recentlyViewedQuerySchema
>;
export type UserThemeModeInput = z.infer<typeof userThemeModeSchema>;
export type UserSettingsUpdateInput = z.infer<typeof userSettingsUpdateSchema>;
export type UserDeletionScheduleInput = z.infer<
  typeof userDeletionScheduleSchema
>;
export type ProfilePageCreateInput = z.infer<typeof profilePageCreateSchema>;
export type ProfilePageUpdateInput = z.infer<typeof profilePageUpdateSchema>;
export type BlogPostStatusInput = z.infer<typeof blogPostStatusSchema>;
export type BlogTagCreateInput = z.infer<typeof blogTagCreateSchema>;
export type BlogTagUpdateInput = z.infer<typeof blogTagUpdateSchema>;
export type BlogPostCreateInput = z.infer<typeof blogPostCreateSchema>;
export type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>;
export type BlogCommentCreateInput = z.infer<typeof blogCommentCreateSchema>;
export type BlogCommentModerationInput = z.infer<
  typeof blogCommentModerationSchema
>;
export type HelpArticleStatusInput = z.infer<typeof helpArticleStatusSchema>;
export type HelpCategoryCreateInput = z.infer<typeof helpCategoryCreateSchema>;
export type HelpCategoryUpdateInput = z.infer<typeof helpCategoryUpdateSchema>;
export type HelpArticleCreateInput = z.infer<typeof helpArticleCreateSchema>;
export type HelpArticleUpdateInput = z.infer<typeof helpArticleUpdateSchema>;
export type TestimonialCreateInput = z.infer<typeof testimonialCreateSchema>;
export type TestimonialUpdateInput = z.infer<typeof testimonialUpdateSchema>;
export type ThemeConfigCreateInput = z.infer<typeof themeConfigCreateSchema>;
export type ThemeConfigUpdateInput = z.infer<typeof themeConfigUpdateSchema>;
