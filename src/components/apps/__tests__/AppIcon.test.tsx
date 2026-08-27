import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppIcon } from '../AppIcon';

describe('AppIcon Component', () => {
  it('1. Renders image element with proper dimensions for valid iconUrl', () => {
    render(<AppIcon iconUrl="https://cdn.elsesourav.com/icons/app.png" name="CodeFlow" size="lg" />);

    const img = screen.getByRole('img', { name: 'CodeFlow application icon' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://cdn.elsesourav.com/icons/app.png');
  });

  it('2. Renders initial letter fallback when iconUrl is null', () => {
    render(<AppIcon iconUrl={null} name="VoxelCraft 3D" size="md" />);

    const fallback = screen.getByText('V');
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveClass('app-icon-fallback');
    expect(document.querySelector('img')).toBeNull();
  });

  it('3. Renders initial letter fallback on image load failure without showing broken image box', () => {
    render(<AppIcon iconUrl="https://cdn.elsesourav.com/broken-icon.png" name="DevMetrics" size="xl" />);

    const img = screen.getByRole('img', { name: 'DevMetrics application icon' });
    fireEvent.error(img);

    const fallback = screen.getByText('D');
    expect(fallback).toBeInTheDocument();
  });

  it('4. Applies correct width and height dimensions to container for size presets', () => {
    const { container: smContainer } = render(<AppIcon name="App" size="sm" />);
    expect(smContainer.querySelector('.app-icon-wrapper')).toHaveStyle({ width: '32px', height: '32px' });

    const { container: xlContainer } = render(<AppIcon name="App" size="xl" />);
    expect(xlContainer.querySelector('.app-icon-wrapper')).toHaveStyle({ width: '56px', height: '56px' });

    const { container: xxlContainer } = render(<AppIcon name="App" size="2xl" />);
    expect(xxlContainer.querySelector('.app-icon-wrapper')).toHaveStyle({ width: '104px', height: '104px' });
  });

  it('5. Supports numeric custom pixel sizes', () => {
    const { container } = render(<AppIcon name="App" size={64} />);
    expect(container.querySelector('.app-icon-wrapper')).toHaveStyle({ width: '64px', height: '64px' });
  });
});
