export type ApiSuccess<T> = {
  ok: true;
  data: T;
  requestId: string;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type StoreSectionType = "LATEST" | "UPCOMING" | "FEATURED";

export type BannerPlacement = "HOME_HERO" | "LATEST" | "UPCOMING";

export type ContentStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

export type StoreSectionItemDto = {
  id: string;
  appId: string;
  sectionType: StoreSectionType;
  orderIndex: number;
  releaseAt: string | null;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StoreBannerDto = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  placement: BannerPlacement;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContentPageDto = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  seoTitle: string | null;
  seoDescription: string | null;
  status: ContentStatus;
  publishAt: string | null;
  publishedAt: string | null;
  updatedAt: string;
};

export type ThemeConfigDto = {
  id: string;
  name: string;
  isActive: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  fontSans: string;
  fontHeading: string;
  headingScale: string;
  updatedAt: string;
};
