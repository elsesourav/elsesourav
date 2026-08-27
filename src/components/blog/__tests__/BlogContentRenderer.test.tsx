import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlogContentRenderer, isSafeUrl } from '../BlogContentRenderer';

describe('BlogContentRenderer & Content Safety', () => {
  it('1. isSafeUrl validates URLs securely and rejects javascript/data schemes', () => {
    expect(isSafeUrl('https://elsesourav.com')).toBe(true);
    expect(isSafeUrl('http://example.com/image.png')).toBe(true);
    expect(isSafeUrl('/apps/codeflow')).toBe(true);
    expect(isSafeUrl('#section')).toBe(true);

    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeUrl('JAVASCRIPT:evil()')).toBe(false);
    expect(isSafeUrl('data:text/html;base64,PHNjcmlwdD4=')).toBe(false);
    expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
  });

  it('2. Renders headings H1, H2, H3, and blockquotes', () => {
    const markdown = `# Main Title\n## Section Subtitle\n### Deep Topic\n> Important quote here`;
    render(<BlogContentRenderer content={markdown} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Main Title' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Section Subtitle' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Deep Topic' })).toBeInTheDocument();
    expect(screen.getByText('Important quote here')).toBeInTheDocument();
  });

  it('3. Renders bold, italic, and inline code formatting', () => {
    const markdown = `This is **bold text**, this is *italic text*, and this is \`const x = 42;\`.`;
    render(<BlogContentRenderer content={markdown} />);

    expect(screen.getByText('bold text')).toBeInTheDocument();
    expect(screen.getByText('italic text')).toBeInTheDocument();
    expect(screen.getByText('const x = 42;')).toBeInTheDocument();
  });

  it('4. Renders ordered and unordered lists', () => {
    const markdown = `- First bullet\n- Second bullet\n\n1. Numbered one\n2. Numbered two`;
    render(<BlogContentRenderer content={markdown} />);

    expect(screen.getByText('First bullet')).toBeInTheDocument();
    expect(screen.getByText('Second bullet')).toBeInTheDocument();
    expect(screen.getByText('Numbered one')).toBeInTheDocument();
    expect(screen.getByText('Numbered two')).toBeInTheDocument();
  });

  it('5. Renders fenced code blocks', () => {
    const markdown = '```typescript\nfunction hello(): string {\n  return "world";\n}\n```';
    render(<BlogContentRenderer content={markdown} />);

    expect(screen.getByText(/function hello\(\): string/)).toBeInTheDocument();
  });

  it('6. Renders safe links with external target attributes and blocks malicious links', () => {
    const markdown = `Check [Safe Link](https://elsesourav.com) and [Evil Link](javascript:alert(1)).`;
    render(<BlogContentRenderer content={markdown} />);

    const safeLink = screen.getByRole('link', { name: 'Safe Link' });
    expect(safeLink).toHaveAttribute('href', 'https://elsesourav.com');
    expect(safeLink).toHaveAttribute('target', '_blank');
    expect(safeLink).toHaveAttribute('rel', 'noopener noreferrer');

    expect(screen.queryByRole('link', { name: 'Evil Link' })).toBeNull();
    expect(screen.getByText(/Evil Link/)).toBeInTheDocument();
  });

  it('7. Renders safe images and prevents unsafe image URLs', () => {
    const markdown = `![Hero Cover](https://cdn.elsesourav.com/cover.png)\n\n![Bad Img](javascript:void(0))`;
    render(<BlogContentRenderer content={markdown} />);

    const img = screen.getByAltText('Hero Cover');
    expect(img).toHaveAttribute('src', 'https://cdn.elsesourav.com/cover.png');
    expect(screen.queryByAltText('Bad Img')).toBeNull();
  });

  it('8. Escapes raw HTML to prevent XSS script injection', () => {
    const malicious = `<script>alert("XSS")</script><img src="x" onerror="alert(1)" />`;
    render(<BlogContentRenderer content={markdownLine(malicious)} />);

    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('img[onerror]')).toBeNull();
  });
});

function markdownLine(text: string): string {
  return text;
}
