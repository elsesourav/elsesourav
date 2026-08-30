import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as React from 'react';
import { render } from '@testing-library/react';
import { Reveal, RevealGroup } from '@elsesourav/ui';

describe('Global Scroll-Reveal Motion System', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children content immediately without hiding for SSR/accessibility', () => {
    const { container } = render(
      <Reveal>
        <h2>Featured System Project</h2>
      </Reveal>
    );

    const heading = container.querySelector('h2');
    expect(heading).not.toBeNull();
    expect(heading?.textContent).toBe('Featured System Project');
  });

  it('applies custom className and custom tag element to Reveal container', () => {
    const { container } = render(
      <Reveal as="section" className="custom-section-class" data-testid="reveal-section">
        <p>Section Content</p>
      </Reveal>
    );

    const section = container.querySelector('section');
    expect(section).not.toBeNull();
    expect(section?.className).toContain('custom-section-class');
    expect(section?.className).toContain('reveal-container');
  });

  it('renders RevealGroup with staggered child delays', () => {
    const { container } = render(
      <RevealGroup staggerDelay={0.1} baseDelay={0.05} data-testid="reveal-group">
        <div>Item 01</div>
        <div>Item 02</div>
        <div>Item 03</div>
      </RevealGroup>
    );

    expect(container.textContent).toContain('Item 01');
    expect(container.textContent).toContain('Item 02');
    expect(container.textContent).toContain('Item 03');
  });

  it('renders with fade direction without throwing errors', () => {
    const { container } = render(
      <Reveal direction="fade" distance={0}>
        <span>Fade In Content</span>
      </Reveal>
    );

    expect(container.textContent).toContain('Fade In Content');
  });
});

