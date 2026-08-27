import React from 'react';
import { Spinner, Text } from '@/components';

export interface LoadingFallbackProps {
  readonly message?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading ElseSourav...',
}) => {
  return (
    <div
      style={{
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-8)',
      }}
    >
      <Spinner size="lg" />
      <Text variant="muted" size="sm">
        {message}
      </Text>
    </div>
  );
};
