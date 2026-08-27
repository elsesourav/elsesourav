import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Image } from '../Image';

describe('Image Component', () => {
  it('1. Renders image element with valid src, alt, and default lazy loading', () => {
    render(
      <Image
        src="https://cdn.elsesourav.com/app.png"
        alt="CodeFlow IDE"
        width={100}
        height={100}
      />
    );

    const img = screen.getByRole('img', { name: 'CodeFlow IDE' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://cdn.elsesourav.com/app.png');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('2. Uses eager loading and high fetchPriority when priority={true}', () => {
    render(
      <Image
        src="https://cdn.elsesourav.com/hero.png"
        alt="Hero Image"
        priority={true}
      />
    );

    const img = screen.getByRole('img', { name: 'Hero Image' });
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('fetchPriority', 'high');
  });

  it('3. Renders skeleton placeholder while loading', () => {
    const { container } = render(
      <Image
        src="https://cdn.elsesourav.com/slow-image.png"
        alt="Slow Image"
      />
    );

    expect(container.querySelector('.ui-image-skeleton')).toBeInTheDocument();
  });

  it('4. Removes skeleton and fires onLoad callback when image completes loading', () => {
    const handleLoad = vi.fn();
    const { container } = render(
      <Image
        src="https://cdn.elsesourav.com/fast-image.png"
        alt="Fast Image"
        onLoad={handleLoad}
      />
    );

    const img = screen.getByRole('img', { name: 'Fast Image' });
    fireEvent.load(img);

    expect(handleLoad).toHaveBeenCalled();
    expect(container.querySelector('.ui-image-skeleton')).toBeNull();
  });

  it('5. Renders fallback and fires onError when image fails to load', () => {
    const handleError = vi.fn();
    render(
      <Image
        src="https://cdn.elsesourav.com/broken.png"
        alt="Broken Image"
        fallbackText="Failed to load preview"
        onError={handleError}
      />
    );

    const img = screen.getByRole('img', { name: 'Broken Image' });
    fireEvent.error(img);

    expect(handleError).toHaveBeenCalled();
    expect(screen.getByText('Failed to load preview')).toBeInTheDocument();
  });

  it('6. Automatically renders fallback when src is missing or null without rendering broken img', () => {
    render(<Image src={null} alt="Missing Image" fallbackText="No Image Available" />);

    expect(screen.queryByRole('img', { name: 'Missing Image' })).toBeInTheDocument(); // Container has role="img"
    expect(screen.getByText('No Image Available')).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull(); // No native <img> rendered
  });

  it('7. Rejects unsafe protocols (javascript:, data:) and renders fallback', () => {
    render(<Image src="javascript:alert(1)" alt="Malicious Scheme" fallbackText="Unsafe Source" />);

    expect(screen.getByText('Unsafe Source')).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
  });

  it('8. Supports custom fallback component', () => {
    render(
      <Image
        src={null}
        alt="Custom Fallback"
        fallback={<div data-testid="custom-fallback">Custom Media Missing</div>}
      />
    );

    expect(screen.getByTestId('custom-fallback')).toHaveTextContent('Custom Media Missing');
  });

  it('9. Preserves container aspect-ratio style to prevent layout shifts', () => {
    const { container } = render(
      <Image
        src="https://cdn.elsesourav.com/aspect.png"
        alt="Aspect Ratio Test"
        aspectRatio="16/9"
      />
    );

    const wrapper = container.querySelector('.ui-image-container');
    expect(wrapper).toHaveStyle({ aspectRatio: '16/9' });
  });
});
