import NextLink from "next/link";
import { forwardRef } from "react";
import { createPortal } from "react-dom";

type SearchPanelMode = "text" | "rich";

type SearchPanelItem = {
  type: "app";
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  href: string;
};

type SearchResultsPanelProps = {
  isOpen: boolean;
  mode: SearchPanelMode;
  items: SearchPanelItem[];
  position: {
    top: number;
    left: number;
    width: number;
  };
  onClose: () => void;
};

const SearchResultsPanel = forwardRef<HTMLDivElement, SearchResultsPanelProps>(
  ({ isOpen, mode, items, position, onClose }, ref) => {
    if (!isOpen) {
      return null;
    }

    if (typeof document === "undefined") {
      return null;
    }

    return createPortal(
      <div
        ref={ref}
        className="fixed z-50 rounded-2xl border border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] bg-white p-3 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.5)]"
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
        }}
      >
        {items.length === 0 ? (
          <p className="px-2 py-3 text-xs font-semibold text-[color-mix(in_srgb,var(--foreground)_60%,var(--background)_40%)]">
            No matches yet. Try a different keyword.
          </p>
        ) : mode === "text" ? (
          <div className="grid gap-1">
            {items.map((result) => (
              <NextLink
                key={`${result.type}-${result.id}`}
                href={result.href}
                className="flex items-center justify-between rounded-xl px-2 py-2 text-xs font-semibold text-foreground transition hover:bg-[color-mix(in_srgb,var(--background)_92%,white_8%)]"
                onClick={onClose}
              >
                <span className="truncate">{result.title}</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--foreground)_55%,var(--background)_45%)]">
                  App
                </span>
              </NextLink>
            ))}
          </div>
        ) : (
          <div className="grid gap-2">
            {items.map((result) => (
              <NextLink
                key={`${result.type}-${result.id}`}
                href={result.href}
                className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 text-xs font-semibold text-foreground transition hover:border-[color-mix(in_srgb,var(--foreground)_16%,transparent)] hover:bg-[color-mix(in_srgb,var(--background)_92%,white_8%)]"
                onClick={onClose}
              >
                <img
                  src={result.imageUrl ?? "/img/icon.png"}
                  alt=""
                  className="h-10 w-16 rounded-lg object-cover"
                />
                <div>
                  <p className="text-sm text-foreground">{result.title}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--foreground)_55%,var(--background)_45%)]">
                    App
                  </p>
                </div>
              </NextLink>
            ))}
          </div>
        )}
      </div>,
      document.body,
    );
  },
);

SearchResultsPanel.displayName = "SearchResultsPanel";

export default SearchResultsPanel;
