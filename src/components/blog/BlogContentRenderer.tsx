import React from 'react';
import './BlogContentRenderer.css';

interface BlogContentRendererProps {
  content: string;
  className?: string;
}

/**
 * Checks if a URL is safe for href or src attribute.
 * Only http, https, mailto, or relative root paths are allowed.
 * Blocks javascript:, data:, vbscript:, etc.
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();

  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return false;
  }

  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('#')
  );
}

/**
 * Parses inline formatting: bold (**), italic (*), code (`), links ([text](url))
 * Returns safe React nodes.
 */
function renderInlineFormatting(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Tokenizer regex matching links, images, code, bold, italic
  const tokenRegex = /(!?\[([^\]]*)\]\(([^)]+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      nodes.push(text.substring(lastIndex, match.index));
    }

    const fullMatch = match[0];
    const isLinkOrImg = match[1];
    const linkText = match[2] || '';
    const rawLinkUrl = match[3] || '';
    const isCode = match[4];
    const codeText = match[5] || '';
    const isBold = match[6];
    const boldText = match[7] || '';
    const isItalic = match[8];
    const italicText = match[9] || '';

    if (isLinkOrImg) {
      if (fullMatch.startsWith('!')) {
        // Image
        if (isSafeUrl(rawLinkUrl)) {
          nodes.push(
            <span key={`img-${keyIndex++}`} className="blog-image-wrapper">
              <img
                src={rawLinkUrl}
                alt={linkText || 'Blog image'}
                className="blog-image"
                loading="lazy"
              />
              {linkText && <span className="blog-image-caption">{linkText}</span>}
            </span>
          );
        } else {
          nodes.push(`[Unsafe Image URL: ${linkText}]`);
        }
      } else {
        // Link
        if (isSafeUrl(rawLinkUrl)) {
          const isExternal = rawLinkUrl.startsWith('http://') || rawLinkUrl.startsWith('https://');
          nodes.push(
            <a
              key={`link-${keyIndex++}`}
              href={rawLinkUrl}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
            >
              {linkText || rawLinkUrl}
            </a>
          );
        } else {
          nodes.push(linkText || rawLinkUrl);
        }
      }
    } else if (isCode) {
      nodes.push(
        <code key={`code-${keyIndex++}`} className="blog-inline-code">
          {codeText}
        </code>
      );
    } else if (isBold) {
      nodes.push(<strong key={`bold-${keyIndex++}`}>{boldText}</strong>);
    } else if (isItalic) {
      nodes.push(<em key={`italic-${keyIndex++}`}>{italicText}</em>);
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Append remaining text
  if (lastIndex < text.length) {
    nodes.push(text.substring(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

export const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({
  content,
  className = '',
}) => {
  if (!content || !content.trim()) {
    return <div className={`blog-content-renderer ${className}`} />;
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';
  let inList: 'ul' | 'ol' | null = null;
  let listItems: React.ReactNode[] = [];
  let elementKey = 0;

  const flushList = () => {
    if (inList === 'ul') {
      elements.push(<ul key={`ul-${elementKey++}`}>{listItems}</ul>);
    } else if (inList === 'ol') {
      elements.push(<ol key={`ol-${elementKey++}`}>{listItems}</ol>);
    }
    inList = null;
    listItems = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i] ?? '';
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    // Check code block fences
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <pre key={`pre-${elementKey++}`} className="blog-code-block">
            <code className={codeBlockLang ? `language-${codeBlockLang}` : undefined}>
              {codeBlockContent.join('\n')}
            </code>
          </pre>
        );
        inCodeBlock = false;
        codeBlockContent = [];
        codeBlockLang = '';
      } else {
        flushList();
        inCodeBlock = true;
        codeBlockLang = trimmed.substring(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(rawLine);
      continue;
    }

    // Empty lines flush active lists
    if (!trimmed) {
      flushList();
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList();
      elements.push(<hr key={`hr-${elementKey++}`} />);
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={`h1-${elementKey++}`}>{renderInlineFormatting(trimmed.substring(2))}</h1>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${elementKey++}`}>{renderInlineFormatting(trimmed.substring(3))}</h2>
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${elementKey++}`}>{renderInlineFormatting(trimmed.substring(4))}</h3>
      );
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      flushList();
      elements.push(
        <h4 key={`h4-${elementKey++}`}>{renderInlineFormatting(trimmed.substring(5))}</h4>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={`quote-${elementKey++}`}>
          {renderInlineFormatting(trimmed.substring(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered List
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (inList !== 'ul') {
        flushList();
        inList = 'ul';
      }
      listItems.push(
        <li key={`li-${elementKey++}`}>{renderInlineFormatting(trimmed.substring(2))}</li>
      );
      continue;
    }

    // Ordered List
    const olMatch = /^(\d+)\.\s+(.*)$/.exec(trimmed);
    if (olMatch && olMatch[2] !== undefined) {
      if (inList !== 'ol') {
        flushList();
        inList = 'ol';
      }
      listItems.push(<li key={`li-${elementKey++}`}>{renderInlineFormatting(olMatch[2])}</li>);
      continue;
    }

    // Paragraph
    flushList();
    elements.push(<p key={`p-${elementKey++}`}>{renderInlineFormatting(line)}</p>);
  }

  // Flush any trailing list or code block
  flushList();
  if (inCodeBlock) {
    elements.push(
      <pre key={`pre-${elementKey++}`} className="blog-code-block">
        <code>{codeBlockContent.join('\n')}</code>
      </pre>
    );
  }

  return <div className={`blog-content-renderer ${className}`}>{elements}</div>;
};
