import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import type { AppVersion } from '@/types/version.types';
import './AppVersionHistory.css';

export interface AppVersionHistoryProps {
  latestVersion?: AppVersion | null;
  versions: AppVersion[];
  className?: string;
}

export const AppVersionHistory: React.FC<AppVersionHistoryProps> = ({
  latestVersion,
  versions,
  className = '',
}) => {
  const [showHistory, setShowHistory] = useState(false);

  const activeLatest = latestVersion || versions[0] || null;
  const historyList = versions.filter((v) => v.id !== activeLatest?.id);

  if (!activeLatest && versions.length === 0) {
    return null;
  }

  return (
    <section className={`app-version-history ${className}`} aria-labelledby="whats-new-heading">
      {/* What's New Card */}
      {activeLatest && (
        <article className="app-version-history__whats-new-card">
          <header className="app-version-history__header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <h2 id="whats-new-heading" className="app-version-history__section-title">
                What's New
              </h2>
              <Badge variant="accent" size="sm" icon={<Sparkles size={12} />}>
                v{activeLatest.version}
              </Badge>
            </div>

            {activeLatest.releaseDate && (
              <span className="app-version-history__date">
                {new Date(activeLatest.releaseDate).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </header>

          {activeLatest.summary && (
            <p className="app-version-history__summary">{activeLatest.summary}</p>
          )}

          {activeLatest.releaseNotes && (
            <p className="app-version-history__notes">{activeLatest.releaseNotes}</p>
          )}
        </article>
      )}

      {/* Collapsible Version History */}
      {historyList.length > 0 && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            rightIcon={showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            aria-expanded={showHistory}
            aria-controls="version-history-list"
          >
            {showHistory ? 'Hide Version History' : `View Version History (${historyList.length})`}
          </Button>

          {showHistory && (
            <div
              id="version-history-list"
              className="app-version-history__list"
              style={{ marginTop: 'var(--space-4)' }}
            >
              {historyList.map((ver) => (
                <div key={ver.id} className="app-version-history__item">
                  <div className="app-version-history__item-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span className="app-version-history__item-title">v{ver.version}</span>
                      {ver.title && (
                        <span
                          style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          - {ver.title}
                        </span>
                      )}
                    </div>
                    {ver.releaseDate && (
                      <span className="app-version-history__date">
                        {new Date(ver.releaseDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                  {ver.releaseNotes && (
                    <p className="app-version-history__item-notes">{ver.releaseNotes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
