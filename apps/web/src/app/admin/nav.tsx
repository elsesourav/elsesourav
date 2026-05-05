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

const adminNavSections: ReadonlyArray<{
  title: string;
  items: ReadonlyArray<AdminNavItem>;
}> = [
  {
    title: "Main menu",
    items: [
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
    ],
  },
  {
    title: "Operations",
    items: [
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
    ],
  },
  {
    title: "Content",
    items: [
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
    ],
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
    <nav aria-label="Admin navigation" className="space-y-6">
      {adminNavSections.map((section) => (
        <div key={section.title} className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
            {section.title}
          </p>
          <div className="space-y-1">
            {section.items.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-[color-mix(in_srgb,var(--brand-secondary)_18%,var(--background)_82%)] text-[color-mix(in_srgb,var(--foreground)_90%,transparent)]"
                      : "text-[color-mix(in_srgb,var(--foreground)_60%,transparent)] hover:bg-[color-mix(in_srgb,var(--background)_90%,var(--foreground)_10%)]",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={[
                      "inline-flex h-8 w-8 items-center justify-center rounded-xl transition",
                      active
                        ? "bg-[color-mix(in_srgb,var(--background)_70%,white_30%)] text-[color-mix(in_srgb,var(--foreground)_90%,transparent)] shadow-sm"
                        : "bg-[color-mix(in_srgb,var(--background)_88%,var(--foreground)_12%)] text-[color-mix(in_srgb,var(--foreground)_45%,transparent)] group-hover:text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]",
                    ].join(" ")}
                  >
                    <Icon fontSize="small" />
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
