import * as React from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <div className="dark bg-zinc-950 text-white min-h-screen">{children}</div>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
