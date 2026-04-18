import { cn } from "@/lib/cn";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  markdown: string;
  className?: string;
  allowRawHtml?: boolean;
};

const markdownContentClassName =
  "prose prose-slate max-w-none text-sm leading-7 " +
  "prose-headings:ui-text-heading prose-p:ui-text-primary " +
  "prose-strong:ui-text-heading " +
  "prose-a:text-[color-mix(in_srgb,var(--brand-secondary)_82%,var(--foreground)_18%)] " +
  "prose-code:rounded prose-code:bg-black/5 prose-code:px-1 prose-code:py-0.5 " +
  "prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:border-black/10 " +
  "prose-pre:bg-[#0f172a] prose-pre:text-[#e2e8f0] " +
  "[&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_h4]:text-lg " +
  "[&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-black/15 " +
  "[&_hr]:my-4 [&_hr]:border-black/15 " +
  "[&_ul[data-type='taskList']]:list-none [&_ul[data-type='taskList']]:pl-0 " +
  "[&_ul[data-type='taskList']_li]:my-1 [&_ul[data-type='taskList']_li]:flex " +
  "[&_ul[data-type='taskList']_li]:items-start [&_ul[data-type='taskList']_li]:gap-2 " +
  "[&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-black/15 " +
  "[&_td]:p-2 [&_th]:border [&_th]:border-black/15 " +
  "[&_th]:bg-[color-mix(in_srgb,var(--brand-secondary)_14%,var(--background)_86%)] [&_th]:p-2 [&_th]:text-left";

function isLikelyHtmlContent(content: string): boolean {
  const trimmed = content.trim();

  if (!trimmed) {
    return false;
  }

  return /<[a-z][\s\S]*>/i.test(trimmed);
}

export function MarkdownContent({
  markdown,
  className,
  allowRawHtml = true,
}: MarkdownContentProps) {
  if (allowRawHtml && isLikelyHtmlContent(markdown)) {
    return (
      <div
        className={cn(markdownContentClassName, className)}
        dangerouslySetInnerHTML={{ __html: markdown }}
      />
    );
  }

  return (
    <div className={cn(markdownContentClassName, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={allowRawHtml ? [rehypeRaw] : undefined}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
