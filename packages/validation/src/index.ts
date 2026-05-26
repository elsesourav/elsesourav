import { z } from "zod";

const metadataSchema = z
  .record(z.string(), z.unknown())
  .refine((value) => JSON.stringify(value).length <= 20000, {
    message: "Metadata payload is too large.",
  });

export const appStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);
export const linkPlatformSchema = z.enum([
  "CHROME",
  "ANDROID",
  "GITHUB",
  "WEBSITE",
  "OTHER",
]);

export const mediaTypeSchema = z.enum(["IMAGE", "VIDEO"]);

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const registerSchema = credentialsSchema.extend({
  name: z.string().min(2).max(120),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resendVerificationSchema = z.object({
  email: z.string().email(),
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(12).max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(12).max(255),
  password: z.string().min(8).max(128),
});

export const customFieldEntitySchema = z.enum([
  "APP",
  "CATEGORY",
  "CONTENT_PAGE",
  "POST",
  "HELP_ARTICLE",
  "PROFILE_PAGE",
  "TESTIMONIAL",
  "THEME_CONFIG",
  "STORE_BANNER",
  "STORE_SECTION_ITEM",
  "HOME_SLIDER",
  "APP_TAG",
  "POST_TAG",
  "HELP_CATEGORY",
  "APP_MEDIA",
  "APP_LINK",
  "USER",
]);

export const customFieldTypeSchema = z.enum([
  "TEXT",
  "LONG_TEXT",
  "NUMBER",
  "BOOLEAN",
  "DATE",
  "URL",
  "JSON",
  "SELECT",
  "MULTISELECT",
]);

const customFieldDefinitionBaseSchema = z.object({
  entity: customFieldEntitySchema,
  key: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9][a-z0-9_.-]{1,79}$/),
  label: z.string().trim().min(2).max(120),
  description: z.string().trim().max(400).optional(),
  fieldType: customFieldTypeSchema.default("TEXT"),
  isRequired: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  isFilterable: z.coerce.boolean().default(false),
  options: z.unknown().optional(),
  defaultValue: z.unknown().optional(),
});

export const customFieldDefinitionCreateSchema =
  customFieldDefinitionBaseSchema;

export const customFieldDefinitionUpdateSchema = customFieldDefinitionBaseSchema
  .partial()
  .refine(
    (value) =>
      value.entity !== undefined ||
      value.key !== undefined ||
      value.label !== undefined ||
      value.description !== undefined ||
      value.fieldType !== undefined ||
      value.isRequired !== undefined ||
      value.isActive !== undefined ||
      value.isFilterable !== undefined ||
      value.options !== undefined ||
      value.defaultValue !== undefined,
    {
      message: "At least one custom field definition field must be provided.",
    },
  );

export const customFieldValuesQuerySchema = z.object({
  definitionId: z.string().cuid().optional(),
  entity: customFieldEntitySchema.optional(),
  entityId: z.string().trim().min(2).max(120).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export const customFieldValueUpsertSchema = z.object({
  definitionId: z.string().cuid(),
  entityId: z.string().trim().min(2).max(120),
  value: z.unknown(),
});

export const customFieldValueUpdateSchema = z.object({
  value: z.unknown(),
});

const createAppBaseSchema = z.object({
  title: z.string().min(3).max(120),
  shortDescription: z.string().min(10).max(300),
  fullDescription: z.string().min(20).max(5000),
  releaseNotes: z.string().max(8000).optional(),
  version: z.string().min(1).max(20).default("1.0.0"),
  status: appStatusSchema.default("DRAFT"),
  isPaid: z.coerce.boolean().default(false),
  isFeatured: z.coerce.boolean().default(false),
  price: z.coerce.number().min(0).max(999999).default(0),
  iconUrl: z.string().url().optional(),
  featureGraphicUrl: z.string().url().optional(),
  promoVideoUrl: z.string().url().optional(),
  supportEmail: z.string().email().optional(),
  supportWebsiteUrl: z.string().url().optional(),
  privacyPolicyUrl: z.string().url().optional(),
  containsAds: z.coerce.boolean().default(false),
  developerName: z.string().max(120).optional(),
  metadata: metadataSchema.optional(),
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
  description: z.string().trim().max(200).optional(),
});

export const appTypeSchema = z.enum([
  "GAMING",
  "SOCIAL_MEDIA_COMMUNICATION",
  "PRODUCTIVITY_BUSINESS",
  "LIFESTYLE",
  "UTILITY_TOOL",
]);

export const publicAppsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  categoryId: z.string().cuid().optional(),
  type: appTypeSchema.optional(),
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

const appMediaBaseSchema = z.object({
  type: mediaTypeSchema,
  url: z.string().url(),
  alt: z.string().trim().max(180).nullish(),
  mimeType: z.string().trim().max(120).nullish(),
  width: z.coerce.number().int().min(1).max(12000).nullish(),
  height: z.coerce.number().int().min(1).max(12000).nullish(),
  durationSec: z.coerce.number().int().min(0).max(86400).nullish(),
  thumbnailUrl: z.string().url().nullish(),
  fileSizeBytes: z.string().trim().regex(/^\d+$/).nullish(),
  isAnimated: z.coerce.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const appMediaCreateSchema = appMediaBaseSchema;

export const appMediaUpdateSchema = appMediaBaseSchema
  .partial()
  .refine(
    (value) =>
      value.type !== undefined ||
      value.url !== undefined ||
      value.alt !== undefined ||
      value.mimeType !== undefined ||
      value.width !== undefined ||
      value.height !== undefined ||
      value.durationSec !== undefined ||
      value.thumbnailUrl !== undefined ||
      value.fileSizeBytes !== undefined ||
      value.isAnimated !== undefined ||
      value.sortOrder !== undefined,
    {
      message: "At least one media field must be provided.",
    },
  );

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
  "NEW",
  "COMING_SOON",
  "SPECIAL_OFFER",
  "EVENT",
]);

const bannerPlacementInputSchema = z.preprocess((value) => {
  if (value === "HOME_HERO") return "NEW";
  if (value === "LATEST") return "SPECIAL_OFFER";
  if (value === "UPCOMING") return "COMING_SOON";
  return value;
}, bannerPlacementSchema);

const bannerPlacementWithDefaultSchema = bannerPlacementInputSchema
  .optional()
  .transform((value) => value ?? "NEW");

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const bannerLinkUrlSchema = z
  .string()
  .trim()
  .refine((value) => value.startsWith("/") || isHttpUrl(value), {
    message:
      "linkUrl must be a valid URL or an internal path that starts with '/'.",
  });

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

const bannerWindowSchema = z
  .object({
    liveStartsAt: z.coerce.date().optional(),
    liveEndsAt: z.coerce.date().optional(),
    appStartsAt: z.coerce.date().optional(),
    appEndsAt: z.coerce.date().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.liveStartsAt && value.liveEndsAt) {
      if (value.liveEndsAt <= value.liveStartsAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["liveEndsAt"],
          message: "liveEndsAt must be greater than liveStartsAt.",
        });
      }
    } else if (value.liveStartsAt || value.liveEndsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["liveEndsAt"],
        message: "Both liveStartsAt and liveEndsAt are required.",
      });
    }

    if (value.appStartsAt && value.appEndsAt) {
      if (value.appEndsAt <= value.appStartsAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["appEndsAt"],
          message: "appEndsAt must be greater than appStartsAt.",
        });
      }
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
    subtitle: z.string().max(160).nullable().optional(),
    imageUrl: z.string().url(),
    linkUrl: bannerLinkUrlSchema.nullable().optional(),
    placement: bannerPlacementWithDefaultSchema,
    isActive: z.coerce.boolean().default(true),
  })
  .and(bannerWindowSchema)
  .superRefine((value, ctx) => {
    const placement = value.placement;
    const appStartsAt = value.appStartsAt;
    const appEndsAt = value.appEndsAt;
    const liveStartsAt = value.liveStartsAt;
    const liveEndsAt = value.liveEndsAt;

    if (!liveStartsAt || !liveEndsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["liveStartsAt"],
        message: "Visibility window is required for all banners.",
      });
    }

    if ((placement === "NEW" || placement === "COMING_SOON") && !appStartsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["appStartsAt"],
        message: "Launch date is required for New and Coming Soon banners.",
      });
    }

    if (
      (placement === "SPECIAL_OFFER" || placement === "EVENT") &&
      !appStartsAt
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["appStartsAt"],
        message: "Start date is required for Special Offer and Event banners.",
      });
    }

    if (
      (placement === "SPECIAL_OFFER" || placement === "EVENT") &&
      !appEndsAt
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["appEndsAt"],
        message: "End date is required for Special Offer and Event banners.",
      });
    }
  });

export const bannerUpdateSchema = z
  .object({
    title: z.string().min(3).max(120).optional(),
    subtitle: z.string().max(160).nullable().optional(),
    imageUrl: z.string().url().optional(),
    linkUrl: bannerLinkUrlSchema.nullable().optional(),
    placement: bannerPlacementInputSchema.optional(),
    liveStartsAt: z.coerce.date().optional(),
    liveEndsAt: z.coerce.date().optional(),
    appStartsAt: z.coerce.date().optional(),
    appEndsAt: z.coerce.date().optional(),
    isActive: z.coerce.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.liveStartsAt && value.liveEndsAt) {
      if (value.liveEndsAt <= value.liveStartsAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["liveEndsAt"],
          message: "liveEndsAt must be greater than liveStartsAt.",
        });
      }
    } else if (value.liveStartsAt || value.liveEndsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["liveEndsAt"],
        message: "Both liveStartsAt and liveEndsAt are required.",
      });
    }

    if (value.appStartsAt && value.appEndsAt) {
      if (value.appEndsAt <= value.appStartsAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["appEndsAt"],
          message: "appEndsAt must be greater than appStartsAt.",
        });
      }
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
  metadata: metadataSchema.optional(),
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
    customTheme: z
      .record(z.string(), z.string().max(200))
      .nullable()
      .optional(),
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

export const supportTicketStatusSchema = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "WAITING_FOR_USER",
  "RESOLVED",
  "CLOSED",
]);

export const supportTicketPrioritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

export const supportTicketChannelSchema = z.enum([
  "WEB",
  "EMAIL",
  "CHAT",
  "API",
]);

export const supportTicketCreateSchema = z.object({
  appId: z.string().cuid().optional(),
  subject: z.string().trim().min(4).max(200),
  description: z.string().trim().min(10).max(12000),
  priority: supportTicketPrioritySchema.default("MEDIUM"),
  category: z.string().trim().min(2).max(80).optional(),
  channel: supportTicketChannelSchema.default("WEB"),
  sourceUrl: z.string().url().optional(),
  metadata: metadataSchema.optional(),
});

export const supportTicketUpdateSchema = z
  .object({
    status: supportTicketStatusSchema.optional(),
    priority: supportTicketPrioritySchema.optional(),
    category: z.string().trim().min(2).max(80).optional(),
    assignedToId: z.string().cuid().nullable().optional(),
    sourceUrl: z.string().url().nullable().optional(),
    metadata: metadataSchema.optional(),
  })
  .refine(
    (value) =>
      value.status !== undefined ||
      value.priority !== undefined ||
      value.category !== undefined ||
      value.assignedToId !== undefined ||
      value.sourceUrl !== undefined ||
      value.metadata !== undefined,
    {
      message: "At least one support ticket update field must be provided.",
    },
  );

export const supportTicketReplyCreateSchema = z.object({
  body: z.string().trim().min(2).max(12000),
  isInternal: z.coerce.boolean().optional(),
  attachments: z.array(z.string().url()).max(10).optional(),
});

export const supportTicketListQuerySchema = z.object({
  status: supportTicketStatusSchema.optional(),
  priority: supportTicketPrioritySchema.optional(),
  appId: z.string().cuid().optional(),
  assignedToId: z.string().cuid().optional(),
  search: z.string().trim().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
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

export const postStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const postTagCreateSchema = z.object({
  name: z.string().min(2).max(80),
  slug: slugSchema.optional(),
});

export const postTagUpdateSchema = postTagCreateSchema.partial();

export const postCreateSchema = z.object({
  slug: slugSchema,
  title: z.string().min(3).max(180),
  excerpt: z.string().max(500).optional(),
  contentMarkdown: z.string().min(20),
  featuredImageUrl: z.string().url().optional(),
  metadata: metadataSchema.optional(),
  status: postStatusSchema.default("DRAFT"),
  publishAt: z.coerce.date().optional(),
  tagIds: z.array(z.string().cuid()).max(25).default([]),
});

export const postUpdateSchema = postCreateSchema.partial();

export const postCommentCreateSchema = z.object({
  content: z.string().min(2).max(5000),
  authorName: z.string().min(2).max(120).optional(),
  authorEmail: z.string().email().optional(),
  parentId: z.string().cuid().optional(),
});

export const postCommentModerationSchema = z.object({
  isApproved: z.coerce.boolean(),
});

export const postReactionToggleSchema = z.object({
  type: z.enum(["like", "love", "insightful", "celebrate"]).default("like"),
});

export const postBookmarkToggleSchema = z.object({}); // Empty body for toggle

// Backwards-compatible aliases
export const blogPostStatusSchema = postStatusSchema;
export const blogTagCreateSchema = postTagCreateSchema;
export const blogTagUpdateSchema = postTagUpdateSchema;
export const blogPostCreateSchema = postCreateSchema;
export const blogPostUpdateSchema = postUpdateSchema;
export const blogCommentCreateSchema = postCommentCreateSchema;
export const blogCommentModerationSchema = postCommentModerationSchema;
export const blogReactionToggleSchema = postReactionToggleSchema;
export const blogBookmarkToggleSchema = postBookmarkToggleSchema;

export const helpArticleStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const helpCategoryCreateSchema = z.object({
  parentId: z.string().cuid().optional(),
  name: z.string().min(2).max(120),
  slug: slugSchema,
  description: z.string().max(300).optional(),
  orderIndex: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const helpCategoryUpdateSchema = helpCategoryCreateSchema.partial();

export const helpArticleCreateSchema = z.object({
  categoryId: z.string().cuid().optional(),
  appId: z.string().cuid().optional(),
  slug: slugSchema,
  title: z.string().min(3).max(180),
  summary: z.string().max(500).optional(),
  contentMarkdown: z.string().min(20),
  contentMdx: z.string().optional(),
  status: helpArticleStatusSchema.default("DRAFT"),
  isFeatured: z.coerce.boolean().default(false),
  publishAt: z.coerce.date().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const helpArticleUpdateSchema = helpArticleCreateSchema.partial();

export const faqCreateSchema = z.object({
  question: z.string().min(3),
  answerMdx: z.string().min(5),
  categoryId: z.string().cuid().optional(),
  appId: z.string().cuid().optional(),
  orderIndex: z.coerce.number().int().min(0).default(0),
});

export const faqUpdateSchema = faqCreateSchema.partial();

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
  actionColor: hexColorSchema,
  backgroundColor: hexColorSchema,
  foregroundColor: hexColorSchema,
  darkPrimaryColor: hexColorSchema,
  darkSecondaryColor: hexColorSchema,
  darkAccentColor: hexColorSchema,
  darkActionColor: hexColorSchema,
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
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateAppInput = z.infer<typeof createAppSchema>;
export type UpdateAppInput = z.infer<typeof updateAppSchema>;
export type CustomFieldEntityInput = z.infer<typeof customFieldEntitySchema>;
export type CustomFieldTypeInput = z.infer<typeof customFieldTypeSchema>;
export type CustomFieldDefinitionCreateInput = z.infer<
  typeof customFieldDefinitionCreateSchema
>;
export type CustomFieldDefinitionUpdateInput = z.infer<
  typeof customFieldDefinitionUpdateSchema
>;
export type CustomFieldValuesQueryInput = z.infer<
  typeof customFieldValuesQuerySchema
>;
export type CustomFieldValueUpsertInput = z.infer<
  typeof customFieldValueUpsertSchema
>;
export type CustomFieldValueUpdateInput = z.infer<
  typeof customFieldValueUpdateSchema
>;
export type PublicAppsQuery = z.infer<typeof publicAppsQuerySchema>;
export type DownloadEventInput = z.infer<typeof downloadEventSchema>;
export type LibraryMutationInput = z.infer<typeof libraryMutationSchema>;
export type FeedbackCreateInput = z.infer<typeof feedbackCreateSchema>;
export type FeedbackModerationInput = z.infer<typeof feedbackModerationSchema>;
export type CloudinarySignInput = z.infer<typeof cloudinarySignSchema>;
export type MediaTypeInput = z.infer<typeof mediaTypeSchema>;
export type StoreSectionTypeInput = z.infer<typeof storeSectionTypeSchema>;
export type BannerPlacementInput = z.infer<typeof bannerPlacementSchema>;
export type AppMediaCreateInput = z.infer<typeof appMediaCreateSchema>;
export type AppMediaUpdateInput = z.infer<typeof appMediaUpdateSchema>;
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
export type SupportTicketStatusInput = z.infer<
  typeof supportTicketStatusSchema
>;
export type SupportTicketPriorityInput = z.infer<
  typeof supportTicketPrioritySchema
>;
export type SupportTicketChannelInput = z.infer<
  typeof supportTicketChannelSchema
>;
export type SupportTicketCreateInput = z.infer<
  typeof supportTicketCreateSchema
>;
export type SupportTicketUpdateInput = z.infer<
  typeof supportTicketUpdateSchema
>;
export type SupportTicketReplyCreateInput = z.infer<
  typeof supportTicketReplyCreateSchema
>;
export type SupportTicketListQueryInput = z.infer<
  typeof supportTicketListQuerySchema
>;
export type ProfilePageCreateInput = z.infer<typeof profilePageCreateSchema>;
export type ProfilePageUpdateInput = z.infer<typeof profilePageUpdateSchema>;
export type PostStatusInput = z.infer<typeof postStatusSchema>;
export type PostTagCreateInput = z.infer<typeof postTagCreateSchema>;
export type PostTagUpdateInput = z.infer<typeof postTagUpdateSchema>;
export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
export type PostCommentCreateInput = z.infer<typeof postCommentCreateSchema>;
export type PostCommentModerationInput = z.infer<
  typeof postCommentModerationSchema
>;
export type PostReactionToggleInput = z.infer<typeof postReactionToggleSchema>;
export type PostBookmarkToggleInput = z.infer<typeof postBookmarkToggleSchema>;

// Backwards-compatible aliases
export type BlogPostStatusInput = PostStatusInput;
export type BlogTagCreateInput = PostTagCreateInput;
export type BlogTagUpdateInput = PostTagUpdateInput;
export type BlogPostCreateInput = PostCreateInput;
export type BlogPostUpdateInput = PostUpdateInput;
export type BlogCommentCreateInput = PostCommentCreateInput;
export type BlogCommentModerationInput = PostCommentModerationInput;
export type HelpArticleStatusInput = z.infer<typeof helpArticleStatusSchema>;
export type HelpCategoryCreateInput = z.infer<typeof helpCategoryCreateSchema>;
export type HelpCategoryUpdateInput = z.infer<typeof helpCategoryUpdateSchema>;
export type HelpArticleCreateInput = z.infer<typeof helpArticleCreateSchema>;
export type HelpArticleUpdateInput = z.infer<typeof helpArticleUpdateSchema>;
export type TestimonialCreateInput = z.infer<typeof testimonialCreateSchema>;
export type TestimonialUpdateInput = z.infer<typeof testimonialUpdateSchema>;
export type ThemeConfigCreateInput = z.infer<typeof themeConfigCreateSchema>;
export type ThemeConfigUpdateInput = z.infer<typeof themeConfigUpdateSchema>;
