import React from 'react';
import { Card, Heading, Text, Badge } from '@/components';
import { Sparkles } from 'lucide-react';

export interface PlaceholderPageProps {
  readonly title: string;
  readonly description: string;
  readonly badge?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  badge = 'Coming Soon',
}) => {
  return (
    <div
      style={{
        padding: 'var(--space-8) var(--space-4)',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <Card
        variant="glass"
        padding="lg"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Badge variant="accent" size="sm">
            <Sparkles size={12} />
            <span>{badge}</span>
          </Badge>
        </div>

        <Heading level={1} size="2xl">
          {title}
        </Heading>

        <Text variant="muted" size="md" style={{ maxWidth: '640px' }}>
          {description}
        </Text>
      </Card>
    </div>
  );
};
