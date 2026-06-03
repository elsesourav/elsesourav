"use client";

import { cn } from "@/lib/cn";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useEffect, useState } from "react";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  markdown: string;
  className?: string;
  allowRawHtml?: boolean;
};

const markdownContentClassName = "max-w-none text-sm leading-7";

export function MarkdownContent({
  markdown,
  className,
  allowRawHtml = true,
}: MarkdownContentProps) {
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;

    const syncColorMode = () => {
      const mode = root.dataset.colorMode === "dark" ? "dark" : "light";
      setColorMode(mode);
    };

    syncColorMode();

    const observer = new MutationObserver(syncColorMode);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-color-mode"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      data-color-mode={colorMode}
      className={cn(
        "ui-markdown-surface wmde-markdown-var",
        markdownContentClassName,
        className,
      )}
    >
      <MarkdownPreview
        source={markdown}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={allowRawHtml ? [rehypeRaw, rehypeSlug] : [rehypeSlug]}
        wrapperElement={{ "data-color-mode": colorMode }}
        components={{
          // @ts-expect-error - Custom callout tag handled by rehypeRaw
          callout: ({ children, type, ...rest }: any) => {
            const isWarning = type === "warning";
            const isDanger = type === "danger";
            const isInfo = type === "info";
            
            return (
              <div
                {...rest}
                className={cn(
                  "my-4 rounded-xl border p-4 text-sm",
                  isWarning && "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200",
                  isDanger && "border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-200",
                  isInfo && "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200",
                  !isWarning && !isDanger && !isInfo && "border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                )}
              >
                {children}
              </div>
            );
          },
        }}
      />
    </div>
  );
}
