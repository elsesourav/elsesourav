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

export type BannerPlacement = "NEW" | "COMING_SOON" | "SPECIAL_OFFER" | "EVENT";

export type ContentStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

export type SliderType = "HERO" | "FEATURED" | "PROMO";

export type BlogPostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type HelpArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

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
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  placement: BannerPlacement;
  liveStartsAt: string | null;
  liveEndsAt: string | null;
  appStartsAt: string | null;
  appEndsAt: string | null;
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

export type HomeSliderDto = {
  id: string;
  title: string;
  description: string | null;
  type: SliderType;
  imageUrl: string | null;
  linkUrl: string | null;
  appId: string | null;
  orderIndex: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AppTagDto = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type AppAggregateStatDto = {
  appId: string;
  viewCount: number;
  downloadCount: number;
  libraryCount: number;
  feedbackCount: number;
  averageRating: string;
  lastViewedAt: string | null;
  lastDownloadedAt: string | null;
  updatedAt: string;
};

export type AppDailyStatDto = {
  id: string;
  appId: string;
  date: string;
  viewCount: number;
  downloadCount: number;
  libraryCount: number;
  feedbackCount: number;
  averageRating: string;
  createdAt: string;
  updatedAt: string;
};

export type CursorPaginationDto = {
  limit: number;
  nextCursor: string | null;
  hasMore: boolean;
};

export type ProfilePageDto = {
  id: string;
  slug: string;
  fullName: string;
  headline: string | null;
  shortBio: string | null;
  bioMarkdown: string;
  experienceMarkdown: string | null;
  skills: unknown;
  tools: unknown;
  contactEmail: string | null;
  location: string | null;
  websiteUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  resumeUrl: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  isActive: boolean;
  updatedAt: string;
};

export type BlogTagDto = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type BlogCommentDto = {
  id: string;
  postId: string;
  userId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  content: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BlogPostDto = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentMarkdown: string;
  status: BlogPostStatus;
  publishAt: string | null;
  publishedAt: string | null;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HelpCategoryDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HelpArticleDto = {
  id: string;
  categoryId: string | null;
  slug: string;
  title: string;
  summary: string | null;
  contentMarkdown: string;
  status: HelpArticleStatus;
  isFeatured: boolean;
  publishAt: string | null;
  publishedAt: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
};

export type TestimonialDto = {
  id: string;
  authorName: string;
  authorRole: string | null;
  company: string | null;
  avatarUrl: string | null;
  quoteMarkdown: string;
  rating: number;
  sourceUrl: string | null;
  sortOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
