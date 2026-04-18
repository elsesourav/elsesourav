"use client";

import { LandingGlassHeader } from "@/components/layout/landing-glass-header";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { signOut as clientSignOut } from "next-auth/react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/apps", label: "Apps" },
  { href: "/content", label: "Pages" },
  { href: "/blog", label: "Blog" },
  { href: "/help", label: "Help" },
  { href: "/about", label: "About" },
  { href: "/support", label: "Support" },
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
      { href: "/support", label: "Support" },
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
  const accountHref = sessionUser?.role === "ADMIN" ? "/admin" : "/settings";
  const accountLabel =
    sessionUser?.role === "ADMIN" ? "Admin panel" : "My account";

  useEffect(() => {
    setIsNavigating(false);
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

  if (hidePublicChrome(pathname)) {
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

      <LandingGlassHeader
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

      <Box component="main" id="main-content">
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          mt: 9,
          borderTop: "1px solid color-mix(in srgb, black 12%, transparent)",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--background) 88%, white 12%), color-mix(in srgb, var(--background) 96%, white 4%))",
        }}
      >
        <Container maxWidth="xl" sx={{ py: 8 }}>
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 5,
              border: "1px solid color-mix(in srgb, black 10%, transparent)",
              background:
                "linear-gradient(130deg, #0f1d40, #1f5ed4 52%, #8bb0f8)",
              p: { xs: 3, sm: 4 },
              color: "#fff",
              boxShadow: "0 24px 54px -34px rgba(20,23,31,0.95)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                right: -40,
                top: -40,
                width: 160,
                height: 160,
                borderRadius: "999px",
                backgroundColor: "rgba(255,255,255,0.15)",
                filter: "blur(24px)",
              }}
            />
            <Typography
              variant="caption"
              sx={{
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.72)",
              }}
            >
              Build faster
            </Typography>
            <Typography
              variant="h4"
              sx={{
                mt: 1,
                maxWidth: 760,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                fontSize: { xs: "1.6rem", sm: "2rem" },
              }}
            >
              App-store foundation for apps, support, help center, and blog.
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1.5, maxWidth: 760, color: "rgba(255,255,255,0.84)" }}
            >
              Production-ready storefront patterns with data-driven content and
              admin tooling built on microservices.
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 2.5, flexWrap: "wrap" }}
            >
              <Button
                component={NextLink}
                href="/apps"
                onClick={(event) => markAnchorNavigation(event, "/apps")}
                variant="outlined"
                sx={{
                  borderColor: "rgba(255,255,255,0.34)",
                  color: "#fff",
                }}
              >
                Browse apps
              </Button>
              <Button
                component={NextLink}
                href="/support"
                onClick={(event) => markAnchorNavigation(event, "/support")}
                variant="outlined"
                sx={{
                  borderColor: "rgba(255,255,255,0.34)",
                  color: "#fff",
                }}
              >
                Open support
              </Button>
            </Stack>
          </Paper>

          <Box
            sx={{
              mt: 6,
              display: "grid",
              gap: 4,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                lg: "1.3fr 1fr 1fr 1fr",
              },
            }}
          >
            <section>
              <Typography
                variant="subtitle1"
                className="ui-text-heading"
                sx={{ fontWeight: 600 }}
              >
                ElseSourav Platform
              </Typography>
              <Typography
                variant="body2"
                className="ui-text-muted"
                sx={{ mt: 1.25, maxWidth: 420 }}
              >
                Curated app discovery, rich content publishing, and enterprise
                support workflows in one composable platform.
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 2, flexWrap: "wrap" }}
              >
                {socialLinks.map((item) => (
                  <Button
                    key={item.href}
                    component="a"
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    variant="outlined"
                    size="small"
                    sx={{
                      borderRadius: 999,
                      borderColor: "color-mix(in srgb, black 12%, transparent)",
                      backgroundColor: "rgba(255,255,255,0.84)",
                      color: "#1a2439",
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Stack>
            </section>

            {footerColumns.map((column) => (
              <section key={column.title}>
                <Typography
                  variant="caption"
                  className="ui-text-heading"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    fontWeight: 700,
                  }}
                >
                  {column.title}
                </Typography>
                <Stack
                  component="ul"
                  spacing={1}
                  sx={{ mt: 1.5, m: 0, p: 0, listStyle: "none" }}
                >
                  {column.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        component={NextLink}
                        href={item.href}
                        underline="none"
                        className="ui-text-muted"
                        onClick={(event) =>
                          markAnchorNavigation(event, item.href)
                        }
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          fontSize: "0.9rem",
                          "&:hover": {
                            color:
                              "color-mix(in srgb, var(--brand-secondary) 82%, var(--foreground) 18%)",
                          },
                        }}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </Stack>
              </section>
            ))}
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{
              mt: 5,
              pt: 2,
              borderTop: "1px solid color-mix(in srgb, black 10%, transparent)",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="caption" sx={{ color: "#606a7e" }}>
              © {year} ElseSourav. All rights reserved.
            </Typography>
            <Typography variant="caption" sx={{ color: "#606a7e" }}>
              Built for modern app-store and content operations.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
