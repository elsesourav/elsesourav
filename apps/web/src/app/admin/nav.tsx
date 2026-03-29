"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavItem = {
  href: string;
  label: string;
  description: string;
};

const adminNavSections: ReadonlyArray<{
  title: string;
  items: ReadonlyArray<AdminNavItem>;
}> = [
  {
    title: "Overview",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        description: "Traffic, users, and catalog pulse.",
      },
      {
        href: "/admin/control",
        label: "Control Center",
        description: "Quick actions across services.",
      },
    ],
  },
  {
    title: "Catalog",
    items: [
      {
        href: "/admin/apps",
        label: "Apps",
        description: "Inventory and app metadata.",
      },
      {
        href: "/admin/categories",
        label: "Categories",
        description: "Create, schedule delete, and restore.",
      },
      {
        href: "/admin/store/sections",
        label: "Store Sections",
        description: "Latest, upcoming, and featured order.",
      },
      {
        href: "/admin/store/banners",
        label: "Store Banners",
        description: "Campaign windows and placements.",
      },
    ],
  },
  {
    title: "People",
    items: [
      {
        href: "/admin/users",
        label: "Users",
        description: "Account roles and usage totals.",
      },
      {
        href: "/admin/feedback",
        label: "Feedback",
        description: "Moderation stream and ratings.",
      },
    ],
  },
  {
    title: "Presentation",
    items: [
      {
        href: "/admin/content/pages",
        label: "Content Pages",
        description: "CMS records and publish states.",
      },
      {
        href: "/admin/content/blog",
        label: "Blog Posts",
        description: "Editorial drafting and publish flow.",
      },
      {
        href: "/admin/theme/configs",
        label: "Theme Configs",
        description: "Color and typography presets.",
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
    <nav aria-label="Admin navigation" className="space-y-4">
      {adminNavSections.map((section) => (
        <section
          key={section.title}
          className="rounded-2xl border border-black/10 bg-white/80 p-3 backdrop-blur"
        >
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#55607a]">
            {section.title}
          </p>
          <div className="space-y-1.5">
            {section.items.map((item) => {
              const active = isNavItemActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "block rounded-xl border px-3 py-2 transition",
                    active
                      ? "border-[#193769] bg-[#1f5ed4] text-white shadow-[0_10px_26px_-20px_rgba(20,23,31,0.9)]"
                      : "border-black/5 bg-white text-[#1c2638] hover:border-black/15 hover:bg-[#f8faff]",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p
                    className={[
                      "text-xs",
                      active ? "text-blue-100" : "text-[#5f6a82]",
                    ].join(" ")}
                  >
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}
