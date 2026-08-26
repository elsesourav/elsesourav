import React from 'react';

export interface AppProvidersProps {
  readonly children: React.ReactNode;
}

/**
 * Root composition of application providers
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return <>{children}</>;
};
