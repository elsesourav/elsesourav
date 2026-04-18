"use client";

import type { SvgIconComponent } from "@mui/icons-material";
import ApiRoundedIcon from "@mui/icons-material/ApiRounded";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import FeedbackRoundedIcon from "@mui/icons-material/FeedbackRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import ViewCarouselRoundedIcon from "@mui/icons-material/ViewCarouselRounded";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavItem = {
  href: string;
  label: string;
  icon: SvgIconComponent;
};

const adminNavItems: ReadonlyArray<AdminNavItem> = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: DashboardRoundedIcon,
  },
  {
    href: "/admin/apps",
    label: "Apps",
    icon: AppsRoundedIcon,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: CategoryRoundedIcon,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: PeopleAltRoundedIcon,
  },
  {
    href: "/admin/feedback",
    label: "Feedback",
    icon: FeedbackRoundedIcon,
  },
  {
    href: "/admin/store/sections",
    label: "Store sections",
    icon: ViewCarouselRoundedIcon,
  },
  {
    href: "/admin/store/banners",
    label: "Banners",
    icon: CampaignRoundedIcon,
  },
  {
    href: "/admin/content/pages",
    label: "Pages",
    icon: DescriptionRoundedIcon,
  },
  {
    href: "/admin/content/blog",
    label: "Blog",
    icon: ArticleRoundedIcon,
  },
  {
    href: "/admin/theme/configs",
    label: "Theme configs",
    icon: TuneRoundedIcon,
  },
  {
    href: "/admin/control",
    label: "API docs",
    icon: ApiRoundedIcon,
  },
];

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="space-y-1.5">
      {adminNavItems.map((item) => {
        const active = isNavItemActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition",
              active
                ? "border-[color-mix(in_srgb,var(--brand-secondary)_50%,var(--foreground)_50%)] bg-[color-mix(in_srgb,var(--brand-secondary)_78%,var(--brand-primary)_22%)] text-white shadow-[0_10px_26px_-20px_rgba(20,23,31,0.9)]"
                : "ui-border bg-[color-mix(in_srgb,var(--background)_94%,white_6%)] ui-text-primary hover:ui-border-strong hover:bg-[color-mix(in_srgb,var(--background)_82%,var(--brand-secondary)_18%)]",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
          >
            <span
              className={[
                "inline-flex h-8 w-8 items-center justify-center rounded-xl border",
                active
                  ? "border-white/30 bg-white/15"
                  : "ui-border bg-[color-mix(in_srgb,var(--background)_90%,white_10%)]",
              ].join(" ")}
            >
              <Icon fontSize="small" />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
