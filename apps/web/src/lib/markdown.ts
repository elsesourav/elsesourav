const codeFenceRegex = /```[\s\S]*?```/g;
const inlineCodeRegex = /`([^`]+)`/g;
const imageRegex = /!\[([^\]]*)\]\([^)]*\)/g;
const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
const htmlTagRegex = /<[^>]+>/g;
const headingRegex = /^#{1,6}\s+/gm;
const unorderedListRegex = /^\s*[-*+]\s+/gm;
const orderedListRegex = /^\s*\d+\.\s+/gm;
const blockquoteRegex = /^\s*>\s?/gm;
const markdownDecorationRegex = /(\*\*|__|\*|_|~~)/g;
const whitespaceRegex = /\s+/g;

export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(codeFenceRegex, " ")
    .replace(inlineCodeRegex, "$1")
    .replace(imageRegex, "$1")
    .replace(linkRegex, "$1")
    .replace(htmlTagRegex, " ")
    .replace(headingRegex, "")
    .replace(unorderedListRegex, "")
    .replace(orderedListRegex, "")
    .replace(blockquoteRegex, "")
    .replace(markdownDecorationRegex, "")
    .replace(whitespaceRegex, " ")
    .trim();
}

export function markdownExcerpt(
  markdown: string,
  maxLength: number,
  fallback = "",
): string {
  const normalized = markdownToPlainText(markdown);

  if (!normalized) {
    return fallback;
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}
