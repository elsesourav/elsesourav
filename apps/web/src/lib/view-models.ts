export type PriceValue = number | string;
export type MetadataRecord = Record<string, unknown>;

export type PublicCategory = {
  id: string;
  name: string;
};

export type PublicApp = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  iconUrl?: string | null;
  developerName?: string | null;
  isPaid: boolean;
  price: PriceValue;
  category: {
    id: string;
    name: string;
  };
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  aggregateStat?: {
    viewCount: number;
    downloadCount: number;
    averageRating: PriceValue;
  } | null;
  media?: Array<{
    id: string;
    url: string;
    alt: string | null;
    type: "IMAGE" | "VIDEO";
    mimeType?: string | null;
    width?: number | null;
    height?: number | null;
    durationSec?: number | null;
    thumbnailUrl?: string | null;
    fileSizeBytes?: string | number | null;
    isAnimated?: boolean;
  }>;
};

export type AppDetail = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  releaseNotes?: string | null;
  metadata?: MetadataRecord | null;
  iconUrl?: string | null;
  featureGraphicUrl?: string | null;
  promoVideoUrl?: string | null;
  supportEmail?: string | null;
  supportWebsiteUrl?: string | null;
  privacyPolicyUrl?: string | null;
  containsAds?: boolean;
  developerName?: string | null;
  version: string;
  isPaid: boolean;
  price: PriceValue;
  category: {
    id: string;
    name: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  aggregateStat?: {
    viewCount: number;
    downloadCount: number;
    libraryCount: number;
    feedbackCount: number;
    averageRating: PriceValue;
    lastViewedAt: string | null;
    lastDownloadedAt: string | null;
    updatedAt: string;
  } | null;
  media: Array<{
    id: string;
    url: string;
    alt: string | null;
    type: "IMAGE" | "VIDEO";
    mimeType?: string | null;
    width?: number | null;
    height?: number | null;
    durationSec?: number | null;
    thumbnailUrl?: string | null;
    fileSizeBytes?: string | number | null;
    isAnimated?: boolean;
  }>;
  links: Array<{
    id: string;
    platform: string;
    downloadUrl: string;
    sourceCodeUrl: string | null;
  }>;
};

export type AppFeedback = {
  id: string;
  rating: number;
  message: string;
  user: {
    id: string;
    name: string | null;
  };
};

export type AdminApp = {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
};

export type CatalogStats = {
  appsCount: number;
  categoriesCount: number;
  recentApps: AdminApp[];
};

export type AuthStats = {
  usersCount: number;
};

export type UserStats = {
  feedbackCount: number;
};

export type AppRole = "ADMIN" | "USER";

export type AdminAppTag = {
  id: string;
  name: string;
  slug: string;
  _count?: {
    appLinks: number;
  };
};

export type AdminAppListItem = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  releaseNotes?: string | null;
  metadata?: MetadataRecord | null;
  iconUrl?: string | null;
  featureGraphicUrl?: string | null;
  promoVideoUrl?: string | null;
  supportEmail?: string | null;
  supportWebsiteUrl?: string | null;
  privacyPolicyUrl?: string | null;
  containsAds?: boolean;
  developerName?: string | null;
  version: string;
  status: string;
  isPaid: boolean;
  isFeatured: boolean;
  price: PriceValue;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
  tags: AdminAppTag[];
  _count: {
    feedbacks: number;
    downloadEvents: number;
  };
};

export type AdminCategory = {
  id: string;
  name: string;
  icon: string | null;
  scheduledDeletionAt: string | null;
  deletedAt: string | null;
  _count: {
    apps: number;
  };
};

export type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: AppRole;
  createdAt: string;
  _count: {
    libraries: number;
    feedbacks: number;
    payments: number;
  };
};

export type AdminFeedbackItem = {
  id: string;
  rating: number;
  message: string;
  isHidden: boolean;
  createdAt: string;
  app: {
    id: string;
    title: string;
    slug: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type AdminSectionItem = {
  id: string;
  sectionType: string;
  orderIndex: number;
  releaseAt: string | null;
  startsAt: string | null;
  endsAt: string | null;
  app: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
};

export type AdminBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  placement: string;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminSlider = {
  id: string;
  title: string;
  description: string | null;
  type: "HERO" | "FEATURED" | "PROMO";
  imageUrl: string | null;
  linkUrl: string | null;
  appId: string | null;
  orderIndex: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  app?: {
    id: string;
    title: string;
    slug: string;
    status: string;
  } | null;
};

export type CustomFieldEntity =
  | "APP"
  | "CATEGORY"
  | "CONTENT_PAGE"
  | "BLOG_POST"
  | "HELP_ARTICLE"
  | "PROFILE_PAGE"
  | "TESTIMONIAL"
  | "THEME_CONFIG"
  | "STORE_BANNER"
  | "STORE_SECTION_ITEM"
  | "HOME_SLIDER"
  | "APP_TAG"
  | "BLOG_TAG"
  | "HELP_CATEGORY"
  | "APP_MEDIA"
  | "APP_LINK"
  | "USER";

export type CustomFieldType =
  | "TEXT"
  | "LONG_TEXT"
  | "NUMBER"
  | "BOOLEAN"
  | "DATE"
  | "URL"
  | "JSON"
  | "SELECT"
  | "MULTISELECT";

export type AdminCustomFieldDefinition = {
  id: string;
  entity: CustomFieldEntity;
  key: string;
  label: string;
  description: string | null;
  fieldType: CustomFieldType;
  isRequired: boolean;
  isActive: boolean;
  isFilterable: boolean;
  options: unknown;
  defaultValue: unknown;
  createdAt: string;
  updatedAt: string;
  _count?: {
    values: number;
  };
};

export type AdminCustomFieldValue = {
  id: string;
  definitionId: string;
  entityId: string;
  value: unknown;
  createdAt: string;
  updatedAt: string;
  definition: {
    id: string;
    entity: CustomFieldEntity;
    key: string;
    label: string;
    fieldType: CustomFieldType;
  };
};

export type PublicContentPageListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishAt: string | null;
  publishedAt: string | null;
  updatedAt: string;
  metadata?: MetadataRecord | null;
};

export type AdminContentPage = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  seoTitle: string | null;
  seoDescription: string | null;
  metadata?: MetadataRecord | null;
  status: string;
  publishAt: string | null;
  publishedAt: string | null;
  updatedAt: string;
  versions: Array<{
    id: string;
    version: number;
    status: string;
    createdAt: string;
  }>;
};

export type AdminBlogTag = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
  };
};

export type AdminBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentMarkdown: string;
  metadata?: MetadataRecord | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishAt: string | null;
  publishedAt: string | null;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
  tags: AdminBlogTag[];
  _count?: {
    comments: number;
  };
};

export type AdminThemeConfig = {
  id: string;
  name: string;
  isActive: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  actionColor: string;
  backgroundColor: string;
  foregroundColor: string;
  darkPrimaryColor: string;
  darkSecondaryColor: string;
  darkAccentColor: string;
  darkActionColor: string;
  darkBackgroundColor: string;
  darkForegroundColor: string;
  fontSans: string;
  fontHeading: string;
  headingScale: string;
  updatedAt: string;
};

export type UserLibraryItem = {
  id: string;
  createdAt: string;
  app: {
    id: string;
    title: string;
    slug: string;
    shortDescription: string;
    isPaid: boolean;
    price: PriceValue;
  };
};

export type UserHistoryItem = {
  id: string;
  platform: string;
  createdAt: string;
  app: {
    id: string;
    title: string;
    slug: string;
  };
};

export type UserSettingsView = {
  themeMode: "system" | "light" | "dark";
  customTheme: Record<string, string> | null;
  emailNotifications: boolean;
  marketingEmails: boolean;
  updatedAt: string | null;
};

export type UserDeletionScheduleView = {
  scheduledDeletionAt: string | null;
  deletedAt: string | null;
  isScheduled: boolean;
  minimumDelayDays: number;
  maximumDelayDays: number;
  defaultDelayDays: number;
};

export type PublicFeedbackItem = {
  id: string;
  rating: number;
  message: string;
  createdAt: string;
  app: {
    id: string;
    title: string;
    slug: string;
  };
  user: {
    id: string;
    name: string | null;
  };
};

export function formatPrice(price: PriceValue): string {
  const numeric = typeof price === "string" ? Number(price) : price;

  if (!Number.isFinite(numeric)) {
    return `$${price}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  const second = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second} UTC`;
}
