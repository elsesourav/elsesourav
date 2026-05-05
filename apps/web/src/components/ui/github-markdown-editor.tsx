"use client";

import MDEditor from "@uiw/react-md-editor";
import { useEffect, useState } from "react";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

type GithubMarkdownEditorProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
};

export function GithubMarkdownEditor({
  id,
  value,
  onChange,
  placeholder,
  height = 420,
}: GithubMarkdownEditorProps) {
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
      className="ui-markdown-surface wmde-markdown-var bg-transparent! rounded-3xl p-3"
    >
      <MDEditor
        textareaProps={{
          id,
          placeholder,
          name: id,
        }}
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        height={height}
        previewOptions={{
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeRaw],
        }}
        preview="live"
        className="border-0!"
      />
    </div>
  );
}
