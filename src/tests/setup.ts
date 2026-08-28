import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { vi } from 'vitest';

// Configure testing-library async timeouts for heavy test matrix runs
configure({ asyncUtilTimeout: 10000 });

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
};

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();
