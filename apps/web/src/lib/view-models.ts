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
