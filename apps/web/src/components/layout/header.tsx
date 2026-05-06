"use client";

import Navigation, { type HeaderNavItem } from "@/components/layout/Navigation";
import Image from "next/image";
import NextLink from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import UseAnimations from "react-useanimations";
import menu2 from "react-useanimations/lib/menu2";

type SessionNavUser = {
  id: string;
  role: "ADMIN" | "USER";
  name: string | null;
  email: string | null;
};

type HeaderProps = {
  pathname: string;
  navItems: ReadonlyArray<HeaderNavItem>;
  sessionUser: SessionNavUser | null;
  accountHref: string;
  accountLabel: string;
  isNavigating: boolean;
  onAnchorNavigation: (event: MouseEvent<HTMLElement>, href: string) => void;
  onNavigation: (href: string) => void;
  onSignOut: () => void;
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getMobileNavLinkClass(active: boolean): string {
  return [
    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
    active
      ? "bg-[color-mix(in_srgb,var(--background)_82%,var(--foreground)_18%)] text-foreground"
      : "text-foreground hover:bg-[color-mix(in_srgb,var(--background)_90%,var(--foreground)_10%)]",
  ].join(" ");
}

function getLoadingClass(isActive: boolean): string {
  return isActive ? "header-loading-active" : "";
}

export function Header({
  pathname,
  navItems,
  sessionUser,
  accountHref,
  accountLabel,
  isNavigating,
  onAnchorNavigation,
  onNavigation,
  onSignOut,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null);

  const isModifiedNavigationClick = (
    event: MouseEvent<HTMLElement>,
  ): boolean => {
    return (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    );
  };

  const handleAnchorNavigation = (
    event: MouseEvent<HTMLElement>,
    href: string,
    target: string,
  ) => {
    onAnchorNavigation(event, href);

    if (isModifiedNavigationClick(event)) {
      return;
    }

    setLoadingTarget(target);
  };

  const handleNavigation = (href: string, target: string) => {
    if (href === pathname) {
      return;
    }

    setLoadingTarget(target);
    onNavigation(href);
  };

  const handleSignOut = () => {
    setLoadingTarget("signout");
    onSignOut();
  };

  const isTargetLoading = (target: string): boolean => {
    return isNavigating && loadingTarget === target;
  };

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-transparent overflow-hidden">
      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <div className="px-2 py-2 sm:px-3 md:px-4 md:py-3">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex min-w-0 z-20 items-center gap-2">
              <UseAnimations
                animation={menu2}
                reverse={isMobileMenuOpen}
                size={24}
                strokeColor="var(--foreground)"
                onClick={() => {
                  setIsMobileMenuOpen((previousState) => !previousState);
                }}
                render={(eventProps, animationProps) => (
                  <button
                    type="button"
                    aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    aria-controls="landing-mobile-left-menu"
                    aria-expanded={isMobileMenuOpen}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-[color-mix(in_srgb,var(--background)_90%,white_10%)] text-foreground transition hover:bg-[color-mix(in_srgb,var(--background)_82%,white_18%)] md:hidden"
                    {...eventProps}
                  >
                    <div {...animationProps} />
                  </button>
                )}
              />

              <NextLink
                href="/"
                onClick={(event) =>
                  handleAnchorNavigation(event, "/", "brand-home")
                }
                className={[
                  "inline-flex min-w-0 items-center rounded-full px-3 py-2 text-sm font-extrabold tracking-[0.01em] text-foreground transition hover:-translate-y-px hover:bg-[color-mix(in_srgb,var(--background)_86%,white_14%)]",
                  getLoadingClass(isTargetLoading("brand-home")),
                ].join(" ")}
              >
                <span className="mr-2 inline-flex items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,var(--foreground)_14%,transparent)] bg-[color-mix(in_srgb,var(--background)_90%,white_10%)] p-1">
                  <Image
                    src="/img/icon.png"
                    alt="ElseSourav"
                    width={22}
                    height={22}
                    priority
                  />
                </span>
                <span className="truncate">ElseSourav</span>
              </NextLink>
            </div>

            <Navigation
              pathname={pathname}
              navItems={navItems}
              onAnchorNavigation={handleAnchorNavigation}
              isTargetLoading={isTargetLoading}
            />

            <div className="hidden z-20 items-center gap-2 md:flex">
              {sessionUser ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      handleNavigation(accountHref, "desktop-account")
                    }
                    disabled={isNavigating}
                    className={[
                      "inline-flex items-center rounded-full border border-black/20 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-60",
                      getLoadingClass(isTargetLoading("desktop-account")),
                    ].join(" ")}
                  >
                    <span>{accountLabel}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isNavigating}
                    className={[
                      "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60",
                      getLoadingClass(isTargetLoading("signout")),
                    ].join(" ")}
                    style={{
                      background:
                        "linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 74%, white 26%), color-mix(in srgb, var(--brand-secondary) 70%, var(--brand-accent) 30%))",
                    }}
                  >
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      handleNavigation("/login", "desktop-sign-in")
                    }
                    disabled={isNavigating}
                    className={[
                      "inline-flex items-center rounded-full px-2.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-60",
                      getLoadingClass(isTargetLoading("desktop-sign-in")),
                    ].join(" ")}
                  >
                    <span>Sign in</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleNavigation("/register", "desktop-create-account")
                    }
                    disabled={isNavigating}
                    className={[
                      "inline-flex items-center rounded-2xl px-4 py-1.5 text-xs font-bold text-[#2d1029] shadow-[0_10px_22px_-16px_rgba(211,89,171,0.9)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60",
                      getLoadingClass(
                        isTargetLoading("desktop-create-account"),
                      ),
                    ].join(" ")}
                    style={{
                      background:
                        "linear-gradient(135deg, #f9d7df, #f6b4eb 62%, #f1c98e)",
                    }}
                  >
                    <span>Create account</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div
            className={[
              "fixed inset-0 z-70 transition md:hidden",
              isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none",
            ].join(" ")}
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className={[
                "absolute inset-0 bg-black/45 backdrop-blur-[1px] transition-opacity duration-300",
                isMobileMenuOpen ? "opacity-100" : "opacity-0",
              ].join(" ")}
            />

            <aside
              id="landing-mobile-left-menu"
              aria-label="Landing primary mobile menu"
              className={[
                "fixed left-0 top-0 flex h-dvh w-80 max-w-[82vw] flex-col border-r border-black/12 bg-[color-mix(in_srgb,var(--background)_94%,white_6%)] px-4 pb-6 pt-5 shadow-2xl transition-transform duration-300 ease-out",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
              ].join(" ")}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Navigation
                </p>
                <UseAnimations
                  animation={menu2}
                  reverse={isMobileMenuOpen}
                  size={22}
                  strokeColor="var(--foreground)"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                  }}
                  render={(eventProps, animationProps) => (
                    <button
                      type="button"
                      aria-label="Close menu"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/15 text-foreground transition hover:bg-black/5"
                      {...eventProps}
                    >
                      <div {...animationProps} />
                    </button>
                  )}
                />
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active = isActive(pathname, item.href);

                  return (
                    <NextLink
                      key={item.href}
                      href={item.href}
                      onClick={(event) => {
                        handleAnchorNavigation(
                          event,
                          item.href,
                          `mobile-nav-${item.href}`,
                        );
                        setIsMobileMenuOpen(false);
                      }}
                      aria-current={active ? "page" : undefined}
                      className={[
                        getMobileNavLinkClass(active),
                        getLoadingClass(
                          isTargetLoading(`mobile-nav-${item.href}`),
                        ),
                      ].join(" ")}
                    >
                      <span className="relative z-10 inline-flex items-center gap-2">
                        <span>{item.label}</span>
                      </span>
                    </NextLink>
                  );
                })}
              </nav>

              <div className="mt-6 border-t border-black/10 pt-4">
                {sessionUser ? (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        <Navigation
                          pathname={pathname}
                          navItems={navItems}
                          onAnchorNavigation={handleAnchorNavigation}
                          isTargetLoading={isTargetLoading}
                        />;
                        handleNavigation(accountHref, "mobile-account");
                      }}
                      disabled={isNavigating}
                      className={[
                        "inline-flex items-center justify-center rounded-full border border-black/20 px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-60",
                        getLoadingClass(isTargetLoading("mobile-account")),
                      ].join(" ")}
                    >
                      <span>{accountLabel}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      disabled={isNavigating}
                      className={[
                        "inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60",
                        getLoadingClass(isTargetLoading("signout")),
                      ].join(" ")}
                      style={{
                        background:
                          "linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 74%, white 26%), color-mix(in srgb, var(--brand-secondary) 70%, var(--brand-accent) 30%))",
                      }}
                    >
                      <span>Sign out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleNavigation("/login", "mobile-sign-in");
                      }}
                      disabled={isNavigating}
                      className={[
                        "inline-flex items-center justify-center rounded-full border border-black/15 px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-60",
                        getLoadingClass(isTargetLoading("mobile-sign-in")),
                      ].join(" ")}
                    >
                      <span>Sign in</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleNavigation("/register", "mobile-create-account");
                      }}
                      disabled={isNavigating}
                      className={[
                        "inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-bold text-[#2d1029] shadow-[0_10px_22px_-16px_rgba(211,89,171,0.9)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60",
                        getLoadingClass(
                          isTargetLoading("mobile-create-account"),
                        ),
                      ].join(" ")}
                      style={{
                        background:
                          "linear-gradient(135deg, #f9d7df, #f6b4eb 62%, #f1c98e)",
                      }}
                    >
                      <span>Create account</span>
                    </button>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </header>
  );
}
