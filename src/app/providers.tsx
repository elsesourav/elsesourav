import React from 'react';
import { ThemeProvider } from './theme';

export interface AppProvidersProps {
  readonly children: React.ReactNode;
}

/**
 * Root composition of application providers
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};
