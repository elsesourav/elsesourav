import React from 'react';
import { render, screen, fireEvent, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Dropdown, useDropdownPosition } from '@elsesourav/ui/interior';

describe('Dropdown Component Stacking Context & Auto-Adjust Position Engine', () => {
  const SAMPLE_ITEMS = [
    { value: 'all', label: 'All Platforms' },
    { value: 'web', label: 'Web Browser' },
    { value: 'macos', label: 'macOS' },
    { value: 'linux', label: 'Linux' },
    { value: 'windows', label: 'Windows' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders closed by default and does not inject portaled menu in body', () => {
    render(<Dropdown items={SAMPLE_ITEMS} defaultValue="all" />);
    expect(screen.getByRole('button').textContent).toContain('All Platforms');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('opens and renders portaled listbox into document.body with fixed elevation z-index', () => {
    render(<Dropdown items={SAMPLE_ITEMS} defaultValue="all" />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    const listbox = screen.getByRole('listbox');
    expect(listbox).not.toBeNull();

    // The parent motion.div must be attached directly into document.body via createPortal
    const menuContainer = listbox.closest('[style*="position: fixed"]');
    expect(menuContainer).not.toBeNull();
    expect(document.body.contains(menuContainer)).toBe(true);

    // Elevated z-index 9999 to guarantee escape from any parent stacking context
    const htmlContainer = menuContainer as HTMLElement;
    expect(htmlContainer.style.zIndex).toBe('9999');
    expect(htmlContainer.style.position).toBe('fixed');
  });

  it('selects an item and closes the dropdown', async () => {
    const handleChange = vi.fn();
    render(<Dropdown items={SAMPLE_ITEMS} defaultValue="all" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button'));
    const webOption = screen.getByText('Web Browser');
    fireEvent.click(webOption);

    expect(handleChange).toHaveBeenCalledWith('web');
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });

  it('closes on outside click', async () => {
    render(
      <div>
        <div data-testid="outside-area">Outside</div>
        <Dropdown items={SAMPLE_ITEMS} defaultValue="all" />
      </div>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).not.toBeNull();

    fireEvent.pointerDown(screen.getByTestId('outside-area'));
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });

  it('navigates with keyboard and closes on Escape', async () => {
    render(<Dropdown items={SAMPLE_ITEMS} defaultValue="all" />);
    const trigger = screen.getByRole('button');

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const listbox = screen.getByRole('listbox');
    expect(listbox).not.toBeNull();

    fireEvent.keyDown(listbox, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });
});

describe('useDropdownPosition Hook Free Space & Boundary Calculations', () => {
  it('correctly flips upwards (placement: top) when space below is constrained', () => {
    const mockTrigger = document.createElement('button');
    // Simulate trigger near bottom of screen (vh = 600, rect.bottom = 540, spaceBelow = 46px)
    vi.spyOn(mockTrigger, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 500,
      right: 250,
      bottom: 540,
      width: 150,
      height: 40,
      x: 100,
      y: 500,
      toJSON: () => {},
    });

    Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true, writable: true });

    const triggerRef = { current: mockTrigger };
    const { result } = renderHook(() =>
      useDropdownPosition({
        triggerRef,
        isOpen: true,
      })
    );

    expect(result.current).not.toBeNull();
    expect(result.current?.placement).toBe('top');
    expect(result.current?.bottom).toBeDefined();
    expect(result.current?.top).toBeUndefined();
  });

  it('aligns to right edge when trigger is on the right side of the screen', () => {
    const mockTrigger = document.createElement('button');
    // Simulate trigger near right edge of screen (vw = 400, trigger from 250 to 380)
    vi.spyOn(mockTrigger, 'getBoundingClientRect').mockReturnValue({
      left: 250,
      top: 100,
      right: 380,
      bottom: 140,
      width: 130,
      height: 40,
      x: 250,
      y: 100,
      toJSON: () => {},
    });

    Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true });

    const triggerRef = { current: mockTrigger };
    const { result } = renderHook(() =>
      useDropdownPosition({
        triggerRef,
        isOpen: true,
        minWidth: 200,
      })
    );

    expect(result.current).not.toBeNull();
    // Origin must be right-aligned
    expect(result.current?.transformOrigin).toContain('right');
    // Menu width must not overflow viewport (400 - margin * 2 = 384)
    expect(result.current!.left + result.current!.width).toBeLessThanOrEqual(400 - 8);
    // Menu left must be >= margin
    expect(result.current!.left).toBeGreaterThanOrEqual(8);
  });
});
