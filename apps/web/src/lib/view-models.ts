export type PriceValue = number | string;

export type PublicCategory = {
  id: string;
  name: string;
};

export type PublicApp = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  isPaid: boolean;
  price: PriceValue;
  category: {
    id: string;
    name: string;
  };
};

export type AppDetail = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  version: string;
  isPaid: boolean;
  price: PriceValue;
  category: {
    id: string;
    name: string;
  };
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

export type AdminAppListItem = {
  id: string;
  title: string;
  slug: string;
  version: string;
  status: string;
  isPaid: boolean;
  price: PriceValue;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
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
  placement: string;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  updatedAt: string;
};

export type AdminContentPage = {
  id: string;
  slug: string;
  title: string;
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

export type AdminThemeConfig = {
  id: string;
  name: string;
  isActive: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
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

  return date.toLocaleString();
}
