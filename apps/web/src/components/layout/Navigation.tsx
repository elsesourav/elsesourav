import AboutIcon from "@/components/icons/AboutIcon";
import AppsIcon from "@/components/icons/AppsIcon";
import HelpAndSupportIcon from "@/components/icons/HelpAndSupportIcon";
import HomeIcon from "@/components/icons/HomeIcon";
import GlassSurface from "@/components/ui/GlassSurface";
import NextLink from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import BlogIcon from "../icons/BlogIcon";

function getDesktopNavLinkClass(active: boolean): string {
  return [
    "relative z-10 inline-flex flex-col items-center gap-1 rounded-full px-5 py-2.5 text-xs font-semibold transition duration-300 ease-out",
    active
      ? "text-foreground"
      : "text-[color-mix(in_srgb,var(--foreground)_72%,var(--background)_28%)] hover:-translate-y-px hover:bg-[color-mix(in_srgb,var(--background)_84%,var(--foreground)_16%)]",
  ].join(" ");
}

function NavItemIcon({ href, className }: { href: string; className: string }) {
  switch (href) {
    case "/":
      return <HomeIcon className={className} />;
    case "/apps":
      return <AppsIcon className={className} />;
    case "/blog":
      return <BlogIcon className={className} />;
    case "/help-support":
      return <HelpAndSupportIcon className={className} />;
    case "/about":
      return <AboutIcon className={className} />;
    default:
      return <HelpAndSupportIcon className={className} />;
  }
}

export type HeaderNavItem = {
  href: string;
  label: string;
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getLoadingClass(isActiveLink: boolean): string {
  return isActiveLink ? "header-loading-active" : "";
}

const Navigation = ({
  pathname,
  navItems,
  onAnchorNavigation,
  isTargetLoading,
}: {
  pathname: string;
  navItems: ReadonlyArray<HeaderNavItem>;
  onAnchorNavigation: (
    event: MouseEvent<HTMLElement>,
    href: string,
    target: string,
  ) => void;
  isTargetLoading: (target: string) => boolean;
}) => {
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    x: 0,
    opacity: 0,
  });

  const updateIndicator = useCallback(() => {
    const activeIndex = navItems.findIndex((item) =>
      isActive(pathname, item.href),
    );
    const activeEl = itemRefs.current[activeIndex];

    if (!activeEl) {
      setIndicatorStyle((previous) => ({ ...previous, opacity: 0 }));
      return;
    }

    setIndicatorStyle({
      width: activeEl.offsetWidth,
      x: activeEl.offsetLeft,
      opacity: 1,
    });
  }, [navItems, pathname]);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => updateIndicator());
    window.addEventListener("resize", updateIndicator);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

  return (
    <nav
      aria-label="Primary navigation"
      className="hidden md:flex rounded-full"
    >
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 z-10 rounded-full shadow-[0_0_0_1000px_rgba(255,255,255,0.8)]" />
        <GlassSurface
          className="w-auto h-auto relative"
          width="auto"
          height="auto"
          borderRadius={30}
        >
          <div className="relative flex items-center gap-2">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute h-full top-0 inset-y-1 left-0 rounded-full bg-background/80 transition-[transform,width,opacity] duration-300 ease-out"
              style={{
                width: indicatorStyle.width,
                transform: `translateX(${indicatorStyle.x}px)`,
                opacity: indicatorStyle.opacity,
              }}
            />
            {navItems.map((item, index) => {
              const active = isActive(pathname, item.href);
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  onClick={(event) =>
                    onAnchorNavigation(
                      event,
                      item.href,
                      `desktop-nav-${item.href}`,
                    )
                  }
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  aria-current={active ? "page" : undefined}
                  className={[
                    getDesktopNavLinkClass(active),
                    getLoadingClass(
                      isTargetLoading(`desktop-nav-${item.href}`),
                    ),
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-2 font-bold [text-shadow:0_0_0.5px_white,0_0_1px_white,0_0_1.5px_white]">
                    <NavItemIcon
                      href={item.href}
                      className="h-6 w-5 text-current [&_path]:fill-current"
                    />
                    <span>{item.label}</span>
                  </span>
                </NextLink>
              );
            })}
          </div>
        </GlassSurface>
      </div>
    </nav>
  );
};

export default Navigation;
