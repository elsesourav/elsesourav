/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AdminMarkdownEditor } from '../index';

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

describe('Admin Content Management — Markdown Editor & Live Preview', () => {
  it('renders with initial markdown value and counts words/characters', () => {
    const handleChange = vi.fn();
    const markdown = '## Release 1.0\nNew developer terminal features enabled.';

    const { container } = render(
      <AdminMarkdownEditor
        label="Changelog Notes"
        value={markdown}
        onChange={handleChange}
      />
    );

    expect(screen.getByText('Changelog Notes')).toBeDefined();
    expect(container.textContent).toContain('8 words');
    expect(container.textContent).toContain(`${markdown.length} characters`);
  });

  it('switches between Write and Preview tabs', () => {
    const handleChange = vi.fn();
    const markdown = '### Subsystem Architecture\n- Zero-trust RBAC\n- Next.js 15';

    render(
      <AdminMarkdownEditor
        label="Article Body"
        value={markdown}
        onChange={handleChange}
      />
    );

    // Initial state is 'Write' mode with textarea
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea).toBeDefined();
    expect(textarea.value).toBe(markdown);

    // Switch to 'Preview' tab
    const previewTab = screen.getByRole('tab', { name: /preview/i });
    act(() => {
      fireEvent.click(previewTab);
    });

    // In preview mode, rendered heading & list are visible
    expect(screen.getByRole('heading', { level: 3, name: 'Subsystem Architecture' })).toBeDefined();
    expect(screen.getByText('Zero-trust RBAC')).toBeDefined();
  });

  it('toggles the Markdown syntax cheat-sheet reference guide', () => {
    const handleChange = vi.fn();
    render(
      <AdminMarkdownEditor
        label="Guide Content"
        value=""
        onChange={handleChange}
      />
    );

    const guideBtn = screen.getByRole('button', { name: /guide/i });
    expect(screen.queryByText(/Markdown Syntax Reference/i)).toBeNull();

    act(() => {
      fireEvent.click(guideBtn);
    });

    expect(screen.getByText(/Markdown Syntax Reference/i)).toBeDefined();
  });

  it('shows empty preview state when content is blank', () => {
    const handleChange = vi.fn();
    render(
      <AdminMarkdownEditor
        label="Guide Content"
        value=""
        onChange={handleChange}
      />
    );

    const previewTab = screen.getByRole('tab', { name: /preview/i });
    act(() => {
      fireEvent.click(previewTab);
    });

    expect(screen.getByText(/Nothing to preview yet/i)).toBeDefined();
  });
});
