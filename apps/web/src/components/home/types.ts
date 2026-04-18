import type { PublicApp } from "@/lib/view-models";

export type HomeSlider = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  type: "HERO" | "FEATURED" | "PROMO";
  app: PublicApp | null;
};

export type HomeBanner = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  placement: "HOME_HERO" | "LATEST" | "UPCOMING";
};

export type SupportOverviewCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: {
    articles: number;
  };
};

export type SupportOverviewHelpArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  publishedAt: string | null;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export type SupportOverviewBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string | null;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  _count?: {
    comments: number;
  };
};

export type SupportOverviewPayload = {
  categories: SupportOverviewCategory[];
  featuredHelp: SupportOverviewHelpArticle[];
  latestBlog: SupportOverviewBlogPost[];
};
