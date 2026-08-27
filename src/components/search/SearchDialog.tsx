import React, { useState, useEffect, useCallback, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, AppWindow, Folder, BookOpen, HelpCircle, ArrowRight } from 'lucide-react';
import { Modal, Input, Badge, Text } from '@/components';
import { ROUTES } from '@/constants/routes';

export interface SearchDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

interface QuickResult {
  readonly title: string;
  readonly type: 'app' | 'category' | 'blog' | 'help';
  readonly path: string;
}

const DEFAULT_SUGGESTIONS: readonly QuickResult[] = [
  { title: 'Explore Web Apps', type: 'app', path: ROUTES.APPS },
  { title: 'Browser Extensions', type: 'category', path: '/categories/extensions' },
  { title: 'Developer Tools', type: 'category', path: '/categories/developer-tools' },
  { title: 'Latest Devlog & Articles', type: 'blog', path: ROUTES.BLOG },
  { title: 'Help & FAQs', type: 'help', path: ROUTES.HELP },
  { title: 'Submit Support Ticket', type: 'help', path: ROUTES.SUPPORT },
];

export const SearchDialog: React.FC<SearchDialogProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const searchInputId = useId();

  // Listen for Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = useCallback(
    (path: string) => {
      onClose();
      setQuery('');
      navigate(path);
    },
    [navigate, onClose]
  );

  const filtered = query.trim()
    ? DEFAULT_SUGGESTIONS.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
    : DEFAULT_SUGGESTIONS;

  const getTypeIcon = (type: QuickResult['type']) => {
    switch (type) {
      case 'app':
        return <AppWindow size={15} />;
      case 'category':
        return <Folder size={15} />;
      case 'blog':
        return <BookOpen size={15} />;
      case 'help':
        return <HelpCircle size={15} />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="Search ElseSourav">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input
          id={searchInputId}
          placeholder="Search apps, tools, categories, articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Search size={16} />}
          rightIcon={
            query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            ) : undefined
          }
          autoFocus
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <Text variant="muted" size="xs" weight="medium">
            {query.trim() ? 'Search Results' : 'Quick Navigation'}
          </Text>

          {filtered.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <Text variant="muted" size="sm">
                No results found for &ldquo;{query}&rdquo;
              </Text>
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => handleSelect(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color var(--motion-fast) ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'flex' }}>
                    {getTypeIcon(item.type)}
                  </span>
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>{item.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Badge variant="mono" size="sm">
                    {item.type}
                  </Badge>
                  <ArrowRight size={12} style={{ color: 'var(--color-text-muted)' }} />
                </div>
              </button>
            ))
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 'var(--space-2)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <Text variant="muted" size="xs">
            Press <kbd style={{ fontFamily: 'var(--font-family-mono)' }}>Esc</kbd> to close
          </Text>
          <Text variant="muted" size="xs">
            Shortcut <kbd style={{ fontFamily: 'var(--font-family-mono)' }}>⌘K</kbd>
          </Text>
        </div>
      </div>
    </Modal>
  );
};
