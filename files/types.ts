import type { LucideIcon } from "lucide-react";

export type Platform = "ios" | "android" | "web" | "windows" | "mac" | "android-tv";

export type AppCardVariant = "banner" | "list";

export interface AppItem {
  id: string;
  name: string;
  description: string;
  category: string;
  platforms: Platform[];
  /** 0 – 5 (decimals allowed, e.g. 4.6) */
  rating: number;
  ratingCount?: number;
  icon: LucideIcon;
  /** Tailwind text colour for the icon tile, e.g. "text-emerald-600" */
  iconColor?: string;
  /** Tailwind gradient classes, e.g. "from-lime-300 via-emerald-500 to-green-800" */
  bannerGradient: string;
  /** Optional artwork; replaces the gradient when provided */
  bannerImage?: string;
  /** Small pill on the banner, e.g. "New" */
  badge?: string;
  href?: string;
}
