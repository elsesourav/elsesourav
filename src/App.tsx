import React, { useState } from 'react';
import { Layers, ShieldCheck, Code2, Zap, Database, ArrowRight } from 'lucide-react';
import { appConfig } from '@/config';
import { AppLayout } from '@/layouts';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import './App.css';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('/');

  return (
    <AppLayout currentPath={currentPath} onNavigate={setCurrentPath}>
      <div className="foundation-view">
        <Card variant="glass" padding="lg" className="foundation-view__card">
          <div className="foundation-view__header">
            <Badge variant="accent" size="md">
              <Layers size={13} />
              <span>Phase 1 Architecture</span>
            </Badge>

            <h1 className="foundation-view__title">{appConfig.name} Platform</h1>

            <p className="foundation-view__description">
              Scalable, feature-oriented architecture initialized with strict type safety, modular
              layers, and Apple-inspired dark aesthetic.
            </p>
          </div>

          <div className="foundation-view__grid">
            <Card variant="glass" padding="sm" className="arch-layer-card">
              <div className="arch-layer-card__icon-wrap">
                <Code2 size={18} />
              </div>
              <div className="arch-layer-card__content">
                <h3>Strict Domain Types</h3>
                <p>Clean, modular types and Result/Error patterns without any.</p>
                <Badge variant="mono" size="sm">
                  src/types/ & src/lib/
                </Badge>
              </div>
            </Card>

            <Card variant="glass" padding="sm" className="arch-layer-card">
              <div className="arch-layer-card__icon-wrap">
                <Database size={18} />
              </div>
              <div className="arch-layer-card__content">
                <h3>Repository Abstraction</h3>
                <p>Base repository contracts isolating Firestore queries from UI.</p>
                <Badge variant="mono" size="sm">
                  src/repositories/
                </Badge>
              </div>
            </Card>

            <Card variant="glass" padding="sm" className="arch-layer-card">
              <div className="arch-layer-card__icon-wrap">
                <Zap size={18} />
              </div>
              <div className="arch-layer-card__content">
                <h3>Reusable UI Primitives</h3>
                <p>Composable buttons, cards, badges, and layout shells.</p>
                <Badge variant="mono" size="sm">
                  src/components/ui/
                </Badge>
              </div>
            </Card>

            <Card variant="glass" padding="sm" className="arch-layer-card">
              <div className="arch-layer-card__icon-wrap">
                <ShieldCheck size={18} />
              </div>
              <div className="arch-layer-card__content">
                <h3>Runtime Schemas</h3>
                <p>Zod schemas with static type inference and validations.</p>
                <Badge variant="mono" size="sm">
                  src/schemas/
                </Badge>
              </div>
            </Card>
          </div>

          <div className="foundation-view__footer">
            <div className="foundation-view__status-group">
              <span className="live-dot" />
              <span className="status-label">Environment:</span>
              <Badge variant="mono" size="sm">
                {appConfig.environment}
              </Badge>
            </div>

            <div className="foundation-view__cta">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight size={14} />}
                onClick={() => setCurrentPath('/apps')}
              >
                Explore Architecture Ready
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default App;
