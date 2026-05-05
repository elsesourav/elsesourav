"use client";

import { cn } from "@/lib/cn";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useEffect, useState } from "react";
import rehypeRaw from "rehype-raw";
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
        rehypePlugins={allowRawHtml ? [rehypeRaw] : undefined}
        wrapperElement={{ "data-color-mode": colorMode }}
      />
    </div>
  );
}
