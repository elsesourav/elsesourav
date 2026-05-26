"use client";

import { Header } from "@/components/layout/header";
import { signOut as clientSignOut } from "next-auth/react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/apps", label: "Apps" },
  { href: "/posts", label: "Posts" },
  { href: "/help-support", label: "Support" },
  { href: "/about", label: "About" },
] as const;

const footerColumns = [
  {
    title: "Platform",
    items: [
      { href: "/apps", label: "App Catalog" },
      { href: "/content", label: "Pages" },
      { href: "/feedback", label: "Community Feedback" },
      { href: "/history", label: "Download History" },
      { href: "/library", label: "Your Library" },
    ],
  },
  {
    title: "Company",
    items: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/help-support", label: "Help & Support" },
    ],
  },
  {
    title: "Legal",
    items: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/cookies", label: "Cookies" },
      { href: "/refund-policy", label: "Refunds" },
    ],
  },
] as const;

const socialLinks = [
  { href: "https://github.com/elsesourav", label: "GitHub" },
  { href: "https://x.com/elsesourav", label: "X" },
  { href: "https://www.linkedin.com", label: "LinkedIn" },
  { href: "https://www.youtube.com", label: "YouTube" },
] as const;

function hidePublicChrome(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/api");
}

type SessionNavUser = {
  id: string;
  role: "ADMIN" | "USER";
  name: string | null;
  email: string | null;
};

export function PublicSiteShell({
  children,
  sessionUser,
}: {
  children: ReactNode;
  sessionUser: SessionNavUser | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const spacePressedRef = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const resolvedPathname = pathname ?? "";
  const accountHref = sessionUser?.role === "ADMIN" ? "/admin" : "/settings";
  const accountLabel =
    sessionUser?.role === "ADMIN" ? "Admin panel" : "My account";

  useEffect(() => {
    const id = setTimeout(() => setIsNavigating(false), 0);
    return () => clearTimeout(id);
  }, [pathname]);

  const beginSignOut = useCallback(() => {
    setIsNavigating(true);
    void clientSignOut({ callbackUrl: "/" });
  }, []);

  const beginNavigation = useCallback(
    (href: string) => {
      if (href === pathname) {
        return;
      }

      setIsNavigating(true);
      router.push(href);
    },
    [pathname, router],
  );

  const markAnchorNavigation = useCallback(
    (event: MouseEvent<HTMLElement>, href: string) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (href === pathname) {
        event.preventDefault();
        return;
      }

      setIsNavigating(true);
    },
    [pathname],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code === "Space") {
        spacePressedRef.current = true;
      }

      if (event.shiftKey && spacePressedRef.current && event.code === "KeyA") {
        event.preventDefault();
        router.push("/admin");
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.code === "Space") {
        spacePressedRef.current = false;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [router]);

  if (resolvedPathname && hidePublicChrome(resolvedPathname)) {
    return <>{children}</>;
  }

  const year = new Date().getFullYear();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only left-4 top-3 z-60 rounded-full border border-black/20 bg-white px-4 py-2 text-xs font-semibold text-[#14171f] shadow-sm focus:not-sr-only focus:fixed"
      >
        Skip to content
      </a>

      <Header
        pathname={pathname}
        navItems={primaryNav}
        sessionUser={sessionUser}
        accountHref={accountHref}
        accountLabel={accountLabel}
        isNavigating={isNavigating}
        onAnchorNavigation={markAnchorNavigation}
        onNavigation={beginNavigation}
        onSignOut={beginSignOut}
      />

      <main id="main-content">{children}</main>

      <footer className="mt-9 border-t border-black/12 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--background)_88%,white_12%),color-mix(in_srgb,var(--background)_96%,white_4%))]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <section>
              <h3 className="ui-text-heading text-base font-semibold">
                ElseSourav Platform
              </h3>
              <p className="ui-text-muted mt-1.5 max-w-105 text-sm">
                Curated app discovery, rich content publishing, and enterprise
                support workflows in one composable platform.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full border border-black/12 bg-white/85 px-3 py-1.5 text-xs font-medium text-[#1a2439] transition hover:bg-white"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </section>

            {footerColumns.map((column) => (
              <section key={column.title}>
                <h4 className="ui-text-heading text-[11px] font-bold uppercase tracking-[0.16em]">
                  {column.title}
                </h4>
                <ul className="mt-1.5 space-y-1">
                  {column.items.map((item) => (
                    <li key={item.href}>
                      <NextLink
                        href={item.href}
                        className="ui-text-muted inline-flex items-center text-sm transition hover:text-[color-mix(in_srgb,var(--brand-secondary)_82%,var(--foreground)_18%)]"
                        onClick={(event) =>
                          markAnchorNavigation(event, item.href)
                        }
                      >
                        {item.label}
                      </NextLink>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-5 flex flex-col justify-between gap-1 border-t border-black/10 pt-2 text-[11px] text-[#606a7e] sm:flex-row sm:items-center">
            <p>© {year} ElseSourav. All rights reserved.</p>
            <p>Built for modern app-store and content operations.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
