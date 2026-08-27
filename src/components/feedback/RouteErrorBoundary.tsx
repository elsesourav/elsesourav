import React from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';

export interface RouteErrorBoundaryProps {
  readonly children: React.ReactNode;
  readonly featureName?: string;
  readonly adminMode?: boolean;
}

/**
 * Route-level Error Boundary wrapper that tracks location changes
 * and provides contextual reset navigation without page reload.
 */
export const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({
  children,
  featureName,
  adminMode = false,
}) => {
  const location = useLocation();

  return (
    <ErrorBoundary
      key={location.pathname}
      level="route"
      title={
        featureName
          ? `Unable to load ${featureName}`
          : adminMode
          ? 'Admin Console Error'
          : 'Page Unavailable'
      }
      description={
        adminMode
          ? 'An unexpected error occurred in this administrative view. You can retry or return to the Admin Dashboard.'
          : "We couldn't load this content. Please try again or return to the directory."
      }
      onReset={() => {
        // Soft reset
      }}
      showHomeAction={true}
      fallback={undefined}
    >
      {children}
    </ErrorBoundary>
  );
};
