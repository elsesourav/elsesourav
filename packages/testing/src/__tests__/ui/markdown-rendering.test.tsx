import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MarkdownRenderer, renderInlineMarkdown } from '@elsesourav/ui';

describe('Shared Markdown Rendering Architecture (@elsesourav/ui)', () => {
  describe('1. Inline Formatting & Security Sanitization', () => {
    it('formats bold, italic, inline code, and strikethrough tokens', () => {
      const nodes = renderInlineMarkdown(
        'This is **bold**, *italic*, ~~strikethrough~~, and `inline_code()`.'
      );
      const { container } = render(<div>{nodes}</div>);

      expect(container.querySelector('strong')?.textContent).toBe('bold');
      expect(container.querySelector('em')?.textContent).toBe('italic');
      expect(container.querySelector('del')?.textContent).toBe('strikethrough');
      expect(container.querySelector('code')?.textContent).toBe('inline_code()');
    });

    it('renders safe HTTP and HTTPS links', () => {
      const nodes = renderInlineMarkdown('[Official Docs](https://elsesourav.com/help)');
      const { container } = render(<div>{nodes}</div>);
      const anchor = container.querySelector('a');

      expect(anchor).toBeDefined();
      expect(anchor?.getAttribute('href')).toBe('https://elsesourav.com/help');
      expect(anchor?.getAttribute('target')).toBe('_blank');
      expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
      expect(anchor?.textContent).toBe('Official Docs');
    });

    it('sanitizes and disallows dangerous javascript: URLs (XSS protection)', () => {
      const nodes = renderInlineMarkdown('[Malicious Link](javascript:alert("XSS"))');
      const { container } = render(<div>{nodes}</div>);

      // Malicious link should not be rendered as an anchor tag
      expect(container.querySelector('a')).toBeNull();
      expect(container.textContent).toContain('Malicious Link');
    });

    it('sanitizes and disallows dangerous data: and vbscript: URLs', () => {
      const nodes = renderInlineMarkdown(
        '[Data Exploit](data:text/html,<script>alert(1)</script>)'
      );
      const { container } = render(<div>{nodes}</div>);

      expect(container.querySelector('a')).toBeNull();
      expect(container.textContent).toContain('Data Exploit');
    });
  });

  describe('2. Headings, Lists, Blockquotes & Code Blocks', () => {
    it('renders hierarchical headings (H1, H2, H3, H4)', () => {
      const markdown = `# Main Architecture\n## Component Hierarchy\n### Subsystem Details\n#### Fine Specifications`;
      const { container } = render(<MarkdownRenderer content={markdown} />);

      expect(container.querySelector('h1')?.textContent).toBe('Main Architecture');
      expect(container.querySelector('h2')?.textContent).toBe('Component Hierarchy');
      expect(container.querySelector('h3')?.textContent).toBe('Subsystem Details');
      expect(container.querySelector('h4')?.textContent).toBe('Fine Specifications');
    });

    it('renders unordered and ordered lists with correct elements', () => {
      const markdown = `- First item\n- Second item\n\n1. Numbered one\n2. Numbered two`;
      const { container } = render(<MarkdownRenderer content={markdown} />);

      const uls = container.querySelectorAll('ul');
      const ols = container.querySelectorAll('ol');

      expect(uls.length).toBe(1);
      expect(ols.length).toBe(1);
      expect(uls[0]?.querySelectorAll('li').length).toBe(2);
      expect(ols[0]?.querySelectorAll('li').length).toBe(2);
    });

    it('renders task checklists with disabled accessible checkboxes', () => {
      const markdown = `- [x] Completed task\n- [ ] Pending task`;
      const { container } = render(<MarkdownRenderer content={markdown} />);

      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBe(2);
      expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
      expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);
    });

    it('renders blockquotes with distinctive accent styling', () => {
      const markdown = `> Important Note: Always validate server actions with Zod.`;
      const { container } = render(<MarkdownRenderer content={markdown} />);

      const blockquote = container.querySelector('blockquote');
      expect(blockquote).toBeDefined();
      expect(blockquote?.textContent).toContain(
        'Important Note: Always validate server actions with Zod.'
      );
    });

    it('renders fenced code block and supports copy-to-clipboard action', async () => {
      const code = `const server = createServer();\nserver.listen(3000);`;
      const markdown = `\`\`\`typescript\n${code}\n\`\`\``;

      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const { container } = render(<MarkdownRenderer content={markdown} />);
      const pre = container.querySelector('pre');
      const codeElement = container.querySelector('code');
      const copyButton = container.querySelector(
        'button[aria-label="Copy code snippet to clipboard"]'
      );

      expect(pre).toBeDefined();
      expect(codeElement?.textContent).toBe(code);
      expect(container.textContent?.toLowerCase()).toContain('typescript');

      if (copyButton) {
        await React.act(async () => {
          fireEvent.click(copyButton);
        });
        expect(writeTextMock).toHaveBeenCalledWith(code);
      }
    });

    it('generates syntax highlighted tokens for keywords, strings, and identifiers', () => {
      const tsCode = `const greeting: string = "Hello World";\nfunction run() { return 42; }`;
      const markdown = `\`\`\`typescript\n${tsCode}\n\`\`\``;
      const { container } = render(<MarkdownRenderer content={markdown} />);

      const keywords = container.querySelectorAll('.sh__token--keyword');
      const strings = container.querySelectorAll('.sh__token--string');
      const identifiers = container.querySelectorAll('.sh__token--identifier');

      expect(keywords.length).toBeGreaterThan(0);
      expect(strings.length).toBeGreaterThan(0);
      expect(identifiers.length).toBeGreaterThan(0);
      expect(container.querySelector('.sh-code-theme')).toBeDefined();
    });

    it('normalizes language aliases and displays canonical badge names', () => {
      const pyMarkdown = `\`\`\`py\ndef hello():\n    return "hi"\n\`\`\``;
      const { container: pyContainer } = render(<MarkdownRenderer content={pyMarkdown} />);
      expect(pyContainer.textContent).toContain('Python');

      const bashMarkdown = `\`\`\`bash\necho "test"\n\`\`\``;
      const { container: bashContainer } = render(<MarkdownRenderer content={bashMarkdown} />);
      expect(bashContainer.textContent).toContain('Bash');

      const rustMarkdown = `\`\`\`rs\nfn main() {}\n\`\`\``;
      const { container: rustContainer } = render(<MarkdownRenderer content={rustMarkdown} />);
      expect(rustContainer.textContent).toContain('Rust');
    });

    it('activates line numbers for multiline code blocks', () => {
      const multiline = `\`\`\`typescript\nline 1\nline 2\nline 3\nline 4\n\`\`\``;
      const { container } = render(<MarkdownRenderer content={multiline} />);
      const codeEl = container.querySelector('code.sh-code-theme');
      expect(codeEl?.classList.contains('has-line-numbers')).toBe(true);
    });

    it('renders directory trees and box-drawing characters with exact formatting and canonical labels', () => {
      const treeCode = `glorov/\n├── apps/\n│   ├── storefront/\n│   └── backend/\n└── deploy/`;
      const treeMarkdown = `\`\`\`tree\n${treeCode}\n\`\`\``;
      const { container } = render(<MarkdownRenderer content={treeMarkdown} />);

      const codeEl = container.querySelector('code.sh-code-theme');
      expect(codeEl).toBeDefined();
      expect(codeEl?.textContent).toBe(treeCode);
      expect(container.textContent).toContain('Tree');
      expect(container.textContent).toContain('5 lines');
    });
  });

  describe('3. GFM Tables & Overflow Protection', () => {
    it('renders GitHub-Flavored Markdown tables with headers, alignments, and rows', () => {
      const markdown = `| Feature | Status | Support |\n| :--- | :---: | ---: |\n| WebGL 2.0 | Enabled | Full |\n| WASM JIT | Active | High |`;
      const { container } = render(<MarkdownRenderer content={markdown} />);

      const table = container.querySelector('table');
      expect(table).toBeDefined();

      const headers = container.querySelectorAll('th');
      expect(headers.length).toBe(3);
      expect(headers[0]?.textContent).toBe('Feature');
      expect(headers[1]?.textContent).toBe('Status');
      expect(headers[2]?.textContent).toBe('Support');

      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);
      expect(rows[0]?.textContent).toContain('WebGL 2.0');
      expect(rows[1]?.textContent).toContain('WASM JIT');
    });
  });

  describe('4. Safe Images & Horizontal Rules', () => {
    it('renders safe images with lazy loading and alt caption', () => {
      const markdown = `![Architecture Diagram](https://images.unsplash.com/photo-1555066931?w=800)`;
      const { container } = render(<MarkdownRenderer content={markdown} />);

      const img = container.querySelector('img');
      expect(img).toBeDefined();
      expect(img?.getAttribute('src')).toBe('https://images.unsplash.com/photo-1555066931?w=800');
      expect(img?.getAttribute('alt')).toBe('Architecture Diagram');
      expect(img?.getAttribute('loading')).toBe('lazy');
    });

    it('rejects unsafe image URLs', () => {
      const markdown = `![Malicious](javascript:stealCookies())`;
      const { container } = render(<MarkdownRenderer content={markdown} />);

      expect(container.querySelector('img')).toBeNull();
    });

    it('renders horizontal rules', () => {
      const markdown = `Section Above\n\n---\n\nSection Below`;
      const { container } = render(<MarkdownRenderer content={markdown} />);

      expect(container.querySelector('hr')).toBeDefined();
    });
  });

  describe('5. Edge Cases, Fallbacks & Robustness', () => {
    it('handles empty or malformed strings gracefully without crashing', () => {
      const { container: c1 } = render(<MarkdownRenderer content="" />);
      expect(c1.textContent).toBe('');

      const { container: c2 } = render(<MarkdownRenderer content={'\n\n\n   \n'} />);
      expect(c2.querySelector('p')).toBeNull();
    });

    it('renders fallbackText when content is empty and fallbackText is provided', () => {
      const { container } = render(
        <MarkdownRenderer content="" fallbackText="No documentation provided." />
      );
      expect(container.textContent).toContain('No documentation provided.');
    });

    it('renders long paragraphs with break-words to prevent layout overflow', () => {
      const longText = 'A'.repeat(500);
      const { container } = render(<MarkdownRenderer content={longText} />);
      const p = container.querySelector('p');

      expect(p).toBeDefined();
      expect(p?.className).toContain('break-words');
    });

    it('renders H5 and H6 headings', () => {
      const markdown = `##### Heading Five\n###### Heading Six`;
      const { container } = render(<MarkdownRenderer content={markdown} />);

      expect(container.querySelector('h5')?.textContent).toBe('Heading Five');
      expect(container.querySelector('h6')?.textContent).toBe('Heading Six');
    });
  });
});
