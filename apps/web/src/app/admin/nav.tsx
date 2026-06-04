"use client";

import {
  LayoutDashboard,
  AppWindow,
  Tags,
  Users,
  MessageSquare,
  GalleryHorizontalEnd,
  Megaphone,
  FileText,
  FileEdit,
  Palette,
  TerminalSquare,
  LifeBuoy,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useQuery } from "@tanstack/react-query";

type AdminNavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: "support-unread";
};

const adminNavSections: ReadonlyArray<{
  title: string;
  items: ReadonlyArray<AdminNavItem>;
}> = [
  {
    title: "Main menu",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/apps", label: "Apps", icon: AppWindow },
      { href: "/admin/categories", label: "Categories", icon: Tags },
      { href: "/admin/users", label: "Users", icon: Users },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/admin/support", label: "Support", icon: LifeBuoy, badge: "support-unread" },
      { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
      { href: "/admin/store/sections", label: "Store sections", icon: GalleryHorizontalEnd },
      { href: "/admin/store/banners", label: "Banners", icon: Megaphone },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/content/pages", label: "Pages", icon: FileText },
      { href: "/admin/content/posts", label: "Posts", icon: FileEdit },
      { href: "/admin/help", label: "Help Docs", icon: BookOpen },
      { href: "/admin/theme/configs", label: "Theme configs", icon: Palette },
      { href: "/admin/theme/images", label: "Image configs", icon: Palette },
      { href: "/admin/control", label: "API docs", icon: TerminalSquare },
    ],
  },
];

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SupportBadge() {
  const { data: tickets = [] } = useQuery({
    queryKey: ["admin-support-tickets"],
    queryFn: async () => {
      const res = await fetch("/api/admin/user/support/tickets?limit=100");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data as Array<{ unreadAdminCount: number; status: string }>;
    },
    refetchInterval: 30000,
  });

  const unreadCount = tickets.filter(t => t.unreadAdminCount > 0 && t.status !== "CLOSED" && t.status !== "RESOLVED").length;

  if (unreadCount === 0) return null;

  return (
    <span className="ml-auto inline-flex items-center justify-center rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-bold text-brand-primary-fg">
      {unreadCount}
    </span>
  );
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="space-y-8">
      {adminNavSections.map((section) => (
        <div key={section.title} className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted px-3">
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
                  className={cn(
                    "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-brand-primary font-semibold"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <motion.div
                      layoutId="admin-nav-active"
                      className="absolute inset-0 rounded-md bg-surface-active"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors shrink-0",
                      active ? "text-brand-primary" : "text-text-muted group-hover:text-text-primary"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                  {item.badge === "support-unread" && <SupportBadge />}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
