import AboutIcon from "@/components/icons/AboutIcon";
import AppsIcon from "@/components/icons/AppsIcon";
import CrossIcon from "@/components/icons/CrossIcon";
import FilterIcon from "@/components/icons/FilterIcon";
import HelpAndSupportIcon from "@/components/icons/HelpAndSupportIcon";
import HomeIcon from "@/components/icons/HomeIcon";
import SearchIcon from "@/components/icons/SearchIcon";
import SearchResultsPanel from "@/components/search/SearchResultsPanel";
import { registerShortcut } from "@/lib/shortcut";
import { useDeviceInfo } from "@/lib/useDeviceInfo";
import InputBase from "@mui/material/InputBase";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import NextLink from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import PostIcon from "../icons/PostIcon";

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
    case "/posts":
      return <PostIcon className={className} />;
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

type SearchCategory = {
  id: string;
  name: string;
};

type SearchResultItem = {
  type: "app";
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  href: string;
};

type SearchResultsState = {
  mode: "text" | "rich";
  items: SearchResultItem[];
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
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchAreaRef = useRef<HTMLDivElement | null>(null);
  const resultsPanelRef = useRef<HTMLDivElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    x: 0,
    opacity: 0,
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [navWidth, setNavWidth] = useState(0);
  const { isMac, isMobile } = useDeviceInfo();
  const shortcutKeyLabel = isMobile ? (
    <span>Search</span>
  ) : isMac ? (
    <>
      <kbd>Cmd</kbd> + <kbd>K</kbd>
    </>
  ) : (
    <>
      <kbd>Ctrl</kbd> + <kbd>K</kbd>
    </>
  );
  const [categories, setCategories] = useState<SearchCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ANY");
  const [showShortcutKeys, setShowShortcutKeys] = useState(true);
  const [searchResults, setSearchResults] = useState<SearchResultsState>({
    mode: "text",
    items: [],
  });
  const [resultsStyle, setResultsStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const updateIndicator = useCallback(() => {
    if (searchOpen) {
      setIndicatorStyle((previous) => ({ ...previous, opacity: 0 }));
      return;
    }
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
  }, [navItems, pathname, searchOpen]);

  const syncNavWidth = useCallback(() => {
    if (!navItemsRef.current) {
      return;
    }
    const width = navItemsRef.current.getBoundingClientRect().width;
    if (width > 0) {
      setNavWidth(width);
    }
  }, []);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => updateIndicator());
    window.addEventListener("resize", updateIndicator);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

  useLayoutEffect(() => {
    syncNavWidth();
  }, [syncNavWidth, navItems.length]);

  useEffect(() => {
    if (searchOpen) {
      setShowShortcutKeys(false);
    }

    const unregister = registerShortcut({
      id: "search-toggle",
      key: "k",
      requireCtrlOrMeta: true,
      handler: (e) => {
        e.preventDefault();
        setSearchOpen((prev) => {
          if (!prev) {
            syncNavWidth();
          }
          return !prev;
        });
      },
    });

    const escUnregister = registerShortcut({
      id: "escape-close-search",
      key: "Escape",
      handler: () => setSearchOpen(false),
    });

    return () => {
      unregister();
      escUnregister();
    };
  }, []);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    searchInputRef.current?.focus();

    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const categoriesResponse = await fetch("/api/categories", {
          signal: controller.signal,
        });

        if (categoriesResponse.ok) {
          const payload = (await categoriesResponse.json()) as {
            data?: SearchCategory[];
          };
          setCategories(payload.data ?? []);
        }
      } catch {
        // Ignore fetch errors for lightweight search panel.
      }
    };

    fetchData();
    return () => controller.abort();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const isPointerFromSelectMenu = (event: PointerEvent) => {
      const path = event.composedPath();
      return path.some((node) => {
        if (!(node instanceof HTMLElement)) {
          return false;
        }

        return (
          node.classList.contains("MuiPopover-root") ||
          node.classList.contains("MuiMenu-paper") ||
          node.classList.contains("MuiMenuItem-root")
        );
      });
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!searchAreaRef.current) {
        return;
      }

      if (resultsPanelRef.current?.contains(event.target as Node)) {
        return;
      }

      if (isPointerFromSelectMenu(event)) {
        return;
      }

      if (!searchAreaRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const query = searchQuery.trim();
    if (!query) {
      setSearchResults({ mode: "text", items: [] });
      return;
    }

    const mode = query.length < 3 ? "text" : "rich";
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: query,
          limit: "5",
          mode,
        });

        if (selectedCategory !== "ANY") {
          params.set("categoryId", selectedCategory);
        }

        const response = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setSearchResults({ mode, items: [] });
          return;
        }

        const payload = (await response.json()) as {
          data?: SearchResultsState;
        };

        if (payload.data) {
          setSearchResults(payload.data);
        } else {
          setSearchResults({ mode, items: [] });
        }
      } catch {
        // Ignore fetch errors for lightweight search panel.
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [searchOpen, searchQuery, selectedCategory]);

  const syncResultsPosition = useCallback(() => {
    if (!searchAreaRef.current) {
      return;
    }

    const rect = searchAreaRef.current.getBoundingClientRect();
    if (!rect.width) {
      return;
    }

    setResultsStyle({
      top: rect.bottom + 12,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!searchOpen) {
      return;
    }

    syncResultsPosition();

    const resizeObserver = new ResizeObserver(() => {
      syncResultsPosition();
    });

    if (searchAreaRef.current) {
      resizeObserver.observe(searchAreaRef.current);
    }

    window.addEventListener("resize", syncResultsPosition);
    window.addEventListener("scroll", syncResultsPosition, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncResultsPosition);
      window.removeEventListener("scroll", syncResultsPosition, true);
    };
  }, [searchOpen, syncResultsPosition]);

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className="relative hidden md:flex rounded-full overflow-hidden p-1"
      >
        <div
          className="w-full h-full absolute top-0 left-0 bg-background/90"
          style={{
            filter: "blur(10px)",
          }}
        />

        <div className="relative">
          <div className="pointer-events-none absolute inset-0 z-10 rounded-full shadow--[0_0_0_1000px_rgba(255,255,255,0.8)]" />
          <div className="relative flex h-12 items-center">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute h-full top-0 inset-y-1 left-0 rounded-full bg-blue-500/40 transition-[transform,width,opacity] duration-300 ease-out"
              style={{
                width: indicatorStyle.width,
                transform: `translateX(${indicatorStyle.x}px)`,
                opacity: indicatorStyle.opacity,
              }}
            />
            <div
              ref={navItemsRef}
              className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ease-out ${
                searchOpen
                  ? "max-w-0 opacity-0 -translate-x-4 pointer-events-none"
                  : "max-w-180 opacity-100 translate-x-0"
              }`}
              style={{ width: searchOpen ? 0 : navWidth || undefined }}
              onTransitionEnd={(event) => {
                if (event.currentTarget !== event.target) {
                  return;
                }
                if (!searchOpen) {
                  setShowShortcutKeys(true);
                }
              }}
            >
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
                    <span className="inline-flex items-center gap-2 font-bold">
                      <NavItemIcon href={item.href} className="h-6 w-5" />
                      <span>{item.label}</span>
                    </span>
                  </NextLink>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  syncNavWidth();
                  setSearchOpen(true);
                }}
                className={getDesktopNavLinkClass(false)}
              >
                <span className="inline-flex items-center cursor-pointer gap-2 font-bold">
                  <SearchIcon className="h-5 w-5" />
                  {showShortcutKeys && shortcutKeyLabel}
                </span>
              </button>
            </div>

            <div
              ref={searchAreaRef}
              className={`relative flex min-w-0 items-center gap-2 overflow-hidden h-full transition-all duration-300 ease-out ${
                searchOpen
                  ? "w-180 opacity-100"
                  : "w-0 opacity-0 pointer-events-none"
              }`}
              style={{ width: searchOpen ? navWidth || undefined : 0 }}
            >
              <div className="relative flex-1 min-w-0">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <InputBase
                  inputRef={searchInputRef}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search apps, banners, categories"
                  className="h-10 w-full text-lg"
                  sx={{
                    width: "100%",
                    color:
                      "color-mix(in srgb, var(--foreground) 90%, var(--background) 10%)",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    "& .MuiInputBase-input": {
                      height: "2.5rem",
                      padding: "0 2.25rem 0 2.5rem",
                    },
                  }}
                />
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-[color-mix(in_srgb,var(--foreground)_60%,var(--background)_40%)] hover:bg-[color-mix(in_srgb,var(--background)_92%,white_8%)]"
                >
                  <CrossIcon className="h-4 w-4 [&_path]:fill-red-600" />
                </button>
              </div>
              <label className="inline-flex h-10 items-center gap-2 px-1 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/80">
                <FilterIcon className="h-4 w-4" />
                <Select
                  value={selectedCategory}
                  onChange={(event: SelectChangeEvent) =>
                    setSelectedCategory(event.target.value)
                  }
                  variant="standard"
                  disableUnderline
                  className="*:text-xs! font-semibold normal-case tracking-[0.12em]"
                  sx={{
                    color:
                      "color-mix(in srgb, var(--foreground) 80%, var(--background) 20%)",
                    "& .MuiSelect-select": {
                      paddingRight: "1rem",
                      paddingLeft: 0,
                      minHeight: "auto",
                    },
                    "& .MuiSelect-icon": {
                      color: "currentColor",
                    },
                  }}
                >
                  <MenuItem value="ANY">Anything</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </label>
              {/* Close button removed; search auto-closes on outside click or Escape */}
            </div>
          </div>
        </div>
      </nav>

      <SearchResultsPanel
        ref={resultsPanelRef}
        isOpen={searchOpen && searchQuery.trim().length > 0}
        mode={searchResults.mode}
        items={searchResults.items}
        position={resultsStyle}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
};

export default Navigation;
