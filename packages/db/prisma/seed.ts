import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import {
  AppStatus,
  BannerPlacement,
  BlogPostStatus,
  ContentStatus,
  CustomFieldEntity,
  CustomFieldType,
  HelpArticleStatus,
  LinkPlatform,
  MediaType,
  PaymentStatus,
  PrismaClient,
  Role,
  SliderType,
  StoreSectionType,
} from "../src/generated/prisma/client";

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run db seed.");
  }

  return databaseUrl;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: getDatabaseUrl() }),
});

const DAY_MS = 24 * 60 * 60 * 1000;

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * DAY_MS);
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function requireEntity<T>(value: T | undefined, label: string): T {
  if (!value) {
    throw new Error(`Seed dependency not found: ${label}`);
  }

  return value;
}

type SeedUser = {
  key: string;
  email: string;
  name: string;
  role: Role;
};

type AppMediaSeed = {
  type: MediaType;
  url: string;
  alt: string;
  mimeType?: string;
  width?: number;
  height?: number;
  durationSec?: number;
  thumbnailUrl?: string;
  fileSizeBytes?: bigint;
  isAnimated?: boolean;
};

type AppLinkSeed = {
  platform: LinkPlatform;
  downloadUrl: string;
  sourceCodeUrl?: string;
};

type AppSectionSeed = {
  sectionType: StoreSectionType;
  orderIndex: number;
  releaseOffsetDays: number;
};

type AppSeed = {
  slug: string;
  title: string;
  repo: string;
  categoryName: string;
  shortDescription: string;
  fullDescription: string;
  releaseNotes: string;
  version: string;
  status: AppStatus;
  publishedDaysAgo: number;
  isPaid: boolean;
  price: number;
  isFeatured: boolean;
  containsAds: boolean;
  iconUrl: string;
  featureGraphicUrl: string;
  promoVideoUrl?: string;
  supportEmail: string;
  supportWebsiteUrl: string;
  privacyPolicyUrl: string;
  developerName: string;
  tags: string[];
  links: AppLinkSeed[];
  media: AppMediaSeed[];
  sections: AppSectionSeed[];
};

type ContentPageSeed = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  publishedDaysAgo: number;
};

type BlogPostSeed = {
  slug: string;
  title: string;
  excerpt: string;
  contentMarkdown: string;
  tagSlugs: string[];
  publishedDaysAgo: number;
};

type HelpArticleSeed = {
  slug: string;
  categorySlug: string;
  title: string;
  summary: string;
  contentMarkdown: string;
  isFeatured: boolean;
  publishedDaysAgo: number;
};

type BlogCommentSeed = {
  postSlug: string;
  userKey?: string;
  authorName?: string;
  authorEmail?: string;
  content: string;
  isApproved: boolean;
  daysAgo: number;
};

type LibrarySeed = {
  userKey: string;
  appSlug: string;
  note: string;
};

type DownloadSeed = {
  userKey: string;
  appSlug: string;
  platform: LinkPlatform;
  daysAgo: number;
};

type ViewSeed = {
  userKey: string;
  appSlug: string;
  sessionId: string;
  source: string;
  daysAgo: number;
};

type FeedbackSeed = {
  userKey: string;
  appSlug: string;
  message: string;
  rating: number;
  isHidden?: boolean;
  moderated?: boolean;
  daysAgo: number;
};

type PaymentSeed = {
  providerReference: string;
  userKey: string;
  appSlug: string;
  amount: number;
  status: PaymentStatus;
  daysAgo: number;
};

const categorySeeds = [
  { name: "Chrome Extensions", icon: "Puzzle" },
  { name: "Android Apps", icon: "Smartphone" },
  { name: "Developer Tools", icon: "Wrench" },
  { name: "Scripts", icon: "Terminal" },
] as const;

const appTagSeeds = [
  { name: "Open Source", slug: "open-source" },
  { name: "Productivity", slug: "productivity" },
  { name: "Automation", slug: "automation" },
  { name: "E-Commerce", slug: "e-commerce" },
  { name: "Image Tools", slug: "image-tools" },
  { name: "Analytics", slug: "analytics" },
  { name: "Learning", slug: "learning" },
] as const;

const appSeeds: AppSeed[] = [
  {
    slug: "es-orders-suite",
    title: "ES Orders Suite",
    repo: "es-orders",
    categoryName: "Developer Tools",
    shortDescription:
      "Operational dashboard for order lifecycle, retries, and fulfillment QA.",
    fullDescription: [
      "### Project source",
      "Based on [elsesourav/es-orders](https://github.com/elsesourav/es-orders).",
      "",
      "### Why this is seeded",
      "This demo app validates rich detail layouts: markdown content, gallery media, and multi-platform links.",
      "",
      "### Highlights",
      "- Order state transitions with retry-safe workflows.",
      "- Event driven checkout and shipment hooks.",
      "- Operational metrics that map directly to admin dashboards.",
    ].join("\n"),
    releaseNotes: [
      "## v2.4.1",
      "- Added release health checklist for staged rollouts.",
      "- Improved queue diagnostics for delayed confirmations.",
      "- Added richer error traces for payment retries.",
    ].join("\n"),
    version: "2.4.1",
    status: AppStatus.PUBLISHED,
    publishedDaysAgo: 14,
    isPaid: false,
    price: 0,
    isFeatured: true,
    containsAds: false,
    iconUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
    featureGraphicUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80",
    promoVideoUrl: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
    supportEmail: "support@elsesourav.dev",
    supportWebsiteUrl: "https://github.com/elsesourav/es-orders",
    privacyPolicyUrl: "https://elsesourav.dev/privacy",
    developerName: "ElseSourav Labs",
    tags: ["open-source", "automation", "analytics"],
    links: [
      {
        platform: LinkPlatform.GITHUB,
        downloadUrl: "https://github.com/elsesourav/es-orders",
        sourceCodeUrl: "https://github.com/elsesourav/es-orders",
      },
      {
        platform: LinkPlatform.WEBSITE,
        downloadUrl: "https://github.com/elsesourav/es-orders",
      },
      {
        platform: LinkPlatform.OTHER,
        downloadUrl: "https://github.com/elsesourav/es-orders/issues",
      },
    ],
    media: [
      {
        type: MediaType.IMAGE,
        url: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=1400&q=80",
        alt: "Order dashboard overview",
        mimeType: "image/jpeg",
        width: 1400,
        height: 933,
        fileSizeBytes: 382001n,
      },
      {
        type: MediaType.IMAGE,
        url: "https://images.unsplash.com/photo-1551281044-8b34c6e5f2f8?auto=format&fit=crop&w=1400&q=80",
        alt: "Order analytics and funnels",
        mimeType: "image/jpeg",
        width: 1400,
        height: 933,
        fileSizeBytes: 411200n,
      },
      {
        type: MediaType.VIDEO,
        url: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
        alt: "Release walkthrough clip",
        mimeType: "video/mp4",
        width: 640,
        height: 360,
        durationSec: 32,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=80",
        fileSizeBytes: 1890000n,
      },
    ],
    sections: [
      {
        sectionType: StoreSectionType.FEATURED,
        orderIndex: 1,
        releaseOffsetDays: -2,
      },
      {
        sectionType: StoreSectionType.LATEST,
        orderIndex: 1,
        releaseOffsetDays: -1,
      },
    ],
  },
  {
    slug: "listing-image-curator",
    title: "Listing Image Curator",
    repo: "listing-images-only",
    categoryName: "Chrome Extensions",
    shortDescription:
      "Chrome workflow for extracting and cleaning product listing visuals.",
    fullDescription: [
      "### Project source",
      "Based on [elsesourav/listing-images-only](https://github.com/elsesourav/listing-images-only).",
      "",
      "### What this demo validates",
      "It demonstrates marketplace style screenshots, paid pricing cards, and Chrome-focused distribution links.",
      "",
      "### Highlights",
      "- Batch image extraction from long listing pages.",
      "- Deduplicated asset exports for catalog sync.",
      "- Faster image moderation loops for content teams.",
    ].join("\n"),
    releaseNotes: [
      "## v1.8.0",
      "- Added smart dedupe against previous export runs.",
      "- Added one click filename normalization.",
      "- Updated export diagnostics for failed URLs.",
    ].join("\n"),
    version: "1.8.0",
    status: AppStatus.PUBLISHED,
    publishedDaysAgo: 7,
    isPaid: true,
    price: 4.99,
    isFeatured: true,
    containsAds: false,
    iconUrl:
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=400&q=80",
    featureGraphicUrl:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80",
    promoVideoUrl: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
    supportEmail: "chrome@elsesourav.dev",
    supportWebsiteUrl: "https://github.com/elsesourav/listing-images-only",
    privacyPolicyUrl: "https://elsesourav.dev/privacy",
    developerName: "ElseSourav Labs",
    tags: ["productivity", "image-tools", "e-commerce"],
    links: [
      {
        platform: LinkPlatform.CHROME,
        downloadUrl:
          "https://chromewebstore.google.com/detail/listing-image-curator-demo",
      },
      {
        platform: LinkPlatform.GITHUB,
        downloadUrl: "https://github.com/elsesourav/listing-images-only",
        sourceCodeUrl: "https://github.com/elsesourav/listing-images-only",
      },
      {
        platform: LinkPlatform.WEBSITE,
        downloadUrl: "https://github.com/elsesourav/listing-images-only",
      },
    ],
    media: [
      {
        type: MediaType.IMAGE,
        url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
        alt: "Image curation dashboard",
        mimeType: "image/jpeg",
        width: 1400,
        height: 933,
        fileSizeBytes: 367000n,
      },
      {
        type: MediaType.IMAGE,
        url: "https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&w=1400&q=80",
        alt: "Bulk media review queue",
        mimeType: "image/jpeg",
        width: 1400,
        height: 933,
        fileSizeBytes: 399000n,
      },
    ],
    sections: [
      {
        sectionType: StoreSectionType.FEATURED,
        orderIndex: 2,
        releaseOffsetDays: -1,
      },
      {
        sectionType: StoreSectionType.UPCOMING,
        orderIndex: 1,
        releaseOffsetDays: 8,
      },
    ],
  },
  {
    slug: "img-editor-lab",
    title: "IMG Editor Lab",
    repo: "img-editor",
    categoryName: "Android Apps",
    shortDescription:
      "Mobile first image editor experiments with practical export presets.",
    fullDescription: [
      "### Project source",
      "Based on [elsesourav/img-editor](https://github.com/elsesourav/img-editor).",
      "",
      "### Focus",
      "A compact editing workflow for creators who need quick crops, color tuning, and asset packs.",
      "",
      "### Highlights",
      "- Gesture friendly crop and rotate interactions.",
      "- Fast preset packs for social and commerce formats.",
      "- Export diagnostics for low memory devices.",
    ].join("\n"),
    releaseNotes: [
      "## v0.9.4",
      "- Added adaptive canvas fit for narrow screens.",
      "- Improved color histogram responsiveness.",
      "- Added export warning when alpha channels are stripped.",
    ].join("\n"),
    version: "0.9.4",
    status: AppStatus.PUBLISHED,
    publishedDaysAgo: 20,
    isPaid: false,
    price: 0,
    isFeatured: false,
    containsAds: false,
    iconUrl:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=400&q=80",
    featureGraphicUrl:
      "https://images.unsplash.com/photo-1517148815978-75f6acaaf32c?auto=format&fit=crop&w=1400&q=80",
    promoVideoUrl: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
    supportEmail: "mobile@elsesourav.dev",
    supportWebsiteUrl: "https://github.com/elsesourav/img-editor",
    privacyPolicyUrl: "https://elsesourav.dev/privacy",
    developerName: "ElseSourav Labs",
    tags: ["image-tools", "open-source", "productivity"],
    links: [
      {
        platform: LinkPlatform.ANDROID,
        downloadUrl:
          "https://play.google.com/store/apps/details?id=com.elsesourav.imgeditor.demo",
      },
      {
        platform: LinkPlatform.GITHUB,
        downloadUrl: "https://github.com/elsesourav/img-editor",
        sourceCodeUrl: "https://github.com/elsesourav/img-editor",
      },
      {
        platform: LinkPlatform.WEBSITE,
        downloadUrl: "https://github.com/elsesourav/img-editor",
      },
    ],
    media: [
      {
        type: MediaType.IMAGE,
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
        alt: "Mobile image editor canvas",
        mimeType: "image/jpeg",
        width: 1400,
        height: 934,
        fileSizeBytes: 348000n,
      },
      {
        type: MediaType.VIDEO,
        url: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
        alt: "Preset editing preview",
        mimeType: "video/mp4",
        width: 640,
        height: 360,
        durationSec: 25,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80",
        fileSizeBytes: 1740000n,
      },
    ],
    sections: [
      {
        sectionType: StoreSectionType.LATEST,
        orderIndex: 2,
        releaseOffsetDays: -3,
      },
      {
        sectionType: StoreSectionType.FEATURED,
        orderIndex: 3,
        releaseOffsetDays: -2,
      },
    ],
  },
  {
    slug: "extension-update-guardian",
    title: "Extension Update Guardian",
    repo: "ext-self-update",
    categoryName: "Scripts",
    shortDescription:
      "Release monitoring scripts for extension update verification pipelines.",
    fullDescription: [
      "### Project source",
      "Based on [elsesourav/ext-self-update](https://github.com/elsesourav/ext-self-update).",
      "",
      "### Scope",
      "This package helps teams verify that extension artifacts and release channels stay synchronized.",
      "",
      "### Highlights",
      "- Channel diff checks before promotion.",
      "- Automated release notes consistency checks.",
      "- Fast failure mode for rollback readiness.",
    ].join("\n"),
    releaseNotes: [
      "## v1.3.2",
      "- Added deterministic tag verification for release scripts.",
      "- Added optional dry run output mode.",
      "- Improved failure summaries for CI annotations.",
    ].join("\n"),
    version: "1.3.2",
    status: AppStatus.PUBLISHED,
    publishedDaysAgo: 5,
    isPaid: false,
    price: 0,
    isFeatured: false,
    containsAds: false,
    iconUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80",
    featureGraphicUrl:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1400&q=80",
    supportEmail: "automation@elsesourav.dev",
    supportWebsiteUrl: "https://github.com/elsesourav/ext-self-update",
    privacyPolicyUrl: "https://elsesourav.dev/privacy",
    developerName: "ElseSourav Labs",
    tags: ["automation", "analytics"],
    links: [
      {
        platform: LinkPlatform.GITHUB,
        downloadUrl: "https://github.com/elsesourav/ext-self-update",
        sourceCodeUrl: "https://github.com/elsesourav/ext-self-update",
      },
      {
        platform: LinkPlatform.WEBSITE,
        downloadUrl: "https://github.com/elsesourav/ext-self-update",
      },
      {
        platform: LinkPlatform.OTHER,
        downloadUrl:
          "https://github.com/elsesourav/ext-self-update/releases/latest",
      },
    ],
    media: [
      {
        type: MediaType.IMAGE,
        url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1400&q=80",
        alt: "Script execution dashboard",
        mimeType: "image/jpeg",
        width: 1400,
        height: 933,
        fileSizeBytes: 372000n,
      },
      {
        type: MediaType.IMAGE,
        url: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1400&q=80",
        alt: "Update guard release checks",
        mimeType: "image/jpeg",
        width: 1400,
        height: 932,
        fileSizeBytes: 360100n,
      },
    ],
    sections: [
      {
        sectionType: StoreSectionType.UPCOMING,
        orderIndex: 2,
        releaseOffsetDays: 3,
      },
      {
        sectionType: StoreSectionType.LATEST,
        orderIndex: 3,
        releaseOffsetDays: -1,
      },
    ],
  },
  {
    slug: "es-utils-toolbox",
    title: "ES Utils Toolbox",
    repo: "es-utils",
    categoryName: "Developer Tools",
    shortDescription:
      "Reusable utility package for validation, formatting, and retries.",
    fullDescription: [
      "### Project source",
      "Based on [elsesourav/es-utils](https://github.com/elsesourav/es-utils).",
      "",
      "### Purpose",
      "A utility foundation used by multiple apps to reduce boilerplate and improve consistency.",
      "",
      "### Highlights",
      "- Shared error envelopes for service responses.",
      "- Retry helpers with backoff and jitter controls.",
      "- Type safe string and date formatting helpers.",
    ].join("\n"),
    releaseNotes: [
      "## v3.1.0",
      "- Added deterministic date formatting utilities.",
      "- Added response guard helpers for API clients.",
      "- Deprecated legacy retry wrappers.",
    ].join("\n"),
    version: "3.1.0",
    status: AppStatus.PUBLISHED,
    publishedDaysAgo: 24,
    isPaid: true,
    price: 2.49,
    isFeatured: false,
    containsAds: false,
    iconUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80",
    featureGraphicUrl:
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1400&q=80",
    supportEmail: "utils@elsesourav.dev",
    supportWebsiteUrl: "https://github.com/elsesourav/es-utils",
    privacyPolicyUrl: "https://elsesourav.dev/privacy",
    developerName: "ElseSourav Labs",
    tags: ["open-source", "productivity", "automation"],
    links: [
      {
        platform: LinkPlatform.GITHUB,
        downloadUrl: "https://github.com/elsesourav/es-utils",
        sourceCodeUrl: "https://github.com/elsesourav/es-utils",
      },
      {
        platform: LinkPlatform.WEBSITE,
        downloadUrl: "https://github.com/elsesourav/es-utils",
      },
      {
        platform: LinkPlatform.OTHER,
        downloadUrl: "https://github.com/elsesourav/es-utils/issues",
      },
    ],
    media: [
      {
        type: MediaType.IMAGE,
        url: "https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1400&q=80",
        alt: "Utility package docs",
        mimeType: "image/jpeg",
        width: 1400,
        height: 934,
        fileSizeBytes: 355000n,
      },
      {
        type: MediaType.IMAGE,
        url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1400&q=80",
        alt: "Shared utility integration",
        mimeType: "image/jpeg",
        width: 1400,
        height: 933,
        fileSizeBytes: 345700n,
      },
    ],
    sections: [
      {
        sectionType: StoreSectionType.LATEST,
        orderIndex: 4,
        releaseOffsetDays: -7,
      },
    ],
  },
  {
    slug: "travel-plans-companion",
    title: "Travel Plans Companion",
    repo: "travel-plans",
    categoryName: "Android Apps",
    shortDescription:
      "Planner app for itinerary drafts, checkpoints, and daily reminders.",
    fullDescription: [
      "### Project source",
      "Based on [elsesourav/travel-plans](https://github.com/elsesourav/travel-plans).",
      "",
      "### Demo angle",
      "This listing stresses upcoming release cards and detailed markdown on app detail pages.",
      "",
      "### Highlights",
      "- Trip templates with date aware checkpoints.",
      "- Collaborative note slots for itinerary sharing.",
      "- Mobile notifications for milestone reminders.",
    ].join("\n"),
    releaseNotes: [
      "## v1.2.3",
      "- Added exportable packing checklist blocks.",
      "- Improved reminder scheduling for timezone changes.",
      "- Added nearby activity placeholders in plans.",
    ].join("\n"),
    version: "1.2.3",
    status: AppStatus.PUBLISHED,
    publishedDaysAgo: 3,
    isPaid: false,
    price: 0,
    isFeatured: true,
    containsAds: false,
    iconUrl:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80",
    featureGraphicUrl:
      "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1400&q=80",
    promoVideoUrl: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
    supportEmail: "travel@elsesourav.dev",
    supportWebsiteUrl: "https://github.com/elsesourav/travel-plans",
    privacyPolicyUrl: "https://elsesourav.dev/privacy",
    developerName: "ElseSourav Labs",
    tags: ["productivity", "learning", "analytics"],
    links: [
      {
        platform: LinkPlatform.ANDROID,
        downloadUrl:
          "https://play.google.com/store/apps/details?id=com.elsesourav.travelplans.demo",
      },
      {
        platform: LinkPlatform.GITHUB,
        downloadUrl: "https://github.com/elsesourav/travel-plans",
        sourceCodeUrl: "https://github.com/elsesourav/travel-plans",
      },
      {
        platform: LinkPlatform.WEBSITE,
        downloadUrl: "https://github.com/elsesourav/travel-plans",
      },
    ],
    media: [
      {
        type: MediaType.IMAGE,
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
        alt: "Trip planner timeline",
        mimeType: "image/jpeg",
        width: 1400,
        height: 934,
        fileSizeBytes: 352400n,
      },
      {
        type: MediaType.IMAGE,
        url: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1400&q=80",
        alt: "Destination and schedule cards",
        mimeType: "image/jpeg",
        width: 1400,
        height: 934,
        fileSizeBytes: 361900n,
      },
    ],
    sections: [
      {
        sectionType: StoreSectionType.FEATURED,
        orderIndex: 4,
        releaseOffsetDays: -1,
      },
      {
        sectionType: StoreSectionType.UPCOMING,
        orderIndex: 3,
        releaseOffsetDays: 14,
      },
    ],
  },
];

const contentPageSeeds: ContentPageSeed[] = [
  {
    slug: "about",
    title: "About ElseSourav",
    summary:
      "ElseSourav is a product driven playground that combines shipping velocity with polished UX.",
    body: [
      "ElseSourav is a development platform focused on practical shipping.",
      "",
      "### What you can explore",
      "- Public app listings with media rich detail pages.",
      "- Admin workflows for catalog, content, and theme management.",
      "- User engagement loops including feedback and history.",
      "",
      "### GitHub footprint",
      "Key repos include [es-orders](https://github.com/elsesourav/es-orders), [listing-images-only](https://github.com/elsesourav/listing-images-only), and [es-utils](https://github.com/elsesourav/es-utils).",
    ].join("\n"),
    seoTitle: "About ElseSourav Platform",
    seoDescription:
      "Mission, architecture, and product direction for ElseSourav.",
    publishedDaysAgo: 30,
  },
  {
    slug: "platform-roadmap",
    title: "Platform Roadmap",
    summary: "Near term priorities for store, content, and analytics domains.",
    body: [
      "### Q2 focus",
      "- Improve app discovery relevance and sorting behavior.",
      "- Expand content workflows with richer moderation.",
      "- Increase service level observability in admin dashboards.",
      "",
      "### Q3 focus",
      "- Introduce release train automation based on repository metadata.",
      "- Ship a dedicated public changelog timeline.",
    ].join("\n"),
    seoTitle: "ElseSourav Roadmap",
    seoDescription: "Public roadmap for the next release cycles.",
    publishedDaysAgo: 16,
  },
  {
    slug: "support-center",
    title: "Support Center Overview",
    summary: "Where to find help, report issues, and request feature support.",
    body: [
      "### Support channels",
      "- Technical requests: support@elsesourav.dev",
      "- Billing requests: billing@elsesourav.dev",
      "- Repository issues: use the linked GitHub project issue trackers.",
      "",
      "### Response goals",
      "Most requests receive a first response within 24 to 48 hours.",
    ].join("\n"),
    seoTitle: "ElseSourav Support Center",
    seoDescription: "How to request technical and billing support.",
    publishedDaysAgo: 12,
  },
  {
    slug: "integrations",
    title: "Integrations",
    summary: "Service and tooling integrations used in the platform.",
    body: [
      "### Core integrations",
      "- PostgreSQL for transactional data.",
      "- Prisma for schema and relation management.",
      "- Next.js plus microservices for frontend and API orchestration.",
      "",
      "### Developer workflow",
      "Repository links in app details map to source, issue tracking, and release notes.",
    ].join("\n"),
    seoTitle: "ElseSourav Integrations",
    seoDescription:
      "The integration stack behind ElseSourav platform features.",
    publishedDaysAgo: 8,
  },
  {
    slug: "release-calendar",
    title: "Release Calendar",
    summary: "Expected release windows for current quarter milestones.",
    body: [
      "### Upcoming windows",
      "- Week 1: listing-image-curator packaging refresh.",
      "- Week 2: extension-update-guardian rollout.",
      "- Week 3: travel-plans-companion reminders upgrade.",
      "",
      "Dates are indicative and can shift based on QA findings.",
    ].join("\n"),
    seoTitle: "ElseSourav Release Calendar",
    seoDescription: "Public release timing and launch windows.",
    publishedDaysAgo: 5,
  },
];

const blogTagSeeds = [
  { name: "Engineering", slug: "engineering" },
  { name: "Case Study", slug: "case-study" },
  { name: "Release Notes", slug: "release-notes" },
  { name: "Product", slug: "product" },
] as const;

const blogPostSeeds: BlogPostSeed[] = [
  {
    slug: "shipping-es-orders-at-scale",
    title: "Shipping ES Orders At Scale",
    excerpt:
      "How the es-orders repository informed resilient sequencing for stateful order pipelines.",
    contentMarkdown: [
      "The [es-orders](https://github.com/elsesourav/es-orders) workstream shaped how we model retries and event safety.",
      "",
      "### Key takeaways",
      "- Keep delivery and payment concerns isolated.",
      "- Preserve idempotency through explicit dedupe keys.",
      "- Surface operational counters directly in admin views.",
    ].join("\n"),
    tagSlugs: ["engineering", "case-study"],
    publishedDaysAgo: 14,
  },
  {
    slug: "image-workflows-from-listing-images-only",
    title: "Image Workflows From listing-images-only",
    excerpt:
      "Using repository driven experiments to reduce listing media cleanup time.",
    contentMarkdown: [
      "In [listing-images-only](https://github.com/elsesourav/listing-images-only), the main lesson was to optimize for curation throughput.",
      "",
      "### Improvements shipped",
      "- Faster duplicate filtering.",
      "- Better naming conventions for exports.",
      "- Leaner review handoff steps.",
    ].join("\n"),
    tagSlugs: ["product", "case-study"],
    publishedDaysAgo: 11,
  },
  {
    slug: "lessons-from-ext-self-update",
    title: "Lessons From ext-self-update",
    excerpt:
      "Release automation guardrails that made extension updates less risky.",
    contentMarkdown: [
      "The [ext-self-update](https://github.com/elsesourav/ext-self-update) scripts improved release confidence with deterministic checks.",
      "",
      "### Guardrails",
      "- Verify release tags before promotion.",
      "- Confirm artifact checksums match expected outputs.",
      "- Fail fast with clear rollback paths.",
    ].join("\n"),
    tagSlugs: ["engineering", "release-notes"],
    publishedDaysAgo: 9,
  },
  {
    slug: "designing-es-utils-for-reuse",
    title: "Designing es-utils For Reuse",
    excerpt:
      "A practical guide to utility boundaries in a multi-service codebase.",
    contentMarkdown: [
      "The [es-utils](https://github.com/elsesourav/es-utils) package was designed to cut repeated logic while keeping service code readable.",
      "",
      "### Utility boundaries",
      "- Keep helpers pure and side-effect free.",
      "- Prefer explicit naming over implicit convenience wrappers.",
      "- Publish migration notes for renamed utilities.",
    ].join("\n"),
    tagSlugs: ["engineering", "product"],
    publishedDaysAgo: 6,
  },
];

const helpCategorySeeds = [
  {
    name: "Getting Started",
    slug: "getting-started",
    description: "Setup basics for browsing and account onboarding.",
    orderIndex: 0,
  },
  {
    name: "Account & Billing",
    slug: "account-billing",
    description: "Password recovery, invoices, and payment status help.",
    orderIndex: 1,
  },
  {
    name: "Installations",
    slug: "installations",
    description: "Platform specific installation and update steps.",
    orderIndex: 2,
  },
  {
    name: "Troubleshooting",
    slug: "troubleshooting",
    description: "Diagnostic guides for common runtime issues.",
    orderIndex: 3,
  },
] as const;

const helpArticleSeeds: HelpArticleSeed[] = [
  {
    slug: "installing-apps",
    categorySlug: "installations",
    title: "Installing Apps",
    summary: "Install from listing links and verify expected platform route.",
    contentMarkdown: [
      "1. Open the app detail page.",
      "2. Choose the correct platform link (Chrome, Android, Website, or GitHub).",
      "3. Complete install and return to history for tracking.",
    ].join("\n"),
    isFeatured: true,
    publishedDaysAgo: 15,
  },
  {
    slug: "managing-library",
    categorySlug: "getting-started",
    title: "Managing Library",
    summary: "Save, review, and remove items from your personal library.",
    contentMarkdown: [
      "Use the **Add to library** action on app detail pages.",
      "",
      "You can remove saved items at any time from the library screen.",
    ].join("\n"),
    isFeatured: true,
    publishedDaysAgo: 13,
  },
  {
    slug: "tracking-download-history",
    categorySlug: "getting-started",
    title: "Tracking Download History",
    summary:
      "Review your download timeline and revisit previously opened apps.",
    contentMarkdown: [
      "Download history captures platform, timestamp, and app metadata.",
      "",
      "Use history to jump back into recently used tools.",
    ].join("\n"),
    isFeatured: false,
    publishedDaysAgo: 10,
  },
  {
    slug: "resetting-account-password",
    categorySlug: "account-billing",
    title: "Resetting Account Password",
    summary: "Use forgot-password flow and verify your recovery token.",
    contentMarkdown: [
      "From the login page, open **Forgot password**.",
      "",
      "Submit your account email and follow the reset link instructions.",
    ].join("\n"),
    isFeatured: false,
    publishedDaysAgo: 8,
  },
  {
    slug: "requesting-refunds",
    categorySlug: "account-billing",
    title: "Requesting Refunds",
    summary: "How to submit refund requests for eligible paid purchases.",
    contentMarkdown: [
      "Include payment reference, app name, and issue summary in your refund request.",
      "",
      "Most requests are reviewed within 3 business days.",
    ].join("\n"),
    isFeatured: true,
    publishedDaysAgo: 7,
  },
  {
    slug: "reporting-a-bug",
    categorySlug: "troubleshooting",
    title: "Reporting A Bug",
    summary:
      "Submit reproducible issue reports with expected vs actual behavior.",
    contentMarkdown: [
      "Share environment details, reproduction steps, and screenshots.",
      "",
      "If possible, attach the repository issue link used for tracking.",
    ].join("\n"),
    isFeatured: false,
    publishedDaysAgo: 6,
  },
];

const blogCommentSeeds: BlogCommentSeed[] = [
  {
    postSlug: "shipping-es-orders-at-scale",
    userKey: "viewer",
    content: "Great write up. The retry boundaries are especially useful.",
    isApproved: true,
    daysAgo: 8,
  },
  {
    postSlug: "image-workflows-from-listing-images-only",
    userKey: "creator",
    content: "The export naming convention solved our review bottleneck.",
    isApproved: true,
    daysAgo: 7,
  },
  {
    postSlug: "lessons-from-ext-self-update",
    authorName: "Guest QA Engineer",
    authorEmail: "guest.qa@example.com",
    content: "Would love a follow up on rollback strategy templates.",
    isApproved: false,
    daysAgo: 5,
  },
  {
    postSlug: "designing-es-utils-for-reuse",
    userKey: "reviewer",
    content: "The naming guidance for helpers is spot on.",
    isApproved: true,
    daysAgo: 4,
  },
];

const librarySeeds: LibrarySeed[] = [
  { userKey: "viewer", appSlug: "es-orders-suite", note: "Track updates" },
  {
    userKey: "viewer",
    appSlug: "listing-image-curator",
    note: "Use for listing cleanups",
  },
  {
    userKey: "creator",
    appSlug: "img-editor-lab",
    note: "Mobile content workflow",
  },
  {
    userKey: "creator",
    appSlug: "travel-plans-companion",
    note: "Trip planning",
  },
  {
    userKey: "reviewer",
    appSlug: "extension-update-guardian",
    note: "Release checks",
  },
  {
    userKey: "reviewer",
    appSlug: "es-utils-toolbox",
    note: "Shared utility references",
  },
  { userKey: "support", appSlug: "es-orders-suite", note: "Support demos" },
  {
    userKey: "support",
    appSlug: "travel-plans-companion",
    note: "Travel support scenarios",
  },
];

const downloadSeeds: DownloadSeed[] = [
  {
    userKey: "viewer",
    appSlug: "listing-image-curator",
    platform: LinkPlatform.CHROME,
    daysAgo: 6,
  },
  {
    userKey: "creator",
    appSlug: "img-editor-lab",
    platform: LinkPlatform.ANDROID,
    daysAgo: 5,
  },
  {
    userKey: "reviewer",
    appSlug: "extension-update-guardian",
    platform: LinkPlatform.GITHUB,
    daysAgo: 4,
  },
  {
    userKey: "support",
    appSlug: "es-orders-suite",
    platform: LinkPlatform.WEBSITE,
    daysAgo: 3,
  },
  {
    userKey: "viewer",
    appSlug: "travel-plans-companion",
    platform: LinkPlatform.ANDROID,
    daysAgo: 2,
  },
  {
    userKey: "creator",
    appSlug: "es-utils-toolbox",
    platform: LinkPlatform.GITHUB,
    daysAgo: 2,
  },
  {
    userKey: "reviewer",
    appSlug: "es-orders-suite",
    platform: LinkPlatform.GITHUB,
    daysAgo: 1,
  },
  {
    userKey: "support",
    appSlug: "travel-plans-companion",
    platform: LinkPlatform.WEBSITE,
    daysAgo: 1,
  },
];

const viewSeeds: ViewSeed[] = [
  {
    userKey: "viewer",
    appSlug: "es-orders-suite",
    sessionId: "seed-view-001",
    source: "home-hero",
    daysAgo: 6,
  },
  {
    userKey: "viewer",
    appSlug: "listing-image-curator",
    sessionId: "seed-view-002",
    source: "apps-grid",
    daysAgo: 5,
  },
  {
    userKey: "creator",
    appSlug: "img-editor-lab",
    sessionId: "seed-view-003",
    source: "search",
    daysAgo: 5,
  },
  {
    userKey: "reviewer",
    appSlug: "extension-update-guardian",
    sessionId: "seed-view-004",
    source: "featured",
    daysAgo: 4,
  },
  {
    userKey: "support",
    appSlug: "travel-plans-companion",
    sessionId: "seed-view-005",
    source: "latest",
    daysAgo: 3,
  },
  {
    userKey: "support",
    appSlug: "es-utils-toolbox",
    sessionId: "seed-view-006",
    source: "apps-grid",
    daysAgo: 2,
  },
  {
    userKey: "creator",
    appSlug: "travel-plans-companion",
    sessionId: "seed-view-007",
    source: "home-hero",
    daysAgo: 1,
  },
  {
    userKey: "reviewer",
    appSlug: "es-orders-suite",
    sessionId: "seed-view-008",
    source: "detail-link",
    daysAgo: 1,
  },
];

const feedbackSeeds: FeedbackSeed[] = [
  {
    userKey: "viewer",
    appSlug: "es-orders-suite",
    message: "Great visibility into order retries.",
    rating: 5,
    daysAgo: 6,
  },
  {
    userKey: "creator",
    appSlug: "es-orders-suite",
    message: "Would love custom dashboard widgets.",
    rating: 4,
    daysAgo: 5,
  },
  {
    userKey: "reviewer",
    appSlug: "listing-image-curator",
    message: "Huge time saver for listing image cleanup.",
    rating: 5,
    daysAgo: 5,
  },
  {
    userKey: "support",
    appSlug: "listing-image-curator",
    message: "Needs better handling for broken image URLs.",
    rating: 3,
    daysAgo: 4,
  },
  {
    userKey: "viewer",
    appSlug: "img-editor-lab",
    message: "Solid editing presets and quick exports.",
    rating: 4,
    daysAgo: 4,
  },
  {
    userKey: "creator",
    appSlug: "img-editor-lab",
    message: "Performance drops on older phones.",
    rating: 3,
    daysAgo: 3,
  },
  {
    userKey: "reviewer",
    appSlug: "extension-update-guardian",
    message: "Release checks are very clear.",
    rating: 5,
    daysAgo: 3,
  },
  {
    userKey: "support",
    appSlug: "extension-update-guardian",
    message: "Docs could use one extra onboarding example.",
    rating: 4,
    daysAgo: 2,
  },
  {
    userKey: "viewer",
    appSlug: "es-utils-toolbox",
    message: "Helpful utility bundle for quick integrations.",
    rating: 4,
    daysAgo: 2,
  },
  {
    userKey: "creator",
    appSlug: "es-utils-toolbox",
    message: "Saved us a lot of boilerplate this sprint.",
    rating: 5,
    daysAgo: 1,
  },
  {
    userKey: "reviewer",
    appSlug: "travel-plans-companion",
    message: "Planner is useful but reminders were noisy.",
    rating: 3,
    isHidden: true,
    moderated: true,
    daysAgo: 1,
  },
  {
    userKey: "support",
    appSlug: "travel-plans-companion",
    message: "Great itinerary templates and lightweight UI.",
    rating: 5,
    daysAgo: 1,
  },
];

const paymentSeeds: PaymentSeed[] = [
  {
    providerReference: "pay_demo_0001",
    userKey: "viewer",
    appSlug: "listing-image-curator",
    amount: 4.99,
    status: PaymentStatus.SUCCESS,
    daysAgo: 6,
  },
  {
    providerReference: "pay_demo_0002",
    userKey: "creator",
    appSlug: "es-utils-toolbox",
    amount: 2.49,
    status: PaymentStatus.SUCCESS,
    daysAgo: 3,
  },
  {
    providerReference: "pay_demo_0003",
    userKey: "reviewer",
    appSlug: "listing-image-curator",
    amount: 4.99,
    status: PaymentStatus.REFUNDED,
    daysAgo: 2,
  },
  {
    providerReference: "pay_demo_0004",
    userKey: "support",
    appSlug: "es-utils-toolbox",
    amount: 2.49,
    status: PaymentStatus.PENDING,
    daysAgo: 1,
  },
];

async function syncStatsForApp(appId: string, targetDate: Date): Promise<void> {
  const dayStart = startOfUtcDay(targetDate);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const [viewCount, downloadCount, libraryCount, feedbackAggregate] =
    await prisma.$transaction([
      prisma.appViewEvent.count({ where: { appId } }),
      prisma.downloadEvent.count({ where: { appId } }),
      prisma.userLibrary.count({ where: { appId } }),
      prisma.feedback.aggregate({
        where: {
          appId,
          isHidden: false,
        },
        _count: { id: true },
        _avg: { rating: true },
      }),
    ]);

  const [dayViewCount, dayDownloadCount, dayFeedbackAggregate] =
    await prisma.$transaction([
      prisma.appViewEvent.count({
        where: {
          appId,
          createdAt: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      }),
      prisma.downloadEvent.count({
        where: {
          appId,
          createdAt: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      }),
      prisma.feedback.aggregate({
        where: {
          appId,
          isHidden: false,
          createdAt: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
        _count: { id: true },
        _avg: { rating: true },
      }),
    ]);

  await prisma.appAggregateStat.upsert({
    where: { appId },
    update: {
      viewCount,
      downloadCount,
      libraryCount,
      feedbackCount: feedbackAggregate._count.id,
      averageRating: feedbackAggregate._avg.rating ?? 0,
      lastViewedAt: viewCount > 0 ? targetDate : null,
      lastDownloadedAt: downloadCount > 0 ? targetDate : null,
    },
    create: {
      appId,
      viewCount,
      downloadCount,
      libraryCount,
      feedbackCount: feedbackAggregate._count.id,
      averageRating: feedbackAggregate._avg.rating ?? 0,
      lastViewedAt: viewCount > 0 ? targetDate : null,
      lastDownloadedAt: downloadCount > 0 ? targetDate : null,
    },
  });

  await prisma.appDailyStat.upsert({
    where: {
      appId_date: {
        appId,
        date: dayStart,
      },
    },
    update: {
      viewCount: dayViewCount,
      downloadCount: dayDownloadCount,
      libraryCount,
      feedbackCount: dayFeedbackAggregate._count.id,
      averageRating: dayFeedbackAggregate._avg.rating ?? 0,
    },
    create: {
      appId,
      date: dayStart,
      viewCount: dayViewCount,
      downloadCount: dayDownloadCount,
      libraryCount,
      feedbackCount: dayFeedbackAggregate._count.id,
      averageRating: dayFeedbackAggregate._avg.rating ?? 0,
    },
  });
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-this-password";
  const userPassword = process.env.USER_PASSWORD ?? "change-this-user-password";

  if (adminPassword.length < 10) {
    throw new Error(
      "ADMIN_PASSWORD must be at least 10 characters for seeding.",
    );
  }

  if (userPassword.length < 10) {
    throw new Error(
      "USER_PASSWORD must be at least 10 characters for seeding.",
    );
  }

  const [adminPasswordHash, userPasswordHash] = await Promise.all([
    bcrypt.hash(adminPassword, 12),
    bcrypt.hash(userPassword, 12),
  ]);

  const userSeeds: SeedUser[] = [
    {
      key: "admin",
      email: adminEmail,
      name: "Platform Admin",
      role: Role.ADMIN,
    },
    {
      key: "viewer",
      email: "viewer@elsesourav.dev",
      name: "Sourav Viewer",
      role: Role.USER,
    },
    {
      key: "creator",
      email: "creator@elsesourav.dev",
      name: "Sourav Creator",
      role: Role.USER,
    },
    {
      key: "reviewer",
      email: "reviewer@elsesourav.dev",
      name: "Sourav Reviewer",
      role: Role.USER,
    },
    {
      key: "support",
      email: "support@elsesourav.dev",
      name: "Sourav Support",
      role: Role.USER,
    },
  ];

  const usersByKey = new Map<
    string,
    { id: string; email: string; role: Role }
  >();

  for (const userSeed of userSeeds) {
    const passwordHash =
      userSeed.role === Role.ADMIN ? adminPasswordHash : userPasswordHash;

    const user = await prisma.user.upsert({
      where: { email: userSeed.email },
      update: {
        role: userSeed.role,
        passwordHash,
        name: userSeed.name,
        deletedAt: null,
        scheduledDeletionAt: null,
      },
      create: {
        email: userSeed.email,
        role: userSeed.role,
        passwordHash,
        name: userSeed.name,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    usersByKey.set(userSeed.key, user);
  }

  const admin = requireEntity(usersByKey.get("admin"), "admin user");

  const categoriesByName = new Map<string, { id: string }>();
  for (const categorySeed of categorySeeds) {
    const category = await prisma.category.upsert({
      where: { name: categorySeed.name },
      update: {
        icon: categorySeed.icon,
        deletedAt: null,
        scheduledDeletionAt: null,
      },
      create: {
        name: categorySeed.name,
        icon: categorySeed.icon,
      },
      select: {
        id: true,
      },
    });

    categoriesByName.set(categorySeed.name, category);
  }

  const appTagsBySlug = new Map<string, { id: string }>();
  for (const appTagSeed of appTagSeeds) {
    const tag = await prisma.appTag.upsert({
      where: { slug: appTagSeed.slug },
      update: {
        name: appTagSeed.name,
      },
      create: {
        name: appTagSeed.name,
        slug: appTagSeed.slug,
      },
      select: {
        id: true,
      },
    });

    appTagsBySlug.set(appTagSeed.slug, tag);
  }

  const appsBySlug = new Map<
    string,
    { id: string; slug: string; title: string; version: string }
  >();

  for (const [appIndex, appSeed] of appSeeds.entries()) {
    const category = requireEntity(
      categoriesByName.get(appSeed.categoryName),
      `category ${appSeed.categoryName}`,
    );
    const publishedAt = daysFromNow(-appSeed.publishedDaysAgo);
    const appMetadata = {
      sourceRepo: appSeed.repo,
      releaseTrack: appSeed.isFeatured ? "featured" : "standard",
      platforms: appSeed.links.map((link) => link.platform),
      tagSlugs: appSeed.tags,
      hasPromoVideo: Boolean(appSeed.promoVideoUrl),
    };

    const app = await prisma.app.upsert({
      where: { slug: appSeed.slug },
      update: {
        title: appSeed.title,
        shortDescription: appSeed.shortDescription,
        fullDescription: appSeed.fullDescription,
        releaseNotes: appSeed.releaseNotes,
        version: appSeed.version,
        status: appSeed.status,
        publishedAt:
          appSeed.status === AppStatus.PUBLISHED ? publishedAt : null,
        isPaid: appSeed.isPaid,
        isFeatured: appSeed.isFeatured,
        price: appSeed.price,
        iconUrl: appSeed.iconUrl,
        featureGraphicUrl: appSeed.featureGraphicUrl,
        promoVideoUrl: appSeed.promoVideoUrl ?? null,
        supportEmail: appSeed.supportEmail,
        supportWebsiteUrl: appSeed.supportWebsiteUrl,
        privacyPolicyUrl: appSeed.privacyPolicyUrl,
        containsAds: appSeed.containsAds,
        developerName: appSeed.developerName,
        metadata: appMetadata,
        categoryId: category.id,
        updatedById: admin.id,
        deletedAt: null,
      },
      create: {
        title: appSeed.title,
        slug: appSeed.slug,
        shortDescription: appSeed.shortDescription,
        fullDescription: appSeed.fullDescription,
        releaseNotes: appSeed.releaseNotes,
        version: appSeed.version,
        status: appSeed.status,
        publishedAt:
          appSeed.status === AppStatus.PUBLISHED ? publishedAt : null,
        isPaid: appSeed.isPaid,
        isFeatured: appSeed.isFeatured,
        price: appSeed.price,
        iconUrl: appSeed.iconUrl,
        featureGraphicUrl: appSeed.featureGraphicUrl,
        promoVideoUrl: appSeed.promoVideoUrl ?? null,
        supportEmail: appSeed.supportEmail,
        supportWebsiteUrl: appSeed.supportWebsiteUrl,
        privacyPolicyUrl: appSeed.privacyPolicyUrl,
        containsAds: appSeed.containsAds,
        developerName: appSeed.developerName,
        metadata: appMetadata,
        categoryId: category.id,
        createdById: admin.id,
        updatedById: admin.id,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        version: true,
      },
    });

    appsBySlug.set(appSeed.slug, app);

    for (const appLinkSeed of appSeed.links) {
      await prisma.appLink.upsert({
        where: {
          appId_platform: {
            appId: app.id,
            platform: appLinkSeed.platform,
          },
        },
        update: {
          downloadUrl: appLinkSeed.downloadUrl,
          sourceCodeUrl: appLinkSeed.sourceCodeUrl ?? null,
        },
        create: {
          appId: app.id,
          platform: appLinkSeed.platform,
          downloadUrl: appLinkSeed.downloadUrl,
          sourceCodeUrl: appLinkSeed.sourceCodeUrl ?? null,
        },
      });
    }

    for (const [mediaIndex, mediaSeed] of appSeed.media.entries()) {
      const existingMedia = await prisma.appMedia.findFirst({
        where: {
          appId: app.id,
          url: mediaSeed.url,
        },
        select: { id: true },
      });

      const mediaData = {
        type: mediaSeed.type,
        url: mediaSeed.url,
        alt: mediaSeed.alt,
        mimeType: mediaSeed.mimeType ?? null,
        width: mediaSeed.width ?? null,
        height: mediaSeed.height ?? null,
        durationSec: mediaSeed.durationSec ?? null,
        thumbnailUrl: mediaSeed.thumbnailUrl ?? null,
        fileSizeBytes: mediaSeed.fileSizeBytes ?? null,
        isAnimated: mediaSeed.isAnimated ?? false,
        sortOrder: mediaIndex,
      };

      if (existingMedia) {
        await prisma.appMedia.update({
          where: { id: existingMedia.id },
          data: mediaData,
        });
      } else {
        await prisma.appMedia.create({
          data: {
            appId: app.id,
            ...mediaData,
          },
        });
      }
    }

    for (const tagSlug of appSeed.tags) {
      const tag = requireEntity(
        appTagsBySlug.get(tagSlug),
        `app tag ${tagSlug}`,
      );

      await prisma.appTagOnApp.upsert({
        where: {
          appId_tagId: {
            appId: app.id,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          appId: app.id,
          tagId: tag.id,
        },
      });
    }

    for (const sectionSeed of appSeed.sections) {
      await prisma.storeSectionItem.upsert({
        where: {
          appId_sectionType: {
            appId: app.id,
            sectionType: sectionSeed.sectionType,
          },
        },
        update: {
          orderIndex: sectionSeed.orderIndex,
          releaseAt: daysFromNow(sectionSeed.releaseOffsetDays),
          startsAt: daysFromNow(-30),
          endsAt: daysFromNow(45),
        },
        create: {
          appId: app.id,
          sectionType: sectionSeed.sectionType,
          orderIndex: sectionSeed.orderIndex,
          releaseAt: daysFromNow(sectionSeed.releaseOffsetDays),
          startsAt: daysFromNow(-30),
          endsAt: daysFromNow(45),
        },
      });
    }

    const existingDescriptionVersion =
      await prisma.appDescriptionVersion.findFirst({
        where: {
          appId: app.id,
          versionLabel: app.version,
        },
        select: { id: true },
      });

    if (existingDescriptionVersion) {
      await prisma.appDescriptionVersion.update({
        where: { id: existingDescriptionVersion.id },
        data: {
          descriptionMarkdown: appSeed.fullDescription,
          createdBy: admin.id,
        },
      });
    } else {
      await prisma.appDescriptionVersion.create({
        data: {
          appId: app.id,
          versionLabel: app.version,
          descriptionMarkdown: appSeed.fullDescription,
          createdBy: admin.id,
        },
      });
    }

    const existingChangelog = await prisma.appChangelog.findFirst({
      where: {
        appId: app.id,
        version: app.version,
      },
      select: { id: true },
    });

    if (existingChangelog) {
      await prisma.appChangelog.update({
        where: { id: existingChangelog.id },
        data: {
          title: `${app.title} ${app.version}`,
          contentMarkdown: appSeed.releaseNotes,
          releaseDate: publishedAt,
        },
      });
    } else {
      await prisma.appChangelog.create({
        data: {
          appId: app.id,
          version: app.version,
          title: `${app.title} ${app.version}`,
          contentMarkdown: appSeed.releaseNotes,
          releaseDate: publishedAt,
        },
      });
    }

    for (const dayOffset of [-3, -2, -1, 0]) {
      const date = startOfUtcDay(daysFromNow(dayOffset));
      const dayRank = dayOffset + 4;
      const viewCount = (appIndex + 1) * 24 + dayRank * 5;
      const downloadCount = (appIndex + 1) * 6 + dayRank;
      const feedbackCount = Math.min(6, appIndex + dayRank);

      await prisma.appDailyStat.upsert({
        where: {
          appId_date: {
            appId: app.id,
            date,
          },
        },
        update: {
          viewCount,
          downloadCount,
          libraryCount: appIndex + 2,
          feedbackCount,
          averageRating: 4.2,
        },
        create: {
          appId: app.id,
          date,
          viewCount,
          downloadCount,
          libraryCount: appIndex + 2,
          feedbackCount,
          averageRating: 4.2,
        },
      });
    }
  }

  const sliderSeeds = [
    {
      title: "Build Faster With ES Orders",
      description:
        "Explore release-ready order workflows with robust diagnostics.",
      type: SliderType.HERO,
      imageUrl:
        "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1600&q=80",
      linkUrl: "/apps/es-orders-suite",
      appSlug: "es-orders-suite",
      orderIndex: 0,
      startsOffsetDays: -14,
      endsOffsetDays: 40,
      isActive: true,
    },
    {
      title: "Curate Listing Media In Minutes",
      description: "Fast image cleanup flows inspired by listing-images-only.",
      type: SliderType.HERO,
      imageUrl:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
      linkUrl: "/apps/listing-image-curator",
      appSlug: "listing-image-curator",
      orderIndex: 1,
      startsOffsetDays: -10,
      endsOffsetDays: 35,
      isActive: true,
    },
    {
      title: "Image Editing Workbench",
      description: "Mobile editor experiments and performance improvements.",
      type: SliderType.FEATURED,
      imageUrl:
        "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80",
      linkUrl: "/apps/img-editor-lab",
      appSlug: "img-editor-lab",
      orderIndex: 2,
      startsOffsetDays: -7,
      endsOffsetDays: 30,
      isActive: true,
    },
    {
      title: "Travel Plans Rolling Release",
      description:
        "Upcoming rollout snapshots for itinerary and reminder tools.",
      type: SliderType.PROMO,
      imageUrl:
        "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1600&q=80",
      linkUrl: "/apps/travel-plans-companion",
      appSlug: "travel-plans-companion",
      orderIndex: 3,
      startsOffsetDays: -4,
      endsOffsetDays: 20,
      isActive: true,
    },
  ] as const;

  for (const sliderSeed of sliderSeeds) {
    const app = sliderSeed.appSlug
      ? requireEntity(
          appsBySlug.get(sliderSeed.appSlug),
          `app ${sliderSeed.appSlug}`,
        )
      : null;

    const existingSlider = await prisma.homeSlider.findFirst({
      where: {
        title: sliderSeed.title,
        type: sliderSeed.type,
      },
      select: { id: true },
    });

    const sliderData = {
      title: sliderSeed.title,
      description: sliderSeed.description,
      type: sliderSeed.type,
      imageUrl: sliderSeed.imageUrl,
      linkUrl: sliderSeed.linkUrl,
      appId: app?.id ?? null,
      orderIndex: sliderSeed.orderIndex,
      startsAt: daysFromNow(sliderSeed.startsOffsetDays),
      endsAt: daysFromNow(sliderSeed.endsOffsetDays),
      isActive: sliderSeed.isActive,
      createdBy: admin.id,
      updatedBy: admin.id,
    };

    if (existingSlider) {
      await prisma.homeSlider.update({
        where: { id: existingSlider.id },
        data: sliderData,
      });
    } else {
      await prisma.homeSlider.create({
        data: sliderData,
      });
    }
  }

  const bannerSeeds = [
    {
      title: "ElseSourav Home Launch Week",
      imageUrl:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
      linkUrl: "/apps",
      placement: BannerPlacement.HOME_HERO,
      startsOffsetDays: -10,
      endsOffsetDays: 30,
    },
    {
      title: "Fresh Releases This Week",
      imageUrl:
        "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1600&q=80",
      linkUrl: "/apps?sectionType=LATEST",
      placement: BannerPlacement.LATEST,
      startsOffsetDays: -6,
      endsOffsetDays: 20,
    },
    {
      title: "Upcoming Labs",
      imageUrl:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80",
      linkUrl: "/apps?sectionType=UPCOMING",
      placement: BannerPlacement.UPCOMING,
      startsOffsetDays: -3,
      endsOffsetDays: 25,
    },
    {
      title: "Read Engineering Notes",
      imageUrl:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=80",
      linkUrl: "/blog",
      placement: BannerPlacement.HOME_HERO,
      startsOffsetDays: -2,
      endsOffsetDays: 18,
    },
  ] as const;

  for (const bannerSeed of bannerSeeds) {
    const existingBanner = await prisma.storeBanner.findFirst({
      where: {
        title: bannerSeed.title,
        placement: bannerSeed.placement,
      },
      select: { id: true },
    });

    const bannerData = {
      title: bannerSeed.title,
      imageUrl: bannerSeed.imageUrl,
      linkUrl: bannerSeed.linkUrl,
      placement: bannerSeed.placement,
      startsAt: daysFromNow(bannerSeed.startsOffsetDays),
      endsAt: daysFromNow(bannerSeed.endsOffsetDays),
      isActive: true,
      createdBy: admin.id,
      updatedBy: admin.id,
    };

    if (existingBanner) {
      await prisma.storeBanner.update({
        where: { id: existingBanner.id },
        data: bannerData,
      });
    } else {
      await prisma.storeBanner.create({
        data: bannerData,
      });
    }
  }

  const contentPagesBySlug = new Map<string, { id: string }>();

  for (const contentPageSeed of contentPageSeeds) {
    const publishedAt = daysFromNow(-contentPageSeed.publishedDaysAgo);
    const pageMetadata = {
      source: "seed",
      audience: "public",
      summaryLength: contentPageSeed.summary.length,
      seoReady: true,
    };

    const page = await prisma.contentPage.upsert({
      where: {
        slug: contentPageSeed.slug,
      },
      update: {
        title: contentPageSeed.title,
        summary: contentPageSeed.summary,
        body: contentPageSeed.body,
        seoTitle: contentPageSeed.seoTitle,
        seoDescription: contentPageSeed.seoDescription,
        metadata: pageMetadata,
        status: ContentStatus.PUBLISHED,
        publishAt: publishedAt,
        publishedAt,
        updatedBy: admin.id,
      },
      create: {
        slug: contentPageSeed.slug,
        title: contentPageSeed.title,
        summary: contentPageSeed.summary,
        body: contentPageSeed.body,
        seoTitle: contentPageSeed.seoTitle,
        seoDescription: contentPageSeed.seoDescription,
        metadata: pageMetadata,
        status: ContentStatus.PUBLISHED,
        publishAt: publishedAt,
        publishedAt,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      select: {
        id: true,
        title: true,
        summary: true,
        body: true,
        seoTitle: true,
        seoDescription: true,
      },
    });

    contentPagesBySlug.set(contentPageSeed.slug, { id: page.id });

    await prisma.contentPageVersion.upsert({
      where: {
        pageId_version: {
          pageId: page.id,
          version: 1,
        },
      },
      update: {
        title: page.title,
        summary: page.summary,
        body: page.body,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        metadata: pageMetadata,
        status: ContentStatus.PUBLISHED,
        createdBy: admin.id,
      },
      create: {
        pageId: page.id,
        version: 1,
        title: page.title,
        summary: page.summary,
        body: page.body,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        metadata: pageMetadata,
        status: ContentStatus.PUBLISHED,
        createdBy: admin.id,
      },
    });
  }

  const profileSeeds = [
    {
      slug: "main",
      fullName: "Else Sourav",
      headline: "Full-Stack Developer & Product Builder",
      shortBio:
        "Building practical software products with a services first mindset.",
      bioMarkdown:
        "I build full-stack products and publish experiments rooted in real delivery constraints.",
      experienceMarkdown:
        "- Product engineering\n- Service architecture\n- Operational UX",
      skills: ["TypeScript", "Next.js", "Node.js", "Prisma", "PostgreSQL"],
      tools: ["VS Code", "GitHub", "Docker", "Cloudinary", "Vercel"],
      contactEmail: admin.email,
      githubUrl: "https://github.com/elsesourav",
      linkedinUrl: "https://www.linkedin.com/in/elsesourav",
      websiteUrl: "https://elsesourav.dev",
      location: "India",
      isActive: true,
    },
    {
      slug: "opensource-focus",
      fullName: "Else Sourav",
      headline: "Open Source Workflow Notes",
      shortBio: "Reference profile for open-source focused layout demos.",
      bioMarkdown:
        "This profile variant highlights repositories, changelogs, and release notes.",
      experienceMarkdown:
        "- Repository maintenance\n- Release docs\n- Issue triage",
      skills: ["GitHub", "TypeScript", "Automation"],
      tools: ["Actions", "Node.js", "Prisma"],
      contactEmail: "opensource@elsesourav.dev",
      githubUrl: "https://github.com/elsesourav",
      linkedinUrl: null,
      websiteUrl: "https://elsesourav.dev",
      location: "Remote",
      isActive: false,
    },
    {
      slug: "product-builder",
      fullName: "Else Sourav",
      headline: "Product Experiments",
      shortBio: "Prototype profile for product iteration narratives.",
      bioMarkdown:
        "Used to test alternate profile copy and showcase structure.",
      experienceMarkdown:
        "- Product strategy\n- UX validation\n- Feature scoping",
      skills: ["Product", "UX", "Analytics"],
      tools: ["Figma", "Next.js", "PostgreSQL"],
      contactEmail: "product@elsesourav.dev",
      githubUrl: "https://github.com/elsesourav",
      linkedinUrl: null,
      websiteUrl: "https://elsesourav.dev",
      location: "Kolkata",
      isActive: false,
    },
    {
      slug: "writing-lab",
      fullName: "Else Sourav",
      headline: "Writing & Technical Notes",
      shortBio: "Profile variant for long form writing experiments.",
      bioMarkdown: "Used in admin previews while tuning markdown typography.",
      experienceMarkdown:
        "- Technical writing\n- Release communication\n- Internal docs",
      skills: ["Writing", "Documentation", "Teaching"],
      tools: ["Markdown", "VS Code", "GitHub"],
      contactEmail: "writing@elsesourav.dev",
      githubUrl: "https://github.com/elsesourav",
      linkedinUrl: null,
      websiteUrl: "https://elsesourav.dev",
      location: "India",
      isActive: false,
    },
  ] as const;

  for (const profileSeed of profileSeeds) {
    await prisma.profilePage.upsert({
      where: {
        slug: profileSeed.slug,
      },
      update: {
        fullName: profileSeed.fullName,
        headline: profileSeed.headline,
        shortBio: profileSeed.shortBio,
        bioMarkdown: profileSeed.bioMarkdown,
        experienceMarkdown: profileSeed.experienceMarkdown,
        skills: profileSeed.skills,
        tools: profileSeed.tools,
        contactEmail: profileSeed.contactEmail,
        location: profileSeed.location,
        websiteUrl: profileSeed.websiteUrl,
        githubUrl: profileSeed.githubUrl,
        linkedinUrl: profileSeed.linkedinUrl,
        isActive: profileSeed.isActive,
        updatedBy: admin.id,
      },
      create: {
        slug: profileSeed.slug,
        fullName: profileSeed.fullName,
        headline: profileSeed.headline,
        shortBio: profileSeed.shortBio,
        bioMarkdown: profileSeed.bioMarkdown,
        experienceMarkdown: profileSeed.experienceMarkdown,
        skills: profileSeed.skills,
        tools: profileSeed.tools,
        contactEmail: profileSeed.contactEmail,
        location: profileSeed.location,
        websiteUrl: profileSeed.websiteUrl,
        githubUrl: profileSeed.githubUrl,
        linkedinUrl: profileSeed.linkedinUrl,
        isActive: profileSeed.isActive,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
    });
  }

  const blogTagsBySlug = new Map<string, { id: string }>();
  for (const blogTagSeed of blogTagSeeds) {
    const tag = await prisma.blogTag.upsert({
      where: { slug: blogTagSeed.slug },
      update: {
        name: blogTagSeed.name,
      },
      create: {
        name: blogTagSeed.name,
        slug: blogTagSeed.slug,
      },
      select: {
        id: true,
      },
    });

    blogTagsBySlug.set(blogTagSeed.slug, tag);
  }

  const blogPostsBySlug = new Map<string, { id: string }>();
  for (const blogPostSeed of blogPostSeeds) {
    const tagLinks = blogPostSeed.tagSlugs.map((tagSlug) => {
      const tag = requireEntity(
        blogTagsBySlug.get(tagSlug),
        `blog tag ${tagSlug}`,
      );
      return { tagId: tag.id };
    });

    const publishAt = daysFromNow(-blogPostSeed.publishedDaysAgo);
    const readingTimeMinutes = Math.max(
      1,
      Math.ceil(
        blogPostSeed.contentMarkdown.split(/\s+/).filter(Boolean).length / 220,
      ),
    );
    const postMetadata = {
      source: "seed",
      tagSlugs: blogPostSeed.tagSlugs,
      readingTimeMinutes,
      editorialState: "ready",
    };

    const post = await prisma.blogPost.upsert({
      where: {
        slug: blogPostSeed.slug,
      },
      update: {
        title: blogPostSeed.title,
        excerpt: blogPostSeed.excerpt,
        contentMarkdown: blogPostSeed.contentMarkdown,
        metadata: postMetadata,
        status: BlogPostStatus.PUBLISHED,
        publishAt,
        publishedAt: publishAt,
        authorId: admin.id,
        updatedBy: admin.id,
        tags: {
          deleteMany: {},
          create: tagLinks,
        },
      },
      create: {
        slug: blogPostSeed.slug,
        title: blogPostSeed.title,
        excerpt: blogPostSeed.excerpt,
        contentMarkdown: blogPostSeed.contentMarkdown,
        metadata: postMetadata,
        status: BlogPostStatus.PUBLISHED,
        publishAt,
        publishedAt: publishAt,
        authorId: admin.id,
        createdBy: admin.id,
        updatedBy: admin.id,
        tags: {
          create: tagLinks,
        },
      },
      select: {
        id: true,
      },
    });

    blogPostsBySlug.set(blogPostSeed.slug, post);

    const existingVersion = await prisma.blogPostVersion.findFirst({
      where: {
        postId: post.id,
        title: blogPostSeed.title,
      },
      select: {
        id: true,
      },
    });

    if (existingVersion) {
      await prisma.blogPostVersion.update({
        where: { id: existingVersion.id },
        data: {
          excerpt: blogPostSeed.excerpt,
          contentMarkdown: blogPostSeed.contentMarkdown,
          metadata: postMetadata,
          createdBy: admin.id,
        },
      });
    } else {
      await prisma.blogPostVersion.create({
        data: {
          postId: post.id,
          title: blogPostSeed.title,
          excerpt: blogPostSeed.excerpt,
          contentMarkdown: blogPostSeed.contentMarkdown,
          metadata: postMetadata,
          createdBy: admin.id,
        },
      });
    }
  }

  const customFieldDefinitionSeeds = [
    {
      entity: CustomFieldEntity.APP,
      key: "supportTier",
      label: "Support Tier",
      description: "Support plan tier for this app listing.",
      fieldType: CustomFieldType.SELECT,
      isRequired: false,
      isFilterable: true,
      options: {
        values: ["community", "pro", "enterprise"],
      },
    },
    {
      entity: CustomFieldEntity.APP,
      key: "qaStatus",
      label: "QA Status",
      description: "Manual quality review state.",
      fieldType: CustomFieldType.BOOLEAN,
      isRequired: false,
      isFilterable: true,
      options: undefined,
    },
    {
      entity: CustomFieldEntity.CONTENT_PAGE,
      key: "layoutVariant",
      label: "Layout Variant",
      description: "Template variation consumed by frontend rendering.",
      fieldType: CustomFieldType.SELECT,
      isRequired: false,
      isFilterable: true,
      options: {
        values: ["story", "docs", "marketing"],
      },
    },
    {
      entity: CustomFieldEntity.CONTENT_PAGE,
      key: "showToc",
      label: "Show Table Of Contents",
      description: "Display a sticky table of contents in article templates.",
      fieldType: CustomFieldType.BOOLEAN,
      isRequired: false,
      isFilterable: false,
      options: undefined,
    },
    {
      entity: CustomFieldEntity.BLOG_POST,
      key: "readingLevel",
      label: "Reading Level",
      description: "Editorial complexity label for article targeting.",
      fieldType: CustomFieldType.SELECT,
      isRequired: false,
      isFilterable: true,
      options: {
        values: ["beginner", "intermediate", "advanced"],
      },
    },
    {
      entity: CustomFieldEntity.BLOG_POST,
      key: "heroStyle",
      label: "Hero Style",
      description: "Visual treatment for blog header presentation.",
      fieldType: CustomFieldType.TEXT,
      isRequired: false,
      isFilterable: true,
      options: undefined,
    },
  ] as const;

  const customFieldDefinitionsByKey = new Map<string, { id: string }>();

  for (const definitionSeed of customFieldDefinitionSeeds) {
    const definition = await prisma.customFieldDefinition.upsert({
      where: {
        entity_key: {
          entity: definitionSeed.entity,
          key: definitionSeed.key,
        },
      },
      update: {
        label: definitionSeed.label,
        description: definitionSeed.description,
        fieldType: definitionSeed.fieldType,
        isRequired: definitionSeed.isRequired,
        isActive: true,
        isFilterable: definitionSeed.isFilterable,
        options: definitionSeed.options,
      },
      create: {
        entity: definitionSeed.entity,
        key: definitionSeed.key,
        label: definitionSeed.label,
        description: definitionSeed.description,
        fieldType: definitionSeed.fieldType,
        isRequired: definitionSeed.isRequired,
        isActive: true,
        isFilterable: definitionSeed.isFilterable,
        options: definitionSeed.options,
      },
      select: {
        id: true,
      },
    });

    customFieldDefinitionsByKey.set(
      `${definitionSeed.entity}:${definitionSeed.key}`,
      definition,
    );
  }

  const customFieldValueSeeds = [
    {
      entity: CustomFieldEntity.APP,
      fieldKey: "supportTier",
      entityId: requireEntity(
        appsBySlug.get("es-orders-suite"),
        "app es-orders-suite",
      ).id,
      value: "enterprise",
    },
    {
      entity: CustomFieldEntity.APP,
      fieldKey: "supportTier",
      entityId: requireEntity(
        appsBySlug.get("listing-image-curator"),
        "app listing-image-curator",
      ).id,
      value: "pro",
    },
    {
      entity: CustomFieldEntity.APP,
      fieldKey: "qaStatus",
      entityId: requireEntity(
        appsBySlug.get("img-editor-lab"),
        "app img-editor-lab",
      ).id,
      value: true,
    },
    {
      entity: CustomFieldEntity.CONTENT_PAGE,
      fieldKey: "layoutVariant",
      entityId: requireEntity(
        contentPagesBySlug.get("about"),
        "content page about",
      ).id,
      value: "story",
    },
    {
      entity: CustomFieldEntity.CONTENT_PAGE,
      fieldKey: "showToc",
      entityId: requireEntity(
        contentPagesBySlug.get("platform-roadmap"),
        "content page platform-roadmap",
      ).id,
      value: true,
    },
    {
      entity: CustomFieldEntity.BLOG_POST,
      fieldKey: "readingLevel",
      entityId: requireEntity(
        blogPostsBySlug.get("shipping-es-orders-at-scale"),
        "blog post shipping-es-orders-at-scale",
      ).id,
      value: "advanced",
    },
    {
      entity: CustomFieldEntity.BLOG_POST,
      fieldKey: "heroStyle",
      entityId: requireEntity(
        blogPostsBySlug.get("designing-es-utils-for-reuse"),
        "blog post designing-es-utils-for-reuse",
      ).id,
      value: "minimal-grid",
    },
  ] as const;

  for (const valueSeed of customFieldValueSeeds) {
    const definition = requireEntity(
      customFieldDefinitionsByKey.get(
        `${valueSeed.entity}:${valueSeed.fieldKey}`,
      ),
      `custom field definition ${valueSeed.entity}:${valueSeed.fieldKey}`,
    );

    await prisma.customFieldValue.upsert({
      where: {
        definitionId_entityId: {
          definitionId: definition.id,
          entityId: valueSeed.entityId,
        },
      },
      update: {
        value: valueSeed.value,
      },
      create: {
        definitionId: definition.id,
        entityId: valueSeed.entityId,
        value: valueSeed.value,
      },
    });
  }

  for (const commentSeed of blogCommentSeeds) {
    const post = requireEntity(
      blogPostsBySlug.get(commentSeed.postSlug),
      `blog post ${commentSeed.postSlug}`,
    );
    const user = commentSeed.userKey
      ? requireEntity(
          usersByKey.get(commentSeed.userKey),
          `user ${commentSeed.userKey}`,
        )
      : null;

    const existingComment = await prisma.blogComment.findFirst({
      where: {
        postId: post.id,
        content: commentSeed.content,
      },
      select: {
        id: true,
      },
    });

    const commentData = {
      userId: user?.id ?? null,
      authorName: commentSeed.authorName ?? user?.email ?? "Anonymous",
      authorEmail: commentSeed.authorEmail ?? user?.email ?? null,
      content: commentSeed.content,
      isGuest: user === null,
      isApproved: commentSeed.isApproved,
      createdAt: daysFromNow(-commentSeed.daysAgo),
    };

    if (existingComment) {
      await prisma.blogComment.update({
        where: { id: existingComment.id },
        data: commentData,
      });
    } else {
      await prisma.blogComment.create({
        data: {
          postId: post.id,
          ...commentData,
        },
      });
    }
  }

  const helpCategoriesBySlug = new Map<string, { id: string }>();
  for (const helpCategorySeed of helpCategorySeeds) {
    const category = await prisma.helpCategory.upsert({
      where: {
        slug: helpCategorySeed.slug,
      },
      update: {
        name: helpCategorySeed.name,
        description: helpCategorySeed.description,
        orderIndex: helpCategorySeed.orderIndex,
        isActive: true,
      },
      create: {
        name: helpCategorySeed.name,
        slug: helpCategorySeed.slug,
        description: helpCategorySeed.description,
        orderIndex: helpCategorySeed.orderIndex,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    helpCategoriesBySlug.set(helpCategorySeed.slug, category);
  }

  for (const helpArticleSeed of helpArticleSeeds) {
    const category = requireEntity(
      helpCategoriesBySlug.get(helpArticleSeed.categorySlug),
      `help category ${helpArticleSeed.categorySlug}`,
    );
    const publishAt = daysFromNow(-helpArticleSeed.publishedDaysAgo);

    const article = await prisma.helpArticle.upsert({
      where: {
        slug: helpArticleSeed.slug,
      },
      update: {
        categoryId: category.id,
        title: helpArticleSeed.title,
        summary: helpArticleSeed.summary,
        contentMarkdown: helpArticleSeed.contentMarkdown,
        status: HelpArticleStatus.PUBLISHED,
        isFeatured: helpArticleSeed.isFeatured,
        publishAt,
        publishedAt: publishAt,
        updatedBy: admin.id,
      },
      create: {
        categoryId: category.id,
        slug: helpArticleSeed.slug,
        title: helpArticleSeed.title,
        summary: helpArticleSeed.summary,
        contentMarkdown: helpArticleSeed.contentMarkdown,
        status: HelpArticleStatus.PUBLISHED,
        isFeatured: helpArticleSeed.isFeatured,
        publishAt,
        publishedAt: publishAt,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      select: {
        id: true,
      },
    });

    const existingVersion = await prisma.helpArticleVersion.findFirst({
      where: {
        articleId: article.id,
        title: helpArticleSeed.title,
      },
      select: {
        id: true,
      },
    });

    if (existingVersion) {
      await prisma.helpArticleVersion.update({
        where: { id: existingVersion.id },
        data: {
          contentMarkdown: helpArticleSeed.contentMarkdown,
          createdBy: admin.id,
        },
      });
    } else {
      await prisma.helpArticleVersion.create({
        data: {
          articleId: article.id,
          title: helpArticleSeed.title,
          contentMarkdown: helpArticleSeed.contentMarkdown,
          createdBy: admin.id,
        },
      });
    }
  }

  const testimonialSeeds = [
    {
      authorName: "Ari Dev",
      authorRole: "Product Engineer",
      company: "Community Labs",
      quoteMarkdown:
        "The app detail pages are clean and the admin tools are practical for daily operations.",
      rating: 5,
      sortOrder: 0,
      isFeatured: true,
    },
    {
      authorName: "Mina Ops",
      authorRole: "Operations Lead",
      company: "Workflow Studio",
      quoteMarkdown:
        "Store sections and banner scheduling made release communication much easier.",
      rating: 5,
      sortOrder: 1,
      isFeatured: true,
    },
    {
      authorName: "Ravi QA",
      authorRole: "Quality Analyst",
      company: "Release Bench",
      quoteMarkdown:
        "The feedback moderation view gives enough context to act quickly.",
      rating: 4,
      sortOrder: 2,
      isFeatured: false,
    },
    {
      authorName: "Noor Builder",
      authorRole: "Indie Developer",
      company: "Open Build",
      quoteMarkdown:
        "I like that each listing links cleanly to source and platform installs.",
      rating: 5,
      sortOrder: 3,
      isFeatured: true,
    },
  ] as const;

  for (const testimonialSeed of testimonialSeeds) {
    const existingTestimonial = await prisma.testimonial.findFirst({
      where: {
        authorName: testimonialSeed.authorName,
        company: testimonialSeed.company,
      },
      select: {
        id: true,
      },
    });

    const testimonialData = {
      authorName: testimonialSeed.authorName,
      authorRole: testimonialSeed.authorRole,
      company: testimonialSeed.company,
      quoteMarkdown: testimonialSeed.quoteMarkdown,
      rating: testimonialSeed.rating,
      sortOrder: testimonialSeed.sortOrder,
      isFeatured: testimonialSeed.isFeatured,
      isActive: true,
      createdBy: admin.id,
      updatedBy: admin.id,
    };

    if (existingTestimonial) {
      await prisma.testimonial.update({
        where: { id: existingTestimonial.id },
        data: testimonialData,
      });
    } else {
      await prisma.testimonial.create({
        data: testimonialData,
      });
    }
  }

  await prisma.themeConfig.updateMany({
    data: {
      isActive: false,
      updatedBy: admin.id,
    },
  });

  const themeSeeds = [
    {
      name: "Default Brand Theme",
      isActive: true,
      primaryColor: "#1f2937",
      secondaryColor: "#111827",
      accentColor: "#f59e0b",
      backgroundColor: "#ffffff",
      foregroundColor: "#111827",
      fontSans: "IBM Plex Sans",
      fontHeading: "Space Grotesk",
      headingScale: "1.10",
    },
    {
      name: "Ocean Sprint",
      isActive: false,
      primaryColor: "#0f4c81",
      secondaryColor: "#1f6f8b",
      accentColor: "#ffd166",
      backgroundColor: "#f6fbff",
      foregroundColor: "#102a43",
      fontSans: "Inter",
      fontHeading: "Manrope",
      headingScale: "1.08",
    },
    {
      name: "Citrus Graph",
      isActive: false,
      primaryColor: "#2f5233",
      secondaryColor: "#6a994e",
      accentColor: "#f4a259",
      backgroundColor: "#fffdf8",
      foregroundColor: "#293241",
      fontSans: "Public Sans",
      fontHeading: "Archivo",
      headingScale: "1.12",
    },
    {
      name: "Slate Pulse",
      isActive: false,
      primaryColor: "#334155",
      secondaryColor: "#475569",
      accentColor: "#22d3ee",
      backgroundColor: "#f8fafc",
      foregroundColor: "#0f172a",
      fontSans: "DM Sans",
      fontHeading: "Sora",
      headingScale: "1.06",
    },
  ] as const;

  for (const themeSeed of themeSeeds) {
    await prisma.themeConfig.upsert({
      where: {
        name: themeSeed.name,
      },
      update: {
        isActive: themeSeed.isActive,
        primaryColor: themeSeed.primaryColor,
        secondaryColor: themeSeed.secondaryColor,
        accentColor: themeSeed.accentColor,
        backgroundColor: themeSeed.backgroundColor,
        foregroundColor: themeSeed.foregroundColor,
        fontSans: themeSeed.fontSans,
        fontHeading: themeSeed.fontHeading,
        headingScale: themeSeed.headingScale,
        updatedBy: admin.id,
      },
      create: {
        name: themeSeed.name,
        isActive: themeSeed.isActive,
        primaryColor: themeSeed.primaryColor,
        secondaryColor: themeSeed.secondaryColor,
        accentColor: themeSeed.accentColor,
        backgroundColor: themeSeed.backgroundColor,
        foregroundColor: themeSeed.foregroundColor,
        fontSans: themeSeed.fontSans,
        fontHeading: themeSeed.fontHeading,
        headingScale: themeSeed.headingScale,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
    });
  }

  const userSettingsSeeds = [
    {
      key: "admin",
      themeMode: "dark",
      emailNotifications: true,
      marketingEmails: false,
    },
    {
      key: "viewer",
      themeMode: "system",
      emailNotifications: true,
      marketingEmails: false,
    },
    {
      key: "creator",
      themeMode: "light",
      emailNotifications: true,
      marketingEmails: true,
    },
    {
      key: "reviewer",
      themeMode: "dark",
      emailNotifications: true,
      marketingEmails: false,
    },
    {
      key: "support",
      themeMode: "system",
      emailNotifications: true,
      marketingEmails: false,
    },
  ] as const;

  for (const settingsSeed of userSettingsSeeds) {
    const user = requireEntity(
      usersByKey.get(settingsSeed.key),
      `user ${settingsSeed.key}`,
    );

    await prisma.userSettings.upsert({
      where: {
        userId: user.id,
      },
      update: {
        themeMode: settingsSeed.themeMode,
        emailNotifications: settingsSeed.emailNotifications,
        marketingEmails: settingsSeed.marketingEmails,
      },
      create: {
        userId: user.id,
        themeMode: settingsSeed.themeMode,
        emailNotifications: settingsSeed.emailNotifications,
        marketingEmails: settingsSeed.marketingEmails,
      },
    });
  }

  const guestSessionSeeds = [
    { sessionId: "guest-home-001", ipHash: "seed-guest-home-001" },
    { sessionId: "guest-apps-002", ipHash: "seed-guest-apps-002" },
    { sessionId: "guest-blog-003", ipHash: "seed-guest-blog-003" },
    { sessionId: "guest-help-004", ipHash: "seed-guest-help-004" },
  ] as const;

  for (const guestSessionSeed of guestSessionSeeds) {
    await prisma.guestSession.upsert({
      where: {
        sessionId: guestSessionSeed.sessionId,
      },
      update: {
        ipHash: guestSessionSeed.ipHash,
        lastSeenAt: new Date(),
      },
      create: {
        sessionId: guestSessionSeed.sessionId,
        ipHash: guestSessionSeed.ipHash,
        lastSeenAt: new Date(),
      },
    });
  }

  for (const librarySeed of librarySeeds) {
    const user = requireEntity(
      usersByKey.get(librarySeed.userKey),
      `user ${librarySeed.userKey}`,
    );
    const app = requireEntity(
      appsBySlug.get(librarySeed.appSlug),
      `app ${librarySeed.appSlug}`,
    );

    await prisma.userLibrary.upsert({
      where: {
        userId_appId: {
          userId: user.id,
          appId: app.id,
        },
      },
      update: {
        note: librarySeed.note,
      },
      create: {
        userId: user.id,
        appId: app.id,
        note: librarySeed.note,
      },
    });
  }

  for (const downloadSeed of downloadSeeds) {
    const user = requireEntity(
      usersByKey.get(downloadSeed.userKey),
      `user ${downloadSeed.userKey}`,
    );
    const app = requireEntity(
      appsBySlug.get(downloadSeed.appSlug),
      `app ${downloadSeed.appSlug}`,
    );

    const existingEvent = await prisma.downloadEvent.findFirst({
      where: {
        userId: user.id,
        appId: app.id,
        platform: downloadSeed.platform,
      },
      select: {
        id: true,
      },
    });

    if (!existingEvent) {
      await prisma.downloadEvent.create({
        data: {
          userId: user.id,
          appId: app.id,
          platform: downloadSeed.platform,
          ipHash: `seed-download-${downloadSeed.userKey}`,
          userAgent: "SeedBot/1.0",
          createdAt: daysFromNow(-downloadSeed.daysAgo),
        },
      });
    }
  }

  for (const viewSeed of viewSeeds) {
    const user = requireEntity(
      usersByKey.get(viewSeed.userKey),
      `user ${viewSeed.userKey}`,
    );
    const app = requireEntity(
      appsBySlug.get(viewSeed.appSlug),
      `app ${viewSeed.appSlug}`,
    );

    const existingView = await prisma.appViewEvent.findFirst({
      where: {
        appId: app.id,
        userId: user.id,
        sessionId: viewSeed.sessionId,
      },
      select: {
        id: true,
      },
    });

    if (!existingView) {
      await prisma.appViewEvent.create({
        data: {
          appId: app.id,
          userId: user.id,
          sessionId: viewSeed.sessionId,
          source: viewSeed.source,
          isUnique: true,
          ipHash: `seed-view-${viewSeed.userKey}`,
          userAgent: "SeedBot/1.0",
          createdAt: daysFromNow(-viewSeed.daysAgo),
        },
      });
    }
  }

  for (const feedbackSeed of feedbackSeeds) {
    const user = requireEntity(
      usersByKey.get(feedbackSeed.userKey),
      `user ${feedbackSeed.userKey}`,
    );
    const app = requireEntity(
      appsBySlug.get(feedbackSeed.appSlug),
      `app ${feedbackSeed.appSlug}`,
    );

    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        userId: user.id,
        appId: app.id,
        message: feedbackSeed.message,
      },
      select: {
        id: true,
      },
    });

    const feedbackData = {
      userId: user.id,
      appId: app.id,
      message: feedbackSeed.message,
      rating: feedbackSeed.rating,
      isHidden: feedbackSeed.isHidden ?? false,
      moderatedAt: feedbackSeed.moderated ? new Date() : null,
      moderatedById: feedbackSeed.moderated ? admin.id : null,
      createdAt: daysFromNow(-feedbackSeed.daysAgo),
    };

    if (existingFeedback) {
      await prisma.feedback.update({
        where: { id: existingFeedback.id },
        data: feedbackData,
      });
    } else {
      await prisma.feedback.create({
        data: feedbackData,
      });
    }
  }

  for (const paymentSeed of paymentSeeds) {
    const user = requireEntity(
      usersByKey.get(paymentSeed.userKey),
      `user ${paymentSeed.userKey}`,
    );
    const app = requireEntity(
      appsBySlug.get(paymentSeed.appSlug),
      `app ${paymentSeed.appSlug}`,
    );

    await prisma.payment.upsert({
      where: {
        providerReference: paymentSeed.providerReference,
      },
      update: {
        userId: user.id,
        appId: app.id,
        amount: paymentSeed.amount,
        status: paymentSeed.status,
        paymentProvider: "demo-gateway",
        createdAt: daysFromNow(-paymentSeed.daysAgo),
      },
      create: {
        userId: user.id,
        appId: app.id,
        amount: paymentSeed.amount,
        status: paymentSeed.status,
        paymentProvider: "demo-gateway",
        providerReference: paymentSeed.providerReference,
        createdAt: daysFromNow(-paymentSeed.daysAgo),
      },
    });
  }

  const activityLogSeeds = [
    {
      userKey: "admin",
      action: "seed.catalog.sync",
      entity: "app",
      entityId: requireEntity(
        appsBySlug.get("es-orders-suite"),
        "app es-orders-suite",
      ).id,
    },
    {
      userKey: "admin",
      action: "seed.content.sync",
      entity: "blog_post",
      entityId: requireEntity(
        blogPostsBySlug.get("shipping-es-orders-at-scale"),
        "blog post shipping-es-orders-at-scale",
      ).id,
    },
    {
      userKey: "viewer",
      action: "library.add",
      entity: "app",
      entityId: requireEntity(
        appsBySlug.get("listing-image-curator"),
        "app listing-image-curator",
      ).id,
    },
    {
      userKey: "creator",
      action: "download.track",
      entity: "app",
      entityId: requireEntity(
        appsBySlug.get("img-editor-lab"),
        "app img-editor-lab",
      ).id,
    },
    {
      userKey: "reviewer",
      action: "feedback.submit",
      entity: "app",
      entityId: requireEntity(
        appsBySlug.get("extension-update-guardian"),
        "app extension-update-guardian",
      ).id,
    },
    {
      userKey: "support",
      action: "history.view",
      entity: "download_event",
      entityId: null,
    },
    {
      userKey: "admin",
      action: "theme.activate",
      entity: "theme_config",
      entityId: null,
    },
    {
      userKey: "admin",
      action: "stats.recompute",
      entity: "app_aggregate",
      entityId: null,
    },
  ] as const;

  for (const activityLogSeed of activityLogSeeds) {
    const user = requireEntity(
      usersByKey.get(activityLogSeed.userKey),
      `user ${activityLogSeed.userKey}`,
    );

    const existingLog = await prisma.activityLog.findFirst({
      where: {
        userId: user.id,
        action: activityLogSeed.action,
        entity: activityLogSeed.entity,
        entityId: activityLogSeed.entityId,
      },
      select: {
        id: true,
      },
    });

    if (!existingLog) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: activityLogSeed.action,
          entity: activityLogSeed.entity,
          entityId: activityLogSeed.entityId,
          metadata: {
            source: "seed",
          },
        },
      });
    }
  }

  for (const app of appsBySlug.values()) {
    await syncStatsForApp(app.id, new Date());
  }

  const [
    usersCount,
    categoriesCount,
    appsCount,
    appTagsCount,
    appTagLinksCount,
    appMediaCount,
    appLinksCount,
    storeSectionCount,
    bannerCount,
    sliderCount,
    contentPagesCount,
    blogPostsCount,
    helpArticlesCount,
    feedbackCount,
    testimonialsCount,
    themeCount,
    customFieldDefinitionsCount,
    customFieldValuesCount,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.category.count(),
    prisma.app.count(),
    prisma.appTag.count(),
    prisma.appTagOnApp.count(),
    prisma.appMedia.count(),
    prisma.appLink.count(),
    prisma.storeSectionItem.count(),
    prisma.storeBanner.count(),
    prisma.homeSlider.count(),
    prisma.contentPage.count(),
    prisma.blogPost.count(),
    prisma.helpArticle.count(),
    prisma.feedback.count(),
    prisma.testimonial.count(),
    prisma.themeConfig.count(),
    prisma.customFieldDefinition.count(),
    prisma.customFieldValue.count(),
  ]);

  console.log("Seed complete with expanded demo dataset.");
  console.log({
    usersCount,
    categoriesCount,
    appsCount,
    appTagsCount,
    appTagLinksCount,
    appMediaCount,
    appLinksCount,
    storeSectionCount,
    bannerCount,
    sliderCount,
    contentPagesCount,
    blogPostsCount,
    helpArticlesCount,
    feedbackCount,
    testimonialsCount,
    themeCount,
    customFieldDefinitionsCount,
    customFieldValuesCount,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
