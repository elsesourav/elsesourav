export type HelpCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: {
    articles: number;
  };
};

export type HelpArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  publishedAt: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
};
